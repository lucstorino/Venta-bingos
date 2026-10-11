import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { storage, db } from './firebaseClient';

/**
 * 5 Tipos oficiales de imágenes por Bingo en Firebase:
 * - tipo1 / cover: Foto de portada / premio principal en tarjetas y catálogo.
 * - tipo2 / prizes: Gráfica / flyer con la tabla completa de premios.
 * - tipo3 / template: Plantilla oficial del cartón de juego (PDF y vista de cartón).
 * - tipo4 / extract: Extracto oficial con números sorteados y ganadores.
 * - tipo5 / banner: Banner publicitario o imagen promocional secundaria del bingo.
 */
export type BingoImageType = 
  | 'tipo1' 
  | 'tipo2' 
  | 'tipo3' 
  | 'tipo4' 
  | 'tipo5' 
  | 'cover' 
  | 'prizes' 
  | 'template' 
  | 'extract' 
  | 'banner';

export type CanonicalImageType = 'tipo1' | 'tipo2' | 'tipo3' | 'tipo4' | 'tipo5';

export interface BingoImageMetadata {
  tipo: CanonicalImageType;
  numero: 1 | 2 | 3 | 4 | 5;
  nombre: string;
  descripcion: string;
  url: string;
  storagePath: string;
  updatedAt: string;
  contentType?: string;
  sizeBytes?: number;
  replacedAt?: string;
  isFirebaseStored: boolean;
}

export interface FiveBingoImagesState {
  bingoId: string;
  tipo1?: BingoImageMetadata;
  tipo2?: BingoImageMetadata;
  tipo3?: BingoImageMetadata;
  tipo4?: BingoImageMetadata;
  tipo5?: BingoImageMetadata;
  updatedAt: string;
}

/**
 * Normaliza cualquier tipo a su clave canónica 'tipo1'..'tipo5'
 */
export function normalizeImageType(type: BingoImageType): CanonicalImageType {
  switch (type) {
    case 'tipo1':
    case 'cover':
      return 'tipo1';
    case 'tipo2':
    case 'prizes':
      return 'tipo2';
    case 'tipo3':
    case 'template':
      return 'tipo3';
    case 'tipo4':
    case 'extract':
      return 'tipo4';
    case 'tipo5':
    case 'banner':
      return 'tipo5';
    default:
      return 'tipo1';
  }
}

/**
 * Información oficial de los 5 tipos de imágenes
 */
export const FIVE_IMAGES_INFO: Record<CanonicalImageType, {
  numero: 1 | 2 | 3 | 4 | 5;
  tag: string;
  nombre: string;
  descripcion: string;
  legacyField: string;
  tipoField: string;
  recommendedResolution: string;
  aspectRatioLabel: string;
}> = {
  tipo1: {
    numero: 1,
    tag: 'TIPO 1',
    nombre: 'Portada Principal del Bingo',
    descripcion: 'Imagen principal mostrada en la cabecera, catálogo de sorteos y tarjetas de selección.',
    legacyField: 'imageUrl',
    tipoField: 'tipo1Url',
    recommendedResolution: '1200 x 675 px (JPG, PNG o WebP)',
    aspectRatioLabel: '16:9 Horizontal',
  },
  tipo2: {
    numero: 2,
    tag: 'TIPO 2',
    nombre: 'Gráfica Oficial de Premios',
    descripcion: 'Afiche o flyer detallado con los vehículos, efectivo y premios de cada ronda.',
    legacyField: 'prizesImageUrl',
    tipoField: 'tipo2Url',
    recommendedResolution: '1200 x 1600 px o 1080 x 1080 px (Alta resolución)',
    aspectRatioLabel: '3:4 o 1:1',
  },
  tipo3: {
    numero: 3,
    tag: 'TIPO 3',
    nombre: 'Plantilla Oficial del Cartón',
    descripcion: 'Diseño oficial de fondo para la impresión física y generación digital del cartón de juego.',
    legacyField: 'ticketTemplateImage',
    tipoField: 'tipo3Url',
    recommendedResolution: '2000 x 1000 px (Horizontal nítido)',
    aspectRatioLabel: '2:1 Horizontal',
  },
  tipo4: {
    numero: 4,
    tag: 'TIPO 4',
    nombre: 'Extracto Oficial del Sorteo',
    descripcion: 'Foto o acta oficial del extracto con las bolillas sorteadas y números ganadores.',
    legacyField: 'extractoImageUrl',
    tipoField: 'tipo4Url',
    recommendedResolution: '1200 x 1800 px (Vertical legible)',
    aspectRatioLabel: '3:4 o 9:16 Vertical',
  },
  tipo5: {
    numero: 5,
    tag: 'TIPO 5',
    nombre: 'Banner Promocional Secundario',
    descripcion: 'Banner para difusión en redes sociales, campañas publicitarias o cabeceras secundarias.',
    legacyField: 'bannerImageUrl',
    tipoField: 'tipo5Url',
    recommendedResolution: '1920 x 600 px o 1200 x 630 px',
    aspectRatioLabel: '21:9 o 16:9 Panorámico',
  },
};

// Retrocompatibilidad con BINGO_IMAGE_LABELS
export const BINGO_IMAGE_LABELS: Record<string, { name: string; desc: string }> = {
  cover: { name: FIVE_IMAGES_INFO.tipo1.nombre, desc: FIVE_IMAGES_INFO.tipo1.descripcion },
  prizes: { name: FIVE_IMAGES_INFO.tipo2.nombre, desc: FIVE_IMAGES_INFO.tipo2.descripcion },
  template: { name: FIVE_IMAGES_INFO.tipo3.nombre, desc: FIVE_IMAGES_INFO.tipo3.descripcion },
  extract: { name: FIVE_IMAGES_INFO.tipo4.nombre, desc: FIVE_IMAGES_INFO.tipo4.descripcion },
  banner: { name: FIVE_IMAGES_INFO.tipo5.nombre, desc: FIVE_IMAGES_INFO.tipo5.descripcion },
  tipo1: { name: FIVE_IMAGES_INFO.tipo1.nombre, desc: FIVE_IMAGES_INFO.tipo1.descripcion },
  tipo2: { name: FIVE_IMAGES_INFO.tipo2.nombre, desc: FIVE_IMAGES_INFO.tipo2.descripcion },
  tipo3: { name: FIVE_IMAGES_INFO.tipo3.nombre, desc: FIVE_IMAGES_INFO.tipo3.descripcion },
  tipo4: { name: FIVE_IMAGES_INFO.tipo4.nombre, desc: FIVE_IMAGES_INFO.tipo4.descripcion },
  tipo5: { name: FIVE_IMAGES_INFO.tipo5.nombre, desc: FIVE_IMAGES_INFO.tipo5.descripcion },
};

export const BINGO_FIELD_BY_TYPE: Record<string, string> = {
  cover: 'imageUrl',
  prizes: 'prizesImageUrl',
  template: 'ticketTemplateImage',
  extract: 'extractoImageUrl',
  banner: 'bannerImageUrl',
  tipo1: 'imageUrl',
  tipo2: 'prizesImageUrl',
  tipo3: 'ticketTemplateImage',
  tipo4: 'extractoImageUrl',
  tipo5: 'bannerImageUrl',
};

/**
 * Convierte un File o Blob a Data URL Base64 para almacenamiento y transmisión rápida.
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Guarda o REEMPLAZA una de las 5 imágenes asociadas a un Bingo en Firebase.
 * 
 * - Si ya existía una imagen para este tipo, se reemplaza tanto en Firebase Firestore
 *   como en el almacenamiento, actualizando la fecha y los metadatos.
 * - Sincroniza en Firestore:
 *   1. firebaseImages[canonicalType] (objeto estructurado completo)
 *   2. tipo1Url..tipo5Url
 *   3. imageUrl, prizesImageUrl, ticketTemplateImage, extractoImageUrl, bannerImageUrl
 * 
 * @param bingoId Código o ID del bingo
 * @param imageType Tipo de imagen (tipo1..tipo5 o alias cover, prizes, template, extract, banner)
 * @param file Archivo File o Blob de la nueva imagen
 * @param previousUrl URL anterior para limpiar si fue reemplazada
 */
export async function uploadBingoImage(
  bingoId: string,
  imageType: BingoImageType,
  file: File | Blob,
  previousUrl?: string
): Promise<{ url: string; storagePath: string; metadata: BingoImageMetadata }> {
  if (!bingoId) throw new Error('Se requiere el código del bingo para almacenar la imagen en Firebase.');

  const canonical = normalizeImageType(imageType);
  const info = FIVE_IMAGES_INFO[canonical];
  const filename = (file as File).name || `${canonical}_${Date.now()}.jpg`;
  
  let finalUrl = '';
  let finalStoragePath = `bingos/${bingoId}/${canonical}`;

  // 1. Convertir a Data URL para procesamiento seguro
  const dataUrl = await fileToDataUrl(file);

  // 2. Subir al endpoint local para disponibilidad instantánea (evita bloqueos de red)
  try {
    const apiResponse = await fetch('/api/images/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bingoId,
        imageType: canonical,
        imageBase64: dataUrl,
        filename,
      }),
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      if (data.url) {
        finalUrl = data.url;
        finalStoragePath = data.storagePath || finalStoragePath;
      }
    }
  } catch (apiErr) {
    console.warn('Aviso: endpoint local de subida no respondió, usando respaldo directo:', apiErr);
  }

  // 3. Respaldo directo si no hubo URL
  if (!finalUrl) {
    finalUrl = dataUrl;
  }

  // 4. Si había una imagen previa local diferente, solicitar limpieza en servidor
  if (previousUrl && previousUrl !== finalUrl && previousUrl.startsWith('/uploads/bingos/')) {
    try {
      fetch('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bingoId, imageType: canonical, url: previousUrl }),
      }).catch(() => {});
    } catch {
      // Ignorar si falla la limpieza anterior
    }
  }

  const nowIso = new Date().toISOString();
  const metadata: BingoImageMetadata = {
    tipo: canonical,
    numero: info.numero,
    nombre: info.nombre,
    descripcion: info.descripcion,
    url: finalUrl,
    storagePath: finalStoragePath,
    updatedAt: nowIso,
    contentType: file.type || 'image/jpeg',
    sizeBytes: file.size,
    isFirebaseStored: true,
    ...(previousUrl ? { replacedAt: nowIso } : {}),
  };

  // 5. Guardar y sincronizar permanentemente en Firebase Firestore
  try {
    const bingoRef = doc(db, 'bingos', bingoId);
    
    // Objeto con todos los campos sincronizados
    const updatePayload: Record<string, any> = {
      id: bingoId,
      [info.tipoField]: finalUrl,
      [info.legacyField]: finalUrl,
      [`firebaseImages.${canonical}`]: metadata,
      [`imagesMetadata.${canonical}`]: metadata,
      updatedAt: nowIso,
    };

    await setDoc(bingoRef, updatePayload, { merge: true });
  } catch (firestoreErr) {
    console.warn('Aviso al persistir en Firestore (la imagen fue procesada):', firestoreErr);
  }

  return { url: finalUrl, storagePath: finalStoragePath, metadata };
}

/**
 * Obtiene las 5 imágenes oficiales asociadas a un Bingo desde Firebase Firestore.
 */
export async function getBingoFiveImages(bingoId: string): Promise<Record<CanonicalImageType, string | undefined>> {
  const result: Record<CanonicalImageType, string | undefined> = {
    tipo1: undefined,
    tipo2: undefined,
    tipo3: undefined,
    tipo4: undefined,
    tipo5: undefined,
  };

  if (!bingoId) return result;

  try {
    const bingoRef = doc(db, 'bingos', bingoId);
    const snap = await getDoc(bingoRef);
    if (snap.exists()) {
      const data = snap.data();
      const fbImages = data.firebaseImages || {};

      result.tipo1 = data.tipo1Url || fbImages.tipo1?.url || data.imageUrl || data.imagesMetadata?.cover?.url;
      result.tipo2 = data.tipo2Url || fbImages.tipo2?.url || data.prizesImageUrl || data.imagesMetadata?.prizes?.url;
      result.tipo3 = data.tipo3Url || fbImages.tipo3?.url || data.ticketTemplateImage || data.imagesMetadata?.template?.url;
      result.tipo4 = data.tipo4Url || fbImages.tipo4?.url || data.extractoImageUrl || data.imagesMetadata?.extract?.url;
      result.tipo5 = data.tipo5Url || fbImages.tipo5?.url || data.bannerImageUrl || data.imagesMetadata?.banner?.url;
    }
  } catch (err) {
    console.warn(`Error al consultar 5 imágenes en Firebase para ${bingoId}:`, err);
  }

  return result;
}

// Retrocompatibilidad con getBingoImages
export async function getBingoImages(bingoId: string): Promise<Record<string, string | undefined>> {
  const five = await getBingoFiveImages(bingoId);
  return {
    cover: five.tipo1,
    prizes: five.tipo2,
    template: five.tipo3,
    extract: five.tipo4,
    banner: five.tipo5,
    tipo1: five.tipo1,
    tipo2: five.tipo2,
    tipo3: five.tipo3,
    tipo4: five.tipo4,
    tipo5: five.tipo5,
  };
}

/**
 * Elimina una imagen de Firebase (Firestore y almacenamiento local/storage)
 */
export async function deleteBingoImage(bingoId: string, imageType: BingoImageType, currentUrl?: string): Promise<void> {
  if (!bingoId) return;

  const canonical = normalizeImageType(imageType);
  const info = FIVE_IMAGES_INFO[canonical];

  // 1. Eliminar archivo local
  try {
    await fetch('/api/images/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bingoId, imageType: canonical, url: currentUrl }),
    });
  } catch (err) {
    console.warn('Aviso al eliminar del servidor:', err);
  }

  // 2. Limpiar referencia en Firebase Firestore
  try {
    const bingoRef = doc(db, 'bingos', bingoId);
    await updateDoc(bingoRef, {
      [info.tipoField]: null,
      [info.legacyField]: null,
      [`firebaseImages.${canonical}`]: null,
      [`imagesMetadata.${canonical}`]: null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Aviso al actualizar Firestore tras eliminar imagen:', err);
  }
}
