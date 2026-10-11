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
import { uploadBingoImage, deleteBingoImage } from '../../services/firebaseBingoStorageService';

interface BingoCoverUploaderProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  bingoId?: string;
}

export const BingoCoverUploader: React.FC<BingoCoverUploaderProps> = ({
  currentImageUrl,
  onImageChange,
  bingoId = 'bingo-oficial-2026',
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
      setErrorNotice('El archivo seleccionado no es una imagen válida.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorNotice('La imagen supera los 15MB permitidos.');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Guardando imagen...');

    try {
      // Sube de forma segura y permanente (servidor + Firestore)
      const { url } = await uploadBingoImage(bingoId, 'cover', file);
      onImageChange(url);
      setSuccessNotice('¡Portada subida y guardada exitosamente!');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error('Error subiendo portada:', err);
      setErrorNotice(err.message || 'Error al procesar y guardar la imagen.');
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

  const handleRemove = async () => {
    if (!confirm('¿Deseas quitar la imagen de portada?')) return;
    setIsUploading(true);
    try {
      if (bingoId) {
        await deleteBingoImage(bingoId, 'cover', currentImageUrl);
      }
      onImageChange('');
      setSuccessNotice('Imagen de portada quitada.');
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      setErrorNotice('Error al quitar: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const hasImage = Boolean(currentImageUrl);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>1. Foto de Portada del Bingo (Cover Image)</span>
          </label>
          <span className="text-[11px] text-slate-400">
            Recomendado: 16:9 o 16:10 (PNG, JPG o WebP) • Se almacena de forma permanente y optimizada
          </span>
        </div>

        {hasImage && (
          <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md font-semibold">
            <CloudCheck className="w-3 h-3 text-emerald-400" />
            <span>Imagen activa</span>
          </span>
        )}
      </div>

      {/* Main Preview and Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Current Preview / Dropzone */}
        <div className="md:col-span-8">
          {currentImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group aspect-[16/9] flex items-center justify-center">
              <img
                src={currentImageUrl}
                alt="Portada del Bingo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Cambiar portada</span>
                </button>
                <a
                  href={currentImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center space-x-1 transition-all"
                  title="Ver imagen en tamaño completo"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleRemove}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Quitar</span>
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
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-amber-400/10 text-slate-400 group-hover:text-amber-400 flex items-center justify-center mb-3 transition-colors">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">
                    Hacé clic o arrastrá la foto de portada aquí
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Subí la imagen principal oficial para este bingo.
                  </p>
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

        {/* Right: Quick actions */}
        <div className="md:col-span-4 space-y-3 flex flex-col justify-start">
          <div className="space-y-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Cargar foto de portada</span>
            </button>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300 flex items-center gap-1">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                Almacenamiento Permanente
              </p>
              <p>
                Las imágenes se procesan y almacenan de forma permanente y optimizada para máxima velocidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
