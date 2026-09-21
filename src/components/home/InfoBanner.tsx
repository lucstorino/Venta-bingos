import React from 'react';
import { Trophy, Globe, ShieldCheck } from 'lucide-react';
import { TuBingoLogo } from '../common/TuBingoLogo';

interface InfoBannerProps {
  onPlayNow: () => void;
}

export const InfoBanner: React.FC<InfoBannerProps> = ({ onPlayNow }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50/40 to-slate-50 text-slate-900 py-16 sm:py-20 border-t border-slate-200">
      {/* Decorative colored glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <TuBingoLogo variant="light" className="scale-110" />
        </div>

        {/* Main Headline with Heart emoji */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Más que un juego, <br />
            una oportunidad <span className="text-red-500">❤️</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
            La plataforma líder y 100% digital donde comprar tu cartón es simple, transparente y seguro.
          </p>
        </div>

        {/* 3 Pillars / Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 max-w-2xl mx-auto">
          <div className="flex flex-col items-center space-y-2.5 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              Grandes premios
            </span>
            <span className="text-xs text-slate-500">
              Autos 0km, pozos millonarios y viajes
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2.5 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-blue-600">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              Jugá 100% online
            </span>
            <span className="text-xs text-slate-500">
              Desde tu celular o computadora
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2.5 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              Seguro y confiable
            </span>
            <span className="text-xs text-slate-500">
              Fiscalizado por Escribano Público
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <button
            onClick={onPlayNow}
            className="px-10 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/25 transition-all transform hover:scale-105 active:scale-95"
          >
            ¡Jugá ahora!
          </button>
        </div>

        {/* Bottom Mascot/Balls Graphics with "La suerte también se elige ♡" */}
        <div className="pt-6 relative flex flex-col items-center justify-center">
          <div className="relative w-full max-w-md h-40 sm:h-48 overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
            <img
              src="/src/assets/images/bingo_balls_banner_1789819951759.jpg"
              alt="Bolas de bingo de la suerte"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Script badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end justify-center pb-4">
              <span className="font-serif italic text-xl sm:text-2xl font-bold drop-shadow-md text-amber-300">
                La suerte también se elige ♡
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
