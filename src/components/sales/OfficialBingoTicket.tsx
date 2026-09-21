import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, RotateCcw, Check, Sparkles, Edit3, Dices, X } from 'lucide-react';
import { Bingo, BingoCard, Customer, CompradorData } from '../../types';
import { useBingo } from '../../context/BingoContext';

interface OfficialBingoTicketProps {
  card: BingoCard;
  bingo?: Bingo;
  customer?: Customer;
  comprador?: CompradorData;
  validationCode?: string;
  className?: string;
  id?: string;
  allowInteractivePlay?: boolean;
  templateImageUrl?: string;
  showUploader?: boolean;
  allowNumberEditing?: boolean;
}

// 8 Games with exact prizes and models from the official 15º Bingo Monumental ticket
const OFFICIAL_GAMES_PRIZES = [
  {
    game: '1º JUEGO',
    title: '$6.000.000',
    subtitle: 'EN EFECTIVO',
    extraBadge: null,
  },
  {
    game: '2º JUEGO',
    title: '$7.000.000',
    subtitle: 'EN EFECTIVO',
    extraBadge: null,
  },
  {
    game: '3º JUEGO',
    title: '$8.000.000',
    subtitle: 'EN EFECTIVO',
    extraBadge: null,
  },
  {
    game: '4º JUEGO',
    title: '$12.000.000',
    subtitle: 'EN EFECTIVO',
    extraBadge: null,
  },
  {
    game: '5º JUEGO',
    title: 'FIAT CRONOS',
    model: 'LIKE.',
    patent: '0KM PAT.',
    extraBadge: '+ $ 4.000.000 EN EFECTIVO',
  },
  {
    game: '6º JUEGO',
    title: 'FIAT CRONOS',
    model: 'LIKE.',
    patent: '0KM PAT.',
    extraBadge: '+ $ 4.000.000 EN EFECTIVO',
  },
  {
    game: '7º JUEGO',
    title: 'VW TERA',
    model: 'TRENDLINE',
    patent: '0KM PATENTADO',
    extraBadge: '+ $ 5.000.000 EN EFECTIVO',
  },
  {
    game: '8º JUEGO',
    title: 'VW TAOS',
    model: 'CONFORTLINE',
    patent: '0KM PATENTADA',
    extraBadge: '+ $ 5.000.000 EN EFECTIVO',
  },
];

export const OfficialBingoTicket: React.FC<OfficialBingoTicketProps> = ({
  card,
  bingo,
  customer,
  comprador,
  validationCode,
  className = '',
  id,
  allowInteractivePlay = false,
  templateImageUrl,
  showUploader = false,
}) => {
  // Check localStorage for a persistent official template uploaded by the user
  const [templateImage, setTemplateImage] = useState<string | null>(() => {
    if (templateImageUrl) return templateImageUrl;
    if (bingo?.ticketTemplateImage) return bingo.ticketTemplateImage;
    return localStorage.getItem('official_bingo_ticket_template') || '/carton_template.png';
  });

  // View mode: 'with_numbers' (for selling & official card view) vs 'clean_template' (identical to blank printable sheet)
  const [viewMode, setViewMode] = useState<'with_numbers' | 'clean_template'>('with_numbers');

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check backend for stored template on mount if not yet in state
  useEffect(() => {
    if (!templateImage) {
      fetch('/api/bingo/template')
        .then((r) => r.json())
        .then((data) => {
          if (data?.exists && data?.url) {
            setTemplateImage(data.url);
            localStorage.setItem('official_bingo_ticket_template', data.url);
          }
        })
        .catch(() => {});
    }
  }, [templateImage]);

  // Sync if prop changes
  useEffect(() => {
    if (templateImageUrl) {
      setTemplateImage(templateImageUrl);
    } else if (bingo?.ticketTemplateImage) {
      setTemplateImage(bingo.ticketTemplateImage);
    }
  }, [templateImageUrl, bingo?.ticketTemplateImage]);

  // Handle template image upload
  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setTemplateImage(base64);
        try {
          localStorage.setItem('official_bingo_ticket_template', base64);
          fetch('/api/bingo/template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 }),
          }).catch(() => {});
        } catch {
          // localStorage quota catch
        }
        setSuccessNotice('¡Plantilla oficial cargada exitosamente! Ahora todos los cartones usan esta imagen fija.');
        setTimeout(() => setSuccessNotice(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleResetTemplate = () => {
    setTemplateImage(null);
    localStorage.removeItem('official_bingo_ticket_template');
  };

  // Context for updating numbers
  const { updateCardNumbers } = useBingo();

  // Number editing modal state
  const [isEditingNumbers, setIsEditingNumbers] = useState(false);
  const [editableNumbers, setEditableNumbers] = useState<number[]>([]);
  const [editableCardNumber, setEditableCardNumber] = useState<number>(card.cardNumber);
  const [editError, setEditError] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');

  useEffect(() => {
    setEditableNumbers([...card.numbers].sort((a, b) => a - b));
    setEditableCardNumber(card.cardNumber);
  }, [card]);

  const handleOpenEdit = () => {
    setEditableNumbers([...card.numbers].sort((a, b) => a - b));
    setEditableCardNumber(card.cardNumber);
    setEditError('');
    setIsEditingNumbers(true);
  };

  const handleRandomizeNumbers = () => {
    const pool: number[] = [];
    while (pool.length < 10) {
      const n = Math.floor(Math.random() * 90) + 1;
      if (!pool.includes(n)) pool.push(n);
    }
    setEditableNumbers(pool.sort((a, b) => a - b));
    setEditError('');
  };

  const handleSaveNumbers = () => {
    if (editableNumbers.length !== 10) {
      setEditError('Debes ingresar exactamente 10 números.');
      return;
    }
    const unique = new Set(editableNumbers);
    if (unique.size !== 10) {
      setEditError('Todos los números deben ser diferentes (sin duplicados).');
      return;
    }
    const invalidRange = editableNumbers.some((n) => isNaN(n) || n < 1 || n > 90);
    if (invalidRange) {
      setEditError('Los números deben estar entre 1 y 90.');
      return;
    }

    updateCardNumbers(card.id, editableNumbers, editableCardNumber);
    setSuccessNotice('¡Números del cartón actualizados exitosamente!');
    setIsEditingNumbers(false);
    setTimeout(() => setSuccessNotice(''), 3500);
  };

  // The 10 numbers assigned to this card
  const rawNumbers = card?.numbers || [];
  const sortedNumbers = [...rawNumbers].sort((a, b) => a - b);
  const gameNumbers = sortedNumbers.length >= 10
    ? sortedNumbers.slice(0, 10)
    : [...sortedNumbers, ...Array.from({ length: 10 - sortedNumbers.length }, (_, i) => i + 1)];

  // 5-digit formatted card number (e.g. "04812")
  const formattedCardNumber = String(card.cardNumber).padStart(5, '0');

  // Exact resolution info from the photo
  const resolutionNumber = (bingo as unknown as Record<string, unknown>)?.resolutionNumber as string || '191/26';

  // Resolved dynamic buyer details
  const resolvedComprador: CompradorData = {
    nombreApellido:
      comprador?.nombreApellido ||
      card.comprador?.nombreApellido ||
      (customer ? `${customer.name || ''} ${customer.lastname || ''}`.trim() : '') ||
      (card.customer ? `${card.customer.name || ''} ${card.customer.lastname || ''}`.trim() : '') ||
      '',
    dni:
      comprador?.dni ||
      card.comprador?.dni ||
      customer?.dni ||
      card.customer?.dni ||
      '',
    direccion:
      comprador?.direccion ||
      card.comprador?.direccion ||
      customer?.address ||
      card.customer?.address ||
      '',
    localidad:
      comprador?.localidad ||
      card.comprador?.localidad ||
      customer?.city ||
      card.customer?.city ||
      '',
    telefono:
      comprador?.telefono ||
      card.comprador?.telefono ||
      customer?.phone ||
      card.customer?.phone ||
      '',
  };

  // Coordenadas proporcionales en porcentaje según las dimensiones exactas de la plantilla
  const BUYER_FIELDS = {
    nombreApellido: {
      left: '5.80%',
      top: '48.77%',
      width: '35.43%',
      height: '2.26%',
    },
    direccion: {
      left: '8.50%',
      top: '53.02%',
      width: '41.50%',
      height: '2.26%',
    },
    localidad: {
      left: '11.20%',
      top: '53.02%',
      width: '41.50%',
      height: '2.26%',
    },
    telefono: {
      left: '13.97%',
      top: '51.37%',
      width: '39.14%',
      height: '2.26%',
    },
    dni: {
      left: '13.97%',
      top: '36.38%',
      width: '18.08%',
      height: '2.26%',
    },
  };

  const getBuyerFontSize = (val?: string) => {
    const len = val ? val.length : 0;
    if (len > 35) return 'clamp(0.38rem, 0.85cqw, 0.75rem)';
    if (len > 25) return 'clamp(0.42rem, 0.98cqw, 0.88rem)';
    return 'clamp(0.48rem, 1.15cqw, 1.05rem)';
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top action toolbar */}
      {showUploader && (
        <div className="w-full max-w-[1020px] mb-2 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 backdrop-blur-md rounded-xl text-white text-xs border border-slate-700 shadow-md">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">
              {viewMode === 'with_numbers' ? `Cartón Oficial Nº ${formattedCardNumber}` : 'Plantilla Oficial Base (Limpia)'}
            </span>
            <span className="hidden sm:inline-block text-slate-400 text-[11px]">
              • 15º Bingo Monumental
            </span>
          </div>

          {/* View Mode Toggle: Con números vs Plantilla limpia */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('with_numbers')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'with_numbers'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Con Números
            </button>
            <button
              type="button"
              onClick={() => setViewMode('clean_template')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'clean_template'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Plantilla Limpia
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {viewMode === 'with_numbers' && (
              <button
                type="button"
                onClick={handleOpenEdit}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                title="Cambiar los 10 números de este cartón o el número de serie"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                <span>Editar Números</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-xs"
              title="Cargar la foto o diseño personalizado del cartón"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{templateImage ? 'Cambiar Foto' : 'Cargar Foto'}</span>
            </button>

            {templateImage && (
              <button
                type="button"
                onClick={handleResetTemplate}
                title="Volver al vector oficial de alta fidelidad"
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Vector HD</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Ticket Container */}
      <div
        id={id || `official-ticket-${card.id}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative w-full max-w-[1020px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden select-none border-2 ${
          isDragOver ? 'border-amber-400 ring-4 ring-amber-400/40' : 'border-slate-300'
        } font-sans ${className}`}
        style={{ aspectRatio: '1.4166 / 1' }}
      >
        <svg
          viewBox="0 0 1020 720"
          className="w-full h-full block select-none"
          style={{ pointerEvents: allowInteractivePlay ? 'auto' : 'none' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Background Blue Sky Gradient */}
            <linearGradient id="bgSkyGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6dc6f2" />
              <stop offset="30%" stopColor="#b6e7fc" />
              <stop offset="70%" stopColor="#5bbef0" />
              <stop offset="100%" stopColor="#8de0fc" />
            </linearGradient>

            {/* Crystal Facets Linear Gradients */}
            <linearGradient id="crystalGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#89dcfb" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="crystalGrad2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c7f0fe" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="crystalGrad3" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
            </linearGradient>

            {/* Purple Cloud Badge Gradient */}
            <linearGradient id="purpleCloudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3c1f66" />
              <stop offset="100%" stopColor="#22113e" />
            </linearGradient>

            {/* Crown Gold Gradient */}
            <linearGradient id="crownGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff9a6" />
              <stop offset="25%" stopColor="#ffd215" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Red Sorteo Badge Gradient */}
            <linearGradient id="redSorteoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea1d24" />
              <stop offset="100%" stopColor="#b30712" />
            </linearGradient>

            {/* Drop Shadow for badges */}
            <filter id="ticketShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#075985" floodOpacity="0.28" />
            </filter>
            <filter id="subtleShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* =========================================================================
              LAYER 1: BACKGROUND BASE (PHOTO IF PROVIDED, OR PIXEL-PERFECT VECTOR ART)
             ========================================================================= */}
          {templateImage ? (
            /* IF USER UPLOADED PHOTO: USE THE EXACT ORIGINAL PHOTO FILE DIRECTLY */
            <image
              href={templateImage}
              x="0"
              y="0"
              width="1020"
              height="720"
              preserveAspectRatio="none"
            />
          ) : (
            /* DEFAULT VECTOR ARTWORK IDENTICAL TO THE 15º BINGO MONUMENTAL 7811 IMPRIMIBLE */
            <g id="vector-artwork-base">
              {/* Sky blue base background */}
              <rect x="0" y="0" width="1020" height="720" fill="url(#bgSkyGrad)" />

              {/* 3D Faceted Crystal Geometric Mesh matching ChatGPT Image 19 sept 2026 */}
              <g id="crystal-mesh" opacity="0.95">
                {/* Top-Right Crystal Shards */}
                <polygon points="660,0 880,0 790,165 590,95" fill="url(#crystalGrad1)" />
                <polygon points="880,0 1020,0 1020,190 790,165" fill="url(#crystalGrad2)" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.4" />
                <polygon points="790,165 1020,190 1020,380 840,290" fill="url(#crystalGrad1)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
                <polygon points="840,290 1020,380 1020,530 890,460" fill="url(#crystalGrad2)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />
                <polygon points="890,460 1020,530 1020,720 860,720" fill="url(#crystalGrad3)" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.4" />

                {/* Top-Left & Center Crystal Shards */}
                <polygon points="0,0 260,0 130,160 0,110" fill="url(#crystalGrad2)" />
                <polygon points="260,0 490,0 380,150 130,160" fill="url(#crystalGrad1)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
                <polygon points="490,0 660,0 590,95 380,150" fill="url(#crystalGrad3)" />

                {/* Left Margin Crystal Shards */}
                <polygon points="0,110 130,160 60,380 0,330" fill="url(#crystalGrad1)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
                <polygon points="0,330 60,380 0,540" fill="url(#crystalGrad2)" />
                <polygon points="0,540 80,610 160,720 0,720" fill="url(#crystalGrad1)" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.4" />
                <polygon points="860,720 1020,720 940,630" fill="url(#crystalGrad1)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />

                {/* Ambient Soft Diagonal Ray Lines */}
                <line x1="380" y1="150" x2="790" y2="165" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.35" />
                <line x1="130" y1="160" x2="380" y2="150" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.45" />
                <line x1="590" y1="95" x2="790" y2="165" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
              </g>

              {/* ================= TOP HEADER BRANDING ================= */}

              {/* 1. TOP-LEFT: 15º BINGO MONUMENTAL (Purple Cloud + Gold Crown) */}
              <g id="brand-badge" transform="translate(195, 96)" filter="url(#ticketShadow)">
                {/* 5-Point Royal Crown perched on top of purple badge */}
                <g id="royal-crown" transform="translate(0, -46) scale(0.78)">
                  <path
                    d="M-55,14 L-72,-20 L-36,-2 L0,-38 L36,-2 L72,-20 L55,14 Z"
                    fill="url(#crownGrad)"
                    stroke="#b45309"
                    strokeWidth="2.5"
                  />
                  {/* 5 Golden Pearls on Crown Tips */}
                  <circle cx="-72" cy="-20" r="6" fill="#fffbeb" stroke="#b45309" strokeWidth="2" />
                  <circle cx="-36" cy="-2" r="5" fill="#fffbeb" stroke="#b45309" strokeWidth="2" />
                  <circle cx="0" cy="-38" r="7.5" fill="#fffbeb" stroke="#b45309" strokeWidth="2" />
                  <circle cx="36" cy="-2" r="5" fill="#fffbeb" stroke="#b45309" strokeWidth="2" />
                  <circle cx="72" cy="-20" r="6" fill="#fffbeb" stroke="#b45309" strokeWidth="2" />
                  {/* Crown Jeweled Base Band */}
                  <rect x="-52" y="7" width="104" height="8" rx="2.5" fill="#d97706" />
                  <circle cx="-32" cy="11" r="2.8" fill="#ef4444" />
                  <circle cx="0" cy="11" r="2.8" fill="#38bdf8" />
                  <circle cx="32" cy="11" r="2.8" fill="#10b981" />
                </g>

                {/* Deep purple cloud badge with radiant golden outline */}
                <path
                  d="M -130,-5 Q -145,-30 -115,-40 Q -85,-58 -45,-45 Q -10,-60 25,-45 Q 65,-58 100,-40 Q 135,-30 120,-5 Q 142,20 125,45 Q 100,68 60,56 Q 20,70 -20,60 Q -70,70 -105,50 Q -140,35 -130,-5 Z"
                  fill="url(#purpleCloudGrad)"
                  stroke="#ffd200"
                  strokeWidth="4.5"
                  strokeLinejoin="round"
                />

                {/* 15°BINGO (golden yellow bold text) */}
                <text
                  x="-3"
                  y="-1"
                  fontFamily="Impact, 'Arial Black', sans-serif"
                  fontWeight="900"
                  fontSize="34"
                  fill="#ffea00"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  15°BINGO
                </text>

                {/* MONUMENTAL (crisp white bold text) */}
                <text
                  x="-3"
                  y="28"
                  fontFamily="Impact, 'Arial Black', sans-serif"
                  fontWeight="900"
                  fontSize="25"
                  fill="#ffffff"
                  textAnchor="middle"
                  letterSpacing="2.2"
                >
                  MONUMENTAL
                </text>
              </g>

              {/* 2. TOP-CENTER: SORTEO LUNES 28 SEPTIEMBRE + HORARIO 15:00 HS */}
              <g id="sorteo-group" transform="translate(565, 92)" filter="url(#ticketShadow)">
                {/* Red Sorteo Oval Badge with Thick Crisp White Border */}
                <ellipse
                  cx="-50"
                  cy="2"
                  rx="98"
                  ry="53"
                  fill="url(#redSorteoGrad)"
                  stroke="#ffffff"
                  strokeWidth="5"
                />

                {/* SORTEO top white pill */}
                <rect x="-95" y="-45" width="90" height="17" rx="8.5" fill="#ffffff" />
                <text
                  x="-50"
                  y="-32"
                  fontFamily="sans-serif"
                  fontWeight="900"
                  fontSize="10.5"
                  fill="#dc2626"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  SORTEO
                </text>

                {/* LUNES 28 DE */}
                <text
                  x="-88"
                  y="-3"
                  fontFamily="sans-serif"
                  fontWeight="900"
                  fontSize="14"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  LUNES
                </text>
                <text
                  x="-42"
                  y="11"
                  fontFamily="Impact, 'Arial Black', sans-serif"
                  fontWeight="900"
                  fontSize="48"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  28
                </text>
                <text
                  x="-12"
                  y="-3"
                  fontFamily="sans-serif"
                  fontWeight="900"
                  fontSize="10"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  DE
                </text>

                {/* SEPTIEMBRE */}
                <text
                  x="-50"
                  y="31"
                  fontFamily="Impact, 'Arial Black', sans-serif"
                  fontWeight="900"
                  fontSize="18"
                  fill="#ffffff"
                  textAnchor="middle"
                  letterSpacing="1.2"
                >
                  SEPTIEMBRE
                </text>

                {/* -2026- */}
                <text
                  x="-50"
                  y="46"
                  fontFamily="sans-serif"
                  fontWeight="900"
                  fontSize="10"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  -2026-
                </text>

                {/* Attached White Horario Badge */}
                <g transform="translate(68, -8)">
                  <rect
                    x="-32"
                    y="-28"
                    width="64"
                    height="56"
                    rx="28"
                    fill="#ffffff"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                  />
                  {/* HORARIO Pill */}
                  <rect x="-24" y="-24" width="48" height="13" rx="6.5" fill="#dc2626" />
                  <text
                    x="0"
                    y="-14.5"
                    fontFamily="sans-serif"
                    fontWeight="900"
                    fontSize="7.5"
                    fill="#ffffff"
                    textAnchor="middle"
                    letterSpacing="0.5"
                  >
                    HORARIO
                  </text>
                  {/* 15:00 */}
                  <text
                    x="0"
                    y="7"
                    fontFamily="Impact, 'Arial Black', sans-serif"
                    fontWeight="900"
                    fontSize="18"
                    fill="#dc2626"
                    textAnchor="middle"
                  >
                    15:00
                  </text>
                  {/* HORAS */}
                  <text
                    x="0"
                    y="20"
                    fontFamily="sans-serif"
                    fontWeight="900"
                    fontSize="8.5"
                    fill="#dc2626"
                    textAnchor="middle"
                  >
                    HORAS
                  </text>
                </g>
              </g>

              {/* 3. TOP-RIGHT: ENREJA AUTHORIZATION (Card number box is in the overlay layer) */}
              <g id="top-right-auth-group">
                <text
                  x="893"
                  y="152"
                  fontFamily="sans-serif"
                  fontWeight="900"
                  fontSize="10.5"
                  fill="#0f172a"
                  textAnchor="middle"
                  letterSpacing="0.2"
                >
                  AUTORIZADO POR EN.RE.J.A
                </text>
                <text
                  x="893"
                  y="166"
                  fontFamily="sans-serif"
                  fontWeight="800"
                  fontSize="10.5"
                  fill="#0f172a"
                  textAnchor="middle"
                  letterSpacing="0.2"
                >
                  RESOLUCIÓN Nº
                </text>
              </g>

              {/* ================= RED GAME HEADER ROW ================= */}
              {/* Spanning full width: x=20 to x=1000 */}
              <g id="red-game-header-bar">
                {/* Left section: CARTÓN DE JUEGO AL PORTADOR */}
                <path
                  d="M36,176 Q20,176 20,192 L20,210 Q20,226 36,226 L240,226 L240,176 Z"
                  fill="#e11d27"
                />
                <text
                  x="130"
                  y="198"
                  fontFamily="sans-serif"
                  fontWeight="900"
                  fontSize="16"
                  fill="#ffffff"
                  textAnchor="middle"
                  letterSpacing="0.3"
                >
                  CARTÓN DE JUEGO
                </text>
                <text
                  x="130"
                  y="215"
                  fontFamily="sans-serif"
                  fontWeight="800"
                  fontSize="11"
                  fill="#ffffff"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  AL PORTADOR
                </text>

                {/* Outer bounding box with rounded top-right corner for the 10 cells */}
                <path
                  d="M240,176 L984,176 Q1000,176 1000,192 L1000,226 L240,226 Z"
                  fill="#ffffff"
                  stroke="#e11d27"
                  strokeWidth="3.5"
                />

                {/* 10 Vertical Red Dividers */}
                {Array.from({ length: 9 }).map((_, i) => (
                  <line
                    key={i}
                    x1={240 + (i + 1) * 76}
                    y1="176"
                    x2={240 + (i + 1) * 76}
                    y2="226"
                    stroke="#e11d27"
                    strokeWidth="3.5"
                  />
                ))}
              </g>

              {/* ================= 8 ROWS OF PRIZES & EMPTY PLAY CELLS ================= */}
              <g id="game-prizes-table">
                {/* Perimeter bounding box with rounded bottom corners and dashed cyan line */}
                <rect
                  x="20"
                  y="226"
                  width="980"
                  height="360"
                  rx="16"
                  fill="#ffffff"
                  stroke="#009ee3"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />

                {OFFICIAL_GAMES_PRIZES.map((item, rowIdx) => {
                  const y = 226 + rowIdx * 45;
                  return (
                    <g key={rowIdx}>
                      {/* Left prize label section (x: 20 to 240) */}
                      <line x1="20" y1={y} x2="240" y2={y} stroke="#009ee3" strokeWidth="1" strokeDasharray="4,3" />
                      <line x1="240" y1="226" x2="240" y2="586" stroke="#009ee3" strokeWidth="1.5" strokeDasharray="4,3" />

                      {/* Pill: e.g. 1º JUEGO */}
                      <rect x="25" y={y + 11} width="56" height="23" rx="11.5" fill="#008cd2" />
                      <text
                        x="53"
                        y={y + 26.5}
                        fontFamily="sans-serif"
                        fontWeight="900"
                        fontSize="9.5"
                        fill="#ffffff"
                        textAnchor="middle"
                      >
                        {item.game}
                      </text>

                      {/* Prize text */}
                      {item.extraBadge ? (
                        <g>
                          {/* Vehicle Title */}
                          <text
                            x="88"
                            y={y + 17}
                            fontFamily="Impact, 'Arial Black', sans-serif"
                            fontWeight="900"
                            fontSize="14"
                            fill="#0f172a"
                            letterSpacing="0.2"
                          >
                            {item.title}
                          </text>
                          {/* Model underneath Title */}
                          <text
                            x="89"
                            y={y + 25.5}
                            fontFamily="sans-serif"
                            fontWeight="900"
                            fontSize="7"
                            fill="#334155"
                            letterSpacing="0.2"
                          >
                            {item.model}
                          </text>
                          {/* 0KM Patent on the right */}
                          <text
                            x="234"
                            y={y + 16}
                            fontFamily="sans-serif"
                            fontWeight="900"
                            fontSize="7.5"
                            fill="#0f172a"
                            textAnchor="end"
                          >
                            {item.patent}
                          </text>
                          {/* Cyan/Blue Badge underneath */}
                          <rect
                            x="88"
                            y={y + 28}
                            width="146"
                            height="14"
                            rx="7"
                            fill={rowIdx >= 6 ? '#008cd2' : '#009ee3'}
                          />
                          <text
                            x="161"
                            y={y + 38.5}
                            fontFamily="sans-serif"
                            fontWeight="900"
                            fontSize="7.5"
                            fill="#ffffff"
                            textAnchor="middle"
                            letterSpacing="0.3"
                          >
                            {item.extraBadge}
                          </text>
                        </g>
                      ) : (
                        <g>
                          <text
                            x="88"
                            y={y + 30}
                            fontFamily="Impact, 'Arial Black', sans-serif"
                            fontWeight="900"
                            fontSize="18"
                            fill="#0f172a"
                            letterSpacing="0.3"
                          >
                            {item.title}
                          </text>
                          <text
                            x="194"
                            y={y + 21}
                            fontFamily="sans-serif"
                            fontWeight="900"
                            fontSize="7.5"
                            fill="#0f172a"
                          >
                            <tspan x="194" dy="0">EN</tspan>
                            <tspan x="194" dy="9">EFECTIVO</tspan>
                          </text>
                        </g>
                      )}

                      {/* 10 Empty Play Cells - clean white with dashed light-cyan dividers */}
                      {Array.from({ length: 10 }).map((_, colIdx) => (
                        <rect
                          key={colIdx}
                          x={240 + colIdx * 76}
                          y={y}
                          width="76"
                          height="45"
                          fill="#ffffff"
                          stroke="#009ee3"
                          strokeWidth="1.2"
                          strokeDasharray="4,3"
                        />
                      ))}
                    </g>
                  );
                })}
              </g>

              {/* ================= BOTTOM FOOTER BANNER (3 WHITE ROUNDED CARDS) ================= */}
              <g id="footer-cards">
                {/* 1. Left Card: Club Gimnasia y Tiro de Salta */}
                <g id="gyt-card">
                  <rect
                    x="70"
                    y="604"
                    width="385"
                    height="98"
                    rx="18"
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    filter="url(#subtleShadow)"
                  />

                  {/* Shield Logo of GYT */}
                  <g transform="translate(95, 616)">
                    <path
                      d="M0,0 L56,0 L56,42 Q56,66 28,74 Q0,66 0,42 Z"
                      fill="#38bdf8"
                      stroke="#1e3a8a"
                      strokeWidth="2.5"
                    />
                    {/* Vertical white stripes */}
                    <rect x="9" y="2" width="9" height="64" fill="#ffffff" />
                    <rect x="28" y="2" width="9" height="70" fill="#ffffff" />
                    <rect x="47" y="2" width="9" height="52" fill="#ffffff" />
                    {/* Horizontal GYT banner */}
                    <rect x="3" y="23" width="50" height="18" rx="3" fill="#ffffff" stroke="#1e3a8a" strokeWidth="1.5" />
                    <text
                      x="28"
                      y="37"
                      fontFamily="sans-serif"
                      fontWeight="900"
                      fontSize="13"
                      fill="#0f172a"
                      textAnchor="middle"
                      letterSpacing="2"
                    >
                      GYT
                    </text>
                  </g>

                  {/* Club info text */}
                  <g transform="translate(168, 616)">
                    <rect x="0" y="0" width="76" height="18" rx="9" fill="#008cd2" />
                    <text
                      x="38"
                      y="13"
                      fontFamily="sans-serif"
                      fontWeight="900"
                      fontSize="9.5"
                      fill="#ffffff"
                      textAnchor="middle"
                    >
                      ORGANIZA
                    </text>

                    <text
                      x="0"
                      y="38"
                      fontFamily="sans-serif"
                      fontWeight="900"
                      fontSize="18"
                      fill="#008cd2"
                      letterSpacing="0.3"
                    >
                      CLUB DE GIMNASIA
                    </text>
                    <text
                      x="0"
                      y="58"
                      fontFamily="sans-serif"
                      fontWeight="900"
                      fontSize="18"
                      fill="#008cd2"
                      letterSpacing="0.3"
                    >
                      Y TIRO DE SALTA
                    </text>
                    <text
                      x="0"
                      y="77"
                      fontFamily="sans-serif"
                      fontWeight="700"
                      fontSize="11"
                      fill="#475569"
                    >
                      Vicente Lopez 670 | Tel: (0387) 432 0554
                    </text>
                  </g>
                </g>

                {/* 2. Center Card: Oficina de Bingo & JGI Logo */}
                <g id="oficina-card">
                  <rect
                    x="520"
                    y="604"
                    width="215"
                    height="98"
                    rx="18"
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    filter="url(#subtleShadow)"
                  />

                  {/* Oficina info */}
                  <g transform="translate(535, 622)">
                    <text fontFamily="sans-serif" fontWeight="800" fontSize="9.5" fill="#0f172a" y="0">
                      Oficina de bingo:
                    </text>
                    <text fontFamily="sans-serif" fontWeight="700" fontSize="9" fill="#334155" y="13">
                      Balcarce 850 | Salta
                    </text>
                    <text fontFamily="sans-serif" fontWeight="800" fontSize="9.5" fill="#0f172a" y="32">
                      Tel. Oficina:
                    </text>
                    <text fontFamily="sans-serif" fontWeight="900" fontSize="10.5" fill="#0f172a" y="47">
                      (0387) 4215005
                    </text>
                  </g>

                  {/* Colorful JGI circular loop logo */}
                  <g transform="translate(680, 653)">
                    {/* Multi-colored circular loop arc */}
                    <circle cx="0" cy="0" r="28" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="25 8" />
                    <circle cx="-16" cy="-14" r="5" fill="#ef4444" />
                    <circle cx="16" cy="-14" r="5" fill="#facc15" />
                    <circle cx="22" cy="8" r="5" fill="#10b981" />
                    <circle cx="-14" cy="18" r="5" fill="#0284c7" />
                    <circle cx="0" cy="-22" r="4" fill="#6366f1" />
                    {/* jgi text in center */}
                    <text
                      x="0"
                      y="7"
                      fontFamily="sans-serif"
                      fontWeight="900"
                      fontSize="18"
                      fill="#0284c7"
                      textAnchor="middle"
                    >
                      jgi
                    </text>
                    {/* Stand base underneath logo */}
                    <line x1="-15" y1="31" x2="15" y2="31" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                    <line x1="0" y1="28" x2="0" y2="31" stroke="#38bdf8" strokeWidth="2.5" />
                  </g>
                </g>

                {/* 3. Right Card: Clean White Card (matches official printable sheet carton_7811_imprimible) */}
                <g id="stamp-card">
                  <rect
                    x="800"
                    y="604"
                    width="190"
                    height="98"
                    rx="18"
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    filter="url(#subtleShadow)"
                  />
                </g>
              </g>
            </g>
          )}

          {/* =========================================================================
              LAYER 2: DYNAMIC TICKET ELEMENTS (CARD NUMBER & 10 GAME NUMBERS)
              Always stamped on top so ANY official photo or vector template works!
             ========================================================================= */}
          {/* Top-Right Card Number Box: only draw white background shape if NO template image is active */}
          {!templateImage && (
            <rect
              x="795"
              y="38"
              width="196"
              height="96"
              rx="18"
              fill="#ffffff"
            />
          )}
        </svg>

        {/* =========================================================================
            ELEMENTO DINÁMICO 1: NÚMERO DE CARTÓN
            Superpuesto como texto puro sobre el rectángulo blanco existente en la imagen.
            Contenedor completamente transparente, sin ningún fondo blanco, borde,
            border-radius ni box-shadow.
           ========================================================================= */}
        {viewMode === 'with_numbers' && (
          <div
            className="numero-carton pointer-events-none"
            style={{
              position: 'absolute',
              left: templateImage ? '81.24%' : '77.94%',
              top: templateImage ? '3.68%' : '5.28%',
              width: templateImage ? '15.92%' : '19.22%',
              height: templateImage ? '13.85%' : '13.33%',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              margin: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
              color: '#000000',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontFamily: "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(0.65rem, 2.2cqw, 1.8rem)',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {card.cardNumber}
            </span>
          </div>
        )}

        {/* =========================================================================
            ELEMENTO DINÁMICO: NÚMERO DE CARTÓN (CUADRO BLANCO SUPERIOR IZQUIERDO)
            Superpuesto como texto puro sobre el cuadro blanco existente en la imagen original.
            Contenedor completamente transparente, sin ningún fondo blanco, borde,
            border-radius ni box-shadow. Centrado horizontal y verticalmente.
           ========================================================================= */}
        {viewMode === 'with_numbers' && (
          <div
            className="numero-carton-izquierdo pointer-events-none"
            style={{
              position: 'absolute',
              left: templateImage ? '2.63%' : '2.84%',
              top: templateImage ? '3.68%' : '5.28%',
              width: templateImage ? '16.26%' : '16.00%',
              height: templateImage ? '13.67%' : '13.33%',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              margin: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
              color: '#000000',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontFamily: "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 700,
                fontSize: 'clamp(0.65rem, 2.2cqw, 1.8rem)',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {card.cardNumber}
            </span>
          </div>
        )}

        {/* =========================================================================
            ELEMENTO DINÁMICO 2: NÚMEROS DE JUEGO (10 CASILLAS SUPERIORES)
            UN SOLO contenedor absoluto posicionado proporcionalmente sobre las 10 casillas.
            Utiliza display: grid con 10 columnas (repeat(10, 1fr)).
            Cada celda utiliza display: flex; align-items: center; justify-content: center;
            overflow: hidden; box-sizing: border-box; padding: 0; margin: 0;
           ========================================================================= */}
        {viewMode === 'with_numbers' && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: templateImage ? '41.8%' : '23.53%',
              top: templateImage ? '25.5%' : '24.44%',
              width: templateImage ? '55.8%' : '74.51%',
              height: templateImage ? '5.9%' : '6.94%',
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
            }}
          >
            {gameNumbers.map((num, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  padding: 0,
                  margin: 0,
                }}
              >
                <span
                  className="text-black font-extrabold select-none"
                  style={{
                    fontFamily: "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontWeight: 800,
                    fontSize: 'clamp(0.5rem, 1.8cqw, 1.3rem)',
                    lineHeight: 1,
                  }}
                >
                  {num}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            ELEMENTO DINÁMICO 3: DATOS DEL COMPRADOR (LATERAL IZQUIERDO)
            Superpuesto como texto puro sobre los espacios de la imagen original.
            NO crea nuevos cuadros blancos, líneas, bordes, etiquetas ni fondos.
            Zonas transparentes con position: absolute, background: transparent, border: none,
            box-shadow: none, overflow: hidden, box-sizing: border-box.
            Rotación de textos: transform: rotate(-90deg) con transform-origin: center.
            - Nombre y Apellido -> nombreApellido
            - Dirección -> direccion
            - Localidad -> localidad
            - TEL./CEL. -> telefono
           ========================================================================= */}
        {viewMode === 'with_numbers' && resolvedComprador.nombreApellido && (
          <div
            className="comprador-campo pointer-events-none"
            style={{
              position: 'absolute',
              left: BUYER_FIELDS.nombreApellido.left,
              top: BUYER_FIELDS.nombreApellido.top,
              width: BUYER_FIELDS.nombreApellido.width,
              height: BUYER_FIELDS.nombreApellido.height,
              transform: 'translate(-50%, -50%) rotate(-90deg)',
              transformOrigin: 'center',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '0 0.5cqw',
              margin: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                fontFamily: "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 700,
                fontSize: getBuyerFontSize(resolvedComprador.nombreApellido),
                color: '#000000',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {resolvedComprador.nombreApellido}
            </span>
          </div>
        )}

        {viewMode === 'with_numbers' && resolvedComprador.direccion && (
          <div
            className="comprador-campo pointer-events-none"
            style={{
              position: 'absolute',
              left: BUYER_FIELDS.direccion.left,
              top: BUYER_FIELDS.direccion.top,
              width: BUYER_FIELDS.direccion.width,
              height: BUYER_FIELDS.direccion.height,
              transform: 'translate(-50%, -50%) rotate(-90deg)',
              transformOrigin: 'center',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '0 0.5cqw',
              margin: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                fontFamily: "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 700,
                fontSize: getBuyerFontSize(resolvedComprador.direccion),
                color: '#000000',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {resolvedComprador.direccion}
            </span>
          </div>
        )}

        {viewMode === 'with_numbers' && resolvedComprador.localidad && (
          <div
            className="comprador-campo pointer-events-none"
            style={{
              position: 'absolute',
              left: BUYER_FIELDS.localidad.left,
              top: BUYER_FIELDS.localidad.top,
              width: BUYER_FIELDS.localidad.width,
              height: BUYER_FIELDS.localidad.height,
              transform: 'translate(-50%, -50%) rotate(-90deg)',
              transformOrigin: 'center',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '0 0.5cqw',
              margin: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                fontFamily: "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 700,
                fontSize: getBuyerFontSize(resolvedComprador.localidad),
                color: '#000000',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {resolvedComprador.localidad}
            </span>
          </div>
        )}

        {viewMode === 'with_numbers' && resolvedComprador.telefono && (
          <div
            className="comprador-campo pointer-events-none"
            style={{
              position: 'absolute',
              left: BUYER_FIELDS.telefono.left,
              top: BUYER_FIELDS.telefono.top,
              width: BUYER_FIELDS.telefono.width,
              height: BUYER_FIELDS.telefono.height,
              transform: 'translate(-50%, -50%) rotate(-90deg)',
              transformOrigin: 'center',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '0 0.5cqw',
              margin: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                fontFamily: "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 700,
                fontSize: getBuyerFontSize(resolvedComprador.telefono),
                color: '#000000',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {resolvedComprador.telefono}
            </span>
          </div>
        )}

        {viewMode === 'with_numbers' && resolvedComprador.dni && (
          <div
            className="comprador-campo pointer-events-none"
            style={{
              position: 'absolute',
              left: BUYER_FIELDS.dni.left,
              top: BUYER_FIELDS.dni.top,
              width: BUYER_FIELDS.dni.width,
              height: BUYER_FIELDS.dni.height,
              transform: 'translate(-50%, -50%) rotate(-90deg)',
              transformOrigin: 'center',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 0.5cqw',
              margin: 0,
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                fontFamily: "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 700,
                fontSize: getBuyerFontSize(resolvedComprador.dni),
                color: '#000000',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {resolvedComprador.dni}
            </span>
          </div>
        )}
      </div>

      {/* Success alert toast */}
      {successNotice && (
        <div className="mt-3 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Edit Numbers Modal */}
      {isEditingNumbers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 text-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Modificar Números del Cartón</h3>
                  <p className="text-xs text-slate-400">
                    Cartón N° <span className="text-amber-400 font-mono font-bold">{card.cardNumber}</span> • El mismo diseño oficial
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingNumbers(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">¿Quieres sortear 10 números al azar?</span>
              <button
                type="button"
                onClick={handleRandomizeNumbers}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                <Dices className="w-4 h-4" />
                <span>Aleatorios (1 al 90)</span>
              </button>
            </div>

            {/* 10 number input boxes */}
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
                      className="w-full text-center py-2 px-1 bg-slate-950 border border-slate-700 rounded-xl font-mono text-base font-black text-amber-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Card Number (Serial / N°) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Número identificador de cartón (N° de serie):
              </label>
              <input
                type="number"
                value={editableCardNumber}
                onChange={(e) => setEditableCardNumber(parseInt(e.target.value, 10) || 0)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm font-bold text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Error banner */}
            {editError && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-semibold">
                {editError}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingNumbers(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNumbers}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Guardar y Aplicar al Cartón</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
