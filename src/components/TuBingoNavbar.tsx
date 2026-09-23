import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Settings, Ticket, MessageCircle, Lock, ShieldCheck, LogOut } from 'lucide-react';
import { TuBingoLogo } from './common/TuBingoLogo';
import { useAdminAuth } from '../context/AdminAuthContext';

interface TuBingoNavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (section: 'inicio' | 'bingos' | 'como-jugar' | 'premios' | 'atencion') => void;
  activeSection: string;
  onOpenAdmin: () => void;
  isAdminOpen: boolean;
  onLogout?: () => void;
}

export const TuBingoNavbar: React.FC<TuBingoNavbarProps> = ({
  cartCount,
  onOpenCart,
  onNavigate,
  activeSection,
  onOpenAdmin,
  isAdminOpen,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, adminUser, logout } = useAdminAuth();

  const handleNavClick = (section: 'inicio' | 'bingos' | 'como-jugar' | 'premios' | 'atencion') => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white border-b border-emerald-900/50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('inicio')}
            className="flex items-center text-left focus:outline-none"
          >
            <TuBingoLogo variant="dark" />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7">
            <button
              onClick={() => handleNavClick('inicio')}
              className={`text-sm font-semibold transition-colors ${
                activeSection === 'inicio'
                  ? 'text-white border-b-2 border-amber-300 pb-0.5'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavClick('bingos')}
              className={`text-sm font-semibold transition-colors ${
                activeSection === 'bingos'
                  ? 'text-white border-b-2 border-amber-300 pb-0.5'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Bingos
            </button>
            <button
              onClick={() => handleNavClick('como-jugar')}
              className={`text-sm font-semibold transition-colors ${
                activeSection === 'como-jugar'
                  ? 'text-white border-b-2 border-amber-300 pb-0.5'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Cómo jugar
            </button>
            <button
              onClick={() => handleNavClick('atencion')}
              className={`text-xs font-bold transition-all flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full ${
                activeSection === 'atencion'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-white bg-white/15 hover:bg-white/25 border border-white/25 shadow-xs'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
              <span>Atención al Cliente</span>
            </button>
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Cart Button with Counter */}
            <button
              id="header-cart-button"
              onClick={onOpenCart}
              className="relative p-2 rounded-xl text-white hover:bg-white/15 transition-colors focus:outline-none"
              aria-label="Ver carrito"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-400 text-slate-950 rounded-full text-[11px] font-black flex items-center justify-center shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* If Authenticated as Admin: Show discreet Admin Panel shortcut + quick logout */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={onOpenAdmin}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isAdminOpen
                      ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-950/80 text-amber-300 border-amber-300/40 hover:bg-slate-950'
                  }`}
                  title={`Sesión activa: ${adminUser?.email || 'Administrador'}`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Panel Admin</span>
                  <span className="sm:hidden">Admin</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
                <button
                  onClick={() => {
                    logout();
                    if (onLogout) onLogout();
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-semibold text-emerald-100 hover:text-white bg-white/10 hover:bg-rose-600/90 border border-white/20 hover:border-rose-400 transition-colors flex items-center space-x-1"
                  title="Cerrar sesión de administrador"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Salir</span>
                </button>
              </div>
            ) : (
              /* Public View: Single Ingresar Button leading to Admin Login */
              <button
                onClick={onOpenAdmin}
                className="px-5 py-2 rounded-full bg-white hover:bg-emerald-50 text-emerald-950 text-sm font-bold shadow-sm transition-transform active:scale-95 flex items-center space-x-1.5"
                title="Acceso de Administración"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-800" />
                <span>Ingresar</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/15"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-700/60 space-y-2 bg-emerald-900/95 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 rounded-b-2xl shadow-xl">
            <button
              onClick={() => handleNavClick('inicio')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
                activeSection === 'inicio' ? 'bg-white/20 text-white font-bold' : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => handleNavClick('bingos')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
                activeSection === 'bingos' ? 'bg-white/20 text-white font-bold' : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              Bingos disponibles
            </button>
            <button
              onClick={() => handleNavClick('como-jugar')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium ${
                activeSection === 'como-jugar' ? 'bg-white/20 text-white font-bold' : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              Cómo jugar
            </button>
            <button
              onClick={() => handleNavClick('atencion')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium flex items-center space-x-2 ${
                activeSection === 'atencion' ? 'bg-white text-emerald-950 font-bold' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <MessageCircle className="w-4 h-4 fill-emerald-300 text-emerald-300" />
              <span>Atención al Cliente (WhatsApp)</span>
            </button>

            {isAuthenticated ? (
              <div className="pt-2 border-t border-emerald-700/60 flex flex-col space-y-1">
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-xs font-bold text-amber-300 py-2 px-3 hover:bg-white/10 rounded-lg w-full text-left"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>Panel de Administración Privado</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex items-center space-x-2 text-xs font-semibold text-rose-300 py-2 px-3 hover:bg-white/10 rounded-lg w-full text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-300" />
                  <span>Cerrar Sesión de Administrador</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-emerald-700/60 flex items-center justify-between">
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-xs font-medium text-emerald-100 hover:text-white py-2 px-3 hover:bg-white/10 rounded-lg w-full text-left"
                >
                  <Lock className="w-4 h-4 text-emerald-200" />
                  <span>Acceso Administración</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
