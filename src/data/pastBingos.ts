export interface PastBingoItem {
  id: string;
  name: string;
  drawDate: string;
  drawTime: string;
  image: string;
  mainPrize?: string;
  totalPrizes?: string;
  winnerInfo?: string;
  winningTicket?: number;
  location?: string;
  officialResolution?: string;
  /**
   * Ruta o URL de la imagen del extracto oficial.
   * Podés cambiarla aquí por tu propia imagen (ej: '/mi_extracto.jpg' o una URL).
   */
  extractoImage?: string;
}

export const PAST_BINGOS: PastBingoItem[] = [
  {
    id: 'past-bingo-14',
    name: '14º Gran Bingo Monumental',
    drawDate: '15 de Agosto 2026',
    drawTime: '15:00 hs',
    image: '/src/assets/images/bingo_casa_card_1789819899795.jpg',
    // Podés cambiar la imagen de tu extracto aquí:
    extractoImage: '/extracto_oficial_ejemplo.svg',
    mainPrize: 'Toyota Yaris 0km + $10.000.000',
    totalPrizes: '$ 85.000.000 en Premios Oficiales',
    winnerInfo: 'Ganador en Salta Capital',
    winningTicket: 4521,
    location: 'Sede Central Oficial',
    officialResolution: 'EN.RE.JA Res. Nº 142/26',
  },
  {
    id: 'past-bingo-13',
    name: '13º Bingo Especial de Invierno',
    drawDate: '20 de Julio 2026',
    drawTime: '18:00 hs',
    image: '/src/assets/images/bingo_auto_card_1789819914970.jpg',
    // Podés cambiar la imagen de tu extracto aquí:
    extractoImage: '/extracto_oficial_ejemplo.svg',
    mainPrize: 'Renault Sandero 0km + $5.000.000',
    totalPrizes: '$ 60.000.000 en Premios Oficiales',
    winnerInfo: 'Ganador en San Salvador de Jujuy',
    winningTicket: 12890,
    location: 'Transmisión Oficial en Vivo',
    officialResolution: 'EN.RE.JA Res. Nº 118/26',
  },
  {
    id: 'past-bingo-12',
    name: 'Gran Bingo Aniversario Solidario',
    drawDate: '25 de Mayo 2026',
    drawTime: '17:00 hs',
    image: '/src/assets/images/bingo_viaje_card_1789819936993.jpg',
    // Podés cambiar la imagen de tu extracto aquí:
    extractoImage: '/extracto_oficial_ejemplo.svg',
    mainPrize: 'Viaje a Cancún All Inclusive + $4.000.000',
    totalPrizes: '$ 45.000.000 en Premios Oficiales',
    winnerInfo: 'Ganador en Salta Centro',
    winningTicket: 8304,
    location: 'Salón de Actos Oficial',
    officialResolution: 'EN.RE.JA Res. Nº 095/26',
  },
];

const STORAGE_KEY = 'tubingo_past_bingos_v1';

export const getStoredPastBingos = (): PastBingoItem[] => {
  if (typeof window === 'undefined') return PAST_BINGOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading stored past bingos:', err);
  }
  return PAST_BINGOS;
};

export const saveStoredPastBingos = (items: PastBingoItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('tubingo_past_bingos_updated'));
  } catch (err) {
    console.error('Error saving stored past bingos:', err);
  }
};

export const updatePastBingoExtract = (bingoId: string, extractoImage: string): PastBingoItem[] => {
  const current = getStoredPastBingos();
  const updated = current.map((item) =>
    item.id === bingoId ? { ...item, extractoImage } : item
  );
  saveStoredPastBingos(updated);
  return updated;
};

export const addOrUpdatePastBingo = (item: PastBingoItem): PastBingoItem[] => {
  const current = getStoredPastBingos();
  const existingIdx = current.findIndex((b) => b.id === item.id);
  let updated: PastBingoItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = item;
  } else {
    updated = [item, ...current];
  }
  saveStoredPastBingos(updated);
  return updated;
};

export const resetPastBingosToDefault = (): PastBingoItem[] => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('tubingo_past_bingos_updated'));
  }
  return PAST_BINGOS;
};
