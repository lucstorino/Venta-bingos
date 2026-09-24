import React, { useState } from 'react';
import {
  Settings,
  Layers,
  Trophy,
  ShoppingBag,
  ClipboardList,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Database,
  FileText,
  LogOut,
  Store,
  UserCheck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { BingoConfigTab } from './BingoConfigTab';
import { CardsManagementTab } from './CardsManagementTab';
import { PrizesManagementTab } from './PrizesManagementTab';
import { OrdersHistoryTab } from './OrdersHistoryTab';
import { OrdersManagementTab } from './OrdersManagementTab';
import { MercadoPagoTab } from './MercadoPagoTab';
import { DatabaseManagerTab } from './DatabaseManagerTab';
import { ExtractsManagementTab } from './ExtractsManagementTab';
import { TuBingoLogo } from '../common/TuBingoLogo';
import { useBingo } from '../../context/BingoContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Order } from '../../types';

interface AdminDashboardProps {
  onViewOrderTicket: (order: Order) => void;
  onGoToHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewOrderTicket, onGoToHome }) => {
  const { bingo, bingos, orders, resetAllData } = useBingo();
  const { adminUser, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'BINGO' | 'CARDS' | 'PRIZES' | 'ORDERS' | 'EXTRACTS' | 'MERCADOPAGO' | 'DATABASE'>('BINGO');
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    resetAllData();
    setShowResetModal(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    if (onGoToHome) {
      onGoToHome();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="shrink-0 inline-flex">
            <TuBingoLogo variant="dark" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Panel Administrativo Privado
              </span>
              {adminUser && (
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span>{adminUser.email}</span>
                  <span className="text-emerald-500 text-[10px]">({adminUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'})</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Configuración & Gestión
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onGoToHome && (
            <button
              onClick={onGoToHome}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Volver a la tienda pública de venta de cartones"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Ver Tienda Pública</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Restaurar datos a la versión inicial de ejemplo"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restaurar Datos</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs text-rose-300 hover:text-rose-100 border border-rose-800/60 transition-colors"
            title="Cerrar la sesión de administración"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-4 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveTab('BINGO')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'BINGO'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Gestión de Bingos {bingos?.length ? `(${bingos.length})` : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('CARDS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'CARDS'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cartones & Carga Masiva</span>
        </button>

        <button
          onClick={() => setActiveTab('PRIZES')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'PRIZES'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Premios del Evento</span>
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'ORDERS'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Historial de Pedidos</span>
          {orders?.length > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'ORDERS'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {orders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('EXTRACTS')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'EXTRACTS'
              ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/30'
              : 'text-emerald-400 hover:text-white hover:bg-emerald-950/40 border border-emerald-800/40'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Extractos Oficiales</span>
          <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">Inicio</span>
        </button>

        <button
          onClick={() => setActiveTab('MERCADOPAGO')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'MERCADOPAGO'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Mercado Pago & Webhooks</span>
        </button>

        <button
          onClick={() => setActiveTab('DATABASE')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'DATABASE'
              ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
              : 'text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40'
          }`}
        >
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Base de Datos & Backend</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      </div>

      {/* Active Tab Body */}
      <div>
        {activeTab === 'BINGO' && <BingoConfigTab />}
        {activeTab === 'CARDS' && <CardsManagementTab />}
        {activeTab === 'PRIZES' && <PrizesManagementTab />}
        {activeTab === 'ORDERS' && (
          <OrdersHistoryTab onViewOrderTicket={onViewOrderTicket} />
        )}
        {activeTab === 'EXTRACTS' && <ExtractsManagementTab onGoToHome={onGoToHome} />}
        {activeTab === 'MERCADOPAGO' && <MercadoPagoTab />}
        {activeTab === 'DATABASE' && <DatabaseManagerTab />}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-rose-500/20 rounded-xl text-rose-400 border border-rose-500/30">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Cerrar Sesión de Administración?</h3>
                <p className="text-xs text-slate-400">Panel Privado de Gestión</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Tu sesión se cerrará de forma segura y regresarás a la vista pública de la tienda. Para volver al panel, deberás ingresar tus credenciales de administrador nuevamente.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-lg shadow-rose-950/50 transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sí, Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Data Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Restaurar Datos de Demostración?</h3>
                <p className="text-xs text-amber-400/90 font-medium">Reinicio a valores de fábrica</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Se restaurarán los cartones, premios y parámetros iniciales de ejemplo en la memoria local.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold shadow-lg shadow-amber-950/50 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar Datos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
