export interface PastBingoItem {
  id: string;
  name: string;
  drawDate: string;
  drawTime: string;
  image: string;
  mainPrize: string;
  totalPrizes: string;
  winnerInfo: string;
  winningTicket: number;
  location: string;
  officialResolution: string;
  extractoUrl?: string;
}

export const PAST_BINGOS: PastBingoItem[] = [
  {
    id: 'past-bingo-14',
    name: '14º Gran Bingo Monumental',
    drawDate: '15 de Agosto 2026',
    drawTime: '15:00 hs',
    image: '/src/assets/images/bingo_casa_card_1789819899795.jpg',
    mainPrize: 'Toyota Yaris 0km + $10.000.000',
    totalPrizes: '$ 85.000.000 en Premios Oficiales',
    winnerInfo: 'Ganador en Salta Capital',
    winningTicket: 4521,
    location: 'Sede Central - Escribanía Pública Matriculada',
    officialResolution: 'EN.RE.JA Res. Nº 142/26',
  },
  {
    id: 'past-bingo-13',
    name: '13º Bingo Especial de Invierno',
    drawDate: '20 de Julio 2026',
    drawTime: '18:00 hs',
    image: '/src/assets/images/bingo_auto_card_1789819914970.jpg',
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
    mainPrize: 'Viaje a Cancún All Inclusive + $4.000.000',
    totalPrizes: '$ 45.000.000 en Premios Oficiales',
    winnerInfo: 'Ganador en Salta Centro',
    winningTicket: 8304,
    location: 'Salón de Actos Oficial',
    officialResolution: 'EN.RE.JA Res. Nº 095/26',
  },
];
