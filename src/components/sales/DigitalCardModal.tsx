import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Download,
  CheckCircle2,
  Mail,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from 'lucide-react';
import { useBingo } from '../../context/BingoContext';
import { Order, BingoCard } from '../../types';
import { OfficialBingoTicket } from './OfficialBingoTicket';
import { downloadTicketAsPdf, downloadMultipleTicketsAsPdf } from '../../utils/ticketPdfExport';

interface DigitalCardModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalCardModal: React.FC<DigitalCardModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { bingo, getCardById } = useBingo();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  if (!isOpen || !order) return null;

  // Resolve all cards belonging to this order
  const orderCards: BingoCard[] = (() => {
    if (order.cards && order.cards.length > 0) return order.cards;
    if (order.cardIds && order.cardIds.length > 0) {
      const found = order.cardIds.map((id) => getCardById(id)).filter(Boolean) as BingoCard[];
      if (found.length > 0) return found;
    }
    const single = getCardById(order.cardId);
    return single ? [single] : [];
  })();

  const currentCard = orderCards[activeCardIndex] || orderCards[0];

  const handleDownloadSinglePdf = async () => {
    if (!currentCard) return;
    setIsGeneratingPdf(true);
    const elementId = `official-ticket-${currentCard.id}`;
    const filename = `Carton-Oficial-${bingo.name.replace(/\s+/g, '-')}-N${String(currentCard.cardNumber).padStart(5, '0')}.pdf`;
    await downloadTicketAsPdf(elementId, filename);
    setIsGeneratingPdf(false);
  };

  const handleDownloadAllPdf = async () => {
    if (orderCards.length === 0) return;
    setIsGeneratingPdf(true);
    const elementIds = orderCards.map((c) => `official-ticket-export-${c.id}`);
    const filename = `Cartones-Oficiales-${bingo.name.replace(/\s+/g, '-')}-Orden-${order.id}.pdf`;
    await downloadMultipleTicketsAsPdf(elementIds, filename);
    setIsGeneratingPdf(false);
  };

  const handleSendEmailPdf = async () => {
    setIsSendingEmail(true);
    setEmailSentSuccess(false);

    // Simulate sending email to customer.email with the PDF ticket attached
    await new Promise((resolve) => setTimeout(resolve, 1400));

    setIsSendingEmail(false);
    setEmailSentSuccess(true);
    setTimeout(() => {
      setEmailSentSuccess(false);
    }, 6000);
  };

  const handleShareWhatsApp = () => {
    if (!currentCard) return;
    const text = encodeURIComponent(
      `¡Hola! Adquirí mi Cartón Oficial #${currentCard.cardNumber} para el ${bingo.name}. Código de validación: ${order.validationCode}. ¡A ganar!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:my-0 print:bg-white">
        {/* Top notification bar */}
        <div className="bg-emerald-600 px-4 sm:px-6 py-3 text-white flex items-center justify-between text-xs sm:text-sm font-semibold print:hidden">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>
              ¡Pago Confirmado! {orderCards.length > 1 ? `${orderCards.length} Cartones Oficiales Emitidos` : 'Cartón Oficial Emitido'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 sm:p-4 bg-slate-850 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span>Orden:</span>
            <strong className="text-amber-400 font-mono">{order.id}</strong>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">
              Titular: <strong className="text-white">{order.customer.name} {order.customer.lastname}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Send by Email PDF */}
            <button
              onClick={handleSendEmailPdf}
              disabled={isSendingEmail}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSendingEmail ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              <span>Enviar por Email en PDF</span>
            </button>

            {/* Download PDF button */}
            <button
              onClick={orderCards.length > 1 ? handleDownloadAllPdf : handleDownloadSinglePdf}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-black text-slate-950 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>
                {orderCards.length > 1
                  ? `Descargar todos los cartones (${orderCards.length} en PDF)`
                  : 'Descargar Cartón en PDF'}
              </span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>

        {/* Email feedback banner */}
        {emailSentSuccess && (
          <div className="bg-blue-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between animate-fadeIn print:hidden">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                ¡Cartón oficial enviado con éxito en formato PDF a <strong>{order.customer.email}</strong>!
              </span>
            </div>
            <button
              onClick={() => setEmailSentSuccess(false)}
              className="text-white/80 hover:text-white text-xs font-normal underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Multiple Cards Navigation Selector (if order contains more than 1 card) */}
        {orderCards.length > 1 && (
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs print:hidden">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
              <span>Mostrando cartón {activeCardIndex + 1} de {orderCards.length}</span>
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={activeCardIndex === 0}
                onClick={() => setActiveCardIndex((prev) => Math.max(0, prev - 1))}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1 overflow-x-auto max-w-[240px] sm:max-w-none px-1">
                {orderCards.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCardIndex(idx)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                      activeCardIndex === idx
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    #{String(c.cardNumber).padStart(3, '0')}
                  </button>
                ))}
              </div>

              <button
                disabled={activeCardIndex === orderCards.length - 1}
                onClick={() => setActiveCardIndex((prev) => Math.min(orderCards.length - 1, prev + 1))}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TICKET CONTAINER */}
        <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center overflow-x-auto print:bg-white print:p-0">
          {currentCard && (
            <div className="w-full">
              <OfficialBingoTicket
                id={`official-ticket-${currentCard.id}`}
                card={currentCard}
                bingo={bingo}
                customer={order.customer}
                comprador={order.comprador}
                validationCode={order.validationCode}
                showUploader={false}
                allowInteractivePlay={false}
              />
            </div>
          )}

          {/* Off-screen render of all order cards for multi-ticket PDF batch download */}
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
                  id={`official-ticket-export-${c.id}`}
                  card={c}
                  bingo={bingo}
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

        {/* Modal Footer Note */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 print:hidden">
          <div>
            Código de validación oficial ante escribano:{' '}
            <strong className="font-mono text-amber-400">{order.validationCode}</strong>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Válido para el sorteo del {bingo.drawDate}</span>
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer"
            >
              Cerrar visor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
