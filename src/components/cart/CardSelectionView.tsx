import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Dices,
  ShoppingCart,
  CheckCircle,
  Shuffle,
  Trophy,
  Gift,
  Car,
  Home,
  Plane,
  Camera,
  RotateCcw,
  ShieldCheck,
  Calendar,
  Clock,
  Coins,
  Plus,
  Trash2,
  Layers,
  Search,
  Ban,
  Maximize2,
  Eye,
  Loader2,
  X,
  Upload,
} from 'lucide-react';
import { BingoCard } from '../../types';
import { BingoCard as BingoCardComponent } from '../sales/BingoCard';
import { AvailableBingoItem } from '../../data/featuredBingos';
import { LuckyNumberSelector, LuckyMatchMode } from './LuckyNumberSelector';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useBingo } from '../../context/BingoContext';
import { uploadBingoImage } from '../../services/firebaseBingoStorageService';
import { LuckyFloatMessage } from '../common/LuckyFloatMessage';

interface CardSelectionViewProps {
  bingo: AvailableBingoItem;
  cards: BingoCard[];
  onBack: () => void;
  onAddToCart: (cards: BingoCard | BingoCard[]) => void;
}

export const CardSelectionView: React.FC<CardSelectionViewProps> = ({
  bingo,
  cards,
  onBack,
  onAddToCart,
}) => {
  // STRICT REQUIREMENT 1: Only available cards! Never show sold or reserved cards.
  const availableCards = useMemo(() => {
    return cards.filter((card) => card.status === 'AVAILABLE');
  }, [cards]);

  // Selected lucky numbers (up to 3 balls, from 01 to 90)
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);
  const [luckyMatchMode, setLuckyMatchMode] = useState<LuckyMatchMode>('all');

  // Multi-card selection state: user can select multiple cards!
  const [selectedCards, setSelectedCards] = useState<BingoCard[]>([]);

  // Random selection animation state
  const [isRollingRandom, setIsRollingRandom] = useState(false);

  // Search filter by card number
  const [searchCardNumber, setSearchCardNumber] = useState('');

  // Browse all cards toggle
  const [showAllCards, setShowAllCards] = useState(false);
  const [showOfficialPreview, setShowOfficialPreview] = useState(false);

  // Authentication & Dynamic Bingo context
  const { isAuthenticated } = useAdminAuth();
  const { bingos, updateBingo } = useBingo();
  const currentBingoData = useMemo(() => {
    return bingos.find((b) => b.id === bingo.id);
  }, [bingos, bingo.id]);

  // Custom Portada & Premios state
  const [customPortada, setCustomPortada] = useState<string | null>(null);
  const [customPremiosImage, setCustomPremiosImage] = useState<string | null>(null);
  const [isUploadingPortada, setIsUploadingPortada] = useState(false);
  const [isUploadingPremios, setIsUploadingPremios] = useState(false);
  const [showPrizeZoomModal, setShowPrizeZoomModal] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Load custom portada and prizes from localStorage / context
  useEffect(() => {
    try {
      const savedPortada = localStorage.getItem(`bingo_portada_${bingo.id}`);
      if (savedPortada) {
        setCustomPortada(savedPortada);
      } else {
        setCustomPortada(null);
      }

      const savedPremios = localStorage.getItem(`tubingo_prizes_img_${bingo.id}`);
      if (savedPremios) {
        setCustomPremiosImage(savedPremios);
      } else if (currentBingoData?.prizesImageUrl) {
        setCustomPremiosImage(currentBingoData.prizesImageUrl);
      } else {
        setCustomPremiosImage(null);
      }
    } catch {
      // ignore
    }
  }, [bingo.id, currentBingoData?.prizesImageUrl]);

  const handleUploadPortada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPortada(true);
    try {
      const { url } = await uploadBingoImage(bingo.id, 'cover', file);
      setCustomPortada(url);
      if (currentBingoData) {
        updateBingo({
          ...currentBingoData,
          imageUrl: url,
        });
      }
      try {
        localStorage.setItem(`bingo_portada_${bingo.id}`, url);
      } catch {}
      setFeedbackNotice('¡Portada oficial guardada exitosamente!');
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch {
      // Local preview fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setCustomPortada(dataUrl);
          try {
            localStorage.setItem(`bingo_portada_${bingo.id}`, dataUrl);
          } catch {}
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPortada(false);
      e.target.value = '';
    }
  };

  const handleUploadPremiosImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPremios(true);
    try {
      const { url } = await uploadBingoImage(bingo.id, 'prizes', file);
      setCustomPremiosImage(url);
      if (currentBingoData) {
        updateBingo({
          ...currentBingoData,
          prizesImageUrl: url,
        });
      }
      try {
        localStorage.setItem(`tubingo_prizes_img_${bingo.id}`, url);
      } catch {}
      setFeedbackNotice('¡Foto de premios oficial guardada exitosamente!');
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch {
      // Local preview fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setCustomPremiosImage(dataUrl);
          try {
            localStorage.setItem(`tubingo_prizes_img_${bingo.id}`, dataUrl);
          } catch {}
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPremios(false);
      e.target.value = '';
    }
  };

  const handleResetPortada = () => {
    setCustomPortada(null);
    try {
      localStorage.removeItem(`bingo_portada_${bingo.id}`);
    } catch {
      // ignore
    }
  };

  // Active cover image (Custom > Context > Initial)
  const activePortadaImage =
    customPortada ||
    currentBingoData?.imageUrl ||
    bingo.image;

  // Active prizes photo (Custom > Context > Initial > SVG Example)
  const activePremiosImage =
    customPremiosImage ||
    currentBingoData?.prizesImageUrl ||
    bingo.prizesImage ||
    '/premios_oficiales_ejemplo.svg';

  // Contextual prize list based on selected bingo
  const prizesList = useMemo(() => {
    const titleLower = (bingo.title + ' ' + (bingo.tag || '')).toLowerCase();

    if (titleLower.includes('casa')) {
      return [
        {
          category: '1º Premio - BINGO',
          badge: 'ADJUDICACIÓN DIRECTA',
          prizeName: 'Casa a Estrenar Llave en Mano',
          detail: 'Vivienda equipada, con terreno propio y escrituración 100% bonificada.',
          icon: <Home className="w-5 h-5 text-emerald-600" />,
          bgClass: 'bg-emerald-50 text-emerald-700',
        },
        {
          category: '2º Premio - LÍNEA',
          badge: '$ 1.200.000',
          prizeName: 'Efectivo Directo a tu Cuenta',
          detail: 'Acreditación instantánea por transferencia bancaria o Mercado Pago.',
          icon: <Coins className="w-5 h-5 text-blue-600" />,
          bgClass: 'bg-blue-50 text-blue-700',
        },
        {
          category: 'Premios Especiales',
          badge: 'SORTEOS EXTRAS',
          prizeName: 'Set Completo de Amoblamiento',
          detail: 'Electrodomésticos y amoblamiento para el hogar por número de cartón.',
          icon: <Gift className="w-5 h-5 text-amber-600" />,
          bgClass: 'bg-amber-50 text-amber-700',
        },
      ];
    } else if (titleLower.includes('viaje') || titleLower.includes('punta cana')) {
      return [
        {
          category: '1º Premio - BINGO',
          badge: '$2.500.000 + VIAJE',
          prizeName: 'Viaje Todo Incluido a Punta Cana para 2 + Efectivo',
          detail: '7 noches resort all-inclusive con aéreos y traslados incluidos.',
          icon: <Plane className="w-5 h-5 text-purple-600" />,
          bgClass: 'bg-purple-50 text-purple-700',
        },
        {
          category: '2º Premio - LÍNEA',
          badge: '$ 600.000',
          prizeName: 'Efectivo Inmediato',
          detail: 'Acreditación directa al ganador del cartón.',
          icon: <Coins className="w-5 h-5 text-blue-600" />,
          bgClass: 'bg-blue-50 text-blue-700',
        },
        {
          category: 'Premios Especiales',
          badge: 'SMART TV 55"',
          prizeName: 'Smart TV 55" 4K UHD',
          detail: 'Sorteo especial por aproximación y número de cartón.',
          icon: <Gift className="w-5 h-5 text-amber-600" />,
          bgClass: 'bg-amber-50 text-amber-700',
        },
      ];
    }

    // Default: Auto 0KM / Gran Sorteo
    return [
      {
        category: '1º Premio - BINGO',
        badge: 'AUTO 0 KM',
        prizeName: 'Automóvil 0 KM Patentado o $15.000.000',
        detail: 'Cero kilómetro listo para rodar, con flete y patentamiento incluido.',
        icon: <Car className="w-5 h-5 text-blue-600" />,
        bgClass: 'bg-blue-50 text-blue-700',
      },
      {
        category: '2º Premio - LÍNEA',
        badge: '$ 800.000',
        prizeName: 'Premio en Efectivo a la Línea',
        detail: 'Cobro inmediato verificado con escribano público.',
        icon: <Coins className="w-5 h-5 text-emerald-600" />,
        bgClass: 'bg-emerald-50 text-emerald-700',
      },
      {
        category: 'Premios Especiales',
        badge: 'MOTO 110cc',
        prizeName: 'Motocicleta 110cc 0km',
        detail: 'Sorteo por número de cartón entre todos los participantes.',
        icon: <Gift className="w-5 h-5 text-amber-600" />,
        bgClass: 'bg-amber-50 text-amber-700',
      },
    ];
  }, [bingo.title, bingo.tag]);

  // Filter available cards that contain the chosen lucky numbers (up to 3)
  const matchingCards = useMemo(() => {
    if (luckyNumbers.length === 0) return [];
    return availableCards.filter((card) => {
      if (luckyMatchMode === 'all') {
        return luckyNumbers.every((n) => card.numbers.includes(n));
      } else {
        return luckyNumbers.some((n) => card.numbers.includes(n));
      }
    });
  }, [availableCards, luckyNumbers, luckyMatchMode]);

  // Toggle card in or out of selectedCards
  const toggleCardSelection = (card: BingoCard) => {
    setSelectedCards((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      if (exists) {
        return prev.filter((c) => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  // Add multiple random cards
  const handleAddRandomCards = (count: number) => {
    if (availableCards.length === 0) return;
    setIsRollingRandom(true);

    setTimeout(() => {
      // Find cards not already selected
      const selectedIds = new Set(selectedCards.map((c) => c.id));
      const unselected = availableCards.filter((c) => !selectedIds.has(c.id));

      if (unselected.length === 0) {
        setIsRollingRandom(false);
        return;
      }

      // Shuffle and pick
      const shuffled = [...unselected].sort(() => Math.random() - 0.5);
      const toAdd = shuffled.slice(0, count);

      setSelectedCards((prev) => [...prev, ...toAdd]);
      setIsRollingRandom(false);
    }, 250);
  };

  // Select all cards currently matching lucky number
  const handleSelectAllMatching = () => {
    if (matchingCards.length === 0) return;
    const selectedIds = new Set(selectedCards.map((c) => c.id));
    const newCards = matchingCards.filter((c) => !selectedIds.has(c.id));
    setSelectedCards((prev) => [...prev, ...newCards]);
  };

  const handleToggleLuckyNumber = (num: number) => {
    setLuckyNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, num];
    });
  };

  const handleSelectMultipleLuckyNumbers = (nums: number[]) => {
    setLuckyNumbers(nums.slice(0, 3));
  };

  const handleClearLuckyNumbers = () => {
    setLuckyNumbers([]);
  };

  const formatCardNum = (num: number) => {
    const lastThree = num % 1000;
    return String(lastThree === 0 ? num : lastThree).padStart(3, '0');
  };

  // Filter cards by search term
  const searchedCards = useMemo(() => {
    if (!searchCardNumber.trim()) return availableCards;
    return availableCards.filter((c) =>
      String(c.cardNumber).includes(searchCardNumber.trim())
    );
  }, [availableCards, searchCardNumber]);

  const totalSelectedPrice = selectedCards.length * bingo.price;

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 pb-28 relative">
      {/* Floating Lucky Welcome Message */}
      <LuckyFloatMessage />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Button matching mockup 3 */}
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a bingos disponibles</span>
        </button>

        {/* Main Box matching mockup 3 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-1.5 text-left border-b border-slate-100 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">
                Paso 1: Elección de Cartones
              </span>
              <span className="text-xs font-bold text-slate-500">
                {availableCards.length} cartones oficiales disponibles
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Elegí tus cartones de la suerte
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Podés elegir por tu número favorito, seleccionar al azar o elegir múltiples cartones para tener más chances de ganar el pozo mayor.
            </p>
          </div>

          {/* Banner si la venta está cerrada */}
          {bingo.salesClosed && (
            <div className="p-4 sm:p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center space-x-3 text-rose-900 shadow-xs">
              <div className="p-2.5 rounded-xl bg-rose-200/80 text-rose-700 shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black uppercase tracking-wide text-rose-900">
                  Venta Cerrada Oficialmente
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  La venta de cartones para este sorteo finalizó. Todos los cartones que no fueron vendidos fueron dados de baja oficialmente y no participan del sorteo.
                </p>
              </div>
            </div>
          )}

          {/* PORTADA OFICIAL DE PREMIOS & DETALLES */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 group">
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px]">
              {/* Cover Image Column */}
              <div className="md:col-span-6 relative h-64 md:h-auto overflow-hidden bg-slate-950">
                <img
                  src={activePortadaImage}
                  alt={bingo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />

                {/* Badge on cover */}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-400/60 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center space-x-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Portada Oficial de Premios</span>
                  </span>
                  {customPortada && (
                    <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                      Personalizada
                    </span>
                  )}
                </div>

                {/* Bottom title & admin-only upload toolbar */}
                <div className="absolute bottom-3 left-3 right-3 space-y-2">
                  <div className="text-white text-left px-1">
                    <span className="text-[11px] font-mono uppercase text-amber-300 font-bold block">
                      {bingo.date}
                    </span>
                    <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                      {bingo.title}
                    </h3>
                  </div>

                  {/* ONLY show upload button if admin is logged in (isAuthenticated) */}
                  {isAuthenticated && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-xs font-bold shadow-md cursor-pointer border border-slate-200 transition-all active:scale-95">
                        {isUploadingPortada ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        ) : (
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>
                          {isUploadingPortada
                            ? 'Guardando...'
                            : customPortada
                            ? 'Cambiar portada (Admin)'
                            : 'Cargar portada (Admin)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingPortada}
                          className="hidden"
                          onChange={handleUploadPortada}
                        />
                      </label>

                      {customPortada && (
                        <button
                          type="button"
                          onClick={handleResetPortada}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-medium shadow-md transition-all cursor-pointer"
                          title="Restablecer portada original"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-400" />
                          <span>Restablecer</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Prize Photo & Details Column */}
              <div className="md:col-span-6 p-4 sm:p-5 flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative">
                <div className="space-y-3">
                  {/* Top Header of Prizes section */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-xs">
                        <Trophy className="w-3.5 h-3.5 text-slate-950" />
                        <span>Premios en Juego</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {activePremiosImage && (
                        <button
                          type="button"
                          onClick={() => setShowPrizeZoomModal(true)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer border border-white/15"
                          title="Ampliar afiche de premios a pantalla completa"
                        >
                          <Maximize2 className="w-3 h-3 text-amber-300" />
                          <span className="hidden sm:inline">Ampliar</span>
                        </button>
                      )}

                      {/* ONLY FOR ADMIN: Upload prizes photo */}
                      {isAuthenticated && (
                        <label className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs">
                          {isUploadingPremios ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Camera className="w-3.5 h-3.5 text-amber-300" />
                          )}
                          <span>
                            {isUploadingPremios
                              ? 'Guardando...'
                              : activePremiosImage
                              ? 'Cambiar foto premios'
                              : 'Cargar foto premios'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingPremios}
                            className="hidden"
                            onChange={handleUploadPremiosImage}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {feedbackNotice && (
                    <div className="p-2 rounded-lg bg-emerald-600/90 text-white text-xs font-bold text-center animate-fadeIn">
                      {feedbackNotice}
                    </div>
                  )}

                  {/* Superimposed Photo of Prizes (Sobre puesta sobre la portada de premios) */}
                  <div
                    className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-900 shadow-md group/photo min-h-[220px] sm:min-h-[250px] flex items-center justify-center cursor-pointer"
                    onClick={() => setShowPrizeZoomModal(true)}
                  >
                    {activePremiosImage ? (
                      <>
                        <img
                          src={activePremiosImage}
                          alt={`Afiche de Premios - ${bingo.title}`}
                          className="w-full max-h-[270px] sm:max-h-[300px] object-contain transition-transform duration-500 group-hover/photo:scale-[1.02]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-end justify-center pb-3">
                          <span className="bg-slate-900/90 text-amber-300 px-3 py-1 rounded-full text-xs font-black shadow-lg border border-amber-400/40 flex items-center space-x-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Hacé clic para ver afiche completo en HD</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 text-center text-slate-400 space-y-2">
                        <Trophy className="w-10 h-10 text-amber-400/60 mx-auto" />
                        <p className="text-xs font-semibold">
                          Afiche oficial de premios pendiente de carga
                        </p>
                        {isAuthenticated && (
                          <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir foto de premios (Admin)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleUploadPremiosImage}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer of Prizes Card */}
                <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">Sorteo oficial con escribano</span>
                  </div>
                  <span className="font-black text-amber-300 text-sm">
                    {bingo.formattedPrice} c/u
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Banner: Multi-Card & Random Picker */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-4 sm:p-5 rounded-2xl shadow-md text-slate-950 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-sm flex items-center justify-center shrink-0">
                <Dices className={`w-7 h-7 text-amber-600 ${isRollingRandom ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg leading-tight">
                  Selección rápida y múltiple
                </h3>
                <p className="text-xs text-amber-950 font-medium">
                  Elegí varios cartones al azar o seleccioná individualmente los que más te gusten.
                </p>
              </div>
            </div>

            {/* Quick multi-add buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center">
              <button
                type="button"
                onClick={() => handleAddRandomCards(1)}
                disabled={isRollingRandom || availableCards.length === 0}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>+1 al azar</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddRandomCards(3)}
                disabled={isRollingRandom || availableCards.length < 3}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>+3 al azar</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddRandomCards(5)}
                disabled={isRollingRandom || availableCards.length < 5}
                className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-850 active:scale-95 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>+5 al azar</span>
              </button>
            </div>
          </div>

          {/* SECTION: Lucky Number Picker */}
          <LuckyNumberSelector
            availableCards={availableCards}
            selectedLuckyNumbers={luckyNumbers}
            onToggleNumber={handleToggleLuckyNumber}
            onSelectMultipleNumbers={handleSelectMultipleLuckyNumbers}
            onClearSelection={handleClearLuckyNumbers}
            matchMode={luckyMatchMode}
            onChangeMatchMode={setLuckyMatchMode}
          />

          {/* SECTION: Matching Cards for Lucky Numbers */}
          {luckyNumbers.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {luckyNumbers.length === 1 && (
                      <>Cartones disponibles con la bolilla #{String(luckyNumbers[0]).padStart(2, '0')}:</>
                    )}
                    {luckyNumbers.length === 2 && (
                      <>
                        Cartones disponibles con las bolillas #{String(luckyNumbers[0]).padStart(2, '0')} y #{String(luckyNumbers[1]).padStart(2, '0')}
                        {luckyMatchMode === 'all' ? ' (ambas a la vez):' : ' (al menos una):'}
                      </>
                    )}
                    {luckyNumbers.length === 3 && (
                      <>
                        Cartones con las 3 bolillas #{String(luckyNumbers[0]).padStart(2, '0')}, #{String(luckyNumbers[1]).padStart(2, '0')} y #{String(luckyNumbers[2]).padStart(2, '0')}
                        {luckyMatchMode === 'all' ? ' (las 3 juntas):' : ' (al menos una):'}
                      </>
                    )}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                    {matchingCards.length} {matchingCards.length === 1 ? 'cartón encontrado' : 'cartones encontrados'}
                  </span>
                  {matchingCards.length > 1 && (
                    <button
                      type="button"
                      onClick={handleSelectAllMatching}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer ml-2"
                    >
                      Seleccionar todos
                    </button>
                  )}
                </div>
              </div>

              {matchingCards.length === 0 ? (
                <div className="p-6 text-center bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
                  <p className="font-bold">
                    No hay cartones disponibles actualmente que contengan{' '}
                    {luckyNumbers.length === 1
                      ? `la bolilla #${String(luckyNumbers[0]).padStart(2, '0')}`
                      : `las ${luckyNumbers.length} bolillas elegidas simultáneamente (${luckyNumbers.map((n) => '#' + String(n).padStart(2, '0')).join(', ')})`}
                    .
                  </p>
                  {luckyNumbers.length > 1 && luckyMatchMode === 'all' && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setLuckyMatchMode('any')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Ver cartones que tengan al menos 1 de estas bolillas
                      </button>
                    </div>
                  )}
                  <p className="text-amber-700 text-[11px]">
                    Probá cambiando o quitando una bolilla, o elegí cartones al azar con los botones superiores.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {matchingCards.map((card) => {
                    const isCardSelected = selectedCards.some((c) => c.id === card.id);
                    return (
                      <div
                        key={card.id}
                        onClick={() => toggleCardSelection(card)}
                        className={`
                          p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left relative select-none
                          ${
                            isCardSelected
                              ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <span className="font-black text-xs text-slate-900">
                            Cartón N° {formatCardNum(card.cardNumber)}
                          </span>
                          {isCardSelected ? (
                            <span className="bg-emerald-600 text-white rounded-full p-1 text-xs font-bold flex items-center space-x-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Seleccionado</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full hover:bg-emerald-100 hover:text-emerald-700">
                              + Seleccionar
                            </span>
                          )}
                        </div>

                        {/* 10 numbers mini-grid */}
                        <div className="grid grid-cols-5 gap-1 text-[11px] font-mono font-bold text-center">
                          {card.numbers.map((n, i) => {
                            const isLucky = luckyNumbers.includes(n);
                            return (
                              <span
                                key={i}
                                className={`py-0.5 rounded ${
                                  isLucky
                                    ? 'bg-amber-400 text-slate-950 font-black ring-1 ring-amber-500 shadow-2xs scale-105'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {String(n).padStart(2, '0')}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TOGGLE: Browse all cards or search */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowAllCards((prev) => !prev)}
                className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center space-x-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>
                  {showAllCards ? 'Ocultar catálogo completo' : `Ver catálogo completo (${availableCards.length} cartones)`}
                </span>
              </button>

              {showAllCards && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por Nº de cartón..."
                    value={searchCardNumber}
                    onChange={(e) => setSearchCardNumber(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              )}
            </div>

            {showAllCards && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                {searchedCards.map((card) => {
                  const isCardSelected = selectedCards.some((c) => c.id === card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleCardSelection(card)}
                      className={`
                        p-3 rounded-2xl border-2 transition-all cursor-pointer text-left select-none
                        ${
                          isCardSelected
                            ? 'bg-sky-50 border-blue-600 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
                        <span className="font-bold text-xs text-slate-800">
                          Cartón N° {formatCardNum(card.cardNumber)}
                        </span>
                        {isCardSelected ? (
                          <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Elegido</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Tocar para elegir
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-5 gap-1 text-[10px] font-mono font-bold text-center">
                        {card.numbers.map((n, i) => (
                          <span key={i} className="py-0.5 bg-slate-100 rounded text-slate-700">
                            {String(n).padStart(2, '0')}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIVE SELECTED CARDS SUMMARY & DETAILS */}
          {selectedCards.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50/70 via-sky-50/50 to-indigo-50/70 border-2 border-blue-200 rounded-3xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-blue-800 bg-blue-200/70 px-2.5 py-0.5 rounded-full inline-block">
                    Selección Activa ({selectedCards.length} {selectedCards.length === 1 ? 'cartón' : 'cartones'})
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                    {selectedCards.length === 1
                      ? `Cartón Nº ${formatCardNum(selectedCards[0].cardNumber)}`
                      : `${selectedCards.length} Cartones listos para comprar`}
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total a pagar</span>
                    <span className="text-xl sm:text-2xl font-black text-blue-700">
                      ${totalSelectedPrice.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCards([])}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                    title="Vaciar selección"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards Tags List */}
              <div className="flex flex-wrap gap-2">
                {selectedCards.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-white border border-blue-300 rounded-xl text-xs font-mono font-black text-slate-900 shadow-2xs"
                  >
                    <span>#{formatCardNum(c.cardNumber)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCardSelection(c);
                      }}
                      className="ml-1 text-slate-400 hover:text-red-500 cursor-pointer font-sans"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* If single card selected, display the 10 game numbers and optional official card view */}
              {selectedCards.length === 1 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 block">
                      Cartón Oficial Nº {formatCardNum(selectedCards[0].cardNumber)}:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOfficialPreview((prev) => !prev)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      {showOfficialPreview ? 'Ocultar cartón oficial' : 'Ver cartón oficial completo'}
                    </button>
                  </div>

                  {showOfficialPreview ? (
                    <div className="max-w-2xl mx-auto my-2 rounded-xl overflow-hidden shadow-lg border border-slate-200">
                      <BingoCardComponent
                        numeroCarton={selectedCards[0].cardNumber}
                        numerosJuego={selectedCards[0].numbers}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2 text-center">
                      {selectedCards[0].numbers.map((num, i) => (
                        <div
                          key={i}
                          className="py-2.5 bg-white border border-blue-200 rounded-xl font-mono font-black text-sm sm:text-base text-slate-900 shadow-2xs"
                        >
                          {String(num).padStart(2, '0')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Initial state guide if nothing is selected yet */}
          {selectedCards.length === 0 && luckyNumbers.length === 0 && (
            <div className="p-6 text-center bg-slate-50/80 rounded-2xl border border-slate-200/60 text-slate-500 text-xs">
              <p className="font-bold text-slate-700 mb-1">
                ¿Cómo funciona la compra de cartones?
              </p>
              <p>
                1. Hacé clic en <strong className="text-slate-800">1 o hasta 3 bolillas de la suerte</strong> del 01 al 90 para filtrar los cartones con tus números favoritos, o
              </p>
              <p>
                2. Utilizá los botones <strong className="text-amber-700">"+1 al azar"</strong>, <strong className="text-amber-700">"+3 al azar"</strong> o <strong className="text-amber-700">"+5 al azar"</strong> para seleccionar múltiples cartones en un solo clic.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* STICKY BOTTOM BAR WHEN CARDS ARE SELECTED */}
      {!bingo.salesClosed && selectedCards.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3.5 sm:p-4 shadow-2xl z-40">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                {selectedCards.length}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">
                  {selectedCards.length === 1 ? '1 cartón seleccionado' : `${selectedCards.length} cartones seleccionados`}
                </div>
                <div className="text-xl font-black text-slate-900">
                  ${totalSelectedPrice.toLocaleString('es-AR')}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedCards([])}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Limpiar
              </button>

              <button
                id="btn-agregar-al-carrito"
                type="button"
                onClick={() => onAddToCart(selectedCards)}
                className="flex-1 sm:flex-initial px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
              >
                <ShoppingCart className="w-4 h-4 text-amber-300" />
                <span>
                  Agregar {selectedCards.length} {selectedCards.length === 1 ? 'cartón' : 'cartones'} al carrito
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom Modal for Official Prizes Photo */}
      {showPrizeZoomModal && activePremiosImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowPrizeZoomModal(false)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] bg-slate-900 rounded-3xl p-3 sm:p-4 border border-amber-400/40 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 text-white border-b border-white/10 mb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-amber-300">
                  Afiche Oficial de Premios • {bingo.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPrizeZoomModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Cerrar vista ampliada"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[78vh] w-full rounded-2xl flex items-center justify-center bg-black/60 p-2">
              <img
                src={activePremiosImage}
                alt={`Afiche Oficial - ${bingo.title}`}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
