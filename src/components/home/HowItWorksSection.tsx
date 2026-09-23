import React from 'react';
import { Compass, Dices, Smartphone, Trophy } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Elegí tu bingo',
      description:
        'Explorá los sorteos oficiales vigentes, revisá la fecha de transmisión y elegí el evento con los premios que más te gusten.',
      icon: Compass,
      badgeColor: 'bg-emerald-500 text-white',
      cardBorder: 'border-emerald-200/80',
    },
    {
      number: '2',
      title: 'Comprá tu cartón',
      description:
        'Elegí tus números de la suerte del 01 al 90 o generá cartones al azar. Pagá en segundos de forma 100% segura.',
      icon: Dices,
      badgeColor: 'bg-amber-400 text-slate-950 font-black',
      cardBorder: 'border-amber-200/80',
    },
    {
      number: '3',
      title: 'Recibí tu cartón digital',
      description:
        'Obtené al instante tu cartón oficial numerado con código QR y número de serie único. Descargalo en PDF o recibilo en WhatsApp.',
      icon: Smartphone,
      badgeColor: 'bg-emerald-600 text-white',
      cardBorder: 'border-emerald-200/80',
    },
    {
      number: '4',
      title: 'Participá del sorteo',
      description:
        'Seguí la transmisión en directo con bolillero oficial. Si tu cartón resulta ganador, el premio se acredita o se entrega de inmediato.',
      icon: Trophy,
      badgeColor: 'bg-yellow-400 text-slate-950 font-black',
      cardBorder: 'border-yellow-300/80',
    },
  ];

  return (
    <section id="seccion-como-funciona" className="py-12 sm:py-16 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Mascot Touch */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3 shadow-xs">
            <img
              src="/logo_tubingo.png"
              alt="TuBINGO.com"
              className="h-5 w-auto object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <span>Simple, Transparente y 100% Oficial</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            ¿Cómo funciona <span className="text-emerald-700">TuBINGO.com</span>?
          </h2>

          <p className="text-sm sm:text-base text-slate-500 mt-2 font-normal">
            Comprar tu cartón oficial y participar de los sorteos es muy fácil en solo 4 pasos:
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative bg-slate-50/70 hover:bg-white rounded-3xl border ${step.cardBorder} p-6 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group`}
              >
                <div>
                  {/* Step Top Bar: Step Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`w-9 h-9 rounded-2xl ${step.badgeColor} flex items-center justify-center font-black text-sm shadow-xs`}
                    >
                      {step.number}
                    </span>
                    <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:scale-110 group-hover:border-emerald-400 group-hover:text-emerald-700 transition-all duration-200 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
