import React, { useState, useMemo } from 'react';
import { Sparkles, Search, X, Check, Dices, ChevronDown, ChevronUp, Layers, HelpCircle } from 'lucide-react';
import { BingoCard } from '../../types';

export type LuckyMatchMode = 'all' | 'any';

interface LuckyNumberSelectorProps {
  availableCards: BingoCard[];
  selectedLuckyNumbers: number[];
  onToggleNumber: (num: number) => void;
  onSelectMultipleNumbers?: (nums: number[]) => void;
  onClearSelection: () => void;
  matchMode?: LuckyMatchMode;
  onChangeMatchMode?: (mode: LuckyMatchMode) => void;
}

type RangeFilter = '1-18' | '19-36' | '37-54' | '55-72' | '73-90' | 'all';

export const LuckyNumberSelector: React.FC<LuckyNumberSelectorProps> = ({
  availableCards,
  selectedLuckyNumbers,
  onToggleNumber,
  onSelectMultipleNumbers,
  onClearSelection,
  matchMode = 'all',
  onChangeMatchMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRange, setActiveRange] = useState<RangeFilter>('1-18');
  const [isGridCollapsed, setIsGridCollapsed] = useState(false);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  // Pre-calculate card count for each individual number from 1 to 90
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

  // Calculate cards that match the current selection
  const matchingCardsCount = useMemo(() => {
    if (selectedLuckyNumbers.length === 0) return 0;
    return availableCards.filter((card) => {
      if (matchMode === 'all') {
        return selectedLuckyNumbers.every((n) => card.numbers.includes(n));
      } else {
        return selectedLuckyNumbers.some((n) => card.numbers.includes(n));
      }
    }).length;
  }, [availableCards, selectedLuckyNumbers, matchMode]);

  // Ranges definition
  const rangeFilters: { id: RangeFilter; label: string; min: number; max: number }[] = [
    { id: '1-18', label: '01 al 18', min: 1, max: 18 },
    { id: '19-36', label: '19 al 36', min: 19, max: 36 },
    { id: '37-54', label: '37 al 54', min: 37, max: 54 },
    { id: '55-72', label: '55 al 72', min: 55, max: 72 },
    { id: '73-90', label: '73 al 90', min: 73, max: 90 },
    { id: 'all', label: 'Ver todas (01-90)', min: 1, max: 90 },
  ];

  // Filter numbers based on active range and search query
  const visibleNumbers = useMemo(() => {
    let list = Array.from({ length: 90 }, (_, i) => i + 1);

    // If searching, search in all 90
    if (searchQuery.trim() !== '') {
      const query = searchQuery.trim().replace(/^0+/, '');
      return list.filter((n) => {
        const formatted = String(n).padStart(2, '0');
        return String(n) === query || formatted.includes(searchQuery.trim()) || String(n).includes(query);
      });
    }

    // Filter by active range
    const filter = rangeFilters.find((r) => r.id === activeRange);
    if (filter && activeRange !== 'all') {
      list = list.filter((n) => n >= filter.min && n <= filter.max);
    }

    return list;
  }, [activeRange, searchQuery]);

  // Handler for clicking a number in the grid
  const handleNumberClick = (num: number) => {
    const isAlreadySelected = selectedLuckyNumbers.includes(num);

    if (isAlreadySelected) {
      onToggleNumber(num);
      setLimitNotice(null);
      return;
    }

    // If trying to add a 4th number
    if (selectedLuckyNumbers.length >= 3) {
      setLimitNotice('Podés elegir hasta un máximo de 3 bolillas. Quitá una para agregar otra.');
      setTimeout(() => setLimitNotice(null), 3500);
      return;
    }

    onToggleNumber(num);
    setLimitNotice(null);
  };

  // Quick random pick: can pick 1, 2 or 3 numbers with available cards
  const handleRandomPick = (count: number = 1) => {
    if (availableCards.length === 0) return;

    // Look for cards and pick numbers from a single card if possible (guarantees match!)
    const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    const shuffledCardNumbers = [...randomCard.numbers].sort(() => Math.random() - 0.5);
    const chosen = shuffledCardNumbers.slice(0, Math.min(count, 3));

    if (onSelectMultipleNumbers) {
      onSelectMultipleNumbers(chosen);
    } else {
      // Fallback toggling
      onClearSelection();
      chosen.forEach((n) => onToggleNumber(n));
    }
    setIsGridCollapsed(false);
    setLimitNotice(null);
  };

  // Handle direct Enter in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const parsed = parseInt(searchQuery.trim(), 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 90) {
        handleNumberClick(parsed);
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title & subtitle */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  Elegí tu número de la suerte
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Hasta 3 bolillas
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                Elegí <strong className="text-slate-700">1, 2 o hasta 3 bolillas</strong> para encontrar los cartones que contengan tus números favoritos
              </p>
            </div>
          </div>

          {/* Quick actions: Search & Random Generator */}
          <div className="flex items-center gap-2">
            <div className="relative w-36 sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={searchQuery}
                onKeyDown={handleSearchKeyDown}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (isGridCollapsed) setIsGridCollapsed(false);
                }}
                placeholder="Número (ej: 07)..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Random Buttons Group */}
            <div className="flex items-center rounded-lg bg-emerald-50 border border-emerald-200/80 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => handleRandomPick(1)}
                title="Elegir 1 bolilla al azar"
                className="px-2 py-1 rounded-md text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Dices className="w-3 h-3 text-emerald-600" />
                <span>1 al azar</span>
              </button>
              <span className="w-px h-3.5 bg-emerald-200 mx-0.5" />
              <button
                type="button"
                onClick={() => handleRandomPick(3)}
                title="Elegir una combinación de 3 bolillas al azar que estén en un cartón"
                className="px-2 py-1 rounded-md text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>3 al azar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Limit notice message if user tries >3 numbers */}
        {limitNotice && (
          <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span>⚠️ {limitNotice}</span>
            <button
              type="button"
              onClick={() => setLimitNotice(null)}
              className="text-amber-700 hover:text-amber-950 font-bold ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Selected Lucky Numbers Banner (Interactive Spheres) */}
        {selectedLuckyNumbers.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 shadow-2xs space-y-2.5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Spheres list */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tus bolillas ({selectedLuckyNumbers.length}/3):</span>
                </span>

                {selectedLuckyNumbers.map((num, idx) => (
                  <div
                    key={num}
                    className="group inline-flex items-center pl-2 pr-1.5 py-1 rounded-full bg-emerald-700 text-white font-mono font-black text-xs shadow-xs ring-2 ring-emerald-300/80 gap-1.5 transition-transform hover:scale-105"
                  >
                    <span>#{String(num).padStart(2, '0')}</span>
                    <button
                      type="button"
                      onClick={() => handleNumberClick(num)}
                      title={`Quitar bolilla #${num}`}
                      className="w-4 h-4 rounded-full bg-emerald-900/40 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                {selectedLuckyNumbers.length < 3 && (
                  <span className="text-[11px] text-emerald-700 font-medium italic">
                    + Podés sumar {3 - selectedLuckyNumbers.length} más
                  </span>
                )}
              </div>

              {/* Action buttons on the banner */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsGridCollapsed(!isGridCollapsed)}
                  className="text-[11px] font-bold text-emerald-900 hover:text-emerald-950 bg-white/90 hover:bg-white border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer shadow-2xs transition-colors"
                >
                  <span>{isGridCollapsed ? 'Abrir tablero' : 'Ocultar tablero'}</span>
                  {isGridCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-white/90 hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer shadow-2xs transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Quitar filtro</span>
                </button>
              </div>
            </div>

            {/* Match Mode Selector (AND vs OR when >1 number chosen) & Result summary */}
            <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {matchingCardsCount > 0 ? (
                    <>
                      <strong className="text-emerald-950 font-black">{matchingCardsCount}</strong>{' '}
                      {matchingCardsCount === 1 ? 'cartón disponible contiene' : 'cartones disponibles contienen'}{' '}
                      {matchMode === 'all' && selectedLuckyNumbers.length > 1
                        ? `las ${selectedLuckyNumbers.length} bolillas elegidas a la vez`
                        : matchMode === 'any' && selectedLuckyNumbers.length > 1
                        ? 'al menos una de las bolillas elegidas'
                        : `la bolilla #${String(selectedLuckyNumbers[0]).padStart(2, '0')}`}
                    </>
                  ) : (
                    <span className="text-amber-800 font-semibold">
                      Ningún cartón contiene {matchMode === 'all' && selectedLuckyNumbers.length > 1 ? 'las bolillas elegidas al mismo tiempo' : 'esta bolilla'}.
                    </span>
                  )}
                </span>
              </div>

              {/* Mode switch (if 2 or 3 numbers selected) */}
              {selectedLuckyNumbers.length > 1 && onChangeMatchMode && (
                <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                  <span className="text-[11px] text-slate-500 font-medium">Filtrar por:</span>
                  <div className="inline-flex rounded-lg bg-white p-0.5 border border-emerald-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onChangeMatchMode('all')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                        matchMode === 'all'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Mostrar solo cartones que contengan todas las bolillas elegidas"
                    >
                      Todas a la vez ({selectedLuckyNumbers.length}/{selectedLuckyNumbers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => onChangeMatchMode('any')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                        matchMode === 'any'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Mostrar cartones que contengan al menos una de las bolillas"
                    >
                      Cualquiera (≥1)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area: Range Tabs + Compact Grid */}
      {!isGridCollapsed && (
        <div className="p-3 sm:p-4 space-y-3">
          {/* Range tabs */}
          {!searchQuery && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {rangeFilters.map((r) => {
                const isActive = activeRange === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveRange(r.id)}
                    className={`
                      px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer
                      ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                          : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900'
                      }
                    `}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Numbers Grid Container (Bounded height with sleek scrolling) */}
          <div className="max-h-48 sm:max-h-52 overflow-y-auto pr-1">
            {visibleNumbers.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <p>No se encontraron números para "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-1 text-emerald-600 font-bold hover:underline"
                >
                  Restablecer búsqueda
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-10 gap-1.5 sm:gap-2">
                {visibleNumbers.map((num) => {
                  const isSelected = selectedLuckyNumbers.includes(num);
                  const selectedIndex = selectedLuckyNumbers.indexOf(num);
                  const formatted = String(num).padStart(2, '0');
                  const count = numberStats.get(num) || 0;
                  const hasCards = count > 0;
                  const isLimitReached = selectedLuckyNumbers.length >= 3 && !isSelected;

                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={!hasCards}
                      onClick={() => handleNumberClick(num)}
                      title={
                        hasCards
                          ? `Bolilla ${formatted} • Presente en ${count} ${count === 1 ? 'cartón' : 'cartones'}${
                              isSelected ? ' (Seleccionada)' : isLimitReached ? ' (Máximo 3 alcanzado)' : ''
                            }`
                          : `Bolilla ${formatted} • Sin cartones disponibles`
                      }
                      className={`
                        relative h-8.5 sm:h-9 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-all select-none cursor-pointer
                        ${
                          isSelected
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 ring-offset-1 shadow-sm font-black scale-105 z-10'
                            : hasCards
                            ? isLimitReached
                              ? 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 opacity-80'
                              : 'bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs active:scale-95'
                            : 'bg-slate-100/50 text-slate-300 border border-transparent cursor-not-allowed opacity-40'
                        }
                      `}
                    >
                      <span>{formatted}</span>

                      {/* Small badge/dot if it has cards */}
                      {hasCards && !isSelected && (
                        <span className="absolute bottom-0.5 right-1 w-1 h-1 rounded-full bg-emerald-500/70" />
                      )}

                      {/* Order indicator badge for selected balls (#1, #2, #3) */}
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-sans font-black text-[9px] border border-amber-500 flex items-center justify-center shadow-xs">
                          {selectedIndex + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
