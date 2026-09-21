import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  MessageCircle,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  X,
} from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { Bingo, BingoStatus } from '../../types';
import { BingoCoverUploader } from './BingoCoverUploader';
import { OfficialTicketTemplateUploader } from './OfficialTicketTemplateUploader';

const createDefaultBingoData = (index: number): Bingo => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 15 + index * 5);
  const dateStr = futureDate.toISOString().split('T')[0];

  return {
    id: `bingo-${Date.now()}-${index}`,
    name: `Nuevo Gran Bingo #${index + 1}`,
    description: '¡Participa por increíbles premios oficiales en efectivo y vehículos 0KM! Transmisión en directo.',
    drawDate: dateStr,
    drawTime: '18:00',
    price: 2500,
    currency: 'ARS',
    status: 'ACTIVE',
    reservationDurationMinutes: 10,
    location: 'Sede Central - Transmisión en Vivo',
    organizer: 'CLUB DE GIMNASIA Y TIRO DE SALTA',
    termsAndConditions: 'Sorteo oficial con bolillero y escribano público matriculado.',
    imageUrl: '/src/assets/images/bingo_casa_card_1789819899795.jpg',
    ticketTemplateImage: '/src/assets/images/carton_7811_imprimible.jpg',
    supportWhatsapp: '+54 9 387 421-5005',
    supportHours: 'Lunes a Sábados de 09:00 a 20:00 hs',
    ticketEditionTitle: '16º BINGO MONUMENTAL',
    ticketDrawDateText: `SORTEA: ${dateStr} - 18:00 HS`,
    ticketResolutionText: 'Autorizado por EN.RE.JA Resolución Nº 191/26',
    ticketOrganizerTitle: 'CLUB DE GIMNASIA Y TIRO DE SALTA',
    ticketOrganizerContact: 'Vicente Lopez 670 | Tel: (0387) 432 0554',
  };
};

export const BingoConfigTab: React.FC = () => {
  const {
    bingos,
    activeBingoId,
    setActiveBingoId,
    createBingo,
    updateBingo,
    deleteBingo,
  } = useBingo();

  const [selectedBingoId, setSelectedBingoId] = useState<string>(activeBingoId || (bingos[0] ? bingos[0].id : ''));
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Active form data
  const currentBingo = bingos.find((b) => b.id === selectedBingoId) || bingos[0];

  const [formData, setFormData] = useState<Bingo>(() => {
    return currentBingo || createDefaultBingoData(0);
  });

  // When switching selected bingo or when bingos update
  useEffect(() => {
    if (!isCreatingNew && currentBingo) {
      setFormData(currentBingo);
    }
  }, [selectedBingoId, bingos, isCreatingNew]);

  const handleStartCreateNew = () => {
    const newBingoDraft = createDefaultBingoData(bingos.length);
    setFormData(newBingoDraft);
    setIsCreatingNew(true);
  };

  const handleCancelCreateNew = () => {
    setIsCreatingNew(false);
    if (currentBingo) {
      setFormData(currentBingo);
    }
  };

  const handleSelectToEdit = (bingoId: string) => {
    setIsCreatingNew(false);
    setSelectedBingoId(bingoId);
  };

  const handleDelete = (id: string, name: string) => {
    if (bingos.length <= 1) {
      alert('Debe haber al menos un bingo registrado en el sistema.');
      return;
    }
    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar el bingo "${name}"?`);
    if (confirmed) {
      deleteBingo(id);
      if (selectedBingoId === id) {
        const remaining = bingos.filter((b) => b.id !== id);
        if (remaining.length > 0) {
          setSelectedBingoId(remaining[0].id);
        }
      }
      setSavedSuccess('Bingo eliminado exitosamente');
      setTimeout(() => setSavedSuccess(null), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingNew) {
      const created = createBingo(formData);
      setIsCreatingNew(false);
      setSelectedBingoId(created.id);
      setSavedSuccess('¡Nuevo bingo creado y publicado exitosamente!');
    } else {
      updateBingo(formData, formData.id);
      setSavedSuccess('¡Configuración del bingo guardada exitosamente!');
    }
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white">Gestión y Configuración de Bingos</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Crea, edita y administra múltiples bingos oficiales. Cada uno tiene su imagen oficial, fecha, precio y cartones.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreateNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Bingo</span>
        </button>
      </div>

      {/* Notification Toast */}
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{savedSuccess}</span>
        </div>
      )}

      {/* Bingos Carousel/Selector List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Bingos Disponibles en el Sistema</span>
            <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded-full text-[11px] font-mono">
              {bingos.length}
            </span>
          </h4>
          <span className="text-[11px] text-slate-400">
            Haz clic en <strong className="text-slate-200">"Editar"</strong> para modificar sus datos o en <strong className="text-slate-200">"Principal"</strong> para destacarlo en portada.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {bingos.map((b) => {
            const isCurrentEditing = !isCreatingNew && selectedBingoId === b.id;
            const isCurrentActive = activeBingoId === b.id;

            return (
              <div
                key={b.id}
                className={`relative rounded-xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 border ${
                  isCurrentEditing
                    ? 'bg-slate-850 border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Status Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {isCurrentActive && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Principal en Portada
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium">
                      {b.status || 'ACTIVE'}
                    </span>
                  </div>

                  {bingos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.name)}
                      title="Eliminar este bingo"
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Info preview */}
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {b.imageUrl ? (
                      <img
                        src={b.imageUrl}
                        alt={b.name}
                        className="w-full h-full object-contain p-1"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Layers className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-sm font-bold text-white truncate" title={b.name}>
                      {b.name}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {b.drawDate || 'Fecha a definir'}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-amber-400">
                        ${(b.price || 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectToEdit(b.id)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors text-center ${
                      isCurrentEditing
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {isCurrentEditing ? 'Editando Ahora' : 'Editar Datos'}
                  </button>

                  {!isCurrentActive && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBingoId(b.id);
                        setSavedSuccess(`"${b.name}" establecido como Bingo Principal`);
                        setTimeout(() => setSavedSuccess(null), 3000);
                      }}
                      title="Establecer como bingo principal"
                      className="py-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                    >
                      Hacer Principal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editing / Creating Form Section */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Form header indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                isCreatingNew
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {isCreatingNew ? 'Modo Creación' : 'Modo Edición'}
              </span>
              <h4 className="text-base font-bold text-white">
                {isCreatingNew ? 'Creando Nuevo Bingo Oficial' : `Editando: ${formData.name}`}
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Modifica la imagen oficial, el precio del cartón, horarios y reglas específicas de este sorteo.
            </p>
          </div>

          {isCreatingNew && (
            <button
              type="button"
              onClick={handleCancelCreateNew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancelar Creación</span>
            </button>
          )}
        </div>

        {/* Foto de Portada del Bingo (Upload / Change) */}
        <div className="pb-6 border-b border-slate-800">
          <BingoCoverUploader
            currentImageUrl={formData.imageUrl}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          />
        </div>

        {/* Plantilla Oficial del Cartón de Juego */}
        <div className="pb-6 border-b border-slate-800">
          <OfficialTicketTemplateUploader
            currentTemplateUrl={formData.ticketTemplateImage}
            onTemplateChange={(url) => setFormData({ ...formData, ticketTemplateImage: url })}
            bingo={formData}
          />
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre del Evento */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre Oficial del Bingo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              placeholder="Ej: 16º Gran Bingo Monumental 2026"
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción e Información General
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              placeholder="Detalla los premios principales y la transmisión..."
            />
          </div>

          {/* Fecha del sorteo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fecha del Sorteo *
            </label>
            <input
              type="date"
              required
              value={formData.drawDate}
              onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Hora del sorteo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Hora del Sorteo (HH:mm) *
            </label>
            <input
              type="time"
              required
              value={formData.drawTime}
              onChange={(e) => setFormData({ ...formData, drawTime: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Precio del cartón */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Precio Oficial por Cartón ($ ARS) *
            </label>
            <input
              type="number"
              min="100"
              step="50"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          {/* Duración de Reserva Temporal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tiempo de Reserva Temporal (Minutos) *
            </label>
            <input
              type="number"
              min="1"
              max="60"
              required
              value={formData.reservationDurationMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reservationDurationMinutes: parseInt(e.target.value, 10) || 10,
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Recomendado: 10 min. Tiempo máximo que un cartón queda bloqueado mientras el cliente paga.
            </p>
          </div>

          {/* Estado del Bingo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Estado del Bingo *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as BingoStatus })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ACTIVE">ACTIVE (En venta público)</option>
              <option value="SCHEDULED">SCHEDULED (Programado / Próximamente)</option>
              <option value="DRAFT">DRAFT (Borrador interno)</option>
              <option value="FINISHED">FINISHED (Sorteado / Finalizado)</option>
              <option value="CANCELLED">CANCELLED (Cancelado)</option>
            </select>
          </div>

          {/* Ubicación / Transmisión */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lugar / Vía de Transmisión
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej. Transmisión en vivo por YouTube y Facebook Live"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Términos y Condiciones */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bases, Condiciones y Validez Legal
            </label>
            <textarea
              rows={3}
              value={formData.termsAndConditions || ''}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Sección de Diseño y Plantilla Oficial de Cartón */}
          <div className="md:col-span-2 p-4 sm:p-5 bg-slate-950/80 border border-blue-800/60 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Diseño y Datos Impresos en el Cartón Oficial (PDF)</h4>
                <p className="text-[11px] text-slate-400">
                  Personalizá los datos que se imprimen en el cartón oficial descargable por los compradores.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1">
                  Título de la Edición del Bingo
                </label>
                <input
                  type="text"
                  value={formData.ticketEditionTitle || ''}
                  onChange={(e) => setFormData({ ...formData, ticketEditionTitle: e.target.value })}
                  placeholder="Ej: 16º BINGO MONUMENTAL"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1">
                  Texto de Sorteo y Fecha
                </label>
                <input
                  type="text"
                  value={formData.ticketDrawDateText || ''}
                  onChange={(e) => setFormData({ ...formData, ticketDrawDateText: e.target.value })}
                  placeholder="Ej: SORTEA: DOMINGO 15 DE MARZO - 15:00 HS"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-blue-300 mb-1">
                  Resolución y Autorización Oficial
                </label>
                <input
                  type="text"
                  value={formData.ticketResolutionText || ''}
                  onChange={(e) => setFormData({ ...formData, ticketResolutionText: e.target.value })}
                  placeholder="Ej: Autorizado por EN.RE.JA Resolución Nº 191/26"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1">
                  Club o Entidad Organizadora
                </label>
                <input
                  type="text"
                  value={formData.ticketOrganizerTitle || ''}
                  onChange={(e) => setFormData({ ...formData, ticketOrganizerTitle: e.target.value })}
                  placeholder="Ej: CLUB DE GIMNASIA Y TIRO DE SALTA"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-300 mb-1">
                  Dirección y Contacto del Organizador
                </label>
                <input
                  type="text"
                  value={formData.ticketOrganizerContact || ''}
                  onChange={(e) => setFormData({ ...formData, ticketOrganizerContact: e.target.value })}
                  placeholder="Ej: Vicente Lopez 670 | Tel: (0387) 432 0554"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Atención al Cliente / WhatsApp */}
          <div className="md:col-span-2 p-4 bg-slate-950/80 border border-emerald-800/60 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Canal de Atención al Cliente (WhatsApp)</h4>
                <p className="text-[11px] text-slate-400">
                  Número al que los compradores pueden escribir para resolver dudas sobre este bingo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Número de WhatsApp *
                </label>
                <input
                  type="text"
                  value={formData.supportWhatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, supportWhatsapp: e.target.value })}
                  placeholder="Ej: +54 9 387 421-5005"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  Horarios de Atención
                </label>
                <input
                  type="text"
                  value={formData.supportHours || ''}
                  onChange={(e) => setFormData({ ...formData, supportHours: e.target.value })}
                  placeholder="Ej: Lunes a Sábados de 09:00 a 20:00 hs"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          {isCreatingNew && (
            <button
              type="button"
              onClick={handleCancelCreateNew}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isCreatingNew ? 'Crear y Publicar Bingo' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
