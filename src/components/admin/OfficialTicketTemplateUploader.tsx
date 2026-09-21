import React, { useRef, useState } from 'react';
import { Upload, Camera, Trash2, CheckCircle2, AlertCircle, ShieldCheck, FileCheck } from 'lucide-react';
import { OfficialBingoTicket } from '../sales/OfficialBingoTicket';
import { Bingo, BingoCard } from '../../types';

interface OfficialTicketTemplateUploaderProps {
  currentTemplateUrl?: string;
  onTemplateChange: (url: string) => void;
  bingo: Bingo;
}

// Sample dummy card to showcase numbers overlay
const SAMPLE_CARD: BingoCard = {
  id: 'sample-admin-card',
  bingoId: 'active-bingo',
  cardNumber: 7811,
  numbers: [8, 13, 23, 35, 39, 50, 63, 66, 70, 85],
  status: 'AVAILABLE',
};

export const OfficialTicketTemplateUploader: React.FC<OfficialTicketTemplateUploaderProps> = ({
  currentTemplateUrl,
  onTemplateChange,
  bingo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setErrorNotice(null);
    setSuccessNotice(null);

    if (!file.type.startsWith('image/')) {
      setErrorNotice('El archivo seleccionado debe ser una imagen (JPG, PNG, WebP).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (!base64) {
        setErrorNotice('No se pudo procesar la imagen.');
        setIsUploading(false);
        return;
      }

      try {
        // 1. Save locally in localStorage
        localStorage.setItem('official_bingo_ticket_template', base64);
        
        // 2. Persist to backend server so it is shared across all buyers and PDF exports
        await fetch('/api/bingo/template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        onTemplateChange(base64);
        setSuccessNotice('¡Plantilla oficial cargada exitosamente! Ahora todos los cartones y envíos PDF usan esta imagen oficial con los números dinámicos.');
        setTimeout(() => setSuccessNotice(null), 5000);
      } catch (err) {
        console.error('Error saving template:', err);
        onTemplateChange(base64);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setErrorNotice('Error al leer el archivo.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveTemplate = () => {
    localStorage.removeItem('official_bingo_ticket_template');
    onTemplateChange('');
    setSuccessNotice('Se restableció la plantilla oficial vectorizada de alta fidelidad.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <label className="block text-sm font-bold text-white">
              Plantilla Oficial del Cartón de Juego (<span className="font-mono text-amber-300">carton_7811_imprimible.jpg</span>)
            </label>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            El diseño físico, logos (GYT, JCI), resolución ENREJA y los 8 premios quedan <strong>fijos e inalterables</strong>. El sistema sólo estampa el número de cartón y los 10 números de juego de cada comprador.
          </p>
        </div>

        {currentTemplateUrl && (
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[11px] font-bold text-emerald-400 shrink-0">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Plantilla Fotográfica Activa</span>
          </div>
        )}
      </div>

      {errorNotice && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Upload and Control Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <span className="font-semibold text-white">Archivo base del cartón:</span>
          <span className="text-slate-400">
            {currentTemplateUrl ? 'Imagen JPG personalizada en uso' : 'Vector HD oficial de alta fidelidad'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{currentTemplateUrl ? 'Reemplazar Imagen Oficial' : 'Cargar carton_7811_imprimible.jpg'}</span>
          </button>

          {currentTemplateUrl && (
            <button
              type="button"
              onClick={handleRemoveTemplate}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/80 hover:text-red-300 text-slate-300 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Usar Vector HD</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Preview Container with Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-x-auto"
      >
        <div className="w-full max-w-2xl">
          <OfficialBingoTicket
            card={SAMPLE_CARD}
            bingo={bingo}
            templateImageUrl={currentTemplateUrl}
            showUploader={false}
            allowInteractivePlay={false}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-2 text-center">
          Vista previa del cartón impreso: Los números de la muestra (Nº 7811 y los 10 casilleros rojos) cambian dinámicamente para cada comprador.
        </p>
      </div>
    </div>
  );
};
