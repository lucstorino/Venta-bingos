import React, { useState } from 'react';
import { ShieldCheck, Key, Lock, CheckCircle2, Globe, AlertTriangle, Save } from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { MercadoPagoConfig } from '../../types';

export const MercadoPagoTab: React.FC = () => {
  const { mpConfig, updateMercadoPagoConfig } = useBingo();
  const [formData, setFormData] = useState<MercadoPagoConfig>(mpConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMercadoPagoConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">Pasarela de Pagos Mercado Pago</h3>
        <p className="text-xs text-slate-400">
          Configuración de API oficial, webhooks IPN y políticas de seguridad para cobro de cartones.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>¡Parámetros de Mercado Pago actualizados correctamente!</span>
        </div>
      )}

      {/* Security note matching spec */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Arquitectura Segura & Webhooks</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conforme a la sección 10 del documento de alcance, el frontend nunca debe procesar cobros de forma directa ni asumir la pantalla de éxito como confirmación. El backend es el único autorizado para crear la preferencia con la clave privada (Access Token), escuchar el webhook de Mercado Pago y realizar el bloqueo transaccional del cartón a estado <strong className="text-emerald-400">SOLD</strong>.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 gap-5">
          {/* Environment Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-sm font-bold text-white block">Modo Sandbox (Pruebas)</span>
              <span className="text-xs text-slate-400">
                Permite probar transacciones completas sin dinero real usando tarjetas de prueba de Mercado Pago.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sandboxMode}
                onChange={(e) => setFormData({ ...formData, sandboxMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#009EE3]"></div>
            </label>
          </div>

          {/* Public Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Public Key (Frontend / Checkout Bricks)
            </label>
            <input
              type="text"
              value={formData.publicKey}
              onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
              placeholder="TEST-xxxx-xxxx-xxxx"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Access Token */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Access Token (Backend Privado)
            </label>
            <input
              type="password"
              value={formData.accessToken}
              onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
              placeholder="TEST-xxxxxxxxxxxx-xxxxxx"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL Endpoint del Webhook IPN
            </label>
            <input
              type="url"
              value={formData.webhookUrl}
              onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              placeholder="https://tudominio.com/api/mercadopago/webhook"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Configura este webhook en el panel de desarrolladores de Mercado Pago para recibir notificaciones de eventos <code>payment.updated</code>.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#009EE3] hover:bg-[#0082ba] text-white font-bold rounded-xl text-xs shadow-lg shadow-[#009EE3]/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración de Mercado Pago</span>
          </button>
        </div>
      </form>
    </div>
  );
};
