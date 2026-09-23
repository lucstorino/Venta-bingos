import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Wallet,
  Check,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  IdCard,
  MapPin,
  Ticket,
} from 'lucide-react';
import { BingoCard, Customer } from '../../types';
import { AvailableBingoItem } from '../../data/featuredBingos';
import { TuBingoLogo } from '../common/TuBingoLogo';

interface CheckoutViewProps {
  card?: BingoCard;
  cards?: BingoCard[];
  bingo: AvailableBingoItem;
  onBack: () => void;
  onSubmitPayment: (customer: Customer, paymentMethod: string) => Promise<void>;
  isProcessing: boolean;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  card,
  cards,
  bingo,
  onBack,
  onSubmitPayment,
  isProcessing,
}) => {
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Salta Capital');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Dinero en cuenta, tarjeta de crédito y débito');
  const [formError, setFormError] = useState<string | null>(null);

  // Normalize to cards list
  const checkoutCards: BingoCard[] = (() => {
    if (cards && cards.length > 0) return cards;
    if (card) return [card];
    return [];
  })();

  const totalCards = checkoutCards.length;
  const totalPrice = totalCards * bingo.price;

  const formatCardNum = (num: number) => {
    const lastThree = num % 1000;
    return String(lastThree === 0 ? num : lastThree).padStart(3, '0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Por favor ingresá tu nombre y apellido.');
      return;
    }
    if (!dni.trim()) {
      setFormError('Por favor ingresá tu número de documento (DNI).');
      return;
    }
    if (!address.trim()) {
      setFormError('Por favor ingresá tu domicilio (calle y número).');
      return;
    }
    if (!city.trim()) {
      setFormError('Por favor ingresá tu localidad / provincia.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Por favor ingresá un email válido para recibir tus cartones en PDF.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Por favor ingresá un número de teléfono / celular.');
      return;
    }

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'Registrado';

    const customer: Customer = {
      name: firstName,
      lastname: lastName,
      email: email.trim(),
      phone: phone.trim(),
      dni: dni.trim(),
      address: address.trim(),
      city: city.trim(),
    };

    await onSubmitPayment(customer, paymentMethod);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al carrito</span>
        </button>

        {/* Card Box matching mockup 5 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <TuBingoLogo />
            <span className="text-xs font-bold text-slate-400">Paso 2 de 3</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Finalizá tu compra
            </h1>
            <p className="text-xs text-slate-500">
              {totalCards === 1 ? (
                <>
                  Estás adquiriendo el{' '}
                  <strong className="text-slate-900">
                    Cartón N° {checkoutCards[0] ? formatCardNum(checkoutCards[0].cardNumber) : ''}
                  </strong>{' '}
                  ({bingo.title}) por{' '}
                  <strong className="text-blue-600">${totalPrice.toLocaleString('es-AR')}</strong>.
                </>
              ) : (
                <>
                  Estás adquiriendo{' '}
                  <strong className="text-slate-900">{totalCards} cartones</strong> ({bingo.title}) por un total de{' '}
                  <strong className="text-blue-600">${totalPrice.toLocaleString('es-AR')}</strong>.
                </>
              )}
            </p>
          </div>

          {/* Cards pills summary */}
          {totalCards > 1 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5 text-blue-600" />
                  Cartones incluidos:
                </span>
                <span className="font-black text-slate-900">{totalCards} unidades</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {checkoutCards.map((c) => (
                  <span
                    key={c.id}
                    className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 shadow-2xs"
                  >
                    #{formatCardNum(c.cardNumber)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nombre y Apellido completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* DNI & Localidad in grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* DNI */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Número de documento (DNI) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Ej: 38450123"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Localidad */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Localidad / Ciudad *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Salta Capital"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Domicilio (Calle, Nº y Barrio) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Vicente López 670, B° Centro"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            {/* Email & Phone in grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email (para recibir PDF) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tunombre@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Teléfono / WhatsApp *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="387 154 123456"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Medio de pago disponible
              </label>

              {/* Botón único de medio de pago */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Dinero en cuenta, tarjeta de crédito y débito')}
                className="w-full p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20 text-left transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-black text-slate-900 block leading-snug">
                      Dinero en cuenta, tarjeta de crédito y débito
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Acreditación instantánea
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>Mercado Pago, Visa, Mastercard y Débito</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </button>
            </div>

            {/* Total Callout */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 block">Total a abonar</span>
                <span className="text-xl font-black text-slate-900">
                  ${totalPrice.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pago 100% Seguro</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando compra segura...</span>
                </>
              ) : (
                <>
                  <span>Pagar ${totalPrice.toLocaleString('es-AR')}</span>
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
