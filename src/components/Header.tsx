import React from 'react';
import { Ticket, Settings, ShoppingBag, Clock, FileText, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { useBingo } from '../context/BingoContext';

interface HeaderProps {
  currentView: 'sales' | 'admin';
  onSelectView: (view: 'sales' | 'admin') => void;
  onOpenMyCards: () => void;
  onOpenReservation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  onOpenMyCards,
  onOpenReservation,
}) => {
  const { bingo, activeReservation, cards, orders } = useBingo();

  const availableCardsCount = cards.filter((c) => c.status === 'AVAILABLE').length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectView('sales')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 transform hover:rotate-3 transition-transform">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  BINGO<span className="text-amber-400">VIRTUAL</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  En Vivo
                </span>
                <button
                  onClick={() => onSelectView('admin')}
                  className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800/80 hover:bg-slate-750 text-indigo-300 border border-slate-700 transition-colors"
                  title="Backend Express y Base de Datos SQLite Conectados. Haz clic para abrir el administrador de BD."
                >
                  <Database className="w-3 h-3 text-indigo-400" />
                  <span>SQLite & Backend</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                Digitalización oficial de cartones físicos • Pagos con Mercado Pago
              </p>
            </div>
          </div>

          {/* Active Reservation Banner (if user holds a reserved card) */}
          {activeReservation && (
            <button
              onClick={onOpenReservation}
              className="hidden lg:flex items-center space-x-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 px-3.5 py-1.5 rounded-lg text-xs font-semibold animate-pulse transition-all"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                Reserva activa Cartón #{activeReservation.cardNumber} (
                <strong className="text-white font-mono">{formatTime(activeReservation.remainingSeconds)}</strong>)
              </span>
              <span className="underline ml-1">Completar</span>
            </button>
          )}

          {/* View Toggle & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* My Cards Lookup */}
            <button
              onClick={onOpenMyCards}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Consultar cartones comprados con tu DNI"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Mis Cartones</span>
              {orders.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => onSelectView('sales')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentView === 'sales'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Venta</span>
              </button>
              <button
                onClick={() => onSelectView('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  currentView === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Configuración</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile reservation banner */}
      {activeReservation && (
        <div
          onClick={onOpenReservation}
          className="lg:hidden bg-amber-500/20 text-amber-200 border-t border-amber-500/30 px-4 py-2 text-xs flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>
              Tienes el Cartón <strong>#{activeReservation.cardNumber}</strong> reservado
            </span>
          </div>
          <span className="font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
            {formatTime(activeReservation.remainingSeconds)}
          </span>
        </div>
      )}
    </header>
  );
};
