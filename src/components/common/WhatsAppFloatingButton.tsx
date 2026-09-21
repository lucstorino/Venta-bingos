import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  onClick: () => void;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        id="btn-whatsapp-flotante"
        type="button"
        onClick={onClick}
        aria-label="Atención al cliente por WhatsApp"
        className="group relative flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/45 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-200 border-2 border-white cursor-pointer"
      >
        {/* Soft pulse ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
        </span>

        <MessageCircle className="w-5 h-5 fill-white text-emerald-600 shrink-0" />
        <div className="text-left hidden sm:block">
          <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider block leading-none">
            ¿Dudas o Consultas?
          </span>
          <span className="text-xs font-black text-white leading-tight block">
            Atención WhatsApp
          </span>
        </div>
        <span className="sm:hidden text-xs font-black">
          WhatsApp
        </span>
      </button>
    </div>
  );
};
