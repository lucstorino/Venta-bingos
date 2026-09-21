import React, { useEffect } from 'react';
import {
  X,
  Trophy,
  Car,
  Coins,
  Gift,
  Home,
  Plane,
  Ticket,
  ArrowRight,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Prize } from '../../types';
import { AvailableBingoItem } from '../../data/featuredBingos';

interface BingoPrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bingo: AvailableBingoItem;
  prizes: Prize[];
  onBuyTicket: (bingo: AvailableBingoItem) => void;
}

export const BingoPrizesModal: React.FC<BingoPrizesModalProps> = ({
  isOpen,
  onClose,
  bingo,
  prizes,
  onBuyTicket,
}) => {
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

  if (!isOpen) return null;

  // Filter prizes for this bingo, or use fallback if none configured specifically
  const bingoPrizes = prizes.filter((p) => p.bingoId === bingo.id);
  const displayPrizes =
    bingoPrizes.length > 0
      ? bingoPrizes.sort((a, b) => a.order - b.order)
      : prizes.slice(0, 5); // Fallback to general prizes

  const getPrizeIcon = (iconType?: string) => {
    switch (iconType) {
      case 'car':
        return <Car className="w-5 h-5 text-amber-500" />;
      case 'cash':
        return <Coins className="w-5 h-5 text-emerald-600" />;
      case 'home':
        return <Home className="w-5 h-5 text-blue-500" />;
      case 'plane':
        return <Plane className="w-5 h-5 text-sky-500" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-purple-500" />;
      default:
        return <Trophy className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mascot Badge & Bingo info */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <img
              src="/D3D6D92C-3883-4894-A39F-3EC814A809D4.PNG"
              alt="Mascota TuBINGO"
              className="w-9 h-9 object-contain shrink-0"
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

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white pr-8">
            {bingo.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 font-medium mt-2">
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

        {/* Prizes List Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ronda / Premio
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Valor Estimado
            </span>
          </div>

          {displayPrizes.map((prize, index) => (
            <div
              key={prize.id || index}
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all flex items-start justify-between gap-3"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getPrizeIcon(prize.iconType)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-emerald-700 font-mono">
                      #{prize.order || index + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {prize.name}
                    </h4>
                  </div>
                  {prize.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {prize.description}
                    </p>
                  )}
                </div>
              </div>

              {prize.amount && (
                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-black text-emerald-700 font-mono">
                    ${prize.amount.toLocaleString('es-AR')}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Guarantee / Legal note */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5 mt-4">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Todos los premios se entregan libres de gravámenes con certificación notarial ante escribano público en la fecha del sorteo.
            </span>
          </div>
        </div>

        {/* Footer with CTA */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-3">
            <span className="text-xs text-slate-500 font-medium">Valor del cartón:</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">
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
