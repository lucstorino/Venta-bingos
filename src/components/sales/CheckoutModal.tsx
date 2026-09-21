import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  User,
  MapPin,
  Phone,
  Mail,
  FileBadge,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBingo } from '../../context/BingoContext';
import { BingoCard, Customer, Order } from '../../types';

interface CheckoutModalProps {
  card: BingoCard;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  card,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { bingo, reserveCard, releaseCard, confirmOrderPayment, activeReservation, mpConfig } =
    useBingo();

  const [step, setStep] = useState<'RESERVATION' | 'FORM' | 'MERCADOPAGO' | 'PROCESSING'>('FORM');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Customer Form State (Section 3.4)
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    lastname: '',
    dni: '',
    address: '',
    phone: '',
    email: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'account' | 'cash'>('card');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [cardNumberInput, setCardNumberInput] = useState<string>('**** **** **** 4242');

  // Reserve card upon open if not already reserved
  useEffect(() => {
    if (isOpen && card) {
      const res = reserveCard(card.id);
      if (!res.success) {
        setErrorMessage(res.message || 'No fue posible reservar este cartón');
      } else {
        setErrorMessage('');
      }
    }
  }, [isOpen, card?.id]);

  if (!isOpen || !card) return null;

  const formatRemaining = (seconds?: number) => {
    if (seconds === undefined) return '10:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleClose = () => {
    // Prompt confirmation if in middle of checkout
    if (confirm('¿Deseas cancelar la compra? Se liberará la reserva del cartón.')) {
      releaseCard(card.id);
      onClose();
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!customer.name.trim()) errs.name = 'El nombre es obligatorio';
    if (!customer.lastname.trim()) errs.lastname = 'El apellido es obligatorio';
    if (!customer.dni.trim()) errs.dni = 'El DNI es obligatorio';
    if (!customer.address.trim()) errs.address = 'La dirección es obligatoria';
    if (!customer.phone.trim()) errs.phone = 'El teléfono es obligatorio';
    if (customer.email && !customer.email.includes('@')) {
      errs.email = 'Ingrese un correo electrónico válido';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setCardHolder(`${customer.name} ${customer.lastname}`.toUpperCase());
    setStep('MERCADOPAGO');
  };

  const handleConfirmMercadoPago = async () => {
    setStep('PROCESSING');

    // Simulate real Mercado Pago payment processing latency + webhook validation
    setTimeout(async () => {
      const methodLabel =
        paymentMethod === 'card'
          ? 'Tarjeta de Débito/Crédito'
          : paymentMethod === 'account'
          ? 'Dinero en cuenta Mercado Pago'
          : 'Efectivo Rapipago/Pago Fácil';

      const result = await confirmOrderPayment(card.id, customer, methodLabel);

      if (result.success && result.order) {
        // Trigger celebratory confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        onSuccess(result.order);
      } else {
        setErrorMessage(result.message || 'Error al procesar el pago');
        setStep('FORM');
      }
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <FileBadge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Comprar Cartón #{card.cardNumber}</h3>
              <p className="text-xs text-slate-400">{bingo.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Reservation countdown pill */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatRemaining(activeReservation?.remainingSeconds)}</span>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Temporary reservation warning */}
        <div className="bg-amber-950/40 border-b border-amber-900/50 px-6 py-2.5 flex items-center space-x-2 text-xs text-amber-300">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Reserva activa:</strong> Este cartón está bloqueado para ti durante 10 minutos para evitar compras duplicadas simultáneas.
          </span>
        </div>

        {errorMessage && (
          <div className="m-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: CUSTOMER DATA FORM */}
        {step === 'FORM' && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-5">
            {/* Card recap banner */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Cartón Seleccionado</span>
                <span className="text-xl font-mono font-black text-amber-400">#{card.cardNumber}</span>
                <div className="flex items-center gap-1 mt-1">
                  {card.numbers.map((n, i) => (
                    <span key={i} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-slate-400 block">Total a Pagar</span>
                <span className="text-2xl font-black text-white font-mono">
                  ${bingo.price.toLocaleString('es-AR')}
                </span>
                <span className="text-[10px] text-slate-400 block">{bingo.currency}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center space-x-1.5">
                <User className="w-4 h-4" />
                <span>Datos del Comprador (Requeridos para Asignación del Cartón)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Ej. Juan Carlos"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {formErrors.name && <p className="text-rose-400 text-[11px] mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={customer.lastname}
                    onChange={(e) => setCustomer({ ...customer, lastname: e.target.value })}
                    placeholder="Ej. Pérez"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {formErrors.lastname && <p className="text-rose-400 text-[11px] mt-1">{formErrors.lastname}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">DNI / Identificación *</label>
                  <input
                    type="text"
                    required
                    value={customer.dni}
                    onChange={(e) => setCustomer({ ...customer, dni: e.target.value })}
                    placeholder="Ej. 34567890"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {formErrors.dni && <p className="text-rose-400 text-[11px] mt-1">{formErrors.dni}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="Ej. 11 4455-6677"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {formErrors.phone && <p className="text-rose-400 text-[11px] mt-1">{formErrors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección Completa *</label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    placeholder="Ej. Av. San Martín 1240, Dpto 2B"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {formErrors.address && <p className="text-rose-400 text-[11px] mt-1">{formErrors.address}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Electrónico (Opcional, para envío de cartón PDF)
                  </label>
                  <input
                    type="email"
                    value={customer.email || ''}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="nombre@ejemplo.com"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {formErrors.email && <p className="text-rose-400 text-[11px] mt-1">{formErrors.email}</p>}
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar y liberar
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all active:scale-95"
              >
                <span>Continuar a Mercado Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: MERCADO PAGO GATEWAY CHECKOUT */}
        {step === 'MERCADOPAGO' && (
          <div className="p-6 space-y-6">
            {/* Mercado Pago Official Badge & Guarantee */}
            <div className="bg-[#009EE3]/10 border border-[#009EE3]/30 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#009EE3] text-white flex items-center justify-center font-black text-xs shadow-md">
                  MP
                </div>
                <div>
                  <span className="text-xs font-bold text-[#009EE3] block">Checkout Seguro Mercado Pago</span>
                  <span className="text-sm font-semibold text-white">
                    Pago de Cartón #{card.cardNumber} • ${bingo.price.toLocaleString('es-AR')} {bingo.currency}
                  </span>
                </div>
              </div>
              <span className="text-[11px] px-2 py-1 rounded bg-[#009EE3]/20 text-[#009EE3] font-bold">
                {mpConfig.sandboxMode ? 'Modo Pruebas' : 'Producción'}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selecciona medio de pago:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#009EE3] bg-[#009EE3]/15 text-white ring-1 ring-[#009EE3]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-2 text-[#009EE3]" />
                  <div className="text-xs font-bold text-white">Tarjeta Débito/Crédito</div>
                  <div className="text-[10px] text-slate-400">Acreditación instantánea</div>
                </div>

                <div
                  onClick={() => setPaymentMethod('account')}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                    paymentMethod === 'account'
                      ? 'border-[#009EE3] bg-[#009EE3]/15 text-white ring-1 ring-[#009EE3]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mb-2 text-emerald-400" />
                  <div className="text-xs font-bold text-white">Dinero en Mercado Pago</div>
                  <div className="text-[10px] text-slate-400">Con saldo disponible</div>
                </div>

                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-[#009EE3] bg-[#009EE3]/15 text-white ring-1 ring-[#009EE3]'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Clock className="w-5 h-5 mb-2 text-amber-400" />
                  <div className="text-xs font-bold text-white">Efectivo (Rapipago / Pago Fácil)</div>
                  <div className="text-[10px] text-slate-400">Cupón de pago</div>
                </div>
              </div>
            </div>

            {/* Buyer and Order Recap */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Comprador:</span>
                <span className="text-white font-semibold">{customer.name} {customer.lastname} (DNI {customer.dni})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cartón N°:</span>
                <span className="text-amber-400 font-mono font-bold">#{card.cardNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Evento:</span>
                <span className="text-white">{bingo.name}</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1.5 border-t border-slate-800">
                <span>Monto Total:</span>
                <span className="text-base font-black text-white font-mono">
                  ${bingo.price.toLocaleString('es-AR')} {bingo.currency}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleConfirmMercadoPago}
                className="w-full py-3.5 px-6 rounded-xl bg-[#009EE3] hover:bg-[#0082ba] text-white font-black text-sm shadow-xl shadow-[#009EE3]/25 flex items-center justify-center space-x-2 transition-all transform active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>PAGAR CON MERCADO PAGO • ${bingo.price.toLocaleString('es-AR')}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white text-center"
              >
                ← Volver a modificar datos
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING WEBHOOK & TRANSACTION */}
        {step === 'PROCESSING' && (
          <div className="p-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto animate-spin">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">Validando transacción con Mercado Pago...</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                El backend está procesando la notificación de pago segura, bloqueando definitivamente el cartón y generando tu copia digital.
              </p>
            </div>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-amber-400 animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
