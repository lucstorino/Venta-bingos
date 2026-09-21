import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, ShieldCheck } from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// Configurable and editable FAQ list
export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: '¿Cómo recibo mi cartón después de realizar el pago?',
    answer:
      'Una vez confirmado el pago, tu cartón oficial se genera de inmediato en pantalla. Podés visualizar los números asignados, descargarlo en formato PDF de alta resolución con su código QR y número de serie oficial, y recibir una copia directa a tu WhatsApp o correo electrónico.',
  },
  {
    id: 'faq-2',
    question: '¿Es seguro comprar cartones en TuBINGO.com?',
    answer:
      'Totalmente seguro. Todos los pagos se procesan a través de la infraestructura certificada de Mercado Pago con cifrado SSL de nivel bancario. Cada cartón cuenta con numeración única autorizada y supervisada por autoridades oficiales de juego.',
  },
  {
    id: 'faq-3',
    question: '¿Puedo elegir mis propios números de la suerte?',
    answer:
      '¡Sí! En nuestra pantalla de selección podés filtrar por tu número preferido (del 01 al 90) para ver todos los cartones disponibles que contengan ese número, o bien utilizar el botón de azar para que la bolilla de la suerte elija cartones al instante.',
  },
  {
    id: 'faq-4',
    question: '¿Cómo sé si mi cartón resultó ganador?',
    answer:
      'Los sorteos se transmiten en vivo en la fecha y hora indicadas para cada bingo. Además, los resultados y números cantados se cargan de forma oficial en la plataforma y podés consultar el extracto en cualquier momento desde la sección "Sorteos anteriores".',
  },
  {
    id: 'faq-5',
    question: '¿Cómo y cuándo cobro mi premio si gano?',
    answer:
      'Los premios en efectivo se acreditan directamente por transferencia bancaria (CBU/CVU) previa validación de identidad. En el caso de vehículos 0KM y premios mayores, la organización oficial del bingo se contacta directamente con vos para coordinar la entrega y firma de documentación ante escribano público.',
  },
  {
    id: 'faq-6',
    question: '¿Puedo comprar varios cartones a la vez?',
    answer:
      'Sí, podés agregar tantos cartones como desees a tu carrito de compras, combinando diferentes números de la suerte o eligiendo cartones de distintos bingos disponibles.',
  },
  {
    id: 'faq-7',
    question: '¿Qué hago si tengo alguna duda o inconveniente?',
    answer:
      'Nuestro equipo de atención al cliente está disponible por WhatsApp todos los días para ayudarte con cualquier consulta sobre tu compra, cartones o estado de pago.',
  },
];

interface FaqSectionProps {
  onContactSupport?: () => void;
  faqs?: FaqItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  onContactSupport,
  faqs = INITIAL_FAQS,
}) => {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="seccion-faq" className="py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resolución de dudas</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Preguntas frecuentes
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Respuestas claras a las dudas más comunes sobre la compra de cartones y el cobro de premios.
          </p>
        </div>

        {/* Accordions List */}
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-emerald-300 bg-slate-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'rotate-180 bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/80 animate-fadeIn">
                    <p className="pt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Support Banner */}
        {onContactSupport && (
          <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">
                ¿Tenés otra consulta o necesitás asistencia personalizada?
              </h4>
              <p className="text-xs text-slate-500">
                Escribinos por WhatsApp y nuestro equipo te responderá a la brevedad.
              </p>
            </div>
            <button
              type="button"
              onClick={onContactSupport}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar Soporte</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
