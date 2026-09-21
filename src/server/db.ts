import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.join(process.cwd(), 'bingo.db');

export interface DBBingo {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  cardPrice: number;
  currency: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
  maxReservationMinutes: number;
  liveStreamUrl: string;
  terms: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBCard {
  id: string;
  bingoId: string;
  cardNumber: number;
  numbers: number[];
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  reservedUntil: string | null;
  soldToOrderId: string | null;
  createdAt: string;
}

export interface DBPrize {
  id: string;
  bingoId: string;
  name: string;
  description: string;
  amount: number;
  order: number;
  iconType: 'trophy' | 'car' | 'cash' | 'gift' | 'home';
}

export interface DBCustomer {
  id: string;
  name: string;
  lastname: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface DBOrder {
  id: string;
  bingoId: string;
  cardNumber: number;
  customerId: string;
  customerName: string;
  customerLastname: string;
  customerDni: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REJECTED';
  paymentId: string;
  validationCode: string;
  createdAt: string;
}

export interface DBMercadoPagoConfig {
  publicKey: string;
  accessToken: string;
  webhookUrl: string;
  sandboxMode: boolean;
}

// Initialize SQLite database
const db = new DatabaseSync(DB_PATH);

// Create database schemas
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bingos (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      card_price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ARS',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      max_reservation_minutes INTEGER NOT NULL DEFAULT 10,
      live_stream_url TEXT,
      terms TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prizes (
      id TEXT PRIMARY KEY,
      bingo_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      amount REAL DEFAULT 0,
      order_num INTEGER NOT NULL,
      icon_type TEXT DEFAULT 'trophy',
      FOREIGN KEY (bingo_id) REFERENCES bingos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      bingo_id TEXT NOT NULL,
      card_number INTEGER NOT NULL,
      numbers_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'AVAILABLE',
      reserved_until TEXT,
      sold_to_order_id TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(bingo_id, card_number),
      FOREIGN KEY (bingo_id) REFERENCES bingos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      dni TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      lastname TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      bingo_id TEXT NOT NULL,
      card_number INTEGER NOT NULL,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'PAID',
      payment_id TEXT,
      validation_code TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (bingo_id) REFERENCES bingos(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS mp_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      public_key TEXT,
      access_token TEXT,
      webhook_url TEXT,
      sandbox_mode INTEGER DEFAULT 1,
      updated_at TEXT
    );
  `);

  // Migration: Add image_url column to bingos if it doesn't exist
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(bingos)`).all() as any[];
    const hasImageCol = tableInfo.some((col) => col.name === 'image_url');
    if (!hasImageCol) {
      db.exec(`ALTER TABLE bingos ADD COLUMN image_url TEXT`);
    }
  } catch (err) {
    console.warn('Migration note for image_url:', err);
  }

  // Check if seed data is needed
  const bingoCount = db.prepare('SELECT COUNT(*) as count FROM bingos').get() as { count: number };
  if (bingoCount.count === 0) {
    seedInitialData();
  }
}

export function seedInitialData() {
  const now = new Date().toISOString();
  
  // 1. Insert default active Bingo
  const bingoId = 'bingo-oficial-2026';
  db.prepare(`
    INSERT INTO bingos (
      id, name, description, date, time, card_price, currency, status,
      max_reservation_minutes, live_stream_url, terms, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    bingoId,
    'Gran Bingo Millonario 2026',
    '¡Participa por el Auto 0KM y más de $15.000.000 en efectivo! Transmisión oficial en directo con certificación de escribano público.',
    '2026-10-15',
    '21:00',
    2500,
    'ARS',
    'ACTIVE',
    10,
    'https://youtube.com/live/bingo-oficial',
    'El sorteo se realizará con bolillero oficial ante escribano público. Cada cartón contiene 10 números únicos.',
    now,
    now
  );

  // 2. Insert Prizes
  const insertPrize = db.prepare(`
    INSERT INTO prizes (id, bingo_id, name, description, amount, order_num, icon_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPrize.run('prize-1', bingoId, '1º Premio: Auto 0KM + $2.000.000', 'Vehículo 0KM listo para transferir con patente al día.', 12000000, 1, 'car');
  insertPrize.run('prize-2', bingoId, '2º Premio: Moto 150cc + $500.000', 'Motocicleta 0KM equipada con casco de seguridad.', 3500000, 2, 'car');
  insertPrize.run('prize-3', bingoId, '3º Premio: Smart TV 65" 4K', 'Televisor inteligente con tecnología HDR y garantía oficial.', 1200000, 3, 'home');
  insertPrize.run('prize-4', bingoId, 'Premio Ronda Línea: $800.000', 'Para quien complete primero una fila horizontal de 5 números.', 800000, 4, 'cash');

  // 3. Insert default Mercado Pago Config
  db.prepare(`
    INSERT OR REPLACE INTO mp_config (id, public_key, access_token, webhook_url, sandbox_mode, updated_at)
    VALUES (1, ?, ?, ?, 1, ?)
  `).run(
    'TEST-b389f412-a841-477f-94d0-7612fbc9e14a',
    'TEST-7823198421098412-091819-f9a8b7c6d5e4f3a2-192837461',
    'https://mi-dominio.com/api/mercadopago/webhook',
    now
  );

  // 4. Generate initial batch of 30 realistic physical cards
  const insertCard = db.prepare(`
    INSERT INTO cards (id, bingo_id, card_number, numbers_json, status, reserved_until, sold_to_order_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialCards = [
    { num: 7811, nums: [8, 13, 23, 35, 39, 50, 63, 66, 70, 85] },
    { num: 146001, nums: [1, 5, 12, 46, 48, 58, 62, 69, 70, 89] },
    { num: 146002, nums: [3, 8, 19, 33, 41, 52, 67, 74, 81, 90] },
    { num: 146003, nums: [7, 14, 22, 38, 45, 59, 63, 71, 84, 88] },
    { num: 146004, nums: [2, 11, 26, 35, 49, 54, 60, 77, 83, 87] },
    { num: 146005, nums: [6, 17, 29, 34, 42, 57, 68, 75, 82, 86] },
    { num: 146006, nums: [4, 15, 20, 39, 47, 51, 65, 78, 80, 85] },
    { num: 146007, nums: [9, 13, 27, 31, 44, 56, 61, 72, 83, 89] },
    { num: 146008, nums: [10, 18, 23, 36, 43, 53, 64, 79, 81, 90] },
    { num: 146009, nums: [5, 16, 28, 32, 40, 55, 66, 73, 84, 88] },
    { num: 146010, nums: [1, 12, 25, 37, 48, 50, 62, 70, 82, 87] },
  ];

  // Add procedurally up to 90 cards (01 al 90)
  for (let i = 11; i <= 90; i++) {
    const cardNum = 146000 + i;
    const numsSet = new Set<number>();
    while (numsSet.size < 10) {
      numsSet.add(Math.floor(Math.random() * 90) + 1);
    }
    const sorted = Array.from(numsSet).sort((a, b) => a - b);
    initialCards.push({ num: cardNum, nums: sorted });
  }

  for (const c of initialCards) {
    const cardId = `card-${bingoId}-${c.num}`;
    insertCard.run(
      cardId,
      bingoId,
      c.num,
      JSON.stringify(c.nums),
      'AVAILABLE',
      null,
      null,
      now
    );
  }

  // Ensure card 7811 with official numbers exists
  const existing7811 = db.prepare('SELECT id FROM cards WHERE card_number = 7811').get();
  if (!existing7811) {
    db.prepare(`
      INSERT INTO cards (id, bingo_id, card_number, numbers_json, status, reserved_until, sold_to_order_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'card-bingo-2026-01-7811',
      'bingo-2026-01',
      7811,
      JSON.stringify([8, 13, 23, 35, 39, 50, 63, 66, 70, 85]),
      'AVAILABLE',
      null,
      null,
      new Date().toISOString()
    );
  }
}

// ---------------- DATABASE ACCESS METHODS ---------------- //

export const dbService = {
  // BINGO
  getActiveBingo(): DBBingo | null {
    this.releaseExpiredReservations();
    const row = db.prepare(`SELECT * FROM bingos WHERE status = 'ACTIVE' LIMIT 1`).get() as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      date: row.date,
      time: row.time,
      cardPrice: row.card_price,
      currency: row.currency,
      status: row.status,
      maxReservationMinutes: row.max_reservation_minutes,
      liveStreamUrl: row.live_stream_url,
      terms: row.terms,
      imageUrl: row.image_url || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  getAllBingos(): DBBingo[] {
    const rows = db.prepare(`SELECT * FROM bingos ORDER BY created_at DESC`).all() as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      date: row.date,
      time: row.time,
      cardPrice: row.card_price,
      currency: row.currency,
      status: row.status,
      maxReservationMinutes: row.max_reservation_minutes,
      liveStreamUrl: row.live_stream_url,
      terms: row.terms,
      imageUrl: row.image_url || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  createBingo(bingo: Omit<DBBingo, 'createdAt' | 'updatedAt'>): DBBingo {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO bingos (
        id, name, description, date, time, card_price, currency, status,
        max_reservation_minutes, live_stream_url, terms, image_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bingo.id,
      bingo.name,
      bingo.description,
      bingo.date,
      bingo.time,
      bingo.cardPrice,
      bingo.currency || 'ARS',
      bingo.status || 'ACTIVE',
      bingo.maxReservationMinutes || 10,
      bingo.liveStreamUrl || '',
      bingo.terms || '',
      bingo.imageUrl || '',
      now,
      now
    );
    return { ...bingo, createdAt: now, updatedAt: now };
  },

  updateBingo(id: string, updates: Partial<DBBingo>): DBBingo | null {
    const current = this.getAllBingos().find((b) => b.id === id);
    if (!current) return null;

    const updated: DBBingo = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    db.prepare(`
      UPDATE bingos SET
        name = ?, description = ?, date = ?, time = ?, card_price = ?,
        currency = ?, status = ?, max_reservation_minutes = ?, live_stream_url = ?,
        terms = ?, image_url = ?, updated_at = ?
      WHERE id = ?
    `).run(
      updated.name,
      updated.description,
      updated.date,
      updated.time,
      updated.cardPrice,
      updated.currency,
      updated.status,
      updated.maxReservationMinutes,
      updated.liveStreamUrl,
      updated.terms,
      updated.imageUrl || '',
      updated.updatedAt,
      id
    );

    return updated;
  },

  deleteBingo(id: string): boolean {
    try {
      db.prepare(`DELETE FROM cards WHERE bingo_id = ?`).run(id);
      db.prepare(`DELETE FROM prizes WHERE bingo_id = ?`).run(id);
      db.prepare(`DELETE FROM orders WHERE bingo_id = ?`).run(id);
      const res = db.prepare(`DELETE FROM bingos WHERE id = ?`).run(id);
      return (res.changes ?? 0) > 0;
    } catch {
      return false;
    }
  },

  // CARDS
  getCards(bingoId: string, options: { status?: string; query?: string; page?: number; limit?: number } = {}) {
    this.releaseExpiredReservations();

    let sql = `SELECT * FROM cards WHERE bingo_id = ?`;
    const params: any[] = [bingoId];

    if (options.status && options.status !== 'ALL') {
      sql += ` AND status = ?`;
      params.push(options.status);
    }

    if (options.query) {
      const q = options.query.trim();
      sql += ` AND (card_number LIKE ? OR numbers_json LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += ` ORDER BY card_number ASC`;

    const allRows = db.prepare(sql).all(...params) as any[];
    const total = allRows.length;

    let pagedRows = allRows;
    if (options.page && options.limit) {
      const offset = (options.page - 1) * options.limit;
      pagedRows = allRows.slice(offset, offset + options.limit);
    }

    const cards: DBCard[] = pagedRows.map((r) => ({
      id: r.id,
      bingoId: r.bingo_id,
      cardNumber: r.card_number,
      numbers: JSON.parse(r.numbers_json),
      status: r.status,
      reservedUntil: r.reserved_until,
      soldToOrderId: r.sold_to_order_id,
      createdAt: r.created_at,
    }));

    return { total, cards };
  },

  getCardById(id: string): DBCard | null {
    this.releaseExpiredReservations();
    const r = db.prepare(`SELECT * FROM cards WHERE id = ?`).get(id) as any;
    if (!r) return null;
    return {
      id: r.id,
      bingoId: r.bingo_id,
      cardNumber: r.card_number,
      numbers: JSON.parse(r.numbers_json),
      status: r.status,
      reservedUntil: r.reserved_until,
      soldToOrderId: r.sold_to_order_id,
      createdAt: r.created_at,
    };
  },

  updateCardNumbers(cardId: string, numbers: number[], newCardNumber?: number): DBCard | null {
    const card = this.getCardById(cardId);
    if (!card) return null;

    const sortedNums = [...numbers].sort((a, b) => a - b);
    const targetCardNumber = newCardNumber !== undefined ? newCardNumber : card.cardNumber;

    db.prepare(`
      UPDATE cards
      SET numbers_json = ?, card_number = ?
      WHERE id = ?
    `).run(JSON.stringify(sortedNums), targetCardNumber, cardId);

    return this.getCardById(cardId);
  },

  importCardsBatch(bingoId: string, cards: { cardNumber: number; numbers: number[] }[]): { added: number; duplicates: number } {
    let added = 0;
    let duplicates = 0;
    const now = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO cards (id, bingo_id, card_number, numbers_json, status, reserved_until, sold_to_order_id, created_at)
      VALUES (?, ?, ?, ?, 'AVAILABLE', null, null, ?)
    `);

    for (const c of cards) {
      try {
        const id = `card-${bingoId}-${c.cardNumber}`;
        insert.run(id, bingoId, c.cardNumber, JSON.stringify(c.numbers), now);
        added++;
      } catch (e: any) {
        if (e.message?.includes('UNIQUE')) {
          duplicates++;
        }
      }
    }

    return { added, duplicates };
  },

  // TRANSACTIONAL LOCK FOR CARD RESERVATION (10 min)
  reserveCard(cardId: string, minutes: number = 10): { success: boolean; card?: DBCard; message?: string } {
    this.releaseExpiredReservations();

    const card = this.getCardById(cardId);
    if (!card) {
      return { success: false, message: 'Cartón no encontrado' };
    }

    if (card.status === 'SOLD') {
      return { success: false, message: 'El cartón ya fue vendido a otro participante' };
    }

    if (card.status === 'RESERVED') {
      // Check if it's still reserved
      if (card.reservedUntil && new Date(card.reservedUntil).getTime() > Date.now()) {
        return { success: false, message: 'El cartón se encuentra temporalmente reservado por otro usuario' };
      }
    }

    const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();

    db.prepare(`
      UPDATE cards
      SET status = 'RESERVED', reserved_until = ?
      WHERE id = ? AND (status = 'AVAILABLE' OR status = 'RESERVED')
    `).run(expiresAt, cardId);

    const updated = this.getCardById(cardId);
    return { success: true, card: updated! };
  },

  releaseCard(cardId: string): boolean {
    const res = db.prepare(`
      UPDATE cards
      SET status = 'AVAILABLE', reserved_until = null
      WHERE id = ? AND status = 'RESERVED'
    `).run(cardId);
    return Number(res.changes ?? 0) > 0;
  },

  releaseExpiredReservations(): number {
    const now = new Date().toISOString();
    const res = db.prepare(`
      UPDATE cards
      SET status = 'AVAILABLE', reserved_until = null
      WHERE status = 'RESERVED' AND reserved_until IS NOT NULL AND reserved_until < ?
    `).run(now);
    return Number(res.changes ?? 0);
  },

  // PRIZES
  getPrizes(bingoId: string): DBPrize[] {
    const rows = db.prepare(`SELECT * FROM prizes WHERE bingo_id = ? ORDER BY order_num ASC`).all(bingoId) as any[];
    return rows.map((r) => ({
      id: r.id,
      bingoId: r.bingo_id,
      name: r.name,
      description: r.description,
      amount: r.amount,
      order: r.order_num,
      iconType: r.icon_type,
    }));
  },

  createPrize(prize: DBPrize): DBPrize {
    db.prepare(`
      INSERT INTO prizes (id, bingo_id, name, description, amount, order_num, icon_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      prize.id,
      prize.bingoId,
      prize.name,
      prize.description,
      prize.amount,
      prize.order,
      prize.iconType
    );
    return prize;
  },

  updatePrize(id: string, updates: Partial<DBPrize>): boolean {
    const current = db.prepare(`SELECT * FROM prizes WHERE id = ?`).get(id) as any;
    if (!current) return false;

    db.prepare(`
      UPDATE prizes SET
        name = ?, description = ?, amount = ?, order_num = ?, icon_type = ?
      WHERE id = ?
    `).run(
      updates.name ?? current.name,
      updates.description ?? current.description,
      updates.amount ?? current.amount,
      updates.order ?? current.order_num,
      updates.iconType ?? current.icon_type,
      id
    );
    return true;
  },

  deletePrize(id: string): boolean {
    const res = db.prepare(`DELETE FROM prizes WHERE id = ?`).run(id);
    return Number(res.changes ?? 0) > 0;
  },

  // ORDERS & CUSTOMERS
  createOrder(orderData: {
    bingoId: string;
    cardId: string;
    customer: {
      name: string;
      lastname: string;
      dni: string;
      phone: string;
      email?: string;
      address?: string;
    };
    amount: number;
    paymentMethod: string;
    paymentId?: string;
  }): { success: boolean; order?: DBOrder; message?: string } {
    const card = this.getCardById(orderData.cardId);
    if (!card) {
      return { success: false, message: 'Cartón inexistente' };
    }
    if (card.status === 'SOLD') {
      return { success: false, message: 'El cartón ya ha sido vendido' };
    }

    const now = new Date().toISOString();
    const customerId = `cust-${orderData.customer.dni}`;

    // Upsert customer
    db.prepare(`
      INSERT INTO customers (id, dni, name, lastname, phone, email, address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(dni) DO UPDATE SET
        name = excluded.name,
        lastname = excluded.lastname,
        phone = excluded.phone,
        email = excluded.email,
        address = excluded.address
    `).run(
      customerId,
      orderData.customer.dni,
      orderData.customer.name,
      orderData.customer.lastname,
      orderData.customer.phone,
      orderData.customer.email || '',
      orderData.customer.address || '',
      now
    );

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const validationCode = `VAL-${orderData.cardId.slice(-4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${orderData.customer.dni.slice(-4)}`;

    // Insert Order
    db.prepare(`
      INSERT INTO orders (
        id, bingo_id, card_number, customer_id, amount, payment_method,
        payment_status, payment_id, validation_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'PAID', ?, ?, ?)
    `).run(
      orderId,
      orderData.bingoId,
      card.cardNumber,
      customerId,
      orderData.amount,
      orderData.paymentMethod,
      orderData.paymentId || 'MP-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      validationCode,
      now
    );

    // Atomically transition Card to SOLD
    db.prepare(`
      UPDATE cards
      SET status = 'SOLD', reserved_until = null, sold_to_order_id = ?
      WHERE id = ?
    `).run(orderId, orderData.cardId);

    const order: DBOrder = {
      id: orderId,
      bingoId: orderData.bingoId,
      cardNumber: card.cardNumber,
      customerId,
      customerName: orderData.customer.name,
      customerLastname: orderData.customer.lastname,
      customerDni: orderData.customer.dni,
      customerPhone: orderData.customer.phone,
      customerEmail: orderData.customer.email || '',
      customerAddress: orderData.customer.address || '',
      amount: orderData.amount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'PAID',
      paymentId: orderData.paymentId || 'MP-AUTO-CONFIRM',
      validationCode,
      createdAt: now,
    };

    return { success: true, order };
  },

  getAllOrders(bingoId?: string): DBOrder[] {
    let sql = `
      SELECT o.*, c.name as customer_name, c.lastname as customer_lastname,
             c.dni as customer_dni, c.phone as customer_phone, c.email as customer_email,
             c.address as customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
    `;
    const params: any[] = [];
    if (bingoId) {
      sql += ` WHERE o.bingo_id = ?`;
      params.push(bingoId);
    }
    sql += ` ORDER BY o.created_at DESC`;

    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map((r) => ({
      id: r.id,
      bingoId: r.bingo_id,
      cardNumber: r.card_number,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerLastname: r.customer_lastname,
      customerDni: r.customer_dni,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email,
      customerAddress: r.customer_address,
      amount: r.amount,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      paymentId: r.payment_id,
      validationCode: r.validation_code,
      createdAt: r.created_at,
    }));
  },

  getOrdersByCustomerDni(dni: string): DBOrder[] {
    const sql = `
      SELECT o.*, c.name as customer_name, c.lastname as customer_lastname,
             c.dni as customer_dni, c.phone as customer_phone, c.email as customer_email,
             c.address as customer_address
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE c.dni = ? OR c.phone = ?
      ORDER BY o.created_at DESC
    `;
    const rows = db.prepare(sql).all(dni, dni) as any[];
    return rows.map((r) => ({
      id: r.id,
      bingoId: r.bingo_id,
      cardNumber: r.card_number,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerLastname: r.customer_lastname,
      customerDni: r.customer_dni,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email,
      customerAddress: r.customer_address,
      amount: r.amount,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      paymentId: r.payment_id,
      validationCode: r.validation_code,
      createdAt: r.created_at,
    }));
  },

  // MERCADO PAGO CONFIG
  getMercadoPagoConfig(): DBMercadoPagoConfig {
    const row = db.prepare(`SELECT * FROM mp_config WHERE id = 1`).get() as any;
    if (!row) {
      return {
        publicKey: 'TEST-b389f412-a841-477f-94d0-7612fbc9e14a',
        accessToken: 'TEST-7823198421098412-091819-f9a8b7c6d5e4f3a2-192837461',
        webhookUrl: 'https://mi-dominio.com/api/mercadopago/webhook',
        sandboxMode: true,
      };
    }
    return {
      publicKey: row.public_key || '',
      accessToken: row.access_token || '',
      webhookUrl: row.webhook_url || '',
      sandboxMode: Boolean(row.sandbox_mode),
    };
  },

  updateMercadoPagoConfig(cfg: DBMercadoPagoConfig) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT OR REPLACE INTO mp_config (id, public_key, access_token, webhook_url, sandbox_mode, updated_at)
      VALUES (1, ?, ?, ?, ?, ?)
    `).run(cfg.publicKey, cfg.accessToken, cfg.webhookUrl, cfg.sandboxMode ? 1 : 0, now);
  },

  resetAllData() {
    db.exec(`
      DELETE FROM orders;
      DELETE FROM customers;
      DELETE FROM cards;
      DELETE FROM prizes;
      DELETE FROM bingos;
      DELETE FROM mp_config;
    `);
    seedInitialData();
  },

  getDatabaseStats() {
    this.releaseExpiredReservations();
    let sizeBytes = 0;
    try {
      if (fs.existsSync(DB_PATH)) {
        const stats = fs.statSync(DB_PATH);
        sizeBytes = stats.size;
      }
    } catch {
      // ignore
    }

    const bingosCount = (db.prepare(`SELECT COUNT(*) as count FROM bingos`).get() as any)?.count ?? 0;
    const cardsTotal = (db.prepare(`SELECT COUNT(*) as count FROM cards`).get() as any)?.count ?? 0;
    const cardsAvailable = (db.prepare(`SELECT COUNT(*) as count FROM cards WHERE status = 'AVAILABLE'`).get() as any)?.count ?? 0;
    const cardsReserved = (db.prepare(`SELECT COUNT(*) as count FROM cards WHERE status = 'RESERVED'`).get() as any)?.count ?? 0;
    const cardsSold = (db.prepare(`SELECT COUNT(*) as count FROM cards WHERE status = 'SOLD'`).get() as any)?.count ?? 0;
    const prizesCount = (db.prepare(`SELECT COUNT(*) as count FROM prizes`).get() as any)?.count ?? 0;
    const customersCount = (db.prepare(`SELECT COUNT(*) as count FROM customers`).get() as any)?.count ?? 0;
    const ordersCount = (db.prepare(`SELECT COUNT(*) as count FROM orders`).get() as any)?.count ?? 0;
    const totalRevenue = (db.prepare(`SELECT COALESCE(SUM(amount), 0) as sum FROM orders WHERE payment_status = 'PAID'`).get() as any)?.sum ?? 0;

    return {
      dbPath: DB_PATH,
      engine: 'SQLite 3 (Node.js native DatabaseSync)',
      status: 'CONNECTED',
      sizeBytes,
      sizeFormatted: `${(sizeBytes / 1024).toFixed(1)} KB`,
      tables: {
        bingos: bingosCount,
        prizes: prizesCount,
        cards: {
          total: cardsTotal,
          available: cardsAvailable,
          reserved: cardsReserved,
          sold: cardsSold,
        },
        customers: customersCount,
        orders: ordersCount,
      },
      totalRevenue,
      serverTime: new Date().toISOString(),
    };
  },

  getTables() {
    const rows = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`).all() as any[];
    return rows.map((r) => {
      const columns = db.prepare(`PRAGMA table_info(${r.name})`).all() as any[];
      const count = (db.prepare(`SELECT COUNT(*) as c FROM ${r.name}`).get() as any)?.c ?? 0;
      return {
        name: r.name,
        rowCount: count,
        columns: columns.map((col) => ({
          cid: col.cid,
          name: col.name,
          type: col.type,
          notnull: Boolean(col.notnull),
          dflt_value: col.dflt_value,
          pk: Boolean(col.pk),
        })),
      };
    });
  },

  executeQuery(sql: string) {
    const trimmed = sql.trim();
    // Safety check: only allow SELECT or PRAGMA for direct console queries
    if (!/^(SELECT|PRAGMA|EXPLAIN)\s/i.test(trimmed)) {
      throw new Error('Solo se permiten consultas de lectura (SELECT, PRAGMA) en la consola SQL.');
    }
    const rows = db.prepare(trimmed).all() as any[];
    return {
      rowCount: rows.length,
      rows: rows.slice(0, 100), // cap at 100 for safety
    };
  },
};

// Initialize schema on load
initDatabase();
