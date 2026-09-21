import React from 'react';
import { X, Trophy, Car, Gift, DollarSign, Home, Sparkles } from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { Prize } from '../../types';

interface PrizesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrizesModal: React.FC<PrizesModalProps> = ({ isOpen, onClose }) => {
  const { prizes, bingo } = useBingo();

  if (!isOpen) return null;

  const getIcon = (type?: Prize['iconType']) => {
    switch (type) {
      case 'car':
        return <Car className="w-5 h-5 text-amber-400" />;
      case 'cash':
        return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case 'home':
        return <Home className="w-5 h-5 text-sky-400" />;
      case 'gift':
        return <Gift className="w-5 h-5 text-purple-400" />;
      default:
        return <Trophy className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Premios Oficiales en Juego</h3>
              <p className="text-xs text-slate-400">{bingo.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {prizes
            .sort((a, b) => a.order - b.order)
            .map((prize) => (
              <div
                key={prize.id}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                    {getIcon(prize.iconType)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        Premio #{prize.order}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-0.5">{prize.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{prize.description}</p>
                  </div>
                </div>

                {prize.amount && (
                  <div className="sm:text-right shrink-0 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Estimado</span>
                    <span className="text-base font-black text-amber-400 font-mono">
                      ${prize.amount.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>

        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Los premios se sortearán ante escribano público en la fecha programada.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
