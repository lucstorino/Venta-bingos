import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Upload,
  Link2,
  RotateCcw,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Ticket,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { Prize } from '../../types';
import { AvailableBingoItem } from '../../data/featuredBingos';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { uploadBingoImage } from '../../services/firebaseBingoStorageService';

interface BingoPrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bingo: AvailableBingoItem;
  prizes?: Prize[];
  onBuyTicket: (bingo: AvailableBingoItem) => void;
}

export const BingoPrizesModal: React.FC<BingoPrizesModalProps> = ({
  isOpen,
  onClose,
  bingo,
  onBuyTicket,
}) => {
  const { isAuthenticated } = useAdminAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPrizesImage, setLocalPrizesImage] = useState<string>('');
  const [hasCustomImage, setHasCustomImage] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Load custom image from localStorage or bingo data
  useEffect(() => {
    if (!bingo) return;
    const stored = localStorage.getItem(`tubingo_prizes_img_${bingo.id}`);
    if (stored) {
      setLocalPrizesImage(stored);
      setHasCustomImage(true);
    } else if (bingo.prizesImage) {
      setLocalPrizesImage(bingo.prizesImage);
      setHasCustomImage(false);
    } else {
      setLocalPrizesImage('/premios_oficiales_ejemplo.svg');
      setHasCustomImage(false);
    }
  }, [bingo, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('La imagen no debe superar los 15MB.');
      return;
    }

    setIsUploading(true);
    try {
      const { url } = await uploadBingoImage(bingo.id, 'prizes', file);
      setLocalPrizesImage(url);
      setHasCustomImage(true);
      try {
        localStorage.setItem(`tubingo_prizes_img_${bingo.id}`, url);
      } catch {}
      setFeedbackNotice('¡Imagen de premios guardada exitosamente!');
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch {
      // Fallback local reader
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setLocalPrizesImage(result);
          setHasCustomImage(true);
          try {
            localStorage.setItem(`tubingo_prizes_img_${bingo.id}`, result);
          } catch {}
          setFeedbackNotice('¡Imagen de premios cargada con éxito!');
          setTimeout(() => setFeedbackNotice(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    setLocalPrizesImage(url);
    setHasCustomImage(true);
    localStorage.setItem(`tubingo_prizes_img_${bingo.id}`, url);
    setUrlInput('');
    setShowUrlInput(false);
    setFeedbackNotice('¡Imagen de premios vinculada con éxito!');
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleResetToDefault = () => {
    localStorage.removeItem(`tubingo_prizes_img_${bingo.id}`);
    setLocalPrizesImage(bingo.prizesImage || '/premios_oficiales_ejemplo.svg');
    setHasCustomImage(false);
    setFeedbackNotice('Se restauró la imagen de premios original.');
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mascot Badge & Bingo info */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-1.5">
            <img
              src="/logo_tubingo.png"
              alt="TuBINGO.com"
              className="h-6 sm:h-7 w-auto object-contain shrink-0 drop-shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
              Premios Oficiales
            </span>
            <span className="hidden sm:inline-flex items-center text-xs text-emerald-200 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-300" />
              Sorteo Fiscalizado
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white pr-8">
            {bingo.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 font-medium mt-1.5">
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              {bingo.date}
            </span>
            {bingo.time && (
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                {bingo.time}
              </span>
            )}
            <span className="text-amber-300 font-bold ml-auto text-sm">
              Cartón: {bingo.formattedPrice}
            </span>
          </div>
        </div>

        {/* Toolbar: Upload or change prizes image (ONLY VISIBLE FOR ADMIN) */}
        {isAuthenticated && (
          <div className="px-4 sm:px-6 py-2.5 bg-amber-50/90 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-amber-900 font-bold">
              <ImageIcon className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Gestión de Premios Oficiales (Modo Administrador)</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Subiendo...' : hasCustomImage ? 'Cambiar imagen' : 'Cargar imagen de premios'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold transition-all cursor-pointer"
                title="Pegar enlace de imagen"
              >
                <Link2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">URL</span>
              </button>

              {hasCustomImage && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-rose-700 font-semibold transition-all cursor-pointer"
                  title="Restaurar imagen por defecto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restaurar</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* URL Input Form if toggled (Only for Admin) */}
        {isAuthenticated && showUrlInput && (
          <div className="px-4 sm:px-6 py-2.5 bg-emerald-50/60 border-b border-emerald-200 flex items-center gap-2 animate-fadeIn text-xs">
            <input
              type="text"
              placeholder="Pega la URL o ruta de la imagen (ej: /mis_premios.jpg o https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Feedback Alert */}
        {feedbackNotice && (
          <div className="px-4 py-2 bg-emerald-100 border-b border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
        )}

        {/* Prizes Image Display Area */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 bg-slate-50/70 flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl border border-slate-200 p-2 sm:p-4 flex items-center justify-center overflow-hidden shadow-2xs min-h-[300px]">
            <img
              src={localPrizesImage || '/premios_oficiales_ejemplo.svg'}
              alt={`Premios detallados de ${bingo.title}`}
              className="max-h-[58vh] w-auto max-w-full object-contain rounded-xl select-none"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Fullscreen view link */}
          <div className="w-full mt-3 flex items-center justify-end text-xs text-slate-500">
            <a
              href={localPrizesImage || '/premios_oficiales_ejemplo.svg'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 font-bold hover:underline py-1 px-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver imagen en tamaño completo</span>
            </a>
          </div>
        </div>

        {/* Footer with CTA */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-3">
            <span className="text-xs text-slate-500 font-medium">Valor del cartón:</span>
            <span className="text-2xl font-black text-emerald-700 font-mono whitespace-nowrap shrink-0">
              {bingo.formattedPrice}
            </span>
          </div>

          <div className="w-full sm:w-auto flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBuyTicket(bingo);
              }}
              className="flex-2 sm:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-md shadow-amber-400/20 hover:shadow-amber-400/40 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-slate-950 shrink-0" />
              <span>COMPRAR CARTÓN</span>
              <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
