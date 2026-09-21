import React, { useState } from 'react';
import {
  Check,
  Download,
  QrCode,
  ArrowRight,
  Mail,
  FileText,
  Loader2,
  CheckCircle2,
  Ticket,
} from 'lucide-react';
import { Order, BingoCard } from '../../types';
import { AvailableBingoItem } from '../../data/featuredBingos';
import { TuBingoLogo } from '../common/TuBingoLogo';
import { OfficialBingoTicket } from '../sales/OfficialBingoTicket';
import { downloadTicketAsPdf, downloadMultipleTicketsAsPdf } from '../../utils/ticketPdfExport';
import { useBingo } from '../../context/BingoContext';

interface ConfirmationViewProps {
  order: Order;
  bingo: AvailableBingoItem;
  onViewPurchases: () => void;
  onNewGame: () => void;
  onOpenTicketModal?: (order: Order) => void;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({
  order,
  bingo,
  onViewPurchases,
  onNewGame,
  onOpenTicketModal,
}) => {
  const { getCardById, bingo: fullBingo } = useBingo();
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  const formatCardNum = (num: number) => {
    const lastThree = num % 1000;
    return String(lastThree === 0 ? num : lastThree).padStart(3, '0');
  };

  // Get all cards in this order
  const orderCards: BingoCard[] = (() => {
    if (order.cards && order.cards.length > 0) return order.cards;
    if (order.cardIds && order.cardIds.length > 0) {
      const found = order.cardIds.map((id) => getCardById(id)).filter(Boolean) as BingoCard[];
      if (found.length > 0) return found;
    }
    const single = getCardById(order.cardId);
    return single ? [single] : [];
  })();

  const totalCardsCount = orderCards.length > 0 ? orderCards.length : (order.totalCards || 1);
  const displayCard = orderCards[activeCardIdx] || orderCards[0];

  const handleDownloadPdf = async () => {
    if (orderCards.length === 0) return;
    setIsGeneratingPdf(true);

    if (orderCards.length === 1) {
      const card = orderCards[0];
      const elementId = `confirmation-ticket-${card.id}`;
      const filename = `Carton-Oficial-15-Bingo-Monumental-N${String(card.cardNumber).padStart(5, '0')}.pdf`;
      await downloadTicketAsPdf(elementId, filename);
    } else {
      const elementIds = orderCards.map((c) => `confirmation-ticket-${c.id}`);
      const filename = `Cartones-Oficiales-15-Bingo-Monumental-Orden-${order.id}.pdf`;
      await downloadMultipleTicketsAsPdf(elementIds, filename);
    }

    setIsGeneratingPdf(false);
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailSentSuccess(false);

    // Simulate sending email to customer with official PDF attachment
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSendingEmail(false);
    setEmailSentSuccess(true);
    setTimeout(() => {
      setEmailSentSuccess(false);
    }, 6000);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 py-8 sm:py-12 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-3 sm:mx-auto">
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xl text-center space-y-6">
          {/* Header Branding */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <TuBingoLogo />
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              PAGO CONFIRMADO
            </span>
          </div>

          {/* Success Title */}
          <div className="space-y-1.5 pt-1">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ¡Compra realizada con éxito!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              {totalCardsCount > 1
                ? `Tus ${totalCardsCount} cartones oficiales ya están emitidos y registrados legalmente ante escribanía pública.`
                : `Tu cartón oficial N° ${displayCard?.cardNumber || order.cardNumber} ya está emitido y registrado ante escribanía pública.`}
            </p>
          </div>

          {/* OFFICIAL TICKET DIRECT PREVIEW (TAL CUAL EL MODELO OFICIAL) */}
          <div className="rounded-3xl border-2 border-slate-200/90 overflow-hidden shadow-sm bg-slate-950 text-left">
            {/* Top preview header */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>
                  {orderCards.length > 1
                    ? `Cartón ${activeCardIdx + 1} de ${orderCards.length}: Nº ${displayCard?.cardNumber}`
                    : `Cartón Oficial de Juego: Nº ${displayCard?.cardNumber || order.cardNumber}`}
                </span>
              </div>

              {/* Multi-card tabs if bought more than 1 */}
              {orderCards.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {orderCards.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCardIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        activeCardIdx === idx
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      #{c.cardNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Official Bingo Ticket (Non-Interactive, Clean Printable Document) */}
            <div className="p-2 sm:p-5 bg-slate-900/90 flex justify-center overflow-x-auto">
              {displayCard && (
                <div className="w-full max-w-3xl">
                  <OfficialBingoTicket
                    card={displayCard}
                    bingo={fullBingo}
                    customer={order.customer}
                    comprador={order.comprador}
                    validationCode={order.validationCode}
                    showUploader={false}
                    allowInteractivePlay={false}
                  />
                </div>
              )}
            </div>

            {/* Ticket Info Bar below preview */}
            <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div>
                Código oficial de escribanía:{' '}
                <span className="font-mono font-bold text-amber-400">{order.validationCode}</span>
              </div>
              <div className="text-slate-300">
                15º Bingo Monumental • Organiza Club Gimnasia y Tiro de Salta • EN.RE.J.A.
              </div>
            </div>
          </div>

          {/* Official PDF & Email Sending Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-200/90 text-left space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wider">
                  Descargar o Enviar Cartón Oficial en PDF
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Podés descargarlo en tu dispositivo listo para imprimir o guardarlo en tu celular, o enviártelo por email:
                </p>
                <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                  ✉️ {order.customer.email}
                </div>
              </div>
            </div>

            {/* Download & Email action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Send by Email in PDF */}
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isSendingEmail ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span>Enviar por Email (PDF)</span>
              </button>

              {/* Download PDF button */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {totalCardsCount > 1
                    ? `Descargar ${totalCardsCount} en PDF`
                    : 'Descargar Cartón PDF'}
                </span>
              </button>
            </div>

            {/* Email delivery confirmation */}
            {emailSentSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Cartón oficial enviado con éxito en PDF a {order.customer.email}!</span>
              </div>
            )}
          </div>

          {/* Validation & Customer Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center justify-between text-slate-600 sm:justify-start sm:gap-2">
                <span>Código oficial de escribanía:</span>
                <span className="font-mono font-bold text-blue-700">{order.validationCode}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 sm:justify-start sm:gap-2">
                <span>Titular:</span>
                <span className="font-semibold text-slate-800">
                  {order.customer.name} {order.customer.lastname}
                </span>
              </div>
              {order.customer.dni && (
                <div className="flex items-center justify-between text-slate-600 sm:justify-start sm:gap-2">
                  <span>DNI:</span>
                  <span className="font-semibold text-slate-800">{order.customer.dni}</span>
                </div>
              )}
              {order.customer.phone && (
                <div className="flex items-center justify-between text-slate-600 sm:justify-start sm:gap-2">
                  <span>Teléfono:</span>
                  <span className="font-semibold text-slate-800">{order.customer.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Actions */}
          <div className="space-y-2.5 pt-1">
            {onOpenTicketModal && (
              <button
                type="button"
                onClick={() => onOpenTicketModal(order)}
                className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
              >
                <Ticket className="w-4 h-4 text-amber-500" />
                <span>Ver Cartón Oficial en Pantalla Completa</span>
              </button>
            )}

            <button
              type="button"
              onClick={onViewPurchases}
              className="w-full py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Ver mis compras y comprobantes
            </button>

            <button
              type="button"
              onClick={onNewGame}
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Volver al inicio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Off-screen container used to render tickets for pixel-perfect PDF export */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0px',
          width: '1020px',
          zIndex: -100,
          pointerEvents: 'none',
          opacity: 0,
        }}
      >
        {orderCards.map((c) => (
          <div key={c.id} style={{ width: '1020px' }}>
            <OfficialBingoTicket
              id={`confirmation-ticket-${c.id}`}
              card={c}
              bingo={fullBingo}
              customer={order.customer}
              comprador={order.comprador}
              validationCode={order.validationCode}
              showUploader={false}
              allowInteractivePlay={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
