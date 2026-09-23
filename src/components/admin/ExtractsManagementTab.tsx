import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  PlusCircle,
  Eye,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  PastBingoItem,
  getStoredPastBingos,
  saveStoredPastBingos,
  updatePastBingoExtract,
  addOrUpdatePastBingo,
  resetPastBingosToDefault,
} from '../../data/pastBingos';
import { useBingo } from '../../context/BingoContext';

interface ExtractsManagementTabProps {
  onGoToHome?: () => void;
}

export const ExtractsManagementTab: React.FC<ExtractsManagementTabProps> = ({ onGoToHome }) => {
  const { bingos, bingo: currentActiveBingo } = useBingo();
  const [pastBingos, setPastBingos] = useState<PastBingoItem[]>([]);
  const [selectedBingoId, setSelectedBingoId] = useState<string>('');
  const [currentExtractUrl, setCurrentExtractUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // New bingo form modal/section
  const [showNewBingoForm, setShowNewBingoForm] = useState(false);
  const [newBingoName, setNewBingoName] = useState('');
  const [newBingoDate, setNewBingoDate] = useState('');
  const [newBingoTime, setNewBingoTime] = useState('18:00 hs');
  const [newBingoFlyer, setNewBingoFlyer] = useState('');
  const [newBingoExtract, setNewBingoExtract] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newExtractFileInputRef = useRef<HTMLInputElement>(null);
  const newFlyerFileInputRef = useRef<HTMLInputElement>(null);

  // Load past bingos on mount and on storage change
  useEffect(() => {
    const list = getStoredPastBingos();
    setPastBingos(list);
    if (list.length > 0 && !selectedBingoId) {
      setSelectedBingoId(list[0].id);
      setCurrentExtractUrl(list[0].extractoImage || '/extracto_oficial_ejemplo.svg');
      setUrlInput(list[0].extractoImage || '');
    }
  }, []);

  // Update selected bingo data when selection changes
  const handleSelectBingo = (id: string) => {
    setSelectedBingoId(id);
    const found = pastBingos.find((b) => b.id === id);
    if (found) {
      setCurrentExtractUrl(found.extractoImage || '/extracto_oficial_ejemplo.svg');
      setUrlInput(found.extractoImage || '');
      setSuccessMessage(null);
    }
  };

  const selectedBingo = pastBingos.find((b) => b.id === selectedBingoId);

  // Handle image file upload
  const processImageFile = (file: File, callback: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }
    // Limit to 5MB to avoid storage quota issues
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        callback(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => {
        setCurrentExtractUrl(dataUrl);
        setUrlInput(dataUrl);
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file, (dataUrl) => {
        setCurrentExtractUrl(dataUrl);
        setUrlInput(dataUrl);
      });
    }
  };

  const handleSaveExtract = () => {
    if (!selectedBingoId) {
      alert('Por favor selecciona un bingo primero.');
      return;
    }
    const finalUrl = currentExtractUrl || urlInput || '/extracto_oficial_ejemplo.svg';
    const updated = updatePastBingoExtract(selectedBingoId, finalUrl);
    setPastBingos(updated);
    setSuccessMessage(`¡Extracto oficial para "${selectedBingo?.name}" guardado y publicado con éxito! Ya se encuentra visible en la página inicial.`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);
  };

  const handleResetToDefault = () => {
    if (confirm('¿Restaurar el extracto de este bingo al extracto gráfico oficial de ejemplo?')) {
      const defaultUrl = '/extracto_oficial_ejemplo.svg';
      setCurrentExtractUrl(defaultUrl);
      setUrlInput(defaultUrl);
      if (selectedBingoId) {
        const updated = updatePastBingoExtract(selectedBingoId, defaultUrl);
        setPastBingos(updated);
        setSuccessMessage('Extracto restaurado al valor oficial por defecto.');
      }
    }
  };

  // Import an active bingo into past bingos to upload its extract
  const handleImportActiveBingo = (bingoToImport: any) => {
    const existing = pastBingos.find((b) => b.id === `past-${bingoToImport.id}` || b.name === (bingoToImport.name || bingoToImport.title));
    if (existing) {
      handleSelectBingo(existing.id);
      return;
    }

    const newItem: PastBingoItem = {
      id: `past-${bingoToImport.id}`,
      name: bingoToImport.name || bingoToImport.title || 'Sorteo Oficial',
      drawDate: bingoToImport.drawDate || bingoToImport.date || new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
      drawTime: bingoToImport.drawTime || '18:00 hs',
      image: bingoToImport.imageUrl || '/src/assets/images/bingo_casa_card_1789819899795.jpg',
      extractoImage: '/extracto_oficial_ejemplo.svg',
      mainPrize: bingoToImport.prizes?.[0]?.name || 'Premios Oficiales',
      totalPrizes: '$ 50.000.000 en Premios',
      location: bingoToImport.location || 'Sede Oficial',
    };

    const updated = addOrUpdatePastBingo(newItem);
    setPastBingos(updated);
    setSelectedBingoId(newItem.id);
    setCurrentExtractUrl(newItem.extractoImage || '/extracto_oficial_ejemplo.svg');
    setUrlInput(newItem.extractoImage || '');
    setSuccessMessage(`¡Bingo "${newItem.name}" agregado a sorteos para cargar su extracto!`);
  };

  // Create new custom past bingo
  const handleCreateNewBingoWithExtract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBingoName.trim()) {
      alert('Por favor ingresa el nombre del sorteo.');
      return;
    }

    const newItem: PastBingoItem = {
      id: `past-bingo-${Date.now()}`,
      name: newBingoName.trim(),
      drawDate: newBingoDate.trim() || new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
      drawTime: newBingoTime.trim() || '18:00 hs',
      image: newBingoFlyer || '/src/assets/images/bingo_casa_card_1789819899795.jpg',
      extractoImage: newBingoExtract || '/extracto_oficial_ejemplo.svg',
      totalPrizes: 'Premios Oficiales Entregados',
    };

    const updated = addOrUpdatePastBingo(newItem);
    setPastBingos(updated);
    setSelectedBingoId(newItem.id);
    setCurrentExtractUrl(newItem.extractoImage || '/extracto_oficial_ejemplo.svg');
    setUrlInput(newItem.extractoImage || '');
    setShowNewBingoForm(false);
    setNewBingoName('');
    setNewBingoDate('');
    setNewBingoFlyer('');
    setNewBingoExtract('');
    setSuccessMessage(`¡Sorteo "${newItem.name}" creado y publicado en la página inicial!`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white tracking-tight">
                  Carga & Gestión de Extractos Oficiales
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Visible en Inicio
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                Carga la imagen oficial del extracto (números ganadores, premios y resoluciones) para cada bingo.
                Los usuarios podrán consultar el extracto de inmediato haciendo clic en <strong>"Ver extracto"</strong> en la sección de <em>Sorteos anteriores</em> de la página inicial.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNewBingoForm(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar Nuevo Sorteo</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
            {onGoToHome && (
              <button
                type="button"
                onClick={onGoToHome}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition-colors"
              >
                <span>Ver en Inicio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Left Selector, Right Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Bingo Selection */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <span>1. Elegir Sorteo</span>
                <span className="text-xs font-semibold text-slate-400">({pastBingos.length})</span>
              </h4>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Selecciona el bingo al que le deseas cargar o cambiar la imagen de extracto:
            </p>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {pastBingos.map((b) => {
                const isSelected = b.id === selectedBingoId;
                const hasCustomExtract = b.extractoImage && b.extractoImage !== '/extracto_oficial_ejemplo.svg';

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectBingo(b.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center space-x-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-sm shadow-amber-500/5'
                        : 'bg-slate-850/60 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img
                        src={b.image}
                        alt={b.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                          {b.name}
                        </span>
                        {hasCustomExtract && (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Extracto personalizado cargado" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{b.drawDate}</span>
                      </div>
                      <span className="inline-block text-[10px] text-slate-500 mt-0.5">
                        {hasCustomExtract ? '✓ Extracto Cargado' : 'Extracto Ejemplo'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick import from active bingos if any */}
            {bingos && bingos.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Bingos del Sistema
                </span>
                <div className="space-y-1.5">
                  {bingos.map((activeB) => (
                    <button
                      key={activeB.id}
                      type="button"
                      onClick={() => handleImportActiveBingo(activeB)}
                      className="w-full text-left px-2.5 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white flex items-center justify-between border border-slate-800 transition-colors"
                    >
                      <span className="truncate">{activeB.name}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold shrink-0 ml-2">+ Cargar extracto</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Extract Image Uploader & Preview */}
        <div className="lg:col-span-8 space-y-6">
          {selectedBingo ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
              
              {/* Selected Bingo Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={selectedBingo.image}
                      alt={selectedBingo.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      Sorteo Seleccionado
                    </span>
                    <h4 className="text-lg font-black text-white mt-1">
                      {selectedBingo.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Fecha del sorteo: {selectedBingo.drawDate} {selectedBingo.drawTime ? `• ${selectedBingo.drawTime}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs transition-colors border border-slate-700"
                    title="Restaurar a la imagen de ejemplo"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    <span>Restaurar Ejemplo</span>
                  </button>
                </div>
              </div>

              {/* UPLOAD SECTION: Drag and drop or browse */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Cargar Imagen del Extracto Oficial
                </label>
                
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-850/60 hover:border-emerald-500/50 hover:bg-slate-800/80'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Haz clic para seleccionar o arrastra la imagen del extracto aquí
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Formatos soportados: JPG, PNG, WEBP (hasta 5MB)
                      </p>
                    </div>
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Examinar en mi dispositivo</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Alternative: Direct URL */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  O pegar enlace / URL directa de la imagen:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setCurrentExtractUrl(e.target.value);
                    }}
                    placeholder="https://ejemplo.com/extracto.jpg o /mi_extracto.png"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (urlInput) setCurrentExtractUrl(urlInput);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                  >
                    Cargar
                  </button>
                </div>
              </div>

              {/* LIVE EXTRACT PREVIEW */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Vista Previa del Extracto en la Web
                    </span>
                  </div>
                  <a
                    href={currentExtractUrl || '/extracto_oficial_ejemplo.svg'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <span>Abrir tamaño completo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 sm:p-5 flex flex-col items-center justify-center min-h-[300px] overflow-hidden relative group">
                  <img
                    src={currentExtractUrl || '/extracto_oficial_ejemplo.svg'}
                    alt="Vista previa de extracto"
                    className="max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.01]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 font-medium">
                    {selectedBingo.name}
                  </div>
                </div>
              </div>

              {/* SAVE ACTION BUTTON */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Al guardar, el extracto queda publicado inmediatamente en la página inicial.</span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveExtract}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar y Publicar Extracto</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold">Selecciona un bingo de la izquierda para cargar su extracto.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: AGREGAR NUEVO SORTEO */}
      {showNewBingoForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-white mb-2">
              Publicar Nuevo Sorteo Finalizado
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Ingresa los datos del bingo que acaba de finalizar para que aparezca con su extracto en la sección de sorteos anteriores.
            </p>

            <form onSubmit={handleCreateNewBingoWithExtract} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nombre del Sorteo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 15º Gran Bingo Primavera"
                  value={newBingoName}
                  onChange={(e) => setNewBingoName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Fecha del Sorteo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 21 de Septiembre 2026"
                    value={newBingoDate}
                    onChange={(e) => setNewBingoDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Hora
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 18:00 hs"
                    value={newBingoTime}
                    onChange={(e) => setNewBingoTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Imagen / Flyer del Sorteo (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL o sube una imagen..."
                    value={newBingoFlyer}
                    onChange={(e) => setNewBingoFlyer(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="file"
                    ref={newFlyerFileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processImageFile(file, (url) => setNewBingoFlyer(url));
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => newFlyerFileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
                  >
                    Subir
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Imagen del Extracto Oficial
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="URL o sube el extracto..."
                    value={newBingoExtract}
                    onChange={(e) => setNewBingoExtract(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="file"
                    ref={newExtractFileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processImageFile(file, (url) => setNewBingoExtract(url));
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => newExtractFileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
                  >
                    Subir
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewBingoForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow"
                >
                  Publicar Sorteo y Extracto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
