import React from 'react';
import { ArrowRight, ShieldCheck, Smartphone, CheckCircle } from 'lucide-react';
import { TuBingoLogo } from '../common/TuBingoLogo';

interface TuBingoHeroProps {
  onExploreBingos: () => void;
}

export const TuBingoHero: React.FC<TuBingoHeroProps> = ({ onExploreBingos }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EFF6FF] via-[#F4F8FD] to-white pt-8 pb-14 sm:py-16">
      {/* Subtle background curved glow */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-blue-100/60 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headings, CTA & Value Badges */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-blue-100 shadow-xs inline-flex">
                <TuBingoLogo className="h-9 sm:h-10" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                La emoción <br />
                del bingo <br />
                <span className="text-blue-600">desde donde estés</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Elegí tus números, jugá y viví la emoción de ganar grandes premios.
              </p>
            </div>

            {/* Primary Action Button */}
            <div>
              <button
                id="hero-ver-bingos-btn"
                onClick={onExploreBingos}
                className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Ver bingos disponibles</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Trust Feature Pills */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-2xl mx-auto lg:mx-0">
              {/* Feature 1 */}
              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">100% seguro</div>
                  <div className="text-[11px] text-slate-500">Tus datos protegidos</div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">Pagá fácil</div>
                  <div className="text-[11px] text-slate-500">con Mercado Pago</div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900">Jugá desde cualquier</div>
                  <div className="text-[11px] text-slate-500">dispositivo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Mascot Character with "¡Mucha suerte! ♡" script */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            {/* Cute handwritten badge */}
            <div className="absolute top-2 right-4 sm:right-12 z-20 transform rotate-6 select-none">
              <span className="text-blue-600 font-serif italic text-2xl font-bold tracking-tight drop-shadow-xs">
                ¡Mucha suerte! ♡
              </span>
            </div>

            {/* Mascot Container */}
            <div className="relative w-64 sm:w-80 md:w-96 aspect-square flex items-center justify-center">
              {/* Soft decorative background circles */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 to-blue-400/20 rounded-full blur-2xl transform scale-90"></div>

              <img
                src="/src/assets/images/mascot_bingo_ball_1789819883070.jpg"
                alt="Mascota oficial Tu Bingo - Bola 8 de la suerte"
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
