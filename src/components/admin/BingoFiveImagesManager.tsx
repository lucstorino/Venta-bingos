import React, { useState, useRef } from 'react';
import {
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cloud,
  Sparkles,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  X,
  FileImage,
  Database,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Bingo } from '../../types';
import {
  CanonicalImageType,
  FIVE_IMAGES_INFO,
  uploadBingoImage,
  deleteBingoImage,
} from '../../services/firebaseBingoStorageService';

interface BingoFiveImagesManagerProps {
  bingo: Bingo;
  onUpdateBingoImages: (updatedFields: Partial<Bingo>) => void;
}

export const BingoFiveImagesManager: React.FC<BingoFiveImagesManagerProps> = ({
  bingo,
  onUpdateBingoImages,
}) => {
  const [uploadingTipo, setUploadingTipo] = useState<CanonicalImageType | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; title: string } | null>(null);
  const [showFirestoreInspector, setShowFirestoreInspector] = useState<boolean>(false);
  const [hasCopiedPath, setHasCopiedPath] = useState<boolean>(false);

  // Hidden file input refs for each of the 5 types
  const fileInputRefs = {
    tipo1: useRef<HTMLInputElement>(null),
    tipo2: useRef<HTMLInputElement>(null),
    tipo3: useRef<HTMLInputElement>(null),
    tipo4: useRef<HTMLInputElement>(null),
    tipo5: useRef<HTMLInputElement>(null),
  };

  // Get current URL for each type from bingo object
  const getImageForTipo = (tipo: CanonicalImageType): string | undefined => {
    switch (tipo) {
      case 'tipo1':
        return bingo.tipo1Url || bingo.imageUrl;
      case 'tipo2':
        return bingo.tipo2Url || bingo.prizesImageUrl;
      case 'tipo3':
        return bingo.tipo3Url || bingo.ticketTemplateImage;
      case 'tipo4':
        return bingo.tipo4Url || bingo.extractoImageUrl;
      case 'tipo5':
        return bingo.tipo5Url || bingo.bannerImageUrl;
      default:
        return undefined;
    }
  };

  const getSavedImagesCount = (): number => {
    const tipos: CanonicalImageType[] = ['tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5'];
    return tipos.filter((t) => !!getImageForTipo(t)).length;
  };

  // Handle uploading or replacing an image
  const handleFileSelected = async (tipo: CanonicalImageType, file: File) => {
    if (!bingo.id) {
      setErrorMessage('Primero guarda los datos básicos del bingo antes de subir imágenes a Firebase.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP).');
      return;
    }

    setUploadingTipo(tipo);
    setErrorMessage(null);
    setSuccessMessage(null);

    const info = FIVE_IMAGES_INFO[tipo];
    const previousUrl = getImageForTipo(tipo);
    const isReplacing = !!previousUrl;

    try {
      const result = await uploadBingoImage(bingo.id, tipo, file, previousUrl);

      // Build updated fields for Bingo state
      const updatedFields: Partial<Bingo> = {
        [info.tipoField]: result.url,
        [info.legacyField]: result.url,
        firebaseImages: {
          ...(bingo.firebaseImages || {}),
          [tipo]: result.metadata,
        },
      };

      onUpdateBingoImages(updatedFields);

      setSuccessMessage(
        isReplacing
          ? `¡Imagen ${info.tag} reemplazada con éxito en Firebase!`
          : `¡Imagen ${info.tag} guardada exitosamente en Firebase!`
      );
      setTimeout(() => setSuccessMessage(null), 4500);
    } catch (err: any) {
      console.error(`Error al procesar imagen ${tipo}:`, err);
      setErrorMessage(err.message || 'Error al guardar la imagen en Firebase.');
    } finally {
      setUploadingTipo(null);
      // Reset input value so same file can be re-selected if needed
      if (fileInputRefs[tipo]?.current) {
        fileInputRefs[tipo].current!.value = '';
      }
    }
  };

  // Handle delete image
  const handleDelete = async (tipo: CanonicalImageType) => {
    const info = FIVE_IMAGES_INFO[tipo];
    const currentUrl = getImageForTipo(tipo);
    if (!currentUrl) return;

    if (!window.confirm(`¿Estás seguro de que deseas eliminar la imagen ${info.tag} (${info.nombre}) de Firebase?`)) {
      return;
    }

    setUploadingTipo(tipo);
    try {
      await deleteBingoImage(bingo.id, tipo, currentUrl);

      const updatedFields: Partial<Bingo> = {
        [info.tipoField]: '',
        [info.legacyField]: '',
        firebaseImages: {
          ...(bingo.firebaseImages || {}),
          [tipo]: undefined,
        },
      };

      onUpdateBingoImages(updatedFields);
      setSuccessMessage(`Imagen ${info.tag} eliminada de Firebase.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al eliminar la imagen de Firebase.');
    } finally {
      setUploadingTipo(null);
    }
  };

  const tiposList: CanonicalImageType[] = ['tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5'];
  const savedCount = getSavedImagesCount();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xs">
              <Cloud className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>5 Imágenes Oficiales del Bingo en Firebase</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Persistencia Firebase
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cada bingo cuenta con 5 tipos de imágenes oficiales. Podés subir una nueva imagen o reemplazar cualquiera de las existentes en cualquier momento.
              </p>
            </div>
          </div>
        </div>

        {/* Actions & Counter Badge */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowFirestoreInspector(!showFirestoreInspector)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              showFirestoreInspector
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-850 text-slate-300 border-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>Ver datos en Firestore</span>
            {showFirestoreInspector ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">
              Imágenes en Firebase: <strong className="text-amber-400 font-black">{savedCount} de 5</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Firestore Inspector Panel */}
      {showFirestoreInspector && (
        <div className="bg-slate-950/95 border border-amber-500/30 rounded-2xl p-5 space-y-4 animate-fadeIn shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Ruta y Ubicación Exacta en Firebase Firestore
                </h4>
                <p className="text-[11px] text-slate-400">
                  Base de datos oficial de Firebase donde se persisten los 5 tipos de imágenes de este sorteo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `projects/reference-jar-rpt51/databases/ai-studio-binguito-4e640eb6-8b5f-45c0-a441-72a7fd152103/documents/bingos/${bingo.id}`
                  );
                  setHasCopiedPath(true);
                  setTimeout(() => setHasCopiedPath(false), 2500);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center space-x-1 transition-colors cursor-pointer"
              >
                {hasCopiedPath ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Ruta Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Ruta</span>
                  </>
                )}
              </button>

              <a
                href="https://console.firebase.google.com/project/reference-jar-rpt51/firestore/databases/ai-studio-binguito-4e640eb6-8b5f-45c0-a441-72a7fd152103/data"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <span>Abrir Consola de Firebase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Location details card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Proyecto Firebase</span>
              <p className="font-bold text-slate-200 font-mono">reference-jar-rpt51</p>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Base de Datos (Firestore)</span>
              <p className="font-bold text-amber-400 font-mono truncate" title="ai-studio-binguito-4e640eb6-8b5f-45c0-a441-72a7fd152103">
                ai-studio-binguito-...
              </p>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Documento Colección</span>
              <p className="font-bold text-emerald-400 font-mono truncate" title={`/bingos/${bingo.id}`}>
                /bingos/{bingo.id}
              </p>
            </div>
          </div>

          {/* Current Live Fields in Firestore */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-300">
              Campos de las 5 Imágenes guardados en el Documento:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {tiposList.map((t) => {
                const info = FIVE_IMAGES_INFO[t];
                const url = getImageForTipo(t);
                return (
                  <div key={t} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-amber-400 font-bold shrink-0">{info.tag}:</span>
                    {url ? (
                      <span className="text-emerald-400 truncate text-[11px]" title={url}>
                        {url}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[11px] italic">null (sin imagen)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600/70 text-emerald-200 text-xs font-semibold flex items-center space-x-2.5 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs font-semibold flex items-center space-x-2.5 animate-fadeIn shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid of the 5 Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tiposList.map((tipo) => {
          const info = FIVE_IMAGES_INFO[tipo];
          const currentUrl = getImageForTipo(tipo);
          const isUploaded = !!currentUrl;
          const isCurrentlyUploading = uploadingTipo === tipo;

          // Theme colors per type for crystal clear differentiation
          const typeColors = {
            tipo1: {
              badge: 'bg-amber-400 text-slate-950 border-amber-300',
              borderHover: 'hover:border-amber-400/50',
              accent: 'text-amber-400',
            },
            tipo2: {
              badge: 'bg-blue-500 text-white border-blue-400',
              borderHover: 'hover:border-blue-400/50',
              accent: 'text-blue-400',
            },
            tipo3: {
              badge: 'bg-emerald-500 text-white border-emerald-400',
              borderHover: 'hover:border-emerald-400/50',
              accent: 'text-emerald-400',
            },
            tipo4: {
              badge: 'bg-purple-500 text-white border-purple-400',
              borderHover: 'hover:border-purple-400/50',
              accent: 'text-purple-400',
            },
            tipo5: {
              badge: 'bg-rose-500 text-white border-rose-400',
              borderHover: 'hover:border-rose-400/50',
              accent: 'text-rose-400',
            },
          }[tipo];

          return (
            <div
              key={tipo}
              className={`
                bg-slate-950/90 rounded-2xl border p-4.5 flex flex-col justify-between space-y-4 transition-all duration-200 relative overflow-hidden group
                ${isUploaded ? 'border-slate-800 ' + typeColors.borderHover : 'border-slate-800/60 border-dashed'}
              `}
            >
              {/* Card Top: Badges and Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase border shadow-2xs ${typeColors.badge}`}>
                    {info.tag}
                  </span>

                  {isUploaded ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span>En Firebase</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 text-[10px] font-medium">
                      <span>Sin imagen</span>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{info.nombre}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                    {info.descripcion}
                  </p>
                </div>
              </div>

              {/* Image Preview Container or Placeholder */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 flex items-center justify-center min-h-[140px] max-h-[180px]">
                {isUploaded ? (
                  <>
                    <img
                      src={currentUrl}
                      alt={info.nombre}
                      className="w-full h-36 object-contain p-1.5 transition-transform duration-300 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />

                    {/* Quick overlay actions on hover */}
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl({ url: currentUrl!, title: `${info.tag}: ${info.nombre}` })}
                        title="Ver imagen a pantalla completa"
                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRefs[tipo]?.current?.click()}
                        title="Reemplazar por otra imagen"
                        className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => fileInputRefs[tipo]?.current?.click()}
                    className="p-6 text-center cursor-pointer flex flex-col items-center justify-center space-y-2 hover:bg-slate-850/60 transition-colors w-full h-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      Clic para subir {info.tag}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {info.aspectRatioLabel}
                    </span>
                  </div>
                )}

                {/* Uploading Spinner Overlay */}
                {isCurrentlyUploading && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-20">
                    <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                    <span className="text-xs font-black text-white">
                      Guardando en Firebase...
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Subir / Reemplazar / Eliminar */}
              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                {/* Hidden input for this type */}
                <input
                  ref={fileInputRefs[tipo]}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelected(tipo, file);
                  }}
                />

                {isUploaded ? (
                  <div className="flex items-center gap-2">
                    {/* Botón Reemplazar Imagen */}
                    <button
                      type="button"
                      disabled={isCurrentlyUploading}
                      onClick={() => fileInputRefs[tipo]?.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reemplazar imagen</span>
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      disabled={isCurrentlyUploading}
                      onClick={() => handleDelete(tipo)}
                      title="Eliminar esta imagen de Firebase"
                      className="py-2 px-2.5 rounded-xl bg-slate-850 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/50 text-xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isCurrentlyUploading}
                    onClick={() => fileInputRefs[tipo]?.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Subir imagen a Firebase</span>
                  </button>
                )}

                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>{info.recommendedResolution}</span>
                  {isUploaded && <span className="text-emerald-400 font-semibold">✓ Guardada</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for HD Fullscreen Preview */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileImage className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">{previewModalUrl.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950/80">
              <img
                src={previewModalUrl.url}
                alt={previewModalUrl.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
