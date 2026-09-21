import { Bingo, BingoCard, MercadoPagoConfig, Prize } from '../types';

export const initialBingos: Bingo[] = [
  {
    id: 'bingo-2026-01',
    name: '15º Bingo Monumental',
    description: 'Sorteo Lunes 28 de Septiembre 2026 a las 15:00 Horas. Organiza Club de Gimnasia y Tiro de Salta. Autorizado por EN.RE.J.A.',
    drawDate: '2026-09-28',
    drawTime: '15:00',
    price: 2500,
    currency: 'ARS',
    status: 'ACTIVE',
    reservationDurationMinutes: 10,
    location: 'Balcarce 850, Salta - Transmisión Oficial en Vivo',
    organizer: 'Club de Gimnasia y Tiro de Salta',
    termsAndConditions: 'Cartón de juego al portador con numeración oficial registrada en EN.RE.J.A. según resolución vigente. La compra digital incluye código de validación ante escribanía pública.',
    imageUrl: '/src/assets/images/bingo_casa_card_1789819899795.jpg',
    supportWhatsapp: '+54 9 387 421-5005',
    supportHours: 'Lunes a Sábados de 09:00 a 20:00 hs',
  },
  {
    id: 'bingo-2026-02',
    name: 'Bingo Solidario - Auto 0 km',
    description: 'Sorteo Especial de Primavera. ¡Ganá un Fiat Cronos 0km patentado y dinero en efectivo! Autorizado por Lotería.',
    drawDate: '2026-10-20',
    drawTime: '20:30',
    price: 2000,
    currency: 'ARS',
    status: 'ACTIVE',
    reservationDurationMinutes: 10,
    location: 'Sorteo Oficial transmitido por streaming y TV local',
    organizer: 'Fundación Social & Deportiva',
    termsAndConditions: 'Premio libre de gravámenes con entrega inmediata de la unidad 0km.',
    imageUrl: '/src/assets/images/bingo_auto_card_1789819914970.jpg',
    supportWhatsapp: '+54 9 387 421-5005',
    supportHours: 'Lunes a Sábados de 09:00 a 20:00 hs',
  },
  {
    id: 'bingo-2026-03',
    name: 'Gran Bingo Viaje - Punta Cana',
    description: 'Sorteo Internacional Todo Incluido para 2 personas + $2.500.000 de viáticos para tus vacaciones soñadas.',
    drawDate: '2026-10-30',
    drawTime: '19:00',
    price: 1500,
    currency: 'ARS',
    status: 'ACTIVE',
    reservationDurationMinutes: 10,
    location: 'Transmisión Oficial en vivo por Redes y YouTube',
    organizer: 'Asociación Mutual de Empleados',
    termsAndConditions: 'Válido para viajar en temporada alta o media con pasajes y resort 5 estrellas.',
    imageUrl: '/src/assets/images/bingo_viaje_card_1789819936993.jpg',
    supportWhatsapp: '+54 9 387 421-5005',
    supportHours: 'Lunes a Sábados de 09:00 a 20:00 hs',
  },
];

export const initialBingo: Bingo = initialBingos[0];

export const initialPrizes: Prize[] = [
  {
    id: 'prize-1',
    bingoId: 'bingo-2026-01',
    name: '1º Juego: $6.000.000 en Efectivo',
    description: 'Adjudicación directa en efectivo para la primera ronda de juego.',
    amount: 6000000,
    order: 1,
    iconType: 'cash',
  },
  {
    id: 'prize-2',
    bingoId: 'bingo-2026-01',
    name: '2º Juego: $7.000.000 en Efectivo',
    description: 'Adjudicación en efectivo para la segunda ronda.',
    amount: 7000000,
    order: 2,
    iconType: 'cash',
  },
  {
    id: 'prize-3',
    bingoId: 'bingo-2026-01',
    name: '3º Juego: $8.000.000 en Efectivo',
    description: 'Adjudicación en efectivo para la tercera ronda.',
    amount: 8000000,
    order: 3,
    iconType: 'cash',
  },
  {
    id: 'prize-4',
    bingoId: 'bingo-2026-01',
    name: '4º Juego: $12.000.000 en Efectivo',
    description: 'Gran pozo en efectivo para la cuarta ronda.',
    amount: 12000000,
    order: 4,
    iconType: 'cash',
  },
  {
    id: 'prize-5',
    bingoId: 'bingo-2026-01',
    name: '5º Juego: Fiat Cronos Like 0km + $4.000.000',
    description: 'Vehículo 0km patentado más cuatro millones en efectivo.',
    amount: 22000000,
    order: 5,
    iconType: 'car',
  },
  {
    id: 'prize-6',
    bingoId: 'bingo-2026-01',
    name: '6º Juego: Fiat Cronos Like 0km + $4.000.000',
    description: 'Vehículo 0km patentado más cuatro millones en efectivo.',
    amount: 22000000,
    order: 6,
    iconType: 'car',
  },
  {
    id: 'prize-7',
    bingoId: 'bingo-2026-01',
    name: '7º Juego: VW Tera Trendline 0km + $5.000.000',
    description: 'SUV VW Tera 0km patentado más cinco millones en efectivo.',
    amount: 26000000,
    order: 7,
    iconType: 'car',
  },
  {
    id: 'prize-8',
    bingoId: 'bingo-2026-01',
    name: '8º Juego: VW Taos Confortline 0km + $5.000.000',
    description: 'Gran premio mayor: VW Taos 0km patentada más cinco millones en efectivo.',
    amount: 35000000,
    order: 8,
    iconType: 'car',
  },
  // Prizes for bingo-2026-02 (Bingo Solidario - Auto 0km)
  {
    id: 'prize-auto-1',
    bingoId: 'bingo-2026-02',
    name: 'Línea Ronda 1: $1.000.000 en Efectivo',
    description: 'Adjudicación directa para la primera línea cantada.',
    amount: 1000000,
    order: 1,
    iconType: 'cash',
  },
  {
    id: 'prize-auto-2',
    bingoId: 'bingo-2026-02',
    name: 'Bingo Ronda 1: $3.500.000 en Efectivo',
    description: 'Pozo en efectivo primera ronda de bingo completa.',
    amount: 3500000,
    order: 2,
    iconType: 'cash',
  },
  {
    id: 'prize-auto-3',
    bingoId: 'bingo-2026-02',
    name: 'Línea Ronda 2: Moto 150cc 0km',
    description: 'Moto 0km lista para rodar con casco y papeles.',
    amount: 3200000,
    order: 3,
    iconType: 'gift',
  },
  {
    id: 'prize-auto-4',
    bingoId: 'bingo-2026-02',
    name: 'Bingo Ronda Mayor: Fiat Cronos 0km + $2.000.000',
    description: 'Premio estrella: Automóvil Fiat Cronos 0km patentado + $2.000.000 en efectivo.',
    amount: 24000000,
    order: 4,
    iconType: 'car',
  },
  // Prizes for bingo-2026-03 (Gran Bingo Viaje - Punta Cana)
  {
    id: 'prize-viaje-1',
    bingoId: 'bingo-2026-03',
    name: '1º Ronda: $2.000.000 en Efectivo',
    description: 'Pozo directo en efectivo para la ronda inicial.',
    amount: 2000000,
    order: 1,
    iconType: 'cash',
  },
  {
    id: 'prize-viaje-2',
    bingoId: 'bingo-2026-03',
    name: '2º Ronda: Smart TV 65" 4K + Consola PS5',
    description: 'Kit de entretenimiento premium para el hogar.',
    amount: 2800000,
    order: 2,
    iconType: 'gift',
  },
  {
    id: 'prize-viaje-3',
    bingoId: 'bingo-2026-03',
    name: 'Gran Premio: Viaje a Punta Cana All Inclusive + $2.500.000',
    description: 'Vacaciones soñadas para 2 personas en resort 5 estrellas con todo incluido + viáticos.',
    amount: 18500000,
    order: 3,
    iconType: 'trophy',
  },
];

// Initial physical cards featuring the official 7811 card
const baseInitialCards: BingoCard[] = [
  {
    id: 'card-bingo-2026-01-7811',
    bingoId: 'bingo-2026-01',
    cardNumber: 7811,
    numbers: [8, 13, 23, 35, 39, 50, 63, 66, 70, 85],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-7812',
    bingoId: 'bingo-2026-01',
    cardNumber: 7812,
    numbers: [4, 17, 21, 32, 44, 51, 60, 69, 74, 88],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146001',
    bingoId: 'bingo-2026-01',
    cardNumber: 146001,
    numbers: [1, 5, 12, 46, 48, 58, 62, 69, 70, 89],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146002',
    bingoId: 'bingo-2026-01',
    cardNumber: 146002,
    numbers: [3, 7, 14, 25, 31, 44, 53, 66, 72, 88],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146003',
    bingoId: 'bingo-2026-01',
    cardNumber: 146003,
    numbers: [4, 9, 18, 22, 35, 41, 59, 63, 77, 85],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146004',
    bingoId: 'bingo-2026-01',
    cardNumber: 146004,
    numbers: [2, 11, 19, 28, 33, 47, 52, 68, 79, 90],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146005',
    bingoId: 'bingo-2026-01',
    cardNumber: 146005,
    numbers: [6, 13, 20, 34, 42, 50, 61, 74, 82, 87],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146006',
    bingoId: 'bingo-2026-01',
    cardNumber: 146006,
    numbers: [8, 15, 27, 39, 45, 54, 65, 71, 80, 86],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146007',
    bingoId: 'bingo-2026-01',
    cardNumber: 146007,
    numbers: [10, 16, 23, 30, 49, 55, 67, 73, 81, 84],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146008',
    bingoId: 'bingo-2026-01',
    cardNumber: 146008,
    numbers: [5, 17, 24, 38, 43, 57, 60, 75, 83, 89],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146009',
    bingoId: 'bingo-2026-01',
    cardNumber: 146009,
    numbers: [1, 8, 21, 32, 40, 56, 64, 76, 78, 90],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146010',
    bingoId: 'bingo-2026-01',
    cardNumber: 146010,
    numbers: [7, 12, 29, 36, 48, 51, 62, 70, 85, 88],
    status: 'AVAILABLE',
  },
  {
    id: 'card-bingo-2026-01-146013',
    bingoId: 'bingo-2026-01',
    cardNumber: 146013,
    numbers: [2, 9, 16, 17, 28, 37, 44, 59, 62, 67],
    status: 'AVAILABLE',
  },
];

// Generate deterministic 90 cards for 01 to 90
export const initialCards: BingoCard[] = [...baseInitialCards];
for (let i = 11; i <= 90; i++) {
  if (i === 13) continue; // Already explicitly added as 146013
  const cardNum = 146000 + i;
  // Deterministic seed generation based on index
  const pool = Array.from({ length: 90 }, (_, idx) => idx + 1);
  const picked: number[] = [];
  for (let step = 0; step < 10; step++) {
    const pickIndex = (i * 7 + step * 13) % pool.length;
    picked.push(pool[pickIndex]);
    pool.splice(pickIndex, 1);
  }
  picked.sort((a, b) => a - b);
  initialCards.push({
    id: `card-bingo-2026-01-${cardNum}`,
    bingoId: 'bingo-2026-01',
    cardNumber: cardNum,
    numbers: picked,
    status: 'AVAILABLE',
  });
}

export const initialMercadoPagoConfig: MercadoPagoConfig = {
  publicKey: 'TEST-29481023-e89a-4c22-b062-8172938102a9',
  accessToken: 'TEST-829104819283-091218-a890b213-982103',
  sandboxMode: true,
  webhookUrl: 'https://api.tudominio.com/api/mercadopago/webhook',
  autoApproveInSandbox: true,
};
