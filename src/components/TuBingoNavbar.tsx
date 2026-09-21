import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Settings, Ticket, MessageCircle } from 'lucide-react';
import { TuBingoLogo } from './common/TuBingoLogo';

interface TuBingoNavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (section: 'inicio' | 'bingos' | 'como-jugar' | 'premios' | 'atencion') => void;
  activeSection: string;
  onOpenAdmin: () => void;
  isAdminOpen: boolean;
}

export const TuBingoNavbar: React.FC<TuBingoNavbarProps> = ({
  cartCount,
  onOpenCart,
  onNavigate,
  activeSection,
  onOpenAdmin,
  isAdminOpen,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: 'inicio' | 'bingos' | 'como-jugar' | 'premios' | 'atencion') => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('inicio')}
            className="flex items-center text-left focus:outline-none"
          >
            <TuBingoLogo />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7">
            <button
              onClick={() => handleNavClick('inicio')}
              className={`text-sm font-medium transition-colors ${
                activeSection === 'inicio' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavClick('bingos')}
              className={`text-sm font-medium transition-colors ${
                activeSection === 'bingos' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bingos
            </button>
            <button
              onClick={() => handleNavClick('como-jugar')}
              className={`text-sm font-medium transition-colors ${
                activeSection === 'como-jugar' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cómo jugar
            </button>
            <button
              onClick={() => handleNavClick('premios')}
              className={`text-sm font-medium transition-colors ${
                activeSection === 'premios' ? 'text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Premios
            </button>
            <button
              onClick={() => handleNavClick('atencion')}
              className={`text-xs font-bold transition-all flex items-center space-x-1.5 px-3 py-1.5 rounded-full ${
                activeSection === 'atencion'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-950 border border-emerald-300'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              <span>Atención al Cliente</span>
            </button>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Cart Button with Counter */}
            <button
              id="header-cart-button"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none"
              aria-label="Ver carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin / Config Button */}
            <button
              onClick={onOpenAdmin}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isAdminOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Panel de Configuración y Base de Datos"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Gestión</span>
            </button>

            {/* Ingresar Pill Button */}
            <button
              onClick={() => handleNavClick('inicio')}
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-transform active:scale-95"
            >
              Ingresar
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleNavClick('inicio')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
                activeSection === 'inicio' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavClick('bingos')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
                activeSection === 'bingos' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
              }`}
            >
              Bingos disponibles
            </button>
            <button
              onClick={() => handleNavClick('como-jugar')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
                activeSection === 'como-jugar' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
              }`}
            >
              Cómo jugar
            </button>
            <button
              onClick={() => handleNavClick('premios')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
                activeSection === 'premios' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-700'
              }`}
            >
              Premios
            </button>
            <button
              onClick={() => handleNavClick('atencion')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium flex items-center space-x-2 ${
                activeSection === 'atencion' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>Atención al Cliente (WhatsApp)</span>
            </button>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-xs font-semibold text-slate-600 py-2 px-3"
              >
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Panel de Administración & BD</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
