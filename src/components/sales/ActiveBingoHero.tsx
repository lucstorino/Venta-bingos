import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trophy, ShieldCheck, Zap, Sparkles, MapPin } from 'lucide-react';
import { useBingo } from '../../context/BingoContext';

interface ActiveBingoHeroProps {
  onOpenPrizes: () => void;
  onScrollToCards: () => void;
}

export const ActiveBingoHero: React.FC<ActiveBingoHeroProps> = ({
  onOpenPrizes,
  onScrollToCards,
}) => {
  const { bingo, prizes, cards } = useBingo();

  // Calculate countdown to drawDate & drawTime
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const drawTarget = new Date(`${bingo.drawDate}T${bingo.drawTime}:00`).getTime();
      const now = Date.now();
      const diff = Math.max(0, drawTarget - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [bingo.drawDate, bingo.drawTime]);

  const availableCount = cards.filter((c) => c.status === 'AVAILABLE').length;
  const soldCount = cards.filter((c) => c.status === 'SOLD').length;
  const totalPrizePool = prizes.reduce((acc, p) => acc + (p.amount || 0), 0);

  const formattedDate = new Date(`${bingo.drawDate}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-8 pb-12 border-b border-slate-800">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Bingo Information */}
          <div className="lg:col-span-7 space-y-5">
            {/* Status and category badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bingo Oficial Activo</span>
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                Cartones con Escribano Público
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {bingo.name}
            </h1>

            {/* Description */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              {bingo.description}
            </p>

            {/* Event Details Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Fecha del Sorteo
                  </span>
                  <span className="text-sm font-bold text-white capitalize">{formattedDate}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Hora del Sorteo
                  </span>
                  <span className="text-sm font-bold text-white">{bingo.drawTime} hs (Argentina)</span>
                </div>
              </div>
            </div>

            {bingo.location && (
              <div className="flex items-center text-xs text-slate-400 space-x-1.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{bingo.location}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onScrollToCards}
                className="px-6 py-3 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 flex items-center space-x-2"
              >
                <span>Elegir mi Cartón</span>
                <span className="bg-slate-950/20 px-2 py-0.5 rounded text-xs">
                  ${bingo.price.toLocaleString('es-AR')} {bingo.currency}
                </span>
              </button>

              <button
                onClick={onOpenPrizes}
                className="px-5 py-3 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center space-x-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Ver Premios ({prizes.length})</span>
              </button>
            </div>
          </div>

          {/* Right Column: Countdown Box & Prize Highlights */}
          <div className="lg:col-span-5 space-y-4">
            {/* Draw Countdown Card */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  Cuenta Regresiva al Sorteo
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {bingo.drawDate} {bingo.drawTime}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-4 text-center">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="block text-2xl sm:text-3xl font-black text-white font-mono">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Días</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Horas</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="block text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Min</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="block text-2xl sm:text-3xl font-black text-white font-mono animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Seg</span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-4 pt-3 border-t border-slate-700/80 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="block font-black text-white text-base sm:text-lg">{availableCount}</span>
                  <span className="text-emerald-400 font-semibold">Disponibles</span>
                </div>
                <div>
                  <span className="block font-black text-white text-base sm:text-lg">{soldCount}</span>
                  <span className="text-slate-400 font-semibold">Vendidos</span>
                </div>
                <div>
                  <span className="block font-black text-amber-400 text-base sm:text-lg">
                    ${(totalPrizePool / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-slate-400 font-semibold">En Premios</span>
                </div>
              </div>
            </div>

            {/* Quick Guarantee Badge */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Reserva bloqueada <strong>{bingo.reservationDurationMinutes} min</strong> para tu compra</span>
              </div>
              <span className="text-emerald-400 font-semibold">Sin duplicados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
