import React, { useState, useEffect, useRef } from 'react';

export interface CompradorData {
  nombreApellido?: string;
  dni?: string;
  direccion?: string;
  localidad?: string;
  telefono?: string;
}

/**
 * Interface representing the dynamic bingo card data
 * as requested: { numeroCarton: number | string, numerosJuego: number[], comprador?: CompradorData }
 */
export interface BingoCardData {
  numeroCarton: number | string;
  numerosJuego: number[];
  comprador?: CompradorData;
  id?: string;
  clienteNombre?: string;
  fechaCompra?: string;
  codigoValidacion?: string;
}

export interface BingoCardProps {
  /** Número de cartón dinámico (ej: 7811 o 7812) */
  numeroCarton?: number | string;
  /** Los 10 números de juego para las 10 casillas de la fila superior */
  numerosJuego?: number[];
  /** Datos dinámicos del comprador */
  comprador?: CompradorData;
  /** Objeto de cliente como alternativa */
  customer?: any;
  /** Objeto de datos completo como alternativa */
  card?: BingoCardData | { cardNumber?: number | string; numbers?: number[]; comprador?: CompradorData; customer?: any; [key: string]: any };
  /** URL personalizada de la imagen base/plantilla */
  templateImageUrl?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** ID del elemento */
  id?: string;
  /** Permitir arrastrar y soltar o cambiar la imagen base si se desea */
  allowTemplateUpload?: boolean;
  /** Callback al imprimir */
  onPrint?: () => void;
}

/**
 * Helper para mapear documentos provenientes de Firebase / Firestore
 * hacia la estructura requerida por BingoCard.
 * Prepara la arquitectura para integración con Firestore.
 */
export function mapFirestoreDocToBingoCard(docData: any): BingoCardData {
  if (!docData) {
    return { numeroCarton: 7811, numerosJuego: [8, 13, 23, 35, 39, 50, 63, 66, 70, 85] };
  }
  const comprador: CompradorData | undefined = docData.comprador ?? (
    docData.customer || docData.compradorNombre || docData.clienteNombre
      ? {
          nombreApellido:
            docData.compradorNombre ||
            (docData.customer ? `${docData.customer.name || ''} ${docData.customer.lastname || ''}`.trim() : '') ||
            docData.clienteNombre ||
            '',
          dni: docData.compradorDni || docData.customer?.dni || docData.dni || '',
          direccion: docData.compradorDireccion || docData.customer?.address || docData.direccion || '',
          localidad: docData.compradorLocalidad || docData.customer?.city || docData.localidad || '',
          telefono: docData.compradorTelefono || docData.customer?.phone || docData.telefono || '',
        }
      : undefined
  );

  return {
    numeroCarton: docData.numeroCarton ?? docData.cardNumber ?? docData.numero ?? 7811,
    numerosJuego: Array.isArray(docData.numerosJuego)
      ? docData.numerosJuego
      : Array.isArray(docData.numbers)
      ? docData.numbers
      : [8, 13, 23, 35, 39, 50, 63, 66, 70, 85],
    comprador,
    id: docData.id,
    clienteNombre: comprador?.nombreApellido || docData.clienteNombre || docData.customerName,
    fechaCompra: docData.fechaCompra ?? docData.purchasedAt,
    codigoValidacion: docData.codigoValidacion ?? docData.validationCode,
  };
}

/**
 * Componente React reutilizable BingoCard
 * 
 * REGLAS ESTRICTAS:
 * - NO rediseña, ni modifica, ni recrea gráficamente el cartón.
 * - Utiliza la imagen original del cartón como plantilla fija de fondo.
 * - Posiciona mediante CSS sobre la imagen original utilizando position: relative
 *   y elementos superpuestos con position: absolute calculados proporcionalmente (en %).
 * - Elemento 1: Número de cartón (en el cuadro blanco superior derecho).
 * - Elemento 2: 10 números de juego (en las 10 casillas de la franja roja).
 * - Elemento 3: Datos dinámicos del comprador (en las franjas verticales del lateral izquierdo).
 */
export const BingoCard: React.FC<BingoCardProps> = ({
  numeroCarton,
  numerosJuego,
  comprador,
  customer,
  card,
  templateImageUrl,
  className = '',
  id,
  allowTemplateUpload = true,
}) => {
  // 1. Extraer los datos dinámicos requeridos
  const resolvedNumeroCarton =
    numeroCarton ??
    (card as any)?.numeroCarton ??
    (card as any)?.cardNumber ??
    7811;

  const resolvedNumerosJuego: number[] =
    numerosJuego ??
    (card as any)?.numerosJuego ??
    (card as any)?.numbers ??
    [8, 13, 23, 35, 39, 50, 63, 66, 70, 85];

  const resolvedComprador: CompradorData = {
    nombreApellido:
      comprador?.nombreApellido ||
      (card as any)?.comprador?.nombreApellido ||
      (customer ? `${customer.name || ''} ${customer.lastname || ''}`.trim() : '') ||
      ((card as any)?.customer ? `${(card as any).customer.name || ''} ${(card as any).customer.lastname || ''}`.trim() : '') ||
      (card as any)?.clienteNombre ||
      '',
    dni:
      comprador?.dni ||
      (card as any)?.comprador?.dni ||
      customer?.dni ||
      (card as any)?.customer?.dni ||
      '',
    direccion:
      comprador?.direccion ||
      (card as any)?.comprador?.direccion ||
      customer?.address ||
      (card as any)?.customer?.address ||
      '',
    localidad:
      comprador?.localidad ||
      (card as any)?.comprador?.localidad ||
      customer?.city ||
      (card as any)?.customer?.city ||
      '',
    telefono:
      comprador?.telefono ||
      (card as any)?.comprador?.telefono ||
      customer?.phone ||
      (card as any)?.customer?.phone ||
      '',
  };

  // 2. Gestión de la plantilla de fondo (sin modificar la imagen)
  const [activeTemplate, setActiveTemplate] = useState<string>(() => {
    if (templateImageUrl) return templateImageUrl;
    const saved = localStorage.getItem('official_bingo_ticket_template');
    if (saved) return saved;
    return '/carton_template.png';
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar si cambia templateImageUrl prop
  useEffect(() => {
    if (templateImageUrl) {
      setActiveTemplate(templateImageUrl);
    }
  }, [templateImageUrl]);

  // Consultar al servidor si existe una plantilla fija cargada
  useEffect(() => {
    if (!templateImageUrl && !localStorage.getItem('official_bingo_ticket_template')) {
      fetch('/api/bingo/template')
        .then((r) => r.json())
        .then((data) => {
          if (data?.exists && data?.url) {
            setActiveTemplate(data.url);
            localStorage.setItem('official_bingo_ticket_template', data.url);
          }
        })
        .catch(() => {});
    }
  }, [templateImageUrl]);

  // Manejador para carga de archivo de plantilla original
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setActiveTemplate(base64);
        try {
          localStorage.setItem('official_bingo_ticket_template', base64);
          fetch('/api/bingo/template', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 }),
          }).catch(() => {});
        } catch {
          // localStorage quota
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Coordenadas proporcionales en porcentaje según las dimensiones exactas de la plantilla (1482 x 1061 px)
  // 1. Número de Cartón (área interior del rectángulo blanco que YA EXISTE en la imagen)
  const CARD_NUMBER_BOX = {
    left: '81.24%',
    top: '3.68%',
    width: '15.92%',
    height: '13.85%',
  };

  // Cuadro blanco superior izquierdo que YA EXISTE en la imagen original
  const CARD_NUMBER_BOX_LEFT = {
    left: '2.63%',
    top: '3.68%',
    width: '16.26%',
    height: '13.67%',
  };

  // 2. Fila de 10 Casillas de Juego (área interior de las casillas en la franja roja)
  const GAME_ROW_GRID = {
    left: '41.8%',
    top: '25.5%',
    width: '55.8%',
    height: '5.9%',
  };

  // 3. Datos del comprador en el sector izquierdo (franjas orientadas verticalmente)
  // Posiciones centradas de cada franja, con rotación -90deg para coincidir con la orientación de la imagen
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

  // Reducción automática de fuente únicamente dentro del campo si el texto es largo
  const getBuyerFontSize = (val?: string) => {
    const len = val ? val.length : 0;
    if (len > 35) return 'clamp(0.38rem, 0.85cqw, 0.75rem)';
    if (len > 25) return 'clamp(0.42rem, 0.98cqw, 0.88rem)';
    return 'clamp(0.48rem, 1.15cqw, 1.05rem)';
  };

  return (
    <div
      id={id || `bingo-card-${resolvedNumeroCarton}`}
      className={`bingo-card-container group relative w-full overflow-hidden select-none transition-all rounded-xl shadow-md print:shadow-none print:m-0 print:p-0 ${className} ${
        isDragOver ? 'ring-4 ring-amber-400 ring-offset-2' : ''
      }`}
      style={{
        aspectRatio: '1000 / 750',
        containerType: 'inline-size',
        backgroundColor: '#ffffff',
      }}
      onDragOver={(e) => {
        if (allowTemplateUpload) {
          e.preventDefault();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* =========================================================================
          PLANTILLA FIJA DE FONDO (IMAGEN ORIGINAL INALTERABLE)
          Conserva exactamente sus dimensiones, proporciones, logos, premios y textos
         ========================================================================= */}
      <img
        src={activeTemplate}
        alt={`Cartón Oficial de Bingo Nº ${resolvedNumeroCarton}`}
        className="w-full h-full object-cover block select-none pointer-events-none"
        referrerPolicy="no-referrer"
        onError={() => {
          // Si por alguna razón la imagen local falla, intenta con la ruta relativa pública
          if (activeTemplate !== '/carton_template.png') {
            setActiveTemplate('/carton_template.png');
          }
        }}
      />

      {/* =========================================================================
          ELEMENTO DINÁMICO 1: NÚMERO DE CARTÓN
          Superpuesto como texto puro sobre el rectángulo blanco existente en la imagen.
          Contenedor completamente transparente, sin ningún fondo blanco, borde,
          border-radius ni box-shadow.
         ========================================================================= */}
      <div
        className="numero-carton pointer-events-none"
        style={{
          position: 'absolute',
          left: CARD_NUMBER_BOX.left,
          top: CARD_NUMBER_BOX.top,
          width: CARD_NUMBER_BOX.width,
          height: CARD_NUMBER_BOX.height,
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
          {resolvedNumeroCarton}
        </span>
      </div>

      {/* =========================================================================
          ELEMENTO DINÁMICO: NÚMERO DE CARTÓN (CUADRO BLANCO SUPERIOR IZQUIERDO)
          Superpuesto como texto puro sobre el cuadro blanco existente en la imagen original.
          Contenedor completamente transparente, sin ningún fondo blanco, borde,
          border-radius ni box-shadow. Centrado horizontal y verticalmente.
         ========================================================================= */}
      <div
        className="numero-carton-izquierdo pointer-events-none"
        style={{
          position: 'absolute',
          left: CARD_NUMBER_BOX_LEFT.left,
          top: CARD_NUMBER_BOX_LEFT.top,
          width: CARD_NUMBER_BOX_LEFT.width,
          height: CARD_NUMBER_BOX_LEFT.height,
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
          {resolvedNumeroCarton}
        </span>
      </div>

      {/* =========================================================================
          ELEMENTO DINÁMICO 2: NÚMEROS DE JUEGO (10 CASILLAS SUPERIORES)
          UN SOLO contenedor absoluto que coincide con el área interior de las 10 casillas.
          Utiliza display: grid con 10 columnas iguales (repeat(10, 1fr)).
          Cada celda utiliza display: flex; align-items: center; justify-content: center;
          overflow: hidden; box-sizing: border-box; padding: 0; margin: 0;
          Números centrados horizontal y verticalmente sin tocar las líneas rojas.
         ========================================================================= */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: GAME_ROW_GRID.left,
          top: GAME_ROW_GRID.top,
          width: GAME_ROW_GRID.width,
          height: GAME_ROW_GRID.height,
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
        }}
      >
        {resolvedNumerosJuego.slice(0, 10).map((num, idx) => (
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
              className="text-black font-bold"
              style={{
                fontFamily: "Arial, Helvetica, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(0.5rem, 1.8cqw, 1.25rem)',
                lineHeight: 1,
              }}
            >
              {num}
            </span>
          </div>
        ))}
      </div>

      {/* =========================================================================
          ELEMENTO DINÁMICO 3: DATOS DEL COMPRADOR (LATERAL IZQUIERDO)
          Superpuesto como texto puro sobre los espacios y líneas de puntos de la imagen original.
          NO crea nuevos cuadros blancos, líneas, bordes, etiquetas ni fondos.
          Zonas transparentes con position: absolute, background: transparent, border: none,
          box-shadow: none, overflow: hidden, box-sizing: border-box.
          Rotación de textos: transform: rotate(-90deg) con transform-origin: center.
          - Nombre y Apellido -> nombreApellido
          - Dirección -> direccion
          - Localidad -> localidad
          - TEL./CEL. -> telefono
         ========================================================================= */}
      {resolvedComprador.nombreApellido && (
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

      {resolvedComprador.direccion && (
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

      {resolvedComprador.localidad && (
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

      {resolvedComprador.telefono && (
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

      {resolvedComprador.dni && (
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

      {/* Control discreto para reemplazar la plantilla si el usuario desea cargar una nueva foto */}
      {allowTemplateUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs pointer-events-auto flex items-center space-x-1.5 print:hidden">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-amber-400 cursor-pointer"
            >
              Cambiar imagen de plantilla
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BingoCard;
