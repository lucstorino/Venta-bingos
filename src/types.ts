export type BingoStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';

export type CardStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'CANCELLED';

export type OrderStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED';

export interface Bingo {
  id: string;
  name: string;
  description: string;
  drawDate: string; // ISO date YYYY-MM-DD
  drawTime: string; // HH:mm
  price: number;
  currency: string;
  status: BingoStatus;
  reservationDurationMinutes: number; // default 10
  location?: string;
  organizer?: string;
  termsAndConditions?: string;
  imageUrl?: string;
  prizesImageUrl?: string;
  supportWhatsapp?: string;
  supportHours?: string;
  // Official physical/digital ticket template customization per bingo
  ticketTemplateImage?: string;
  ticketEditionTitle?: string;
  ticketDrawDateText?: string;
  ticketPriceText?: string;
  ticketResolutionText?: string;
  ticketOrganizerTitle?: string;
  ticketOrganizerContact?: string;
  salesClosed?: boolean;
  salesClosedAt?: number;
  extractoImageUrl?: string;
  bannerImageUrl?: string;
  // 5 Tipos oficiales de imágenes en Firebase
  tipo1Url?: string; // Tipo 1: Portada Principal del Bingo
  tipo2Url?: string; // Tipo 2: Gráfica Oficial de Premios
  tipo3Url?: string; // Tipo 3: Plantilla Oficial del Cartón
  tipo4Url?: string; // Tipo 4: Extracto Oficial del Sorteo
  tipo5Url?: string; // Tipo 5: Banner Promocional Secundario
  firebaseImages?: Record<string, any>;
  imagesMetadata?: Record<string, any>;
}

export interface CompradorData {
  nombreApellido: string;
  dni?: string;
  direccion: string;
  localidad: string;
  telefono: string;
}

export interface BingoCard {
  id: string;
  bingoId: string;
  cardNumber: number; // e.g. 146001
  numbers: number[]; // 10 game numbers
  status: CardStatus;
  reservedAt?: number; // timestamp in ms
  reservedUntil?: number; // timestamp in ms
  reservedBySessionId?: string;
  soldToOrderId?: string;
  soldAt?: number;
  comprador?: CompradorData;
  customer?: Customer;
}

export interface Customer {
  id?: string;
  name: string;
  lastname: string;
  dni: string;
  address: string;
  city?: string;
  phone: string;
  email?: string;
}

export interface Order {
  id: string;
  bingoId: string;
  cardId: string;
  cardNumber: number;
  // Multi-card support
  cardIds?: string[];
  cards?: BingoCard[];
  cardNumbers?: number[];
  totalCards?: number;
  customer: Customer;
  comprador?: CompradorData;
  amount: number;
  status: OrderStatus;
  createdAt: number;
  paidAt?: number;
  paymentId?: string;
  validationCode: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: 'MERCADO_PAGO';
  externalId?: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: number;
  paymentMethod?: string;
}

export interface Prize {
  id: string;
  bingoId: string;
  name: string;
  description: string;
  amount?: number;
  order: number;
  iconType?: 'trophy' | 'car' | 'cash' | 'gift' | 'home';
}

export interface MercadoPagoConfig {
  publicKey: string;
  accessToken: string;
  sandboxMode: boolean;
  webhookUrl: string;
  autoApproveInSandbox: boolean;
}
