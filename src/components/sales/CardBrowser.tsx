import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Sparkles,
  Search,
  Dice5,
  LayoutGrid,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Lock,
  Clock,
} from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { BingoCard } from '../../types';
import { OfficialBingoTicket } from './OfficialBingoTicket';

interface CardBrowserProps {
  onSelectCardToBuy: (card: BingoCard) => void;
}

export const CardBrowser: React.FC<CardBrowserProps> = ({ onSelectCardToBuy }) => {
  const { cards, bingo, activeReservation } = useBingo();

  // Navigation state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [showOfficialTicket, setShowOfficialTicket] = useState<boolean>(true);
  const [searchNumber, setSearchNumber] = useState<string>('');
  const [filterLuckyNumber, setFilterLuckyNumber] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'AVAILABLE' | 'SOLD'>('AVAILABLE');

  // Filtered cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      // Filter status
      if (filterStatus === 'AVAILABLE' && c.status !== 'AVAILABLE') return false;
      if (filterStatus === 'SOLD' && c.status !== 'SOLD') return false;

      // Filter by lucky number (one of the 10 numbers)
      if (filterLuckyNumber) {
        const num = parseInt(filterLuckyNumber, 10);
        if (!isNaN(num) && !c.numbers.includes(num)) return false;
      }

      // Filter by card number
      if (searchNumber) {
        if (!c.cardNumber.toString().includes(searchNumber.trim())) return false;
      }

      return true;
    });
  }, [cards, filterStatus, filterLuckyNumber, searchNumber]);

  // Ensure currentIndex is in bounds
  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, filteredCards.length - 1));
  const currentCard: BingoCard | undefined = filteredCards[safeIndex];

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1); // wrap around
    }
  };

  const handleNext = () => {
    if (safeIndex < filteredCards.length - 1) {
      setCurrentIndex(safeIndex + 1);
    } else {
      setCurrentIndex(0); // wrap around
    }
  };

  const handlePickRandom = () => {
    const available = filteredCards.filter((c) => c.status === 'AVAILABLE');
    if (available.length === 0) return;
    const randomIndex = Math.floor(Math.random() * available.length);
    const chosen = available[randomIndex];
    const newIdx = filteredCards.findIndex((c) => c.id === chosen.id);
    if (newIdx !== -1) {
      setCurrentIndex(newIdx);
      setViewMode('carousel');
    }
  };

  const handleSelectFromGrid = (card: BingoCard) => {
    const idx = filteredCards.findIndex((c) => c.id === card.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
    setViewMode('carousel');
  };

  return (
    <section id="catalogo-cartones" className="py-12 bg-slate-950 text-slate-100 min-h-[600px]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Selección de Cartón Oficial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Elige tu Cartón Físico Digitalizado
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Recorre secuencialmente los cartones o busca tus números de la suerte. Cada cartón es único e intransferible.
          </p>
        </div>

        {/* Filters and Controls Toolbar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search by Card Number */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchNumber}
                onChange={(e) => {
                  setSearchNumber(e.target.value);
                  setCurrentIndex(0);
                }}
                placeholder="N° de cartón (ej. 146001)"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Filter by Lucky Number */}
            <div>
              <input
                type="number"
                min="1"
                max="99"
                value={filterLuckyNumber}
                onChange={(e) => {
                  setFilterLuckyNumber(e.target.value);
                  setCurrentIndex(0);
                }}
                placeholder="Número favorito (ej. 48)"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any);
                  setCurrentIndex(0);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="AVAILABLE">Solo Disponibles</option>
                <option value="ALL">Todos los Cartones</option>
                <option value="SOLD">Ya Vendidos</option>
              </select>
            </div>

            {/* Action buttons (Random + View Mode) */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePickRandom}
                title="Elegir un cartón disponible al azar"
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Dice5 className="w-4 h-4" />
                <span>Al Azar</span>
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'carousel' ? 'grid' : 'carousel')}
                className={`p-2 rounded-xl text-xs border transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title={viewMode === 'carousel' ? 'Ver cuadrícula' : 'Ver secuencial'}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter summary */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Mostrando <strong>{filteredCards.length}</strong> de <strong>{cards.length}</strong> cartones
            </span>
            {(searchNumber || filterLuckyNumber || filterStatus !== 'AVAILABLE') && (
              <button
                onClick={() => {
                  setSearchNumber('');
                  setFilterLuckyNumber('');
                  setFilterStatus('AVAILABLE');
                  setCurrentIndex(0);
                }}
                className="text-amber-400 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* View Mode: Carousel (Sequential as per Section 3.3) */}
        {viewMode === 'carousel' && (
          <div className="space-y-6">
            {filteredCards.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">No se encontraron cartones con esos filtros</h3>
                <p className="text-xs text-slate-400">Prueba cambiando el número de búsqueda o limpia los filtros.</p>
                <button
                  onClick={() => {
                    setSearchNumber('');
                    setFilterLuckyNumber('');
                    setFilterStatus('AVAILABLE');
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-amber-500 text-slate-950 rounded-xl"
                >
                  Ver todos los disponibles
                </button>
              </div>
            ) : currentCard ? (
              <div className="space-y-6">
                {/* Carousel Navigator Controls [ ← ANTERIOR ] CARTÓN 146001 [ SIGUIENTE → ] */}
                <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
                  <button
                    onClick={handlePrev}
                    className="flex items-center space-x-1 px-4 sm:px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold border border-slate-700 transition-all active:scale-95 shadow-md"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">ANTERIOR</span>
                  </button>

                  <div className="text-center px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                      Cartón Seleccionado
                    </span>
                    <span className="text-lg sm:text-2xl font-black text-amber-400 font-mono tracking-wider">
                      N° {currentCard.cardNumber}
                    </span>
                  </div>

                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1 px-4 sm:px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold border border-slate-700 transition-all active:scale-95 shadow-md"
                  >
                    <span className="hidden sm:inline">SIGUIENTE</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="text-center text-xs text-slate-400 font-mono">
                  Cartón {safeIndex + 1} de {filteredCards.length}
                </div>

                {/* View Format Selector: Official Ticket vs Matrix */}
                <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setShowOfficialTicket(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      showOfficialTicket
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎟️ Cartón Oficial (15º Bingo Monumental)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOfficialTicket(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !showOfficialTicket
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🔢 Vista Matriz Rápida
                  </button>
                </div>

                {/* Card Representation */}
                {showOfficialTicket ? (
                  /* Official Authentic Physical Ticket */
                  <div className="max-w-3xl mx-auto">
                    <OfficialBingoTicket
                      card={currentCard}
                      bingo={bingo}
                      showUploader={false}
                      allowInteractivePlay={false}
                    />
                  </div>
                ) : (
                  /* Compact Matrix Card Representation */
                  <div className="max-w-xl mx-auto">
                    <div
                      className={`relative rounded-2xl overflow-hidden border-2 shadow-2xl transition-all ${
                        currentCard.status === 'AVAILABLE'
                          ? 'bg-gradient-to-b from-amber-50 to-orange-100/90 border-amber-400 text-slate-900 shadow-amber-500/10'
                          : currentCard.status === 'RESERVED'
                          ? 'bg-gradient-to-b from-amber-100 to-amber-200 border-amber-500 text-slate-900 opacity-90'
                          : 'bg-gradient-to-b from-slate-200 to-slate-300 border-slate-400 text-slate-700 opacity-75'
                      }`}
                    >
                      {/* Perforated ticket edge circles */}
                      <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950 border border-slate-800" />
                      <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950 border border-slate-800" />

                      {/* Card Header */}
                      <div className="p-4 sm:p-5 border-b border-dashed border-slate-400/80 bg-white/40 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">
                            {bingo.name}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-mono">
                            CARTÓN OFICIAL #{currentCard.cardNumber}
                          </h3>
                        </div>

                        {/* Status Stamp */}
                        <div>
                          {currentCard.status === 'AVAILABLE' && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-600 text-white shadow">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Disponible</span>
                            </span>
                          )}
                          {currentCard.status === 'RESERVED' && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-600 text-white shadow animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Reservado</span>
                            </span>
                          )}
                          {currentCard.status === 'SOLD' && (
                            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-rose-600 text-white shadow">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Vendido</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Numbers Matrix (Exactly 2 rows of 5 numbers) */}
                      <div className="p-5 sm:p-6 space-y-3">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 text-center">
                          Números de Juego Asociados al Cartón Físico
                        </div>

                        {/* Row 1: First 5 numbers */}
                        <div className="grid grid-cols-5 gap-2 sm:gap-3">
                          {currentCard.numbers.slice(0, 5).map((num, i) => (
                            <div
                              key={i}
                              className="h-14 sm:h-16 rounded-xl bg-white shadow-md border-2 border-slate-300 flex items-center justify-center font-black text-xl sm:text-2xl text-slate-900 font-mono transform hover:scale-105 transition-transform"
                            >
                              {num}
                            </div>
                          ))}
                        </div>

                        {/* Row 2: Second 5 numbers */}
                        <div className="grid grid-cols-5 gap-2 sm:gap-3">
                          {currentCard.numbers.slice(5, 10).map((num, i) => (
                            <div
                              key={i + 5}
                              className="h-14 sm:h-16 rounded-xl bg-white shadow-md border-2 border-slate-300 flex items-center justify-center font-black text-xl sm:text-2xl text-slate-900 font-mono transform hover:scale-105 transition-transform"
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 py-3 bg-slate-900/10 border-t border-dashed border-slate-400/80 flex items-center justify-between text-xs text-slate-600 font-mono">
                        <span>Sorteo: {bingo.drawDate} {bingo.drawTime} hs</span>
                        <span className="font-bold">Valor: ${bingo.price.toLocaleString('es-AR')} {bingo.currency}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Action Button [ COMPRAR ] */}
                <div className="max-w-md mx-auto pt-2">
                  {currentCard.status === 'AVAILABLE' ? (
                    <button
                      onClick={() => onSelectCardToBuy(currentCard)}
                      className="w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>COMPRAR CARTÓN #{currentCard.cardNumber}</span>
                      <span className="ml-2 text-sm bg-slate-950/15 px-2 py-0.5 rounded-lg">
                        ${bingo.price.toLocaleString('es-AR')}
                      </span>
                    </button>
                  ) : currentCard.status === 'RESERVED' ? (
                    <div className="p-4 rounded-xl bg-amber-900/40 border border-amber-600/50 text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-amber-400 font-bold text-sm">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Cartón Reservado Temporalmente</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Otro comprador está completando el pago en Mercado Pago. Si no completa la compra en los 10 minutos, volverá a estar disponible.
                      </p>
                      <button
                        onClick={handleNext}
                        className="text-xs text-amber-400 font-semibold underline hover:text-amber-300"
                      >
                        Ver siguiente cartón disponible →
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-rose-400 font-bold text-sm">
                        <Lock className="w-4 h-4" />
                        <span>Cartón #{currentCard.cardNumber} ya fue Vendido</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Este cartón ya fue adquirido y registrado oficialmente con su código de validación.
                      </p>
                      <button
                        onClick={handleNext}
                        className="text-xs text-amber-400 font-semibold underline hover:text-amber-300"
                      >
                        Ver siguiente cartón disponible →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* View Mode: Grid (Fast selection) */}
        {viewMode === 'grid' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredCards.map((card) => {
                const isSelected = currentCard?.id === card.id;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleSelectFromGrid(card)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all text-left relative overflow-hidden ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400'
                        : card.status === 'AVAILABLE'
                        ? 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-850'
                        : card.status === 'RESERVED'
                        ? 'border-amber-900/50 bg-amber-950/20 opacity-80'
                        : 'border-slate-800/50 bg-slate-950 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-white">#{card.cardNumber}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          card.status === 'AVAILABLE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : card.status === 'RESERVED'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {card.status === 'AVAILABLE' ? 'Libre' : card.status === 'RESERVED' ? 'Res.' : 'Vendido'}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 my-1">
                      {card.numbers.map((n, i) => (
                        <div
                          key={i}
                          className="h-5 rounded bg-slate-800 text-[10px] font-mono font-bold flex items-center justify-center text-slate-200"
                        >
                          {n}
                        </div>
                      ))}
                    </div>

                    {card.status === 'AVAILABLE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCardToBuy(card);
                        }}
                        className="w-full mt-2 py-1 text-[11px] font-bold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300 transition-colors"
                      >
                        Comprar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
