import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Copy,
  Download,
  Search,
  FileText,
  RotateCcw,
  Ban,
  Ticket,
  DollarSign,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Bingo, BingoCard } from '../../types';
import { useBingo } from '../../context/BingoContext';

interface StopSalesModalProps {
  isOpen: boolean;
  bingo: Bingo;
  onClose: () => void;
  onUploadExtract?: (bingo: Bingo) => void;
}

export const StopSalesModal: React.FC<StopSalesModalProps> = ({
  isOpen,
  bingo,
  onClose,
  onUploadExtract,
}) => {
  const { stopBingoSales, reopenBingoSales, getBingoUnsoldCards } = useBingo();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'UNSOLD' | 'ALL' | 'SOLD'>('UNSOLD');
  const [copyToast, setCopyToast] = useState(false);
  const [isConfirmingStop, setIsConfirmingStop] = useState(false);

  const isSalesClosed = Boolean(bingo.salesClosed || bingo.status === 'FINISHED');

  // Compute card breakdown
  const { soldCards, unsoldCards, total } = useMemo(() => {
    return getBingoUnsoldCards(bingo.id);
  }, [getBingoUnsoldCards, bingo.id, bingo.salesClosed, bingo.status]);

  const totalRevenue = soldCards.length * (bingo.price || 0);

  // Filtered cards for display
  const displayedCards = useMemo(() => {
    let list: BingoCard[] = [];
    if (filterMode === 'UNSOLD') {
      list = unsoldCards;
    } else if (filterMode === 'SOLD') {
      list = soldCards;
    } else {
      list = [...soldCards, ...unsoldCards].sort((a, b) => a.cardNumber - b.cardNumber);
    }

    if (!searchTerm.trim()) return list;

    const term = searchTerm.trim().toLowerCase();
    return list.filter((c) => {
      const numStr = c.cardNumber.toString();
      const padNum = numStr.padStart(4, '0');
      const buyerName = c.comprador?.nombreApellido?.toLowerCase() || '';
      return numStr.includes(term) || padNum.includes(term) || buyerName.includes(term);
    });
  }, [filterMode, unsoldCards, soldCards, searchTerm]);

  if (!isOpen) return null;

  const handleExecuteStopSales = () => {
    stopBingoSales(bingo.id);
    setIsConfirmingStop(false);
  };

  const handleExecuteReopenSales = () => {
    if (
      window.confirm(
        `¿Reanudar la venta de "${bingo.name}"? Los cartones dados de baja volverán a estar disponibles para la compra del público.`
      )
    ) {
      reopenBingoSales(bingo.id);
    }
  };

  // Copy unsold numbers to clipboard
  const handleCopyUnsoldNumbers = () => {
    const numbersList = unsoldCards.map((c) => `#${c.cardNumber.toString().padStart(4, '0')}`).join(', ');
    navigator.clipboard.writeText(numbersList);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 3000);
  };

  // Download official TXT statement
  const handleDownloadActaTxt = () => {
    const dateFormatted = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeFormatted = new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const lines: string[] = [
      '========================================================================',
      '                     ACTA OFICIAL DE CIERRE DE VENTAS                   ',
      '                        Y CARTONES DADOS DE BAJA                        ',
      '========================================================================',
      `Sorteo: ${bingo.name}`,
      `Fecha Oficial del Sorteo: ${bingo.drawDate || 'Fecha a definir'} - ${bingo.drawTime || '18:00'} hs`,
      `Fecha y Hora del Cierre de Ventas: ${dateFormatted} a las ${timeFormatted} hs`,
      `Valor Oficial por Cartón: $${(bingo.price || 0).toLocaleString('es-AR')}`,
      '------------------------------------------------------------------------',
      '                        RESUMEN DE EMISIÓN                              ',
      '------------------------------------------------------------------------',
      `Total de Cartones Emitidos:               ${total}`,
      `Total de Cartones Vendidos (Participan):  ${soldCards.length}`,
      `Total de Cartones NO Vendidos (De Baja):  ${unsoldCards.length}`,
      `Recaudación Total Declarada:              $${totalRevenue.toLocaleString('es-AR')}`,
      '------------------------------------------------------------------------',
      '                  CARTONES HABILITADOS PARA EL SORTEO                   ',
      '------------------------------------------------------------------------',
      soldCards.length > 0
        ? soldCards
            .map(
              (c) =>
                `Cartón #${c.cardNumber.toString().padStart(4, '0')} - Comprador: ${
                  c.comprador?.nombreApellido || 'Cliente Oficial'
                } (DNI: ${c.comprador?.dni || 'S/D'})`
            )
            .join('\n')
        : 'No se registraron cartones vendidos.',
      '------------------------------------------------------------------------',
      '                 CARTONES NO VENDIDOS (DADOS DE BAJA)                   ',
      '       LOS SIGUIENTES CARTONES NO PARTICIPAN DEL SORTEO OFICIAL         ',
      '------------------------------------------------------------------------',
      unsoldCards.length > 0
        ? unsoldCards.map((c) => `#${c.cardNumber.toString().padStart(4, '0')}`).join(', ')
        : 'Todos los cartones fueron vendidos.',
      '',
      '========================================================================',
      'Certificación de cierre de plataforma TuBingo.com',
      '========================================================================',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Acta_Cierre_Cartones_${bingo.name.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-850 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSalesClosed
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isSalesClosed ? <Ban className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isSalesClosed
                    ? 'Acta de Cierre de Venta y Cartones Dados de Baja'
                    : 'Cierre de Venta y Baja de Cartones No Vendidos'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isSalesClosed
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isSalesClosed ? 'Venta Detenida' : 'Venta Activa'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md sm:max-w-xl">
                {bingo.name} • Fecha: {bingo.drawDate || 'Sin definir'} - {bingo.drawTime || '18:00'} hs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* If sales are not closed yet, show the warning & stop button banner */}
          {!isSalesClosed ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-700/60 space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-200">
                    ¿Llegó el momento de cerrar la venta de este bingo?
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Al hacer clic en <strong>"Detener Venta Ahora"</strong>, la plataforma bloqueará de inmediato nuevas
                    compras en la web y dará de baja todos los cartones que no hayan sido pagados. Tendrás aquí el
                    listado completo con cada número de cartón no vendido para certificar antes del sorteo.
                  </p>
                </div>
              </div>

              {isConfirmingStop ? (
                <div className="p-3 bg-rose-950/60 border border-rose-700/80 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-rose-200">
                    ⚠️ ¿Confirmás dar de baja los {unsoldCards.length} cartones no vendidos y detener la venta?
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleExecuteStopSales}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
                    >
                      Sí, Detener Venta y Dar de Baja No Vendidos
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingStop(false)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingStop(true)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  <span>Detener Venta y Dar de Baja No Vendidos ({unsoldCards.length} cartones)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Venta Cerrada Oficialmente
                  </h4>
                  <p className="text-xs text-rose-200 mt-0.5">
                    Los {unsoldCards.length} cartones no vendidos fueron dados de baja y no participan del sorteo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExecuteReopenSales}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Reanudar venta si fue cerrada por error"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reanudar Venta</span>
                </button>

                {onUploadExtract && (
                  <button
                    type="button"
                    onClick={() => onUploadExtract(bingo)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Cargar Extracto Oficial</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* 1. Total Emitidos */}
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Emitidos
                </span>
                <span className="text-2xl font-black text-white font-mono mt-0.5 block">{total}</span>
                <span className="text-[10px] text-slate-400">Cartones en el sistema</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-700/60 text-slate-300 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
            </div>

            {/* 2. Vendidos (Participan) */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Vendidos (Participan)
                </span>
                <span className="text-2xl font-black text-emerald-300 font-mono mt-0.5 block">
                  {soldCards.length}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  Recaudación: ${totalRevenue.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* 3. Dados de baja (No Vendidos) */}
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                  Dados de Baja (No Vendidos)
                </span>
                <span className="text-2xl font-black text-rose-300 font-mono mt-0.5 block">
                  {unsoldCards.length}
                </span>
                <span className="text-[10px] text-rose-300">No entran al bolillero</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Actions & Filters Bar */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center space-x-1.5 p-1 bg-slate-800/90 rounded-xl border border-slate-700/80 self-start">
                <button
                  type="button"
                  onClick={() => setFilterMode('UNSOLD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    filterMode === 'UNSOLD'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  No Vendidos ({unsoldCards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('SOLD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    filterMode === 'SOLD'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Vendidos ({soldCards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    filterMode === 'ALL'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Todos ({total})
                </button>
              </div>

              {/* Action Buttons: Copy & Download Acta */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyUnsoldNumbers}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center space-x-2 transition-all cursor-pointer"
                  title="Copiar lista de números no vendidos"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copiar No Vendidos</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadActaTxt}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-2 transition-all shadow-md shadow-blue-900/30 cursor-pointer"
                  title="Descargar acta oficial en archivo .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Acta (.TXT)</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar número de cartón (ej: 0045) o nombre de comprador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Copy Toast feedback */}
          {copyToast && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-600 text-emerald-300 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">
                ¡Números de los {unsoldCards.length} cartones no vendidos copiados al portapapeles!
              </span>
            </div>
          )}

          {/* Grid of Card Numbers */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-semibold">
                Mostrando {displayedCards.length} cartones{' '}
                {filterMode === 'UNSOLD' ? '(NO VENDIDOS / DADOS DE BAJA)' : filterMode === 'SOLD' ? '(VENDIDOS)' : ''}
              </span>
              <span className="text-[11px] text-slate-500">
                Los cartones en rojo no entran al sorteo
              </span>
            </div>

            {displayedCards.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No se encontraron cartones con el criterio seleccionado.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {displayedCards.map((card) => {
                  const isSold = card.status === 'SOLD';
                  return (
                    <div
                      key={card.id}
                      className={`p-2 rounded-lg text-center border flex flex-col justify-between transition-all ${
                        isSold
                          ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300'
                          : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                      }`}
                      title={
                        isSold
                          ? `Cartón #${card.cardNumber} - VENDIDO a ${card.comprador?.nombreApellido || 'Cliente'}`
                          : `Cartón #${card.cardNumber} - DADO DE BAJA (No vendido)`
                      }
                    >
                      <span className="font-mono text-xs font-black tracking-tight">
                        #{card.cardNumber.toString().padStart(4, '0')}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-1 py-0.5 rounded ${
                          isSold
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-400 line-through'
                        }`}
                      >
                        {isSold ? 'Vendido' : 'De Baja'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            {isSalesClosed ? (
              <span>El acta certifica los cartones que efectivamente juegan el sorteo.</span>
            ) : (
              <span>Revisá los cartones antes de confirmar el cierre oficial de venta.</span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
