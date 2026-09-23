import React, { useState, useMemo } from 'react';
import { useBingo } from '../../context/BingoContext';
import { AvailableBingoItem, FEATURED_BINGOS } from '../../data/featuredBingos';
import { FeaturedBingoCard } from './FeaturedBingoCard';
import { BingoCardItem } from './BingoCardItem';
import { BingoPrizesModal } from './BingoPrizesModal';
import { HowItWorksSection } from './HowItWorksSection';
import { BroadcastChannelsSection } from './BroadcastChannelsSection';
import { PastBingosSection } from './PastBingosSection';
import { PaymentMethodsSection } from './PaymentMethodsSection';
import { FaqSection } from './FaqSection';
import { ShieldCheck, Sparkles, Trophy } from 'lucide-react';

interface HomeViewProps {
  onSelectBingo: (bingo: AvailableBingoItem) => void;
  onOpenSupport?: () => void;
}

function formatDrawDate(dateStr?: string): string {
  if (!dateStr) return 'Próximamente';
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
      ];
      if (months[monthIndex]) {
        return `${day} de ${months[monthIndex]} ${year}`;
      }
    }
  }
  return dateStr;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectBingo, onOpenSupport }) => {
  const { bingos, activeBingoId, prizes } = useBingo();

  // Selected bingo for the prizes modal
  const [modalBingo, setModalBingo] = useState<AvailableBingoItem | null>(null);

  // Map dynamic bingos into AvailableBingoItem list
  const availableBingos: AvailableBingoItem[] = useMemo(() => {
    if (!bingos || bingos.length === 0) {
      return FEATURED_BINGOS;
    }

    return bingos
      .filter((b) => b.status === 'ACTIVE' || b.status === 'SCHEDULED' || b.salesClosed || !b.status)
      .map((b, idx) => {
        // Find main prize from prizes array for this bingo
        const bingoPrizes = prizes.filter((p) => p.bingoId === b.id);
        const topPrize = bingoPrizes.sort((x, y) => (y.amount || 0) - (x.amount || 0))[0];

        const defaultTag = idx === 0 ? 'BINGO OFICIAL' : idx === 1 ? 'EDICIÓN ESPECIAL' : 'GRAN SORTEO';
        const formattedPrice = `$ ${b.price ? b.price.toLocaleString('es-AR') : '2.500'}`.replace(' ', '\u00A0');
        const isClosed = Boolean(b.salesClosed || b.status === 'FINISHED');

        return {
          id: b.id,
          tag: b.ticketEditionTitle || defaultTag,
          tagColor: isClosed ? 'bg-rose-700' : 'bg-emerald-700',
          title: b.name || 'Gran Bingo Oficial',
          date: formatDrawDate(b.drawDate),
          time: b.drawTime ? `${b.drawTime} hs` : '17:00 hs',
          mainPrize: topPrize?.name || b.description || 'Premios millonarios en juego',
          price: b.price || 2500,
          formattedPrice: formattedPrice,
          image: b.imageUrl || '/3B50B378-AFBA-476D-A6F1-A37BCC81D27E.PNG',
          prizesImage: b.prizesImageUrl || '/premios_oficiales_ejemplo.svg',
          slug: b.id,
          badge: isClosed ? 'Venta Cerrada' : b.status === 'ACTIVE' ? 'En Venta' : 'Próximamente',
          salesClosed: isClosed,
          status: b.status,
        };
      });
  }, [bingos, prizes]);

  // Featured Bingo: the one matching activeBingoId or the first one
  const featuredBingo = useMemo(() => {
    if (availableBingos.length === 0) return null;
    const match = availableBingos.find((b) => b.id === activeBingoId);
    return match || availableBingos[0];
  }, [availableBingos, activeBingoId]);

  // Secondary Bingos (remaining active bingos)
  const secondaryBingos = useMemo(() => {
    if (!featuredBingo) return [];
    return availableBingos.filter((b) => b.id !== featuredBingo.id);
  }, [availableBingos, featuredBingo]);

  const handleOpenPrizes = (bingo: AvailableBingoItem) => {
    setModalBingo(bingo);
  };

  const handleClosePrizes = () => {
    setModalBingo(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 antialiased selection:bg-amber-300 selection:text-slate-900">
      
      {/* 1. SECCIÓN PRINCIPAL: BINGOS DISPONIBLES (INMEDIATA, SIN HEADER PUBLICITARIO GENÉRICO) */}
      <section id="seccion-bingos" className="pt-6 pb-12 sm:pt-8 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de Bingos Disponibles simplificado con fondo blanco y contenido perfectamente centralizado */}
        <div className=" p-4 sm:p-5 mb-6 sm:mb-8 transition-all">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            
            {/* Título centralizado con punto pulsante */}
            <div className="flex items-center justify-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                Bingos Disponibles
              </h1>
            </div>

            {/* Bajada / Subtítulo */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md">
              Elegí tu sorteo favorito y comprá tu cartón oficial
            </p>

            {/* Insignia Página Oficial Autorizada centralizada */}
            <div className="pt-0.5 flex items-center justify-center">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Página Oficial Autorizada</span>
              </div>
            </div>

          </div>
        </div>

        {/* FEATURED BINGO CARD (Large 60% flyer / 40% info on desktop, clean vertical stack on mobile) */}
        {featuredBingo && (
          <FeaturedBingoCard
            bingo={featuredBingo}
            onSelectBingo={onSelectBingo}
            onViewPrizes={handleOpenPrizes}
          />
        )}

        {/* OTHER AVAILABLE BINGOS GRID (If there are multiple active bingos) */}
        {secondaryBingos.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Más Sorteos Disponibles
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Otros eventos oficiales activos para adquirir tus cartones con anticipación.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {secondaryBingos.length} sorteo{secondaryBingos.length > 1 ? 's' : ''} más
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {secondaryBingos.map((item) => (
                <BingoCardItem
                  key={item.id}
                  bingo={item}
                  onSelectBingo={onSelectBingo}
                  onViewPrizes={handleOpenPrizes}
                />
              ))}
            </div>
          </div>
        )}

      </section>

      {/* 2. CÓMO FUNCIONA */}
      <HowItWorksSection />

      {/* 3. PREMIOS SECTION ANCHOR (Transparent Prize Showcase) */}
      <section id="seccion-premios" className="py-10 bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/30">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                Premios Oficiales en Juego
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Premios libres de gastos
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                Todos los premios se entregan en regla según el reglamento oficial de cada sorteo.
              </p>
            </div>
          </div>

          {featuredBingo && (
            <button
              type="button"
              onClick={() => handleOpenPrizes(featuredBingo)}
              className="py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
            >
              Ver Premios del Sorteo Principal
            </button>
          )}
        </div>
      </section>

      {/* 4. MEDIOS DE TRANSMISIÓN OFICIALES (Televisado y Transmitido por Radio) */}
      <BroadcastChannelsSection />

      {/* 5. SORTEOS ANTERIORES */}
      <PastBingosSection />

      {/* 5. MEDIOS DE PAGO */}
      <PaymentMethodsSection />

      {/* 6. PREGUNTAS FRECUENTES (FAQ) */}
      <FaqSection onContactSupport={onOpenSupport} />

      {/* INTERACTIVE PRIZES MODAL */}
      {modalBingo && (
        <BingoPrizesModal
          isOpen={Boolean(modalBingo)}
          onClose={handleClosePrizes}
          bingo={modalBingo}
          prizes={prizes}
          onBuyTicket={(b) => {
            handleClosePrizes();
            onSelectBingo(b);
          }}
        />
      )}

    </div>
  );
};
