import React, { useState } from 'react';
import { Trophy, Plus, Edit2, Trash2, CheckCircle2, DollarSign, Car, Gift, Home } from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { Prize } from '../../types';

export const PrizesManagementTab: React.FC = () => {
  const { prizes, addPrize, updatePrize, deletePrize } = useBingo();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingPrizeId, setEditingPrizeId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    amount: number;
    order: number;
    iconType: Prize['iconType'];
  }>({
    name: '',
    description: '',
    amount: 1000000,
    order: prizes.length + 1,
    iconType: 'trophy',
  });

  const handleOpenNew = () => {
    setIsEditing(true);
    setEditingPrizeId(null);
    setForm({
      name: '',
      description: '',
      amount: 500000,
      order: prizes.length + 1,
      iconType: 'trophy',
    });
  };

  const handleOpenEdit = (prize: Prize) => {
    setIsEditing(true);
    setEditingPrizeId(prize.id);
    setForm({
      name: prize.name,
      description: prize.description,
      amount: prize.amount || 0,
      order: prize.order,
      iconType: prize.iconType || 'trophy',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingPrizeId) {
      updatePrize(editingPrizeId, form);
    } else {
      addPrize(form);
    }

    setIsEditing(false);
    setEditingPrizeId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este premio?')) {
      deletePrize(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white">Gestión de Premios del Bingo</h3>
          <p className="text-xs text-slate-400">
            Configura los premios que se exhiben en el portal público y se sortean en el evento.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Premio</span>
        </button>
      </div>

      {/* Editor Modal / Card */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-slate-900 border border-amber-500/50 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-bold text-amber-400">
            {editingPrizeId ? 'Editar Premio' : 'Agregar Nuevo Premio'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Premio *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. 1º Premio: Auto 0KM"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Orden de Sorteo (1, 2, 3...) *</label>
              <input
                type="number"
                min="1"
                required
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Estimado ($ ARS)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Ícono</label>
              <select
                value={form.iconType}
                onChange={(e) => setForm({ ...form, iconType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="trophy">Trofeo / Copa</option>
                <option value="car">Automóvil / Moto</option>
                <option value="cash">Dinero en Efectivo</option>
                <option value="gift">Regalo / Obsequio</option>
                <option value="home">Hogar / Tecnología</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción del Premio</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalles sobre entrega, modelo o condiciones de adjudicación"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-300 shadow"
            >
              Guardar Premio
            </button>
          </div>
        </form>
      )}

      {/* Prizes List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
        {prizes
          .sort((a, b) => a.order - b.order)
          .map((prize) => (
            <div key={prize.id} className="p-4 flex items-center justify-between hover:bg-slate-850/40 transition-colors">
              <div className="flex items-center space-x-3.5">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">
                  #{prize.order}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">{prize.name}</h4>
                  <p className="text-xs text-slate-400">{prize.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {prize.amount && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Valor</span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      ${prize.amount.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(prize)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prize.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
