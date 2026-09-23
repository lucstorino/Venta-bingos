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

interface BingoPrizesImageUploaderProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  bingoId?: string;
}

export const BingoPrizesImageUploader: React.FC<BingoPrizesImageUploaderProps> = ({
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
    setUploadProgress('Subiendo afiche a Firebase Storage...');

    try {
      // Subir físicamente a Firebase Storage en: bingos/{bingoId}/prizes.ext
      const { url } = await uploadBingoImage(bingoId, 'prizes', file);
      onImageChange(url);
      setSuccessNotice('Gráfica de premios subida permanentemente a Firebase Storage.');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error('Error subiendo gráfica de premios a Firebase Storage:', err);
      setErrorNotice(err.message || 'Error al conectar con Firebase Storage.');
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
    if (!confirm('¿Deseas quitar la gráfica de premios?')) return;
    setIsUploading(true);
    try {
      if (bingoId) {
        await deleteBingoImage(bingoId, 'prizes');
      }
      onImageChange('');
      setSuccessNotice('Gráfica de premios removida.');
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      setErrorNotice('Error al remover imagen: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const isFirebaseStored = currentImageUrl && currentImageUrl.includes('firebasestorage.googleapis.com');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>2. Gráfica Oficial de Premios Detallados (Prizes Image)</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Flyer o afiche oficial con la tabla de premios. Se almacena en Firebase Storage: bingos/{bingoId}/prizes.ext
          </p>
        </div>

        {isFirebaseStored && (
          <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md font-semibold">
            <CloudCheck className="w-3 h-3 text-emerald-400" />
            <span>Almacenada en Firebase</span>
          </span>
        )}
      </div>

      {/* Main Preview and Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Preview or Dropzone */}
        <div className="md:col-span-8">
          {currentImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group aspect-[16/9] flex items-center justify-center">
              <img
                src={currentImageUrl}
                alt="Gráfica de premios"
                className="w-full h-full object-contain p-2"
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
                  <span>Cambiar en Storage</span>
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
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-slate-700 hover:border-emerald-400 bg-slate-950 hover:bg-slate-950/80'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs font-bold text-white">{uploadProgress}</span>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-emerald-400/10 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center mb-3 transition-colors">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">
                    Hacé clic o arrastrá el afiche de premios aquí
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Se almacena físicamente en Firebase Storage para verse en el modal "Ver Premios".
                  </p>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg,image/svg+xml"
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

        {/* Right Info */}
        <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300 flex items-center gap-1">
              <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
              Gráfica Oficial Permanente
            </p>
            <p>
              El afiche oficial de premios se muestra en alta calidad cuando los usuarios hacen clic en "Ver premios oficiales".
            </p>
            <p className="text-[10px] text-slate-500">
              Formato recomendado: Vertical o cuadrado en alta definición.
            </p>
          </div>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{currentImageUrl ? 'Reemplazar en Storage' : 'Subir afiche de premios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
