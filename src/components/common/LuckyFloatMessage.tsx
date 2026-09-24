import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface LuckyFloatMessageProps {
  onClose?: () => void;
}

export const LuckyFloatMessage: React.FC<LuckyFloatMessageProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Gentle entrance transition on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    // Smooth exit transition before unmounting
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      if (onClose) onClose();
    }, 400);
  };

  if (isDismissed) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`fixed top-20 sm:top-24 right-3 sm:right-6 z-40 max-w-[280px] sm:max-w-[320px] transition-all duration-500 ease-out pointer-events-auto ${
        isVisible
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-12 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200/90 shadow-xl shadow-emerald-950/10 p-3 sm:p-3.5 transition-transform hover:shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-emerald-400/20 rounded-full blur-md pointer-events-none" />

        <div className="flex items-start space-x-3">
          {/* Clover Icon Container */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 via-emerald-50 to-white border border-emerald-300/70 flex items-center justify-center text-2xl shadow-2xs shrink-0 select-none">
            <span role="img" aria-label="Trébol de cuatro hojas" className="transform hover:rotate-12 transition-transform duration-300">
              🍀
            </span>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1 pt-0.5">
            <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span>Buena Suerte</span>
            </div>
            <p className="text-xs sm:text-[13px] font-black text-slate-800 leading-snug tracking-tight">
              Estás a punto de cambiar tu vida
            </p>
          </div>

          {/* Close Button (X) */}
          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar mensaje"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
