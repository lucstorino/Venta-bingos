import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Phone,
  Clock,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Send,
} from 'lucide-react';
import { useBingo } from '../../context/BingoContext';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({ isOpen, onClose }) => {
  const { bingo } = useBingo();
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  if (!isOpen) return null;

  const rawPhone = bingo.supportWhatsapp || '+54 9 11 3456-7890';
  // Strip non-numeric characters for the wa.me link
  const cleanPhoneForUrl = rawPhone.replace(/\D/g, '');
  const supportHours = bingo.supportHours || 'Lunes a Domingos de 09:00 a 23:00 hs';

  const quickTopics = [
    {
      title: 'Dudas con la compra de mi cartón',
      msg: '¡Hola TuBINGO.com! Tengo una consulta sobre la compra de mi cartón.',
    },
    {
      title: 'Consultar por cobro de premios',
      msg: '¡Hola! Quisiera consultar cómo es el cobro y acreditación de los premios.',
    },
    {
      title: 'Fecha y transmisión del sorteo',
      msg: '¡Hola! Quisiera saber el horario y enlace para ver la transmisión del sorteo en vivo.',
    },
    {
      title: 'Problema con un comprobante',
      msg: '¡Hola TuBINGO.com! Realicé el pago y necesito verificar mi comprobante de compra.',
    },
  ];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(rawPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = (messageText?: string) => {
    const textToSend = messageText || customMessage || '¡Hola TuBINGO.com! Quisiera hacer una consulta.';
    const encoded = encodeURIComponent(textToSend);
    window.open(`https://wa.me/${cleanPhoneForUrl}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-6 py-5 text-white flex items-center justify-between relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight">
                Atención al Cliente
              </h2>
              <p className="text-xs text-emerald-100 font-medium flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse"></span>
                <span>WhatsApp Oficial TuBINGO.com</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white/90 hover:text-white"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Main WhatsApp Card */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 border-2 border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                  Canal Directo
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-wide pt-1">
                  {rawPhone}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyNumber}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct WhatsApp Action Button */}
            <button
              type="button"
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
              <span>Chatear por WhatsApp ahora</span>
              <ExternalLink className="w-4 h-4 text-emerald-100" />
            </button>

            {/* Support hours and active notice */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-emerald-100">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{supportHours}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">Respuesta rápida</span>
            </div>
          </div>

          {/* Quick Consultation Topics */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              ¿Sobre qué te gustaría consultar?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickTopics.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleOpenWhatsApp(topic.msg)}
                  className="p-3 text-left rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="group-hover:text-emerald-900 transition-colors">
                    {topic.title}
                  </span>
                  <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom message prompt */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              O escribí tu mensaje personalizado:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Escribí acá tu duda o consulta..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleOpenWhatsApp();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleOpenWhatsApp()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Enviar</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Guarantee banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-[11px] leading-tight">
              Atención personalizada y directa con los administradores oficiales del sorteo.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
