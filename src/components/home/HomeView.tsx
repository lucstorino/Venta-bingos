import React, { useState, useMemo } from 'react';
import { useBingo } from '../../context/BingoContext';
import { AvailableBingoItem, FEATURED_BINGOS } from '../../data/featuredBingos';
import { FeaturedBingoCard } from './FeaturedBingoCard';
import { BingoCardItem } from './BingoCardItem';
import { BingoPrizesModal } from './BingoPrizesModal';
import { HowItWorksSection } from './HowItWorksSection';
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
      .filter((b) => b.status === 'ACTIVE' || b.status === 'SCHEDULED' || !b.status)
      .map((b, idx) => {
        // Find main prize from prizes array for this bingo
        const bingoPrizes = prizes.filter((p) => p.bingoId === b.id);
        const topPrize = bingoPrizes.sort((x, y) => (y.amount || 0) - (x.amount || 0))[0];

        const defaultTag = idx === 0 ? 'BINGO OFICIAL' : idx === 1 ? 'EDICIÓN ESPECIAL' : 'GRAN SORTEO';
        const formattedPrice = `$ ${b.price ? b.price.toLocaleString('es-AR') : '2.500'}`;

        return {
          id: b.id,
          tag: b.ticketEditionTitle || defaultTag,
          tagColor: 'bg-emerald-700',
          title: b.name || 'Gran Bingo Oficial',
          date: formatDrawDate(b.drawDate),
          time: b.drawTime ? `${b.drawTime} hs` : '17:00 hs',
          mainPrize: topPrize?.name || b.description || 'Premios millonarios en juego',
          price: b.price || 2500,
          formattedPrice: formattedPrice,
          image: b.imageUrl || '/3B50B378-AFBA-476D-A6F1-A37BCC81D27E.PNG',
          slug: b.id,
          badge: b.status === 'ACTIVE' ? 'En Venta' : 'Próximamente',
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
        
        {/* Top Direct Brand Bar with Mascot 8 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-slate-200/80">
          <div className="flex items-center space-x-3">
            <img
              src="/D3D6D92C-3883-4894-A39F-3EC814A809D4.PNG"
              alt="TuBINGO Bolilla 8"
              className="w-10 h-10 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                Bingos Disponibles
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Elegí tu sorteo favorito, comprá tu cartón oficial y participá en vivo.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Transmisión Oficial y Escribanía Matriculada</span>
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
                Pozo Acumulado y Vehículos 0km
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Premios certificados libres de gastos
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                Los vehículos se entregan patentados y el dinero en efectivo se acredita directamente por transferencia.
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

      {/* 4. SORTEOS ANTERIORES */}
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
