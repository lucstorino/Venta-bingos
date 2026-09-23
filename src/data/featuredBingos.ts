export interface AvailableBingoItem {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  date: string;
  time?: string;
  mainPrize?: string;
  price: number;
  formattedPrice: string;
  image: string;
  slug: string;
  badge?: string;
  prizesImage?: string;
  salesClosed?: boolean;
  status?: string;
}

export const FEATURED_BINGOS: AvailableBingoItem[] = [
  {
    id: 'bingo-solidario-casa',
    tag: 'BINGO SOLIDARIO',
    tagColor: 'text-blue-600',
    title: 'Casa a estrenar',
    date: '15 de Octubre 2026',
    time: '21:00 hs',
    mainPrize: 'Casa a estrenar totalmente equipada',
    price: 1000,
    formattedPrice: '$ 1.000'.replace(' ', '\u00A0'),
    image: '/src/assets/images/bingo_casa_card_1789819899795.jpg',
    prizesImage: '/premios_oficiales_ejemplo.svg',
    slug: 'casa-a-estrenar',
    badge: 'Gran Pozo Inmobiliario',
  },
  {
    id: 'bingo-especial-auto',
    tag: 'BINGO ESPECIAL',
    tagColor: 'text-blue-600',
    title: 'Auto 0 km',
    date: '20 de Octubre 2026',
    time: '20:30 hs',
    mainPrize: 'Fiat Cronos 0km patentado + Efectivo',
    price: 2000,
    formattedPrice: '$ 2.000'.replace(' ', '\u00A0'),
    image: '/src/assets/images/bingo_auto_card_1789819914970.jpg',
    prizesImage: '/premios_oficiales_ejemplo.svg',
    slug: 'auto-0km',
    badge: 'Vehículo 0km Patentado',
  },
  {
    id: 'bingo-viaje-punta-cana',
    tag: 'BINGO VIAJE',
    tagColor: 'text-blue-600',
    title: 'Viaje a Punta Cana',
    date: '30 de Octubre 2026',
    time: '19:00 hs',
    mainPrize: 'Viaje all inclusive 2 personas + $2.500.000',
    price: 1500,
    formattedPrice: '$ 1.500'.replace(' ', '\u00A0'),
    image: '/src/assets/images/bingo_viaje_card_1789819936993.jpg',
    prizesImage: '/premios_oficiales_ejemplo.svg',
    slug: 'viaje-punta-cana',
    badge: 'Todo Incluido 2 Personas',
  },
];
