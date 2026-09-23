import React from 'react';
import { Calendar, Clock, Ticket, ArrowRight, Eye, Ban } from 'lucide-react';
import { AvailableBingoItem } from '../../data/featuredBingos';

interface BingoCardItemProps {
  bingo: AvailableBingoItem;
  onSelectBingo: (bingo: AvailableBingoItem) => void;
  onViewPrizes: (bingo: AvailableBingoItem) => void;
}

export const BingoCardItem: React.FC<BingoCardItemProps> = ({
  bingo,
  onSelectBingo,
  onViewPrizes,
}) => {
  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* 1. Official Flyer Image (Mobile & Desktop Top) - 100% full, contain, without cropping */}
      <div className="bg-slate-50/90 border-b border-slate-100 p-3 sm:p-4 flex items-center justify-center min-h-[220px] sm:min-h-[260px] overflow-hidden">
        <img
          src={bingo.image}
          alt={bingo.title}
          className="w-full h-auto max-h-[270px] object-contain group-hover:scale-[1.02] transition-transform duration-300 select-none"
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* 2. Card Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Tag & Badge */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md">
              {bingo.tag || 'BINGO OFICIAL'}
            </span>
            {bingo.badge && (
              <span className="text-[11px] text-slate-500 font-medium">
                {bingo.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
            {bingo.title}
          </h3>

          {/* Main Prize summary if any */}
          {bingo.mainPrize && (
            <p className="text-xs font-semibold text-emerald-700 leading-tight">
              🏆 {bingo.mainPrize}
            </p>
          )}

          {/* Date & Time */}
          <div className="space-y-1.5 pt-1 text-xs text-slate-600 font-medium">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Fecha: <strong className="text-slate-900">{bingo.date}</strong></span>
            </div>
            {bingo.time && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Horario: <strong className="text-slate-900">{bingo.time}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Price & Action Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {/* Price */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Valor del cartón
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-emerald-700 font-mono tracking-tight whitespace-nowrap shrink-0">
              {bingo.formattedPrice}
            </span>
          </div>

          {/* Primary CTA: COMPRAR CARTÓN */}
          {bingo.salesClosed ? (
            <div className="space-y-1">
              <button
                type="button"
                disabled
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-not-allowed border border-slate-300"
              >
                <Ban className="w-4 h-4 text-slate-400 shrink-0" />
                <span>VENTA CERRADA</span>
              </button>
              <p className="text-[10px] text-center text-rose-600 font-medium">
                Cartones no vendidos dados de baja.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelectBingo(bingo)}
              className="w-full min-h-[48px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-md shadow-amber-400/20 hover:shadow-amber-400/40 transition-all duration-200 transform active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2.5"
            >
              <Ticket className="w-4 h-4 text-slate-950 shrink-0" />
              <span>COMPRAR CARTÓN</span>
              <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
            </button>
          )}

          {/* Secondary CTA: VER PREMIOS */}
          <button
            type="button"
            onClick={() => onViewPrizes(bingo)}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-800 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ver premios de este bingo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
