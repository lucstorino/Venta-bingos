import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { AvailableBingoItem, FEATURED_BINGOS } from '../../data/featuredBingos';

interface BinguitoHeroCarouselProps {
  onBuyBingo: (bingoItem: AvailableBingoItem) => void;
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
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ];
      if (months[monthIndex]) {
        return `${day} de ${months[monthIndex]} ${year}`;
      }
    }
  }
  return dateStr;
}

export const BinguitoHeroCarousel: React.FC<BinguitoHeroCarouselProps> = ({ onBuyBingo }) => {
  const { bingo, prizes } = useBingo();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Derive top prize from prizes array or fallback
  const topPrize = useMemo(() => {
    if (!prizes || prizes.length === 0) return 'Gran Pozo Millonario + Premios en Efectivo';
    const sorted = [...prizes].sort((a, b) => (b.amount || 0) - (a.amount || 0));
    return sorted[0]?.name || prizes[0]?.name;
  }, [prizes]);

  // Dynamic bingos list: Primary active bingo comes directly from Admin/Context
  const bingosList: AvailableBingoItem[] = useMemo(() => {
    const primaryBingo: AvailableBingoItem = {
      id: bingo.id || 'bingo-principal',
      tag: 'BINGO OFICIAL',
      tagColor: 'text-emerald-700',
      title: bingo.name || '15º Bingo Monumental',
      date: formatDrawDate(bingo.drawDate),
      time: bingo.drawTime ? `${bingo.drawTime} hs` : '15:00 hs',
      price: bingo.price || 2500,
      formattedPrice: `$ ${(bingo.price || 2500).toLocaleString('es-AR')}`,
      image: bingo.imageUrl || '/src/assets/images/bingo_casa_card_1789819899795.jpg',
      slug: 'bingo-oficial',
      badge: 'Sorteo Oficial Autorizado',
      mainPrize: topPrize,
    };

    // Other featured bingos (excluding duplicate if id matches)
    const others = FEATURED_BINGOS.filter((item) => item.id !== primaryBingo.id);

    return [primaryBingo, ...others];
  }, [bingo, topPrize]);

  const totalSlides = bingosList.length;

  // Auto-play gently cycles between bingos if more than one exists
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const currentBingo = bingosList[currentSlide] || bingosList[0];

  return (
    <section
      id="hero-bingo-principal"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/60 border-b border-slate-200/80 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* =========================================================================
              ELEMENTO 1 (PRINCIPAL): IMAGEN OFICIAL DEL BINGO (60-70% PROTAGONISMO)
              - Desktop: Ocupa 8 de 12 columnas (~67%)
              - Mobile: Ocupa prácticamente todo el ancho disponible
              - width: 100%, height: auto, object-fit: contain
              - Sin recortes, sin zoom, sin tarjetas ni textos superpuestos
              - Card muy sutil con bordes redondeados y sombra suave
             ========================================================================= */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center">
            <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md shadow-slate-200/60 p-2 sm:p-4 flex items-center justify-center transition-all duration-300">
              <img
                src={currentBingo.image}
                alt={currentBingo.title}
                className="w-full h-auto max-h-[620px] object-contain rounded-xl select-none"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Selector interactivo de puntos e indicadores (si hay varios bingos) */}
            {totalSlides > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  aria-label="Bingo anterior"
                  title="Bingo anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-1.5 px-2">
                  {bingosList.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`transition-all rounded-full cursor-pointer ${
                        idx === currentSlide
                          ? 'w-6 h-2 bg-emerald-600 shadow-xs'
                          : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Ver ${item.title}`}
                      title={item.title}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  aria-label="Siguiente bingo"
                  title="Siguiente bingo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <span className="text-[11px] font-mono font-bold text-slate-500 pl-1">
                  {currentSlide + 1} / {totalSlides}
                </span>
              </div>
            )}
          </div>

          {/* =========================================================================
              ELEMENTO 2: SECCIÓN LIMPIA CON INFORMACIÓN BÁSICA + PRECIO + COMPRA
              - Desktop: Ocupa 4 de 12 columnas (~33%)
              - Mobile: Aparece inmediatamente debajo de la imagen
              - Nombre del bingo
              - Fecha del sorteo y Horario
              - Premio principal si corresponde
              - Precio del cartón
              - Botón grande COMPRAR CARTÓN
              - Compra segura • Cartón digital • Entrega inmediata
             ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col justify-center space-y-4 sm:space-y-5">
            {/* Estado / Badge Oficial */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sorteo Oficial</span>
              </span>

              {totalSlides > 1 && (
                <span className="text-xs font-bold text-slate-500">
                  Bingo {currentSlide + 1} de {totalSlides}
                </span>
              )}
            </div>

            {/* Nombre del Bingo */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {currentBingo.title}
              </h1>
            </div>

            {/* Información esencial limpia: Fecha, Horario, Premio principal */}
            <div className="space-y-2.5 text-sm text-slate-700 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-600 font-medium">
                  Fecha:{' '}
                  <strong className="text-slate-900 font-bold">{currentBingo.date}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-600 font-medium">
                  Horario:{' '}
                  <strong className="text-slate-900 font-bold">
                    {currentBingo.time || '15:00 hs'}
                  </strong>
                </span>
              </div>

              {currentBingo.mainPrize && (
                <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-100">
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 font-medium leading-tight">
                    Premio principal:{' '}
                    <strong className="text-slate-900 font-bold block sm:inline">
                      {currentBingo.mainPrize}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* Precio del cartón */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
                Precio del cartón
              </span>
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono tracking-tight">
                {currentBingo.formattedPrice}
              </span>
            </div>

            {/* BOTÓN PRINCIPAL GRANDE: COMPRAR CARTÓN */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                id="btn-comprar-carton-hero"
                onClick={() => onBuyBingo(currentBingo)}
                className="w-full inline-flex items-center justify-center space-x-3 px-8 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-lg sm:text-xl font-black uppercase tracking-wider shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ring-4 ring-amber-400/20 cursor-pointer"
              >
                <Ticket className="w-6 h-6 text-slate-950 shrink-0" />
                <span>COMPRAR CARTÓN</span>
                <ArrowRight className="w-5 h-5 text-slate-950 shrink-0" />
              </button>

              {/* Información secundaria de seguridad y entrega */}
              <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium pt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Compra segura • Cartón digital • Entrega inmediata</span>
              </div>
            </div>

            {/* Selector rápido adicional para avanzar al siguiente bingo */}
            {totalSlides > 1 && (
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
                <span className="text-slate-500">¿Querés ver otro sorteo?</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer hover:underline"
                >
                  <span>Siguiente bingo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};
