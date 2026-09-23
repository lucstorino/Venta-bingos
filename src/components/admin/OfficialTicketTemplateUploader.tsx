import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
  Trash2,
  Loader2,
  CloudCheck,
  ExternalLink,
} from 'lucide-react';
import { OfficialBingoTicket } from '../sales/OfficialBingoTicket';
import { Bingo, BingoCard } from '../../types';
import { uploadBingoImage, deleteBingoImage } from '../../services/firebaseBingoStorageService';

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileSelect = async (file: File) => {
    setErrorNotice(null);
    setSuccessNotice(null);

    if (!file.type.startsWith('image/')) {
      setErrorNotice('El archivo seleccionado debe ser una imagen (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorNotice('La imagen supera los 15MB permitidos.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Subir físicamente a Firebase Storage en: bingos/{bingo.id}/template.ext
      const { url } = await uploadBingoImage(bingo.id || 'bingo-oficial-2026', 'template', file);

      // 2. Notificar cambio con la URL permanente
      onTemplateChange(url);
      setSuccessNotice('¡Plantilla guardada permanentemente en Firebase Storage!');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error('Error subiendo plantilla a Firebase Storage:', err);
      setErrorNotice(err.message || 'Error al guardar en Firebase Storage.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('¿Deseas quitar la plantilla oficial de este bingo?')) return;
    setIsUploading(true);
    try {
      if (bingo.id) {
        await deleteBingoImage(bingo.id, 'template');
      }
      onTemplateChange('');
      setSuccessNotice('Plantilla removida.');
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      setErrorNotice(err.message || 'Error al remover plantilla');
    } finally {
      setIsUploading(false);
    }
  };

  const isFirebaseStored = currentTemplateUrl && currentTemplateUrl.includes('firebasestorage.googleapis.com');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>3. Plantilla Oficial de Fondo del Cartón (Ticket Template)</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Imagen oficial sobre la cual se imprimen los números, código de barras y datos del comprador en el PDF descargable.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isFirebaseStored && (
            <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md font-semibold">
              <CloudCheck className="w-3 h-3 text-emerald-400" />
              <span>Permanente en Firebase</span>
            </span>
          )}
          {currentTemplateUrl && (
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver simulación con números</span>
            </button>
          )}
        </div>
      </div>

      {/* Main container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left preview / upload area */}
        <div className="md:col-span-8">
          {currentTemplateUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 group">
              <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  src={currentTemplateUrl}
                  alt="Plantilla oficial"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Cambiar en Storage</span>
                  </button>
                  <a
                    href={currentTemplateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center space-x-1 transition-all"
                    title="Ver archivo original"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleRemove}
                    className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Quitar</span>
                  </button>
                </div>

                {isUploading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-xs font-bold text-white">Subiendo plantilla a Firebase Storage...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-400 bg-slate-950 hover:bg-slate-950/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[2/1] group"
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs font-bold text-white">Subiendo plantilla a Firebase Storage...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-blue-400/10 text-slate-400 group-hover:text-blue-400 flex items-center justify-center mb-2 transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white mb-0.5">
                    Hacé clic para subir la plantilla oficial del cartón
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Recomendado: Imagen horizontal de alta resolución (2000x1000 px, PNG o JPG). Se guardará en Firebase Storage: bingos/{bingo.id}/template.ext
                  </p>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {errorNotice && (
            <p className="text-xs text-rose-400 font-semibold mt-2 flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorNotice}</span>
            </p>
          )}

          {successNotice && (
            <p className="text-xs text-emerald-300 font-semibold mt-2 flex items-center space-x-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </p>
          )}
        </div>

        {/* Right info */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 space-y-2">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-400" />
              Fondo Oficial para Descargas
            </h5>
            <p className="text-[11px] leading-relaxed">
              Esta imagen sirve como fondo oficial al emitir cartones. El sistema estampará sobre ella el número de cartón, bolillas y datos de fiscalización en tiempo real.
            </p>
            <p className="text-[11px] text-emerald-400/90 font-medium">
              Almacenamiento seguro en Firebase Storage para descargas permanentes.
            </p>
          </div>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center space-x-2 border border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>{currentTemplateUrl ? 'Subir nueva plantilla' : 'Cargar plantilla desde PC'}</span>
          </button>
        </div>
      </div>

      {/* Modal Preview */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-400" />
                <span>Simulación de Cartón Oficial con Plantilla de Firebase</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950 p-2">
              <OfficialBingoTicket
                card={SAMPLE_CARD}
                bingo={bingo}
                templateImageUrl={currentTemplateUrl}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
