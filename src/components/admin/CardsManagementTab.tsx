import React, { useState, useMemo } from 'react';
import {
  Upload,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Dice5,
  Search,
  Filter,
  Layers,
  Sparkles,
  Edit3,
  X,
} from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { parseCardsCSV } from '../../utils/cardValidator';
import { BingoCard } from '../../types';

export const CardsManagementTab: React.FC = () => {
  const {
    cards,
    bingo,
    bingos,
    activeBingoId,
    setActiveBingoId,
    importCardsBatch,
    generateSampleCardsBatch,
    clearAllCards,
    updateCardNumbers,
  } = useBingo();

  const [editingCard, setEditingCard] = useState<BingoCard | null>(null);
  const [editableNumbers, setEditableNumbers] = useState<number[]>([]);
  const [editableCardNumber, setEditableCardNumber] = useState<number>(0);
  const [editError, setEditError] = useState<string>('');

  const [csvText, setCsvText] = useState<string>('');
  const [parseResult, setParseResult] = useState<{
    validCards: BingoCard[];
    errors: { line: number; raw: string; reason: string }[];
    duplicateCount: number;
  } | null>(null);

  const [importNotice, setImportNotice] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Metric counts
  const availableCount = cards.filter((c) => c.status === 'AVAILABLE').length;
  const reservedCount = cards.filter((c) => c.status === 'RESERVED').length;
  const soldCount = cards.filter((c) => c.status === 'SOLD').length;

  const handleValidateCSV = () => {
    if (!csvText.trim()) return;
    const existingNumbers = new Set(cards.map((c) => c.cardNumber));
    const result = parseCardsCSV(csvText, bingo.id, existingNumbers);
    setParseResult(result);
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.validCards.length === 0) return;
    const { added } = importCardsBatch(parseResult.validCards);
    setImportNotice(`¡Se importaron con éxito ${added} cartones físicos nuevos!`);
    setCsvText('');
    setParseResult(null);
    setTimeout(() => setImportNotice(''), 4000);
  };

  const handleGenerateBatch = (count: number) => {
    const added = generateSampleCardsBatch(count);
    setImportNotice(`¡Se generó un lote de ${added} cartones válidos listos para la venta!`);
    setTimeout(() => setImportNotice(''), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const existingNumbers = new Set(cards.map((c) => c.cardNumber));
      const result = parseCardsCSV(content, bingo.id, existingNumbers);
      setParseResult(result);
    };
    reader.readAsText(file);
  };

  const handleStartEditCard = (card: BingoCard) => {
    setEditingCard(card);
    setEditableNumbers([...card.numbers].sort((a, b) => a - b));
    setEditableCardNumber(card.cardNumber);
    setEditError('');
  };

  const handleSaveCardNumbers = () => {
    if (!editingCard) return;
    if (editableNumbers.length !== 10) {
      setEditError('Debes ingresar exactamente 10 números.');
      return;
    }
    const unique = new Set(editableNumbers);
    if (unique.size !== 10) {
      setEditError('Los 10 números deben ser distintos entre sí.');
      return;
    }
    if (editableNumbers.some((n) => isNaN(n) || n < 1 || n > 90)) {
      setEditError('Todos los números deben estar comprendidos entre 1 y 90.');
      return;
    }

    updateCardNumbers(editingCard.id, editableNumbers, editableCardNumber);
    setImportNotice(`¡Cartón N° ${editableCardNumber} actualizado correctamente!`);
    setEditingCard(null);
    setTimeout(() => setImportNotice(''), 4000);
  };

  // Filtered cards for table
  const filteredList = useMemo(() => {
    return cards.filter((c) => {
      if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const matchesNumber = c.cardNumber.toString().includes(q);
        const matchesGameNumber = c.numbers.some((n) => n.toString() === q);
        if (!matchesNumber && !matchesGameNumber) return false;
      }
      return true;
    });
  }, [cards, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedCards = filteredList.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Bingo Selector when multiple exist */}
      {bingos && bingos.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 border border-slate-800 p-3.5 rounded-2xl gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Bingo seleccionado:</span>
            <span className="text-xs font-bold text-amber-400">{bingo.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400">Ver cartones de:</label>
            <select
              value={activeBingoId}
              onChange={(e) => setActiveBingoId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:border-amber-400 focus:outline-none"
            >
              {bingos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (${(b.price || 0).toLocaleString('es-AR')})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Header with Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-semibold">Total Cartones</span>
          <span className="text-2xl font-black text-white font-mono">{cards.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-emerald-400 block font-semibold">Disponibles</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">{availableCount}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-amber-400 block font-semibold">Reservados</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{reservedCount}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-rose-400 block font-semibold">Vendidos</span>
          <span className="text-2xl font-black text-rose-400 font-mono">{soldCount}</span>
        </div>
      </div>

      {importNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{importNotice}</span>
        </div>
      )}

      {/* CSV / Massive Upload Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Carga Masiva de Cartones Físicos (CSV / Excel)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Formato estándar: <code className="text-amber-400 font-mono">numero_carton,n1,n2,n3,n4,n5,n6,n7,n8,n9,n10</code>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="cursor-pointer px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-colors">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Subir Archivo .CSV</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setParseResult(null);
            }}
            placeholder={`146011,2,6,15,33,45,51,60,72,83,89\n146012,4,8,19,27,38,49,58,67,75,90\n146013,1,11,24,36,44,52,63,77,81,88`}
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleValidateCSV}
              disabled={!csvText.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Validar Formato y Duplicados
            </button>

            {parseResult && parseResult.validCards.length > 0 && (
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-all shadow"
              >
                Confirmar e Importar {parseResult.validCards.length} Cartones
              </button>
            )}
          </div>

          {/* Instant sample batch generation for convenience */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Generar lote rápido:</span>
            <button
              onClick={() => handleGenerateBatch(20)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700"
            >
              +20
            </button>
            <button
              onClick={() => handleGenerateBatch(50)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700"
            >
              +50
            </button>
            <button
              onClick={() => handleGenerateBatch(200)}
              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/40"
            >
              +200
            </button>
          </div>
        </div>

        {/* Validation summary report */}
        {parseResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Resumen de Validación de Carga Masiva:</span>
              <div className="flex space-x-3">
                <span className="text-emerald-400 font-bold">
                  ✓ {parseResult.validCards.length} válidos
                </span>
                <span className="text-rose-400 font-bold">
                  ✗ {parseResult.errors.length} errores
                </span>
                {parseResult.duplicateCount > 0 && (
                  <span className="text-amber-400 font-bold">
                    ⚠ {parseResult.duplicateCount} duplicados detectados
                  </span>
                )}
              </div>
            </div>

            {parseResult.errors.length > 0 && (
              <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-rose-300 bg-rose-950/20 p-2 rounded-lg border border-rose-900/30">
                {parseResult.errors.slice(0, 5).map((err, i) => (
                  <div key={i}>
                    Línea {err.line}: {err.reason} ({err.raw})
                  </div>
                ))}
                {parseResult.errors.length > 5 && (
                  <div>... y {parseResult.errors.length - 5} errores más.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cards Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white">Catálogo de Cartones Registrados</h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por N° o número de juego..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Filter by status */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Todos los estados</option>
              <option value="AVAILABLE">Disponibles</option>
              <option value="RESERVED">Reservados</option>
              <option value="SOLD">Vendidos</option>
            </select>

            {cards.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de que deseas vaciar todos los cartones?')) {
                    clearAllCards();
                  }
                }}
                className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-900"
                title="Vaciar cartones"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Cartón N°</th>
                <th className="p-3">Números de Juego (10 Números)</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Trazabilidad</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    No se encontraron cartones con los filtros aplicados
                  </td>
                </tr>
              ) : (
                paginatedCards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-850/50">
                    <td className="p-3 font-mono font-bold text-amber-400 text-sm">
                      #{card.cardNumber}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {card.numbers.map((n, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono font-bold text-[11px] text-slate-200"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          card.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : card.status === 'RESERVED'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {card.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {card.status === 'SOLD' && card.soldToOrderId && (
                        <span className="text-slate-300">Orden: {card.soldToOrderId}</span>
                      )}
                      {card.status === 'RESERVED' && card.reservedUntil && (
                        <span className="text-amber-400">Expira en unos min.</span>
                      )}
                      {card.status === 'AVAILABLE' && (
                        <span className="text-slate-500">Listo para venta</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleStartEditCard(card)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-lg border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Modificar los números de este cartón"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>
            Mostrando {filteredList.length === 0 ? 0 : (page - 1) * pageSize + 1} a{' '}
            {Math.min(page * pageSize, filteredList.length)} de {filteredList.length} cartones
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 bg-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 bg-slate-800 rounded-lg text-slate-300 hover:text-white disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Edit Card Numbers Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Modificar Números del Cartón</h3>
                  <p className="text-xs text-slate-400">
                    Editando Cartón N° <span className="text-amber-400 font-mono font-bold">#{editingCard.cardNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCard(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Randomize */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">¿Generar números aleatorios para este cartón?</span>
              <button
                type="button"
                onClick={() => {
                  const pool: number[] = [];
                  while (pool.length < 10) {
                    const n = Math.floor(Math.random() * 90) + 1;
                    if (!pool.includes(n)) pool.push(n);
                  }
                  setEditableNumbers(pool.sort((a, b) => a - b));
                  setEditError('');
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <Dice5 className="w-4 h-4" />
                <span>Sortear 10 al azar</span>
              </button>
            </div>

            {/* Numbers inputs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Los 10 números del cartón (valores del 1 al 90):
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold mb-1">Nº {idx + 1}</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={editableNumbers[idx] ?? ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const updated = [...editableNumbers];
                        if (isNaN(val)) {
                          updated[idx] = 0;
                        } else {
                          updated[idx] = val;
                        }
                        setEditableNumbers(updated);
                        setEditError('');
                      }}
                      className="w-full text-center py-2 px-1 bg-slate-950 border border-slate-700 rounded-xl font-mono text-base font-black text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Card Serial Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                N° de cartón:
              </label>
              <input
                type="number"
                value={editableCardNumber}
                onChange={(e) => setEditableCardNumber(parseInt(e.target.value, 10) || 0)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm font-bold text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {editError && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold">
                {editError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCardNumbers}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
