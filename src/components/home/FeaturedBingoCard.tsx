import React from 'react';
import { Calendar, Clock, Ticket, ArrowRight, Eye, ShieldCheck, Sparkles, Ban } from 'lucide-react';
import { AvailableBingoItem } from '../../data/featuredBingos';

interface FeaturedBingoCardProps {
  bingo: AvailableBingoItem;
  onSelectBingo: (bingo: AvailableBingoItem) => void;
  onViewPrizes: (bingo: AvailableBingoItem) => void;
}

export const FeaturedBingoCard: React.FC<FeaturedBingoCardProps> = ({
  bingo,
  onSelectBingo,
  onViewPrizes,
}) => {
  return (
    <div className="relative bg-white rounded-3xl border border-emerald-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden mb-10">
      {/* Top subtle highlight banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-700 text-white px-4 sm:px-6 py-2 flex items-center">
        <span className="text-xs font-bold tracking-wide uppercase text-amber-300">
          ★ Sorteo Destacado Oficial
        </span>
      </div>

      {/* Main 60% Image / 40% Info Layout on Desktop, Mobile-First Stack on Celulares */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* 1. Official Flyer Image (approx 60% desktop) - 100% full, contain, without cropping */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full bg-slate-50/80 rounded-2xl border border-slate-100 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
              <img
                src={bingo.image}
                alt={bingo.title}
                className="w-full h-auto max-h-[380px] sm:max-h-[440px] lg:max-h-[480px] object-contain transition-transform duration-300 select-none"
                style={{ objectFit: 'contain' }}
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center hidden sm:block">
              Flyer oficial del sorteo • Consulta los premios detallados en el botón "Ver premios"
            </p>
          </div>

          {/* 2. Essential Info & Purchase Actions (approx 40% desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
            {/* Tag / Category */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{bingo.tag || 'BINGO DESTACADO'}</span>
              </span>
              <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                {bingo.badge || 'Sorteo Oficial'}
              </span>
            </div>

            {/* Name */}
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {bingo.title}
              </h2>
              {bingo.mainPrize && (
                <p className="text-sm font-semibold text-emerald-700 mt-1.5 flex items-center gap-1.5">
                  <span>🏆</span>
                  <span>{bingo.mainPrize}</span>
                </p>
              )}
            </div>

            {/* Draw Date and Time */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center space-x-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Fecha del sorteo:</span>
                  <strong className="text-slate-900 font-bold">{bingo.date}</strong>
                </div>
              </div>

              {bingo.time && (
                <div className="flex items-center space-x-3 text-sm text-slate-700 pt-1 border-t border-slate-200/60">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Horario de transmisión:</span>
                    <strong className="text-slate-900 font-bold">{bingo.time}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Price Highlight */}
            <div className="pt-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Valor oficial del cartón
                </span>
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-700 font-mono tracking-tight whitespace-nowrap shrink-0">
                  {bingo.formattedPrice}
                </span>
              </div>
            </div>

            {/* Action Buttons: Big COMPRAR CARTÓN + Secondary VER PREMIOS */}
            <div className="space-y-2.5 pt-1">
              {bingo.salesClosed ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    disabled
                    className="w-full min-h-[52px] py-4 px-6 rounded-2xl bg-slate-200 text-slate-500 font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 cursor-not-allowed border border-slate-300"
                  >
                    <Ban className="w-5 h-5 text-slate-400 shrink-0" />
                    <span>VENTA CERRADA • SORTEO EN PROCESO</span>
                  </button>
                  <p className="text-[11px] text-center text-rose-600 font-medium">
                    La venta de cartones para este sorteo finalizó. Los cartones no vendidos fueron dados de baja.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectBingo(bingo)}
                  className="w-full min-h-[52px] py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base uppercase tracking-wider shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40 transition-all duration-200 transform active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-3"
                >
                  <Ticket className="w-5 h-5 text-slate-950 shrink-0" />
                  <span>COMPRAR CARTÓN</span>
                  <ArrowRight className="w-5 h-5 text-slate-950 shrink-0" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onViewPrizes(bingo)}
                className="w-full py-3 px-5 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-slate-800 hover:text-emerald-800 font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>VER PREMIOS DETALLADOS</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
