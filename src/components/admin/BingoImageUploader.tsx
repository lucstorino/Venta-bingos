import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  Loader2,
  CloudCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { uploadBingoImage, deleteBingoImage, BingoImageType } from '../../services/firebaseBingoStorageService';

interface BingoImageUploaderProps {
  bingoId: string;
  imageType: BingoImageType;
  title: string;
  description: string;
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  aspectRatioLabel?: string;
  recommendedSize?: string;
}

export const BingoImageUploader: React.FC<BingoImageUploaderProps> = ({
  bingoId,
  imageType,
  title,
  description,
  currentImageUrl,
  onImageChange,
  aspectRatioLabel = '16:9',
  recommendedSize = 'Recomendado: JPG, PNG o WebP hasta 10MB',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (file: File) => {
    setErrorNotice(null);
    setSuccessNotice(null);

    if (!file.type.startsWith('image/')) {
      setErrorNotice('El archivo seleccionado debe ser una imagen válida (PNG, JPG o WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorNotice('La imagen supera los 15MB permitidos.');
      return;
    }

    if (!bingoId) {
      setErrorNotice('Debes asignar o guardar primero el código del bingo antes de subir imágenes permanentes.');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Subiendo a Firebase Storage...');

    try {
      // Sube a Firebase Storage en la ruta: bingos/{bingoId}/{imageType}.{ext}
      // y registra la referencia permanente en Firestore
      const { url } = await uploadBingoImage(bingoId, imageType, file);
      
      onImageChange(url);
      setSuccessNotice(`Imagen guardada permanentemente en Firebase Storage.`);
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error('Error subiendo imagen a Firebase Storage:', err);
      setErrorNotice(err.message || 'Error al conectar con Firebase Storage. Verifica tu conexión.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Deseas quitar esta imagen permanentemente de Firebase Storage?')) return;
    
    setIsUploading(true);
    try {
      if (bingoId) {
        await deleteBingoImage(bingoId, imageType);
      }
      onImageChange('');
      setSuccessNotice('Imagen eliminada de Firebase Storage.');
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      setErrorNotice('Error al eliminar imagen: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{title}</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
              {imageType}
            </span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
            {aspectRatioLabel}
          </span>
          {currentImageUrl && (
            <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md font-semibold">
              <CloudCheck className="w-3 h-3 text-emerald-400" />
              <span>Permanente en Firebase</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Preview or Dropzone */}
        <div className="md:col-span-8">
          {currentImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group aspect-[16/9] flex items-center justify-center">
              <img
                src={currentImageUrl}
                alt={title}
                className="w-full h-full object-contain bg-slate-950 p-1"
                referrerPolicy="no-referrer"
              />

              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 p-4">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Reemplazar en Storage</span>
                </button>
                <a
                  href={currentImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center space-x-1 transition-all"
                  title="Abrir imagen original"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleDelete}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>

              {isUploading && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs font-bold text-white">{uploadProgress}</span>
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[16/9] group ${
                isDragging
                  ? 'border-amber-400 bg-amber-400/10'
                  : 'border-slate-700 hover:border-amber-400 bg-slate-950 hover:bg-slate-950/80'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs font-bold text-white">{uploadProgress}</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-amber-400/10 text-slate-400 group-hover:text-amber-400 flex items-center justify-center mb-2.5 transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">
                    Hacé clic o arrastrá el archivo aquí
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs">{recommendedSize}</p>
                  <span className="mt-2 text-[10px] font-mono text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                    Ruta: bingos/{bingoId || '{codigo}'}/{imageType}.jpg
                  </span>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {errorNotice && (
            <p className="text-xs text-rose-400 font-semibold mt-2 flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorNotice}</span>
            </p>
          )}

          {successNotice && (
            <p className="text-xs text-emerald-300 font-semibold mt-2 flex items-center space-x-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </p>
          )}
        </div>

        {/* Right: Explanatory & Action Box */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h5 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <CloudCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Almacenamiento Permanente</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              El archivo físico se sube directamente a <strong>Firebase Storage</strong> bajo el código del bingo. En Firestore se registra la URL fija permanente.
            </p>
            <div className="text-[10px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
              <p>• <strong>No caduca</strong> ni expira en el tiempo.</p>
              <p>• <strong>No satura</strong> el límite de almacenamiento local.</p>
              <p>• Cada bingo gestiona sus 5 imágenes de forma independiente.</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center space-x-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>{currentImageUrl ? 'Subir nueva imagen a Storage' : 'Elegir imagen de mi PC'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
