// Adapter that bridges the frontend's own /api contract (defined in db.ts) with the
// real NestJS backend (bingos_back_js). Only the entities that already exist and match
// 1:1 in the Nest backend are wired here (Bingos list/detail, Cards per bingo).
//
// Anything not yet implemented in bingos_back_js (prizes CRUD, MercadoPago config,
// card reserve/release, checkout, admin DB tools, ticket template upload) intentionally
// keeps using the local SQLite mock in db.ts until those endpoints are built on the back.
//
// If the Nest backend is unreachable (not running, wrong URL, etc.) every function here
// throws, and the callers in server.ts fall back to the local SQLite mock so the app
// never breaks in local development.

import type { DBBingo, DBCard } from './db';

const NEST_API_URL = process.env.NEST_API_URL || 'http://localhost:3001/api';

/** Thrown when the Nest backend cannot be reached at all (down / wrong URL). */
class NestUnavailableError extends Error {
  isNestUnavailable = true;
}

/** Thrown when the Nest backend responded but rejected the request (validation, 404, etc.). */
class NestApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function nestFetch(pathAndQuery: string) {
  const res = await fetch(`${NEST_API_URL}${pathAndQuery}`);
  if (!res.ok) {
    throw new Error(`Nest backend respondió ${res.status} en ${pathAndQuery}`);
  }
  return res.json();
}

function extractNestErrorMessage(body: any, fallback: string): string {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

/** Fetch wrapper for POST/PATCH/PUT/DELETE. Distinguishes "backend down" (safe to fall
 * back to the local mock) from "backend responded with an error" (must be surfaced). */
async function nestFetchWrite(
  pathAndQuery: string,
  init: { method: string; body?: any },
): Promise<any> {
  let res: Response;
  try {
    res = await fetch(`${NEST_API_URL}${pathAndQuery}`, {
      method: init.method,
      headers: init.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new NestUnavailableError(`No se pudo conectar al backend Nest en ${NEST_API_URL}`);
  }

  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new NestApiError(res.status, extractNestErrorMessage(parsed, `Nest respondió ${res.status}`));
  }
  return parsed;
}

/** Same as nestFetchWrite but sends a multipart/form-data body (used for CSV import). */
async function nestFetchMultipart(pathAndQuery: string, form: FormData): Promise<any> {
  let res: Response;
  try {
    res = await fetch(`${NEST_API_URL}${pathAndQuery}`, { method: 'POST', body: form as any });
  } catch {
    throw new NestUnavailableError(`No se pudo conectar al backend Nest en ${NEST_API_URL}`);
  }

  const text = await res.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new NestApiError(res.status, extractNestErrorMessage(parsed, `Nest respondió ${res.status}`));
  }
  return parsed;
}

function mapNestBingo(b: any): DBBingo {
  const drawDate = b.drawDate ? new Date(b.drawDate) : null;
  return {
    id: b.id,
    name: b.name,
    description: b.description || '',
    // Nest stores a single drawDate; split it so it fits the front's date/time fields.
    date: drawDate ? drawDate.toISOString().split('T')[0] : '',
    time: drawDate ? drawDate.toISOString().split('T')[1]?.slice(0, 5) : '',
    cardPrice: Number(b.price),
    currency: 'ARS',
    // Nest's BingoStatus has an extra CLOSED value the front doesn't know about.
    status: b.status === 'CLOSED' ? 'FINISHED' : b.status,
    maxReservationMinutes: 10,
    liveStreamUrl: '',
    terms: '',
    imageUrl: undefined,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

/** Combines the front's separate date/time strings into the single ISO drawDate Nest expects. */
function toIsoDrawDate(date?: string, time?: string): string {
  if (!date) return new Date().toISOString();
  const safeTime = time && /^\d{2}:\d{2}/.test(time) ? time : '00:00';
  return new Date(`${date}T${safeTime}:00Z`).toISOString();
}

function mapNestCard(c: any, bingoId: string): DBCard {
  return {
    id: c.id,
    bingoId,
    cardNumber: c.cardNumber,
    numbers: c.numbers || [],
    status: c.status,
    reservedUntil: c.reservedUntil || null,
    soldToOrderId: c.soldToOrderId || null,
    createdAt: c.createdAt,
  };
}

export const nestBackend = {
  async getAllBingos(): Promise<DBBingo[]> {
    const json = await nestFetch('/bingos?limit=100');
    const list = Array.isArray(json) ? json : json.data;
    return (list || []).map(mapNestBingo);
  },

  async getActiveBingo(): Promise<DBBingo | null> {
    const bingos = await this.getAllBingos();
    return bingos.find((b) => b.status === 'ACTIVE') || null;
  },

  async getCards(
    bingoId: string,
    options: { status?: string; query?: string; page?: number; limit?: number } = {},
  ): Promise<{ total: number; cards: DBCard[] }> {
    const params = new URLSearchParams();
    params.set('page', String(options.page || 1));
    params.set('limit', String(options.limit || 1000));
    if (options.status && options.status !== 'ALL') params.set('status', options.status);
    if (options.query) params.set('search', options.query);

    const json = await nestFetch(`/bingos/${bingoId}/cards?${params.toString()}`);
    const cards = (json.data || []).map((c: any) => mapNestCard(c, bingoId));
    return { total: json.meta?.total ?? cards.length, cards };
  },

  /** Creates a bingo in the real backend. Any front-only fields (id, currency, terms, etc.)
   * that Nest's CreateBingoDto doesn't accept are stripped before sending (Nest rejects
   * unknown properties). The real cuid assigned by Postgres comes back in the response. */
  async createBingo(body: any): Promise<DBBingo> {
    const payload = {
      name: body.name,
      description: body.description || undefined,
      drawDate: toIsoDrawDate(body.date, body.time),
      price: Number(body.cardPrice ?? body.price ?? 0),
      status: body.status || 'DRAFT',
    };
    const json = await nestFetchWrite('/bingos', { method: 'POST', body: payload });
    return mapNestBingo(json);
  },

  async updateBingo(id: string, body: any): Promise<DBBingo> {
    const payload: Record<string, any> = {};
    if (body.name !== undefined) payload.name = body.name;
    if (body.description !== undefined) payload.description = body.description;
    if (body.date !== undefined || body.time !== undefined) {
      payload.drawDate = toIsoDrawDate(body.date, body.time);
    }
    if (body.cardPrice !== undefined) payload.price = Number(body.cardPrice);
    if (body.status !== undefined) payload.status = body.status;

    const json = await nestFetchWrite(`/bingos/${id}`, { method: 'PATCH', body: payload });
    return mapNestBingo(json);
  },

  async deleteBingo(id: string): Promise<void> {
    await nestFetchWrite(`/bingos/${id}`, { method: 'DELETE' });
  },

  /** Reuses Nest's existing CSV import endpoint: builds an in-memory CSV from the cards
   * array the front already validated, and uploads it as multipart/form-data. */
  async importCardsCsv(
    bingoId: string,
    cards: Array<{ cardNumber: string | number; numbers: number[] }>,
  ): Promise<{ total: number; imported: number; failed: number; errors: any[] }> {
    const header = 'cardNumber,numbers';
    const rows = cards.map((c) => `${c.cardNumber},"${c.numbers.join(',')}"`);
    const csvContent = [header, ...rows].join('\n');

    const form = new FormData();
    form.append('file', new Blob([csvContent], { type: 'text/csv' }), 'cards.csv');

    return nestFetchMultipart(`/bingos/${bingoId}/cards/import`, form);
  },
};

