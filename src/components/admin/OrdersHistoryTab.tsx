import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  ExternalLink,
  Eye,
  Calendar,
  User,
  CreditCard,
  Hash,
  Filter,
  Check,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Ticket,
  Copy,
  AlertCircle,
  X,
  FileSpreadsheet,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { Order, OrderStatus } from '../../types';

interface OrdersHistoryTabProps {
  onViewOrderTicket: (order: Order) => void;
}

export const OrdersHistoryTab: React.FC<OrdersHistoryTabProps> = ({ onViewOrderTicket }) => {
  const { orders, bingos, bingo, updateOrderStatus } = useBingo();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [bingoFilter, setBingoFilter] = useState<string>('ALL');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusChangeSuccess, setStatusChangeSuccess] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'amount' | 'cards'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Filtered & Sorted orders list
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Status filter
        if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;

        // Bingo filter
        if (bingoFilter !== 'ALL' && o.bingoId !== bingoFilter) return false;

        // Text search
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();

        const cardNumbersMatch =
          o.cardNumber.toString().includes(q) ||
          (o.cardNumbers && o.cardNumbers.some((num) => num.toString().includes(q)));

        const customerNameMatch =
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.lastname.toLowerCase().includes(q) ||
          `${o.customer.name} ${o.customer.lastname}`.toLowerCase().includes(q);

        const customerDniMatch = o.customer.dni.toLowerCase().includes(q);
        const customerPhoneMatch = o.customer.phone.toLowerCase().includes(q);
        const customerEmailMatch = o.customer.email ? o.customer.email.toLowerCase().includes(q) : false;
        const orderIdMatch = o.id.toLowerCase().includes(q);
        const paymentIdMatch = o.paymentId ? o.paymentId.toLowerCase().includes(q) : false;
        const valCodeMatch = o.validationCode.toLowerCase().includes(q);

        return (
          cardNumbersMatch ||
          customerNameMatch ||
          customerDniMatch ||
          customerPhoneMatch ||
          customerEmailMatch ||
          orderIdMatch ||
          paymentIdMatch ||
          valCodeMatch
        );
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortDirection === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
        }
        if (sortField === 'amount') {
          return sortDirection === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        }
        if (sortField === 'cards') {
          const cardsA = a.totalCards || (a.cardNumbers ? a.cardNumbers.length : 1);
          const cardsB = b.totalCards || (b.cardNumbers ? b.cardNumbers.length : 1);
          return sortDirection === 'desc' ? cardsB - cardsA : cardsA - cardsB;
        }
        return 0;
      });
  }, [orders, statusFilter, bingoFilter, searchTerm, sortField, sortDirection]);

  // Overall Metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.status === 'PAID');
    const pendingOrders = orders.filter((o) => o.status === 'PENDING');
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED' || o.status === 'EXPIRED');

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalCardsSold = orders.reduce((sum, o) => {
      const count = o.totalCards || (o.cardNumbers ? o.cardNumbers.length : 1);
      return sum + count;
    }, 0);

    return {
      totalOrders,
      paidCount: paidOrders.length,
      pendingCount: pendingOrders.length,
      cancelledCount: cancelledOrders.length,
      totalRevenue,
      totalCardsSold,
    };
  }, [orders]);

  // Copy Order ID
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Change Order Status
  const handleStatusChange = (orderId: string, newStatus: OrderStatus, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    updateOrderStatus(orderId, newStatus);
    setStatusChangeSuccess(`Estado del pedido ${orderId} actualizado a ${newStatus}`);
    setTimeout(() => setStatusChangeSuccess(null), 3000);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const header = [
      'ID Pedido',
      'Fecha',
      'Hora',
      'Comprador Nombre',
      'Comprador Apellido',
      'DNI',
      'Teléfono',
      'Email',
      'Dirección',
      'Localidad',
      'Cant. Cartones',
      'Números de Cartón',
      'Monto Total (ARS)',
      'Estado del Pago',
      'ID de Transacción',
      'Cód. Validación',
    ].join(',');

    const rows = filteredOrders.map((o) => {
      const dateObj = new Date(o.createdAt);
      const dateStr = dateObj.toLocaleDateString('es-AR');
      const timeStr = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      const cardList = o.cardNumbers && o.cardNumbers.length > 0 ? o.cardNumbers.join(';') : o.cardNumber.toString();
      const cardCount = o.totalCards || (o.cardNumbers ? o.cardNumbers.length : 1);

      return [
        `"${o.id}"`,
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${o.customer.name}"`,
        `"${o.customer.lastname}"`,
        `"${o.customer.dni}"`,
        `"${o.customer.phone}"`,
        `"${o.customer.email || ''}"`,
        `"${o.customer.address || ''}"`,
        `"${o.customer.city || ''}"`,
        cardCount,
        `"${cardList}"`,
        o.amount,
        `"${o.status}"`,
        `"${o.paymentId || ''}"`,
        `"${o.validationCode}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + header + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historial_pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format Helper for Dates
  const formatDateTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const dateFormatted = d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Relative calculation
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    let relative = '';
    if (diffSec < 60) relative = 'Hace un momento';
    else if (diffSec < 3600) relative = `Hace ${Math.floor(diffSec / 60)} min`;
    else if (diffSec < 86400) relative = `Hace ${Math.floor(diffSec / 3600)} h`;
    else relative = `Hace ${Math.floor(diffSec / 86400)} días`;

    return { dateFormatted, timeFormatted, relative };
  };

  // Status Badge Helper
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aprobado / Pagado</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pendiente de Pago</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Cancelado</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Expirado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ClipboardList className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Historial Completo de Pedidos</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-800 text-amber-400 border border-slate-700">
                  {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Auditoría en tiempo real de compradores, fecha, cartones adquiridos, montos y estado del pago.
              </p>
            </div>
          </div>
        </div>

        {/* Global Export Action */}
        <div className="flex items-center space-x-2">
          {filteredOrders.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/30 border border-emerald-500/40 transition-all cursor-pointer active:scale-95"
              title="Descargar reporte completo en archivo Excel/CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
              <span>Exportar Excel / CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Notice Toast */}
      {statusChangeSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusChangeSuccess}</span>
        </div>
      )}

      {/* Top Financial & Operational Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total de Pedidos</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white font-mono">{metrics.totalOrders}</span>
            <span className="text-[11px] text-slate-500 font-medium">registrados</span>
          </div>
        </div>

        {/* Total Cards Sold */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Cartones Adquiridos</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{metrics.totalCardsSold}</span>
            <span className="text-[11px] text-amber-400/70 font-medium">boletas</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Recaudación Cobrada</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ${metrics.totalRevenue.toLocaleString('es-AR')}
            </span>
            <span className="text-[10px] text-emerald-400/80 uppercase font-bold">ARS</span>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Estado de Cobros</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-xs">
            <span className="text-emerald-400 font-bold">{metrics.paidCount} Pagados</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">{metrics.pendingCount} Pend.</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Comprador, DNI, Teléfono, N° Cartón o ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <label htmlFor="filter-status-select" className="sr-only">Filtrar por Estado de Pago</label>
              <select
                id="filter-status-select"
                aria-label="Filtrar por Estado de Pago"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  Todos los Estados ({orders.length})
                </option>
                <option value="PAID" className="bg-slate-900 text-emerald-400">
                  Aprobado / Pagado ({orders.filter((o) => o.status === 'PAID').length})
                </option>
                <option value="PENDING" className="bg-slate-900 text-amber-400">
                  Pendiente de Pago ({orders.filter((o) => o.status === 'PENDING').length})
                </option>
                <option value="CANCELLED" className="bg-slate-900 text-rose-400">
                  Cancelado ({orders.filter((o) => o.status === 'CANCELLED').length})
                </option>
              </select>
            </div>
          </div>

          {/* Bingo Event Filter (if multiple) */}
          <div className="md:col-span-2">
            <label htmlFor="filter-bingo-select" className="sr-only">Filtrar por Bingo Sorteo</label>
            <select
              id="filter-bingo-select"
              aria-label="Filtrar por Bingo Sorteo"
              value={bingoFilter}
              onChange={(e) => setBingoFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">
                Todos los Bingos
              </option>
              {bingos?.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Field */}
          <div className="md:col-span-2 flex items-center space-x-1">
            <button
              onClick={() => {
                if (sortField === 'date') {
                  setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                } else {
                  setSortField('date');
                  setSortDirection('desc');
                }
              }}
              className={`flex-1 py-2 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors ${
                sortField === 'date'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Ordenar por fecha"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Fecha {sortField === 'date' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</span>
            </button>
          </div>
        </div>

        {/* Filter Results Summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <div>
            Mostrando <span className="font-bold text-white">{filteredOrders.length}</span> de{' '}
            <span className="font-bold text-white">{orders.length}</span> pedidos
          </div>
          {(searchTerm || statusFilter !== 'ALL' || bingoFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setBingoFilter('ALL');
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Orders History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-3.5">ID Pedido / Fecha</th>
                <th className="p-3.5">Usuario / Comprador</th>
                <th className="p-3.5">Cartones Adquiridos</th>
                <th className="p-3.5">Total Cobrado</th>
                <th className="p-3.5">Estado del Pago</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-700 opacity-60" />
                    <p className="text-sm font-semibold text-slate-400">No se encontraron pedidos en el historial.</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Ajustá los filtros de búsqueda o verificá que haya ventas registradas en el sistema.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const { dateFormatted, timeFormatted, relative } = formatDateTime(order.createdAt);
                  const cardCount = order.totalCards || (order.cardNumbers ? order.cardNumbers.length : 1);
                  const cardsList =
                    order.cardNumbers && order.cardNumbers.length > 0
                      ? order.cardNumbers
                      : [order.cardNumber];

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrderForDetail(order)}
                    >
                      {/* Column 1: Order ID & Date */}
                      <td className="p-3.5 align-top">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono text-white font-black text-xs group-hover:text-amber-400 transition-colors">
                            {order.id}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(order.id, e)}
                            className="p-1 rounded text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Copiar ID del pedido"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{dateFormatted}, {timeFormatted}</span>
                        </div>
                        <div className="text-[10px] text-amber-500/80 font-medium mt-0.5">
                          {relative}
                        </div>
                      </td>

                      {/* Column 2: User / Customer Details */}
                      <td className="p-3.5 align-top">
                        <div className="flex items-start space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-blue-500/20 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                            {order.customer.name.charAt(0)}
                            {order.customer.lastname ? order.customer.lastname.charAt(0) : ''}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs leading-tight">
                              {order.customer.name} {order.customer.lastname}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                              <span className="font-mono font-medium text-slate-300">
                                DNI: {order.customer.dni}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1.5 flex-wrap gap-y-1">
                              {order.customer.phone && (
                                <a
                                  href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold text-[10px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40"
                                  title="Contactar al cliente por WhatsApp"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{order.customer.phone}</span>
                                </a>
                              )}
                              {order.customer.city && (
                                <span className="text-slate-500 text-[10px]">
                                  • {order.customer.city}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Cartones Adquiridos */}
                      <td className="p-3.5 align-top">
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-xs">
                            {cardCount} {cardCount === 1 ? 'Cartón' : 'Cartones'}
                          </span>
                        </div>
                        {/* List of acquired card numbers */}
                        <div className="flex flex-wrap gap-1 mt-1.5 max-w-[240px]">
                          {cardsList.map((cardNum) => (
                            <span
                              key={cardNum}
                              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono font-black text-xs text-amber-400 shadow-2xs"
                              title={`Cartón Oficial #${cardNum}`}
                            >
                              #{cardNum}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Column 4: Monto Total */}
                      <td className="p-3.5 align-top">
                        <div className="font-mono font-black text-white text-sm">
                          ${order.amount.toLocaleString('es-AR')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {order.amount && cardCount > 0
                            ? `$${Math.round(order.amount / cardCount).toLocaleString('es-AR')} c/u`
                            : 'ARS'}
                        </div>
                      </td>

                      {/* Column 5: Estado del Pago */}
                      <td className="p-3.5 align-top">
                        <div className="space-y-1.5">
                          <div>{renderStatusBadge(order.status)}</div>
                          <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                            <span className="text-slate-500">Ref:</span>
                            <span className="truncate max-w-[120px]" title={order.paymentId || 'MP'}>
                              {order.paymentId || 'MP Aprobado'}
                            </span>
                          </div>

                          {/* Quick Admin status switcher dropdown */}
                          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                            <label htmlFor={`order-status-select-${order.id}`} className="sr-only">Modificar Estado de Pago para orden {order.id}</label>
                            <select
                              id={`order-status-select-${order.id}`}
                              aria-label={`Modificar Estado de Pago para orden ${order.id}`}
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus, e)}
                              className="text-[10px] bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-0.5 text-slate-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                              title="Modificar manualmente el estado del pago"
                            >
                              <option value="PAID">Marcar como Pagado</option>
                              <option value="PENDING">Marcar como Pendiente</option>
                              <option value="CANCELLED">Marcar como Cancelado</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Acciones */}
                      <td className="p-3.5 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            title="Ver detalle completo del pedido"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewOrderTicket(order)}
                            className="px-2.5 py-1.5 text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg inline-flex items-center space-x-1 transition-all cursor-pointer"
                            title="Ver cartón oficial y comprobante legal"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Ver Cartón</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal for Selected Order */}
      {selectedOrderForDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedOrderForDetail(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <ClipboardList className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-black text-white">Detalle Completo del Pedido</h3>
                </div>
                <p className="font-mono text-xs text-amber-400">{selectedOrderForDetail.id}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderForDetail(null)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Timing Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Estado del Pago</span>
                <div className="mt-0.5">{renderStatusBadge(selectedOrderForDetail.status)}</div>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Fecha & Hora de Emisión</span>
                <span className="text-xs font-bold text-white">
                  {new Date(selectedOrderForDetail.createdAt).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Buyer / User Section */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Datos del Comprador / Usuario</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Nombre Completo:</span>
                  <span className="font-bold text-white text-sm">
                    {selectedOrderForDetail.customer.name} {selectedOrderForDetail.customer.lastname}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">DNI / Identificación:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {selectedOrderForDetail.customer.dni}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Teléfono Móvil:</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-semibold text-white">{selectedOrderForDetail.customer.phone}</span>
                    {selectedOrderForDetail.customer.phone && (
                      <a
                        href={`https://wa.me/${selectedOrderForDetail.customer.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold underline"
                      >
                        Abrir WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Correo Electrónico:</span>
                  <span className="font-semibold text-white">
                    {selectedOrderForDetail.customer.email || 'No registrado'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-500 block text-[10px]">Domicilio & Localidad:</span>
                  <span className="font-semibold text-white">
                    {selectedOrderForDetail.customer.address || ''}
                    {selectedOrderForDetail.customer.city ? `, ${selectedOrderForDetail.customer.city}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Acquired Bingo Cards Grid */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Ticket className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Cartones Adquiridos ({selectedOrderForDetail.totalCards || (selectedOrderForDetail.cardNumbers?.length || 1)})
                  </span>
                </h4>
                <span className="text-[11px] font-bold text-amber-400">
                  Total: ${selectedOrderForDetail.amount.toLocaleString('es-AR')} ARS
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(selectedOrderForDetail.cardNumbers && selectedOrderForDetail.cardNumbers.length > 0
                  ? selectedOrderForDetail.cardNumbers
                  : [selectedOrderForDetail.cardNumber]
                ).map((cNum) => (
                  <div
                    key={cNum}
                    className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] text-slate-500 block">Cartón N°</span>
                      <span className="font-mono font-black text-amber-400 text-sm">#{cNum}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      Vendido
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation & Security Token */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Código de Autenticidad Notarial</span>
                <span className="font-mono font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block mt-0.5">
                  {selectedOrderForDetail.validationCode}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-bold">Transacción Mercado Pago</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {selectedOrderForDetail.paymentId || 'MP-APROBADO'}
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedOrderForDetail(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  const o = selectedOrderForDetail;
                  setSelectedOrderForDetail(null);
                  onViewOrderTicket(o);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Cartón Oficial / Comprobante</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
