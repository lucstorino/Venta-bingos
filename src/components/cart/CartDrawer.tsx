import React from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Plus } from 'lucide-react';
import { BingoCard } from '../../types';
import { AvailableBingoItem } from '../../data/featuredBingos';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartCards: BingoCard[];
  bingo: AvailableBingoItem;
  onRemoveCard: (cardId: string) => void;
  onClearCart?: () => void;
  onContinueToCheckout: () => void;
  onKeepPlaying: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartCards,
  bingo,
  onRemoveCard,
  onClearCart,
  onContinueToCheckout,
  onKeepPlaying,
}) => {
  if (!isOpen) return null;

  const formatCardNum = (num: number) => {
    const lastThree = num % 1000;
    return String(lastThree === 0 ? num : lastThree).padStart(3, '0');
  };

  const totalPrice = cartCards.length * bingo.price;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Tu carrito
                </h2>
                <p className="text-xs text-slate-500">
                  {cartCards.length} {cartCards.length === 1 ? 'cartón seleccionado' : 'cartones seleccionados'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3">
            {cartCards.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                  <span>Cartones a pagar:</span>
                  {onClearCart && cartCards.length > 1 && (
                    <button
                      onClick={onClearCart}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                    >
                      Vaciar carrito
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {cartCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Mini visual thumbnail */}
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 p-1 flex flex-col justify-between shadow-2xs shrink-0 text-center">
                          <span className="text-[7px] font-bold text-slate-400 uppercase">
                            Cartón
                          </span>
                          <span className="text-xs font-mono font-black text-blue-600">
                            #{formatCardNum(card.cardNumber)}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            Cartón N° {formatCardNum(card.cardNumber)}
                          </h3>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {card.numbers.slice(0, 5).map((n, i) => (
                              <span
                                key={i}
                                className="text-[9px] font-mono font-bold bg-white px-1 py-0.2 rounded border border-slate-200 text-slate-700"
                              >
                                {String(n).padStart(2, '0')}
                              </span>
                            ))}
                            <span className="text-[9px] text-slate-400">...</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-900">
                          {bingo.formattedPrice}
                        </span>
                        <button
                          onClick={() => onRemoveCard(card.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Quitar del carrito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 space-y-3 text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-medium">Tu carrito está vacío.</p>
                <button
                  onClick={onKeepPlaying}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Elegir cartones ahora
                </button>
              </div>
            )}
          </div>

          {/* Footer with Total and CTAs */}
          {cartCards.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-white space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Subtotal ({cartCards.length} {cartCards.length === 1 ? 'cartón' : 'cartones'})</span>
                  <span>${totalPrice.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xl font-black text-slate-900">Total</span>
                  <span className="text-2xl font-black text-blue-700">
                    ${totalPrice.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  id="cart-continue-btn"
                  onClick={onContinueToCheckout}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>
                    Continuar compra ({cartCards.length} {cartCards.length === 1 ? 'cartón' : 'cartones'})
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onKeepPlaying}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Seguir eligiendo cartones</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
