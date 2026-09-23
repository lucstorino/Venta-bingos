import React from 'react';
import { Tv, Radio, Sparkles } from 'lucide-react';

export const BroadcastChannelsSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white relative overflow-hidden">
      {/* Decorative dot matrix pattern */}
      <div className="absolute top-6 right-8 grid grid-cols-6 gap-2 opacity-30 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
        ))}
      </div>
      <div className="absolute bottom-6 left-8 grid grid-cols-6 gap-2 opacity-25 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
        ))}
      </div>

      {/* Decorative ambient glowing circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-emerald-800/90 to-green-800/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left side: Televisado y Transmitido por Radio Badge */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Transmisión en Vivo</span>
              </div>

              {/* 3D-styled Badge recreation matching official graphic */}
              <div className="relative inline-block transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                {/* Yellow light rays */}
                <div className="absolute -top-3 -left-3 w-5 h-1.5 bg-amber-400 rounded-full rotate-45" />
                <div className="absolute -bottom-2 -left-3 w-6 h-1.5 bg-amber-400 rounded-full -rotate-45" />

                <div className="space-y-1 drop-shadow-xl">
                  {/* Televisado Header Card */}
                  <div className="bg-white text-emerald-950 font-black text-3xl sm:text-4xl md:text-5xl tracking-tight px-6 py-2.5 rounded-2xl border-4 border-emerald-600 shadow-lg transform -skew-x-3 flex items-center justify-center space-x-3">
                    <Tv className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-700 shrink-0" />
                    <span className="uppercase tracking-tight font-black text-emerald-900">
                      TELEVISADO
                    </span>
                  </div>

                  {/* Transmitido por Radio Banner */}
                  <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-emerald-950 font-black text-lg sm:text-2xl tracking-tight px-6 py-2 rounded-2xl border-3 border-amber-300 shadow-md transform -skew-x-2 flex items-center justify-center space-x-2">
                    <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-950 shrink-0" />
                    <span className="uppercase font-black text-emerald-950 tracking-tight">
                      Y TRANSMITIDO POR RADIO
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-emerald-100 text-xs sm:text-sm font-medium max-w-sm mt-3">
                Seguí el sorteo en tiempo real con las bolillas y premios fiscalizados en todos los canales y emisoras oficiales.
              </p>
            </div>

            {/* Right side: White card containing the 6 official media broadcast partners */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center">
                  
                  {/* 1. elonce TV */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                    {/* Official elonce TV Logo Mark */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shrink-0 shadow-sm relative overflow-hidden">
                      <div className="w-7 h-7 rounded-xl border-2 border-white/90 flex items-center justify-center">
                        <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-white ml-0.5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-xl font-black text-[#1e3a8a] tracking-tight font-sans">
                          elonce
                        </span>
                        <span className="text-xs font-black text-[#1e3a8a] ml-0.5 -translate-y-1">
                          TV
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 block leading-tight">
                        Televisión Abierta y Cable
                      </span>
                    </div>
                  </div>

                  {/* 2. MULTIVISIÓN FEDERAL */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-sky-200 transition-all">
                    {/* Official Multivisión Federal Sphere Logo */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-900 flex items-center justify-center text-white shrink-0 shadow-sm p-1.5">
                      <div className="w-full h-full flex items-center justify-center space-x-0.5">
                        <div className="w-2.5 h-6 rounded-full bg-gradient-to-t from-slate-200 to-white transform -rotate-12 shadow-xs" />
                        <div className="w-2.5 h-6 rounded-full bg-gradient-to-t from-slate-200 to-white transform rotate-12 shadow-xs" />
                      </div>
                    </div>
                    <div>
                      <span className="text-base font-black text-slate-900 block tracking-tight leading-none uppercase">
                        MULTIVISIÓN
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-600 tracking-[0.25em] uppercase block mt-0.5">
                        FEDERAL
                      </span>
                    </div>
                  </div>

                  {/* 3. express TELECOMUNICACIONES */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all">
                    {/* Official Express Target Logo */}
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                      <div className="w-8 h-8 rounded-full border-3 border-slate-700 flex items-center justify-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-700" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xl font-black text-[#0f4c81] tracking-tight block leading-none font-sans italic">
                        express
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 tracking-[0.15em] uppercase block mt-1">
                        TELECOMUNICACIONES
                      </span>
                    </div>
                  </div>

                  {/* 4. GRAFITT RADIO fm 89.5 - fm 105.1 */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-purple-200 transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <div>
                          <div className="flex items-center space-x-1">
                            <span className="text-lg font-black text-[#4c1d95] tracking-wide uppercase">
                              GRAFITT
                            </span>
                            <Radio className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-600 tracking-[0.3em] block">
                            R A D I O
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-xs shadow-2xs">
                          fm 89.5
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-xs shadow-2xs">
                          fm 105.1
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5. CANAL 7 - EL SIETE */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-orange-200 transition-all">
                    {/* Official Canal 7 vibrant orange/yellow 7 mark */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-sm font-black text-2xl tracking-tighter">
                      7
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-900 block tracking-tight uppercase leading-snug">
                        CANAL 7 - EL SIETE
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 block">
                        Transmisión Oficial en Vivo
                      </span>
                    </div>
                  </div>

                  {/* 6. MIRALO POR DIRECTV FRECUENCIA 133 */}
                  <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-sky-200 transition-all">
                    {/* Official DIRECTV Logo Mark */}
                    <div className="w-12 h-12 rounded-2xl bg-[#00263e] flex items-center justify-center text-white shrink-0 shadow-sm">
                      <div className="text-sky-400 font-black text-xs tracking-tighter uppercase flex items-center">
                        <span className="text-sm font-black">D</span>
                        <span className="text-[10px] ml-0.5">TV</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
                        MIRALO POR
                      </span>
                      <span className="text-base font-black text-[#0072bc] block tracking-tight leading-none">
                        DIRECTV
                      </span>
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase block mt-0.5">
                        FRECUENCIA 133
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
