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
 * 5 Tipos oficiales de imágenes por Bingo:
 * 1. cover: Foto de portada / premio principal en tarjetas y catálogo.
 * 2. prizes: Gráfica / flyer con la tabla completa de premios.
 * 3. template: Plantilla oficial del cartón de juego (PDF y vista de cartón).
 * 4. extract: Extracto oficial con números sorteados y ganadores.
 * 5. banner: Banner o imagen promocional secundaria del bingo.
 */
export type BingoImageType = 'cover' | 'prizes' | 'template' | 'extract' | 'banner';

export interface BingoImageMetadata {
  url: string;
  storagePath: string;
  updatedAt: string;
  contentType?: string;
  sizeBytes?: number;
}

export interface BingoImagesRecord {
  bingoId: string;
  cover?: BingoImageMetadata;
  prizes?: BingoImageMetadata;
  template?: BingoImageMetadata;
  extract?: BingoImageMetadata;
  banner?: BingoImageMetadata;
  updatedAt: string;
}

export const BINGO_IMAGE_LABELS: Record<BingoImageType, { name: string; desc: string }> = {
  cover: {
    name: 'Foto de Portada',
    desc: 'Imagen principal mostrada en la cabecera y tarjetas del catálogo.',
  },
  prizes: {
    name: 'Gráfica de Premios',
    desc: 'Afiche o flyer detallado con la grilla oficial de premios.',
  },
  template: {
    name: 'Plantilla de Cartón',
    desc: 'Fondo oficial utilizado para imprimir y generar cartones digitales.',
  },
  extract: {
    name: 'Extracto Oficial',
    desc: 'Extracto oficial con bolillas sorteadas y números ganadores.',
  },
  banner: {
    name: 'Banner Promocional',
    desc: 'Imagen secundaria de difusión para redes y promociones.',
  },
};

/**
 * Mapeo entre BingoImageType y la propiedad correspondiente en el modelo `Bingo`.
 */
export const BINGO_FIELD_BY_TYPE: Record<BingoImageType, string> = {
  cover: 'imageUrl',
  prizes: 'prizesImageUrl',
  template: 'ticketTemplateImage',
  extract: 'extractoImageUrl',
  banner: 'bannerImageUrl',
};

/**
 * Normaliza el nombre del archivo para Storage según el tipo de imagen.
 */
function getStoragePathForBingo(bingoId: string, imageType: BingoImageType, filename: string): string {
  const cleanId = (bingoId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
  const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
  // Estructura limpia y predecible: bingos/{bingoId}/{imageType}.{ext}
  return `bingos/${cleanId}/${imageType}.${extension}`;
}

/**
 * Convierte un Data URL Base64 a File o Blob para subir a Storage.
 */
export function dataUrlToBlob(dataUrl: string, filename = 'image.jpg'): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Sube una imagen a Firebase Storage y actualiza la referencia permanente en Firestore.
 * 
 * @param bingoId Código o ID del bingo
 * @param imageType Uno de los 5 tipos: cover | prizes | template | extract | banner
 * @param file Archivo File o Blob a subir
 * @returns URL pública permanente de descarga
 */
export async function uploadBingoImage(
  bingoId: string,
  imageType: BingoImageType,
  file: File | Blob
): Promise<{ url: string; storagePath: string }> {
  if (!bingoId) throw new Error('Se requiere el código del bingo para almacenar la imagen.');

  const filename = (file as File).name || `${imageType}.jpg`;
  const storagePath = getStoragePathForBingo(bingoId, imageType, filename);
  const storageRef = ref(storage, storagePath);

  // 1. Subir físicamente a Firebase Storage
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
    cacheControl: 'public,max-age=31536000', // Cache por 1 año para máxima velocidad
    customMetadata: {
      bingoId,
      imageType,
      uploadedAt: new Date().toISOString(),
    },
  });

  // 2. Obtener la URL pública permanente
  const downloadUrl = await getDownloadURL(snapshot.ref);

  const metadata: BingoImageMetadata = {
    url: downloadUrl,
    storagePath,
    updatedAt: new Date().toISOString(),
    contentType: file.type,
    sizeBytes: file.size,
  };

  // 3. Guardar la referencia en Firestore en el documento del bingo
  try {
    const bingoRef = doc(db, 'bingos', bingoId);
    const fieldName = BINGO_FIELD_BY_TYPE[imageType];
    
    await setDoc(
      bingoRef,
      {
        id: bingoId,
        [fieldName]: downloadUrl,
        imagesMetadata: {
          [imageType]: metadata,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (firestoreErr) {
    console.warn('Advertencia al guardar referencia en Firestore (Storage sí se subió exitosamente):', firestoreErr);
  }

  return { url: downloadUrl, storagePath };
}

/**
 * Obtiene todas las URLs de imágenes asociadas a un Bingo desde Firestore.
 */
export async function getBingoImages(bingoId: string): Promise<Record<BingoImageType, string | undefined>> {
  const result: Record<BingoImageType, string | undefined> = {
    cover: undefined,
    prizes: undefined,
    template: undefined,
    extract: undefined,
    banner: undefined,
  };

  if (!bingoId) return result;

  try {
    const bingoRef = doc(db, 'bingos', bingoId);
    const snap = await getDoc(bingoRef);
    if (snap.exists()) {
      const data = snap.data();
      result.cover = data.imageUrl || data.imagesMetadata?.cover?.url;
      result.prizes = data.prizesImageUrl || data.imagesMetadata?.prizes?.url;
      result.template = data.ticketTemplateImage || data.imagesMetadata?.template?.url;
      result.extract = data.extractoImageUrl || data.imagesMetadata?.extract?.url;
      result.banner = data.bannerImageUrl || data.imagesMetadata?.banner?.url;
    }
  } catch (err) {
    console.warn(`No se pudieron cargar imágenes de Firestore para ${bingoId}:`, err);
  }

  return result;
}

/**
 * Elimina una imagen de Firebase Storage y remueve su referencia de Firestore.
 */
export async function deleteBingoImage(bingoId: string, imageType: BingoImageType): Promise<void> {
  if (!bingoId) return;

  const storagePath = getStoragePathForBingo(bingoId, imageType, 'file');
  const storageRef = ref(storage, storagePath);

  try {
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Error al eliminar de Storage (puede que no existiera):', err);
  }

  try {
    const bingoRef = doc(db, 'bingos', bingoId);
    const fieldName = BINGO_FIELD_BY_TYPE[imageType];
    await updateDoc(bingoRef, {
      [fieldName]: null,
      [`imagesMetadata.${imageType}`]: null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Error al actualizar Firestore tras eliminar imagen:', err);
  }
}
