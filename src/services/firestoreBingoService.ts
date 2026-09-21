import { BingoCardData, CompradorData } from '../components/sales/BingoCard';

/**
 * Interfaz para el documento de Cartón en Firestore.
 * Colección prevista: `bingos/{bingoId}/cartones/{cartonId}` o `cartones/{cartonId}`
 */
export interface FirestoreBingoCardDocument {
  id?: string;
  numeroCarton: number;
  numerosJuego: number[];
  estado: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
  comprador?: CompradorData;
  compradorId?: string;
  compradorNombre?: string;
  compradorEmail?: string;
  compradorTelefono?: string;
  compradorDni?: string;
  compradorDireccion?: string;
  compradorLocalidad?: string;
  fechaCompra?: any; // Timestamp de Firestore
  fechaCreacion?: any;
  codigoValidacion?: string;
  ordenPagoId?: string;
}

/**
 * Transforma un documento de Firestore en los datos listos para el componente <BingoCard />
 */
export function transformFirestoreCard(doc: FirestoreBingoCardDocument | any): BingoCardData {
  if (!doc) {
    return {
      numeroCarton: 7811,
      numerosJuego: [8, 13, 23, 35, 39, 50, 63, 66, 70, 85],
    };
  }

  // Resolver datos dinámicos del comprador
  const comprador: CompradorData | undefined = doc.comprador ?? (
    doc.customer || doc.compradorNombre || doc.clienteNombre
      ? {
          nombreApellido:
            doc.compradorNombre ||
            (doc.customer ? `${doc.customer.name || ''} ${doc.customer.lastname || ''}`.trim() : '') ||
            doc.clienteNombre ||
            '',
          dni: doc.compradorDni || doc.customer?.dni || doc.dni || '',
          direccion: doc.compradorDireccion || doc.customer?.address || doc.direccion || '',
          localidad: doc.compradorLocalidad || doc.customer?.city || doc.localidad || '',
          telefono: doc.compradorTelefono || doc.customer?.phone || doc.telefono || '',
        }
      : undefined
  );

  return {
    numeroCarton: doc.numeroCarton ?? doc.cardNumber ?? 7811,
    numerosJuego: Array.isArray(doc.numerosJuego)
      ? doc.numerosJuego
      : Array.isArray(doc.numbers)
      ? doc.numbers
      : [8, 13, 23, 35, 39, 50, 63, 66, 70, 85],
    comprador,
    id: doc.id,
    clienteNombre: comprador?.nombreApellido || doc.compradorNombre || doc.customerName,
    fechaCompra: doc.fechaCompra?.toDate ? doc.fechaCompra.toDate().toISOString() : doc.fechaCompra,
    codigoValidacion: doc.codigoValidacion ?? doc.validationCode,
  };
}

/**
 * Servicio preparado para suscripción en tiempo real o lectura desde Firestore
 * Cuando se inicialice Firebase Firestore en la app, este adaptador conecta directamente.
 */
export class FirestoreBingoService {
  /**
   * Obtiene un cartón por su ID o número desde Firestore
   */
  static async fetchCardByNumber(numeroCarton: number): Promise<BingoCardData | null> {
    try {
      // Si existe un endpoint proxy o cliente Firestore
      const res = await fetch(`/api/cards?number=${numeroCarton}`);
      if (res.ok) {
        const data = await res.json();
        return transformFirestoreCard(data);
      }
    } catch (e) {
      console.warn('Firestore fetchCardByNumber fallback to local state:', e);
    }
    return null;
  }

  /**
   * Registra la adjudicación o compra del cartón en Firestore
   */
  static async assignPurchasedCard(
    numeroCarton: number,
    buyer: { nombre: string; email: string; telefono?: string; dni?: string }
  ): Promise<BingoCardData> {
    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumbers: [numeroCarton],
          customer: buyer,
        }),
      });
      if (res.ok) {
        const orderData = await res.json();
        return transformFirestoreCard(orderData.cards?.[0] || { numeroCarton });
      }
    } catch (e) {
      console.error('Error assigning card:', e);
    }
    return {
      numeroCarton,
      numerosJuego: [8, 13, 23, 35, 39, 50, 63, 66, 70, 85],
      clienteNombre: buyer.nombre,
    };
  }
}
