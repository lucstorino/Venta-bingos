import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Eye,
  AlertCircle,
  FileText,
  Loader2,
  CloudCheck,
  ExternalLink,
} from 'lucide-react';
import { addOrUpdatePastBingo } from '../../data/pastBingos';
import { Bingo } from '../../types';
import { uploadBingoImage, deleteBingoImage } from '../../services/firebaseBingoStorageService';

interface BingoExtractImageUploaderProps {
  bingo: Bingo;
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
}

export const BingoExtractImageUploader: React.FC<BingoExtractImageUploaderProps> = ({
  bingo,
  currentImageUrl,
  onImageChange,
}) => {
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = currentImageUrl || bingo.extractoImageUrl;

  const handleFileSelect = async (file: File) => {
    setErrorNotice(null);
    setFeedback(null);

    if (!file.type.startsWith('image/')) {
      setErrorNotice('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorNotice('El archivo supera los 15MB permitidos.');
      return;
    }

    setIsUploading(true);

    try {
      // Subir de forma segura y permanente (servidor + Firestore)
      const { url } = await uploadBingoImage(bingo.id || 'bingo-oficial-2026', 'extract', file);
      
      onImageChange(url);

      // Sincronizar también con pastBingos
      addOrUpdatePastBingo({
        id: `past-${bingo.id}`,
        name: bingo.name,
        drawDate: bingo.drawDate,
        drawTime: bingo.drawTime,
        image: bingo.imageUrl || '/src/assets/images/bingo_casa_card_1789819899795.jpg',
        extractoImage: url,
        mainPrize: bingo.description || 'Premios Oficiales',
        totalPrizes: '$ 50.000.000 en Premios',
        location: bingo.location || 'Sede Central Oficial',
      });

      setFeedback('¡Extracto oficial guardado exitosamente!');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Error subiendo extracto:', err);
      setErrorNotice(err.message || 'Error al procesar y guardar el extracto.');
    } finally {
      setIsUploading(false);
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
    if (!confirm('¿Deseas quitar el extracto oficial?')) return;
    setIsUploading(true);
    try {
      if (bingo.id) {
        await deleteBingoImage(bingo.id, 'extract');
      }
      onImageChange('');
      setFeedback('Extracto eliminado de Firebase Storage.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setErrorNotice('Error al remover extracto: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const isFirebaseStored = displayUrl && displayUrl.includes('firebasestorage.googleapis.com');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>4. Extracto Oficial del Sorteo (Extract Image)</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Acta escaneada o flyer con las bolillas sorteadas y ganadores. Se almacena en Firebase Storage: bingos/{bingo.id}/extract.ext
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isFirebaseStored && (
            <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md font-semibold">
              <CloudCheck className="w-3 h-3 text-emerald-400" />
              <span>Permanente en Firebase</span>
            </span>
          )}
          {displayUrl && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver extracto ampliado</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Preview or Dropzone */}
        <div className="md:col-span-8">
          {displayUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 group">
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  src={displayUrl}
                  alt="Extracto Oficial"
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Cambiar en Storage</span>
                  </button>
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center space-x-1 transition-all"
                    title="Ver imagen original"
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
                    <span className="text-xs font-bold text-white">Guardando extracto...</span>
                  </div>
                )}
              </div>
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
                  <span className="text-xs font-bold text-white">Guardando extracto...</span>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-emerald-400/10 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center mb-3 transition-colors">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">
                    Cargar Extracto Oficial del Sorteo
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Subí el acta o comprobante con los números sorteados y cartones ganadores.
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

          {feedback && (
            <p className="text-xs text-emerald-300 font-semibold mt-2 flex items-center space-x-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>{feedback}</span>
            </p>
          )}
        </div>

        {/* Right Info */}
        <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300 flex items-center gap-1">
              <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
              Publicación Oficial Fiscalizada
            </p>
            <p>
              El extracto oficial se publicará automáticamente en la sección de sorteos pasados para que los jugadores puedan cotejar sus números.
            </p>
            <p className="text-[10px] text-slate-500">
              Almacenado de por vida en Firebase Storage.
            </p>
          </div>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{displayUrl ? 'Subir nuevo extracto a Storage' : 'Cargar archivo de extracto'}</span>
          </button>
        </div>
      </div>

      {/* Modal Preview */}
      {isPreviewOpen && displayUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Extracto Oficial del Sorteo: {bingo.name}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950 p-2 flex justify-center">
              <img
                src={displayUrl}
                alt="Extracto Oficial"
                className="max-h-[70vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
