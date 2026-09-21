import React from 'react';
import { TuBingoLogo } from '../common/TuBingoLogo';
import { ShieldCheck, Heart, MessageCircle } from 'lucide-react';

interface TuBingoFooterProps {
  onOpenAdmin: () => void;
  onNavigate: (section: 'inicio' | 'bingos' | 'como-jugar' | 'premios' | 'atencion') => void;
}

export const TuBingoFooter: React.FC<TuBingoFooterProps> = ({ onOpenAdmin, onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <TuBingoLogo variant="dark" />
            <p className="text-slate-400 text-xs text-center md:text-left">
              Plataforma oficial de venta y sorteo digital de bingos. Todos los derechos reservados.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
            <button onClick={() => onNavigate('inicio')} className="hover:text-white transition-colors cursor-pointer">
              Inicio
            </button>
            <button onClick={() => onNavigate('bingos')} className="hover:text-white transition-colors cursor-pointer">
              Bingos
            </button>
            <button onClick={() => onNavigate('como-jugar')} className="hover:text-white transition-colors cursor-pointer">
              Cómo jugar
            </button>
            <button onClick={() => onNavigate('premios')} className="hover:text-white transition-colors cursor-pointer">
              Premios
            </button>
            <button
              onClick={() => onNavigate('atencion')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>Atención al Cliente (WhatsApp)</span>
            </button>
            <button
              onClick={onOpenAdmin}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
            >
              Panel de Gestión & BD
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Transacciones y reservas protegidas con SQLite Backend</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>para fanáticos del bingo</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
