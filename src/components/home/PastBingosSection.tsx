import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, FileText, X, ExternalLink } from 'lucide-react';
import { PAST_BINGOS, PastBingoItem, getStoredPastBingos } from '../../data/pastBingos';

interface PastBingosSectionProps {
  finishedBingos?: PastBingoItem[];
}

export const PastBingosSection: React.FC<PastBingosSectionProps> = ({
  finishedBingos,
}) => {
  const [bingosList, setBingosList] = useState<PastBingoItem[]>(() => {
    return finishedBingos || getStoredPastBingos();
  });
  const [selectedPastBingo, setSelectedPastBingo] = useState<PastBingoItem | null>(null);

  useEffect(() => {
    if (finishedBingos) {
      setBingosList(finishedBingos);
      return;
    }
    const handleUpdate = () => {
      setBingosList(getStoredPastBingos());
    };
    window.addEventListener('tubingo_past_bingos_updated', handleUpdate);
    return () => {
      window.removeEventListener('tubingo_past_bingos_updated', handleUpdate);
    };
  }, [finishedBingos]);

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
              Resultados y extractos oficiales de nuestras ediciones finalizadas.
            </p>
          </div>
        </div>

        {/* Finished Bingos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bingosList.map((item) => (
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
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sorteado el {item.drawDate}</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {item.name}
                  </h3>
                </div>
              </div>

              {/* Bottom action to view official extract */}
              <div className="p-4 sm:p-5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPastBingo(item)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Ver extracto</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Official Extract Image Modal */}
      {selectedPastBingo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedPastBingo(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 mb-1">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Extracto Oficial</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {selectedPastBingo.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Sorteo del {selectedPastBingo.drawDate} {selectedPastBingo.drawTime ? `• ${selectedPastBingo.drawTime}` : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPastBingo(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Container */}
            <div className="py-4 overflow-y-auto flex-1 flex flex-col items-center justify-center">
              <div className="w-full bg-slate-50 rounded-2xl border border-slate-200/80 p-2 sm:p-4 flex items-center justify-center overflow-hidden shadow-inner">
                <img
                  src={selectedPastBingo.extractoImage || '/extracto_oficial_ejemplo.svg'}
                  alt={`Extracto oficial de ${selectedPastBingo.name}`}
                  className="max-h-[62vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <a
                href={selectedPastBingo.extractoImage || '/extracto_oficial_ejemplo.svg'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 py-2 px-3 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver imagen en pantalla completa</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedPastBingo(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
