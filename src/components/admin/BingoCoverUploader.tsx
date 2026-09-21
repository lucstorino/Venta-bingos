import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, Link, Sparkles, Check } from 'lucide-react';

interface BingoCoverUploaderProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
}

const PRESET_COVERS = [
  {
    name: 'Casa a estrenar',
    url: '/src/assets/images/bingo_casa_card_1789819899795.jpg',
  },
  {
    name: 'Auto 0 km',
    url: '/src/assets/images/bingo_auto_card_1789819914970.jpg',
  },
  {
    name: 'Viaje a Punta Cana',
    url: '/src/assets/images/bingo_viaje_card_1789819936993.jpg',
  },
];

export const BingoCoverUploader: React.FC<BingoCoverUploaderProps> = ({
  currentImageUrl,
  onImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setErrorNotice(null);
    if (!file.type.startsWith('image/')) {
      setErrorNotice('El archivo seleccionado no es una imagen válida.');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorNotice('La imagen supera los 5MB permitidos.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageChange(result);
      }
    };
    reader.onerror = () => {
      setErrorNotice('Error al leer el archivo.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    onImageChange(urlInput.trim());
    setUrlInput('');
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          Foto de Portada del Bingo (Cover Image)
        </label>
        <span className="text-[11px] text-slate-400">
          Recomendado: 16:9 o 16:10 (PNG, JPG o WebP)
        </span>
      </div>

      {/* Main Preview and Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Current Preview / Dropzone */}
        <div className="md:col-span-8">
          {currentImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group aspect-[16/9]">
              <img
                src={currentImageUrl}
                alt="Portada del Bingo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Cambiar foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => onImageChange('')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Quitar</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-amber-400 bg-slate-950 hover:bg-slate-950/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[16/9] group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-amber-400/10 text-slate-400 group-hover:text-amber-400 flex items-center justify-center mb-3 transition-colors">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-white mb-1">
                Hacé clic o arrastrá la foto de portada aquí
              </p>
              <p className="text-xs text-slate-400 max-w-xs">
                Sube la foto del premio principal (auto, casa, viaje) para mostrarla en la portada y tarjetas.
              </p>
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
            <p className="text-xs text-rose-400 font-semibold mt-2">
              {errorNotice}
            </p>
          )}
        </div>

        {/* Right: Quick actions & Presets */}
        <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700 transition-all"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Subir desde mi computadora</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-700/80 transition-all"
            >
              <Link className="w-4 h-4 text-blue-400" />
              <span>{showUrlInput ? 'Cerrar enlace URL' : 'Pegar enlace de imagen URL'}</span>
            </button>

            {showUrlInput && (
              <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="url"
                  placeholder="https://ejemplo.com/foto-bingo.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors"
                >
                  Usar esta URL
                </button>
              </div>
            )}
          </div>

          {/* Quick Preset Gallery */}
          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Portadas sugeridas:</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_COVERS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onImageChange(preset.url)}
                  className={`group relative rounded-lg overflow-hidden border transition-all aspect-video ${
                    currentImageUrl === preset.url
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                  title={preset.name}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  {currentImageUrl === preset.url && (
                    <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
