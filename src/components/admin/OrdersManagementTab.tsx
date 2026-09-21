import React, { useState } from 'react';
import { ShoppingBag, Search, FileBadge, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { Order } from '../../types';

interface OrdersManagementTabProps {
  onViewOrderTicket: (order: Order) => void;
}

export const OrdersManagementTab: React.FC<OrdersManagementTabProps> = ({
  onViewOrderTicket,
}) => {
  const { orders, bingo } = useBingo();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredOrders = orders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.cardNumber.toString().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.lastname.toLowerCase().includes(q) ||
      o.customer.dni.toLowerCase().includes(q) ||
      o.validationCode.toLowerCase().includes(q)
    );
  });

  const totalCollected = orders.reduce((sum, o) => sum + o.amount, 0);

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const header = 'id_orden,numero_carton,nombre,apellido,dni,telefono,email,monto,fecha,cod_validacion,id_pago\n';
    const rows = orders.map((o) =>
      [
        o.id,
        o.cardNumber,
        `"${o.customer.name}"`,
        `"${o.customer.lastname}"`,
        o.customer.dni,
        o.customer.phone,
        o.customer.email || '',
        o.amount,
        new Date(o.createdAt).toISOString(),
        o.validationCode,
        o.paymentId || '',
      ].join(',')
    );

    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_${bingo.name.toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-semibold">Total Órdenes Pagadas</span>
          <span className="text-2xl font-black text-white font-mono">{orders.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-amber-400 block font-semibold">Recaudación Total</span>
          <span className="text-2xl font-black text-amber-400 font-mono">
            ${totalCollected.toLocaleString('es-AR')} {bingo.currency}
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-emerald-400 block font-semibold">Tasa de Efectividad</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">100%</span>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white">Listado y Trazabilidad de Ventas</h3>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar venta por DNI, N° o Nombre..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {orders.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                title="Descargar reporte en formato CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">ID Orden / Fecha</th>
                <th className="p-3">Cartón N°</th>
                <th className="p-3">Comprador Registrado</th>
                <th className="p-3">Monto & Pago</th>
                <th className="p-3">Cód. Autenticidad</th>
                <th className="p-3 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No hay registros de ventas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-850/50">
                    <td className="p-3">
                      <div className="font-mono text-white font-bold">{order.id}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(order.createdAt).toLocaleString('es-AR')}
                      </div>
                    </td>

                    <td className="p-3 font-mono font-black text-amber-400 text-sm">
                      #{order.cardNumber}
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-white">
                        {order.customer.name} {order.customer.lastname}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        DNI: {order.customer.dni} • Tel: {order.customer.phone}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-mono font-bold text-white">
                        ${order.amount.toLocaleString('es-AR')}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {order.paymentId || 'MP Aprobado'}
                      </div>
                    </td>

                    <td className="p-3 font-mono text-slate-300">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {order.validationCode}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => onViewOrderTicket(order)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg inline-flex items-center space-x-1 transition-colors"
                      >
                        <span>Ver Cartón</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
