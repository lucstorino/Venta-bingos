import React, { useState, useMemo } from 'react';
import { Sparkles, Search, X, Check, Filter } from 'lucide-react';
import { BingoCard } from '../../types';

interface LuckyNumberSelectorProps {
  availableCards: BingoCard[];
  selectedLuckyNumber: number | null;
  onSelectNumber: (num: number) => void;
  onClearSelection: () => void;
}

type RangeFilter = 'all' | '1-18' | '19-36' | '37-54' | '55-72' | '73-90';

export const LuckyNumberSelector: React.FC<LuckyNumberSelectorProps> = ({
  availableCards,
  selectedLuckyNumber,
  onSelectNumber,
  onClearSelection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRange, setActiveRange] = useState<RangeFilter>('all');

  // Pre-calculate card count for each number from 1 to 90
  const numberStats = useMemo(() => {
    const counts = new Map<number, number>();
    for (let i = 1; i <= 90; i++) {
      counts.set(i, 0);
    }
    availableCards.forEach((card) => {
      card.numbers.forEach((num) => {
        counts.set(num, (counts.get(num) || 0) + 1);
      });
    });
    return counts;
  }, [availableCards]);

  // Ranges
  const rangeFilters: { id: RangeFilter; label: string; min: number; max: number }[] = [
    { id: 'all', label: 'Todas (01-90)', min: 1, max: 90 },
    { id: '1-18', label: '01 al 18', min: 1, max: 18 },
    { id: '19-36', label: '19 al 36', min: 19, max: 36 },
    { id: '37-54', label: '37 al 54', min: 37, max: 54 },
    { id: '55-72', label: '55 al 72', min: 55, max: 72 },
    { id: '73-90', label: '73 al 90', min: 73, max: 90 },
  ];

  // Filter numbers based on active range and search query
  const visibleNumbers = useMemo(() => {
    let list = Array.from({ length: 90 }, (_, i) => i + 1);

    // Filter by range
    if (activeRange !== 'all') {
      const filter = rangeFilters.find((r) => r.id === activeRange);
      if (filter) {
        list = list.filter((n) => n >= filter.min && n <= filter.max);
      }
    }

    // Filter by text search if entered
    if (searchQuery.trim() !== '') {
      const query = searchQuery.trim().replace(/^0+/, ''); // remove leading zeros for match
      list = list.filter((n) => {
        const formatted = String(n).padStart(2, '0');
        return String(n) === query || formatted.includes(searchQuery.trim()) || String(n).includes(query);
      });
    }

    return list;
  }, [activeRange, searchQuery]);

  return (
    <div className="space-y-4 pt-1">
      {/* Header bar with title and quick search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Elegí tu número de la suerte
            </h2>
            <p className="text-xs text-slate-500">
              Tocá una bolilla para filtrar los cartones disponibles que la contienen.
            </p>
          </div>
        </div>

        {/* Quick Search input */}
        <div className="relative w-full sm:w-56">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar número (ej: 07)..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Range filter tabs for quick, comfortable navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3 h-3 text-slate-400" />
          <span>Grupo:</span>
        </span>
        {rangeFilters.map((r) => {
          const isActive = activeRange === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setActiveRange(r.id);
                setSearchQuery('');
              }}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                }
              `}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Active Selected Lucky Number Banner */}
      {selectedLuckyNumber !== null && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-yellow-400/10 border-2 border-amber-400/70 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3.5">
            {/* Big 3D Ball Avatar */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-slate-950 font-black font-mono text-xl flex items-center justify-center shadow-lg shadow-amber-500/30 ring-3 ring-amber-300">
              <span className="relative z-10 drop-shadow-xs">
                {String(selectedLuckyNumber).padStart(2, '0')}
              </span>
              {/* Gloss shine reflection */}
              <div className="absolute top-1 left-2 w-4 h-2.5 bg-white/70 rounded-full blur-[0.5px]"></div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Bolilla Seleccionada
                </span>
                <span className="text-xs font-bold text-slate-700">
                  #{String(selectedLuckyNumber).padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {numberStats.get(selectedLuckyNumber) || 0} {(numberStats.get(selectedLuckyNumber) || 0) === 1 ? 'cartón oficial disponible' : 'cartones oficiales disponibles'} con esta bolilla.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearSelection}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-amber-300 text-xs font-bold text-amber-900 hover:text-rose-700 transition-colors shadow-2xs flex items-center space-x-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Quitar filtro</span>
          </button>
        </div>
      )}

      {/* BINGO BALLS MATRIX CONTAINER */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50/80 to-slate-100/50 rounded-3xl border border-slate-200/80 shadow-inner">
        {visibleNumbers.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <p className="font-bold text-sm">No se encontraron bolillas para "{searchQuery}"</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveRange('all');
              }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Ver todas las bolillas (01 al 90)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-10 gap-2 sm:gap-2.5">
            {visibleNumbers.map((num) => {
              const isSelected = selectedLuckyNumber === num;
              const formatted = String(num).padStart(2, '0');
              const count = numberStats.get(num) || 0;
              const hasCards = count > 0;

              return (
                <button
                  key={num}
                  type="button"
                  disabled={!hasCards}
                  onClick={() => onSelectNumber(num)}
                  title={
                    hasCards
                      ? `Bolilla ${formatted} • ${count} cartones disponibles`
                      : `Bolilla ${formatted} • Sin cartones disponibles`
                  }
                  className={`
                    group relative aspect-square rounded-full transition-all duration-200 flex flex-col items-center justify-center cursor-pointer select-none
                    ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 ring-4 ring-amber-400/50 scale-110 shadow-lg shadow-amber-500/35 z-20 font-black'
                        : hasCards
                        ? 'bg-white hover:bg-gradient-to-b hover:from-sky-50 hover:to-blue-50 text-slate-800 border-2 border-slate-200 hover:border-blue-500 hover:text-blue-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                        : 'bg-slate-200/50 text-slate-400 border border-transparent opacity-35 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Top gloss highlight on sphere for realistic 3D lottery ball look */}
                  <div
                    className={`
                      absolute top-1 left-1.5 w-3 sm:w-3.5 h-1.5 rounded-full pointer-events-none transition-opacity
                      ${isSelected ? 'bg-white/80 blur-[0.4px]' : hasCards ? 'bg-white/90 group-hover:bg-blue-200/60' : 'bg-transparent'}
                    `}
                  />

                  {/* Ball number */}
                  <span
                    className={`
                      font-mono text-sm sm:text-base font-black tracking-tight leading-none
                      ${isSelected ? 'text-slate-950 scale-105' : hasCards ? 'text-slate-900 group-hover:text-blue-700' : 'text-slate-400'}
                    `}
                  >
                    {formatted}
                  </span>

                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-950 text-amber-300 rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
