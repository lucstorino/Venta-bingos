import React, { useState } from 'react';
import { Trophy, Calendar, CheckCircle, FileText, X, ShieldCheck, MapPin, Award } from 'lucide-react';
import { PAST_BINGOS, PastBingoItem } from '../../data/pastBingos';

interface PastBingosSectionProps {
  finishedBingos?: PastBingoItem[];
}

export const PastBingosSection: React.FC<PastBingosSectionProps> = ({
  finishedBingos = PAST_BINGOS,
}) => {
  const [selectedPastBingo, setSelectedPastBingo] = useState<PastBingoItem | null>(null);

  return (
    <section id="seccion-sorteos-anteriores" className="py-12 sm:py-16 bg-slate-50/80 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Historial de Transparencia</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sorteos anteriores
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Resultados y ganadores oficiales de nuestras ediciones finalizadas.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Todos los sorteos son fiscalizados ante escribano público.
          </div>
        </div>

        {/* Finished Bingos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {finishedBingos.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Header with flyer and FINALIZADO badge */}
                <div className="relative bg-slate-100 p-3 flex items-center justify-center min-h-[160px] border-b border-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-[140px] w-auto object-contain opacity-90 select-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider shadow-xs flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>FINALIZADO</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sorteado el {item.drawDate}</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {item.name}
                  </h3>

                  <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 space-y-1">
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Premio Mayor Entregado</span>
                    </div>
                    <div className="text-xs font-black text-slate-900">
                      {item.mainPrize}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.winnerInfo} • Cartón Nº <strong className="text-slate-900">#{item.winningTicket}</strong></span>
                  </div>
                </div>
              </div>

              {/* Bottom action to view official extract */}
              <div className="p-4 sm:p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setSelectedPastBingo(item)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ver extracto y acta oficial</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Official Extract Modal */}
      {selectedPastBingo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPastBingo(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Acta de Sorteo y Extracto Oficial</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              {selectedPastBingo.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Realizado el {selectedPastBingo.drawDate} a las {selectedPastBingo.drawTime}
            </p>

            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 mb-4">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Resolución Oficial:</span>
                <span className="font-bold text-slate-900">{selectedPastBingo.officialResolution}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Cartón Ganador del Premio Mayor:</span>
                <span className="font-black font-mono text-emerald-700 text-sm">#{selectedPastBingo.winningTicket}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Adjudicación:</span>
                <span className="font-bold text-slate-900">{selectedPastBingo.winnerInfo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Premio Entregado:</span>
                <span className="font-bold text-slate-900">{selectedPastBingo.mainPrize}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-500">Pozo Total Distribuido:</span>
                <span className="font-bold text-slate-900">{selectedPastBingo.totalPrizes}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Premio abonado e inscripto conforme a las normativas vigentes.</span>
            </div>

            <button
              onClick={() => setSelectedPastBingo(null)}
              className="mt-5 w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cerrar Extracto
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
