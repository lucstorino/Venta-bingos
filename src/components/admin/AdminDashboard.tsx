import React, { useState } from 'react';
import {
  Settings,
  Layers,
  Trophy,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Database,
} from 'lucide-react';
import { BingoConfigTab } from './BingoConfigTab';
import { CardsManagementTab } from './CardsManagementTab';
import { PrizesManagementTab } from './PrizesManagementTab';
import { OrdersManagementTab } from './OrdersManagementTab';
import { MercadoPagoTab } from './MercadoPagoTab';
import { DatabaseManagerTab } from './DatabaseManagerTab';
import { useBingo } from '../../context/BingoContext';
import { Order } from '../../types';

interface AdminDashboardProps {
  onViewOrderTicket: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewOrderTicket }) => {
  const { bingo, bingos, resetAllData } = useBingo();
  const [activeTab, setActiveTab] = useState<'BINGO' | 'CARDS' | 'PRIZES' | 'ORDERS' | 'MERCADOPAGO' | 'DATABASE'>('BINGO');

  const handleReset = () => {
    if (
      confirm(
        '¿Restaurar los datos del Bingo a sus valores iniciales de demostración? Se reestablecerán cartones y premios de ejemplo.'
      )
    ) {
      resetAllData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Panel Administrativo
            </span>
            <span className="text-xs text-slate-400">Control Central de Bingos y Cartones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Configuración & Gestión
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Restaurar datos a la versión inicial de ejemplo"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restaurar Datos Iniciales</span>
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
          <ShoppingBag className="w-4 h-4" />
          <span>Ventas & Trazabilidad</span>
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
          <OrdersManagementTab onViewOrderTicket={onViewOrderTicket} />
        )}
        {activeTab === 'MERCADOPAGO' && <MercadoPagoTab />}
        {activeTab === 'DATABASE' && <DatabaseManagerTab />}
      </div>
    </div>
  );
};
