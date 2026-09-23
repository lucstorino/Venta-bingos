import React from 'react';
import { CreditCard, Wallet, Lock, CheckCircle2, Zap } from 'lucide-react';

export const PaymentMethodsSection: React.FC = () => {
  const methods = [
    {
      title: 'Mercado Pago',
      subtitle: 'Dinero en cuenta y procesador oficial',
      description: 'Pagá directo con tu saldo de Mercado Pago con acreditación instantánea.',
      icon: Wallet,
      tag: 'Acreditación Instantánea',
      tagColor: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      title: 'Tarjetas de Débito',
      subtitle: 'Visa Débito, Mastercard, Maestro, Cabal',
      description: 'Aboná con tu tarjeta de débito bancaria sin comisiones adicionales.',
      icon: CreditCard,
      tag: 'Sin comisión extra',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      title: 'Tarjetas de Crédito',
      subtitle: 'Visa, Mastercard, American Express, Naranja',
      description: 'Financiá tu compra con las principales tarjetas de crédito del país.',
      icon: CreditCard,
      tag: 'Cuotas disponibles',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  return (
    <section id="seccion-medios-de-pago" className="py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pagos 100% Protegidos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Medios de pago disponibles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Operamos con las plataformas oficiales y los métodos de cobro más confiables de Argentina.
          </p>
        </div>

        {/* Payment Methods Cards - 3 columns for balanced display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.title}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-5 hover:bg-white hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${method.tagColor}`}>
                      {method.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {method.title}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {method.subtitle}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {method.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>Acreditación segura</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges Banner without SSL 256 bits text */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-emerald-950">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Generación inmediata de cartón oficial</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Soporte por WhatsApp ante cualquier consulta</span>
          </div>
        </div>

      </div>
    </section>
  );
};
