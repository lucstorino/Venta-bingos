import React, { useState, useEffect } from 'react';
import { BingoProvider, useBingo } from './context/BingoContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { TuBingoNavbar } from './components/TuBingoNavbar';
import { HomeView } from './components/home/HomeView';
import { TuBingoFooter } from './components/home/TuBingoFooter';
import { CardSelectionView } from './components/cart/CardSelectionView';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutView } from './components/cart/CheckoutView';
import { ConfirmationView } from './components/cart/ConfirmationView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { DigitalCardModal } from './components/sales/DigitalCardModal';
import { CustomerSupportModal } from './components/common/CustomerSupportModal';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { AvailableBingoItem, FEATURED_BINGOS } from './data/featuredBingos';
import { BingoCard, Customer, Order } from './types';
import confetti from 'canvas-confetti';

type ScreenState = 'home' | 'select-card' | 'checkout' | 'confirmation' | 'admin';

function MainAppContent() {
  const { cards, confirmOrderPayment, setActiveBingoId } = useBingo();
  const { isAuthenticated } = useAdminAuth();

  // Navigation & Screens
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(() => {
    if (typeof window !== 'undefined' && (window.location.hash === '#admin' || window.location.pathname === '/admin')) {
      return 'admin';
    }
    return 'home';
  });
  const [activeNavSection, setActiveNavSection] = useState<string>('inicio');
  const [selectedBingo, setSelectedBingo] = useState<AvailableBingoItem>(FEATURED_BINGOS[1]); // Auto 0km default

  // Listen to hash and URL popstate changes (e.g. #admin or /admin)
  useEffect(() => {
    const handleUrlChange = () => {
      const isUrlAdmin = window.location.hash === '#admin' || window.location.pathname === '/admin';
      if (isUrlAdmin) {
        setCurrentScreen('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (currentScreen === 'admin') {
          setCurrentScreen('home');
        }
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [currentScreen]);

  // Sync URL when navigating
  const navigateToScreen = (screen: ScreenState) => {
    setCurrentScreen(screen);
    if (screen === 'admin') {
      window.location.hash = 'admin';
      try {
        if (window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      } catch {
        // ignore in iframe
      }
    } else {
      // Clear admin route from URL
      if (window.location.hash === '#admin') {
        window.location.hash = '';
      }
      try {
        if (window.location.pathname === '/admin') {
          window.history.pushState(null, '', '/');
        }
      } catch {
        // ignore in iframe
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart & Orders
  const [cartCards, setCartCards] = useState<BingoCard[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Modals for ancillary views
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [digitalCardOrder, setDigitalCardOrder] = useState<Order | null>(null);

  // Handler: Select a bingo from home cards
  const handleSelectBingo = (bingo: AvailableBingoItem) => {
    setActiveBingoId(bingo.id);
    setSelectedBingo(bingo);
    navigateToScreen('select-card');
  };

  // Handler: Add card or cards to cart
  const handleAddToCart = (cardOrCards: BingoCard | BingoCard[]) => {
    const newItems = Array.isArray(cardOrCards) ? cardOrCards : [cardOrCards];
    setCartCards((prev) => {
      const existingIds = new Set(prev.map((c) => c.id));
      const filtered = newItems.filter((c) => !existingIds.has(c.id));
      return [...prev, ...filtered];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (cardId: string) => {
    setCartCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleClearCart = () => {
    setCartCards([]);
  };

  // Handler: Continue to checkout from cart
  const handleContinueToCheckout = () => {
    setIsCartOpen(false);
    navigateToScreen('checkout');
  };

  // Handler: Submit payment from checkout
  const handleSubmitPayment = async (customer: Customer, paymentMethod: string) => {
    if (cartCards.length === 0) return;

    setIsProcessingPayment(true);
    try {
      const cardIds = cartCards.map((c) => c.id);
      const result = await confirmOrderPayment(cardIds, customer, paymentMethod);
      if (result.success && result.order) {
        setConfirmedOrder(result.order);
        setCartCards([]);
        navigateToScreen('confirmation');

        // Confetti celebration
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas not supported
        }
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleNavClick = (section: 'inicio' | 'bingos' | 'como-jugar' | 'premios' | 'atencion') => {
    setActiveNavSection(section);
    if (section === 'inicio') {
      navigateToScreen('home');
    } else if (section === 'bingos') {
      if (currentScreen !== 'home') {
        navigateToScreen('home');
        setTimeout(() => {
          document.getElementById('seccion-bingos')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById('seccion-bingos')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (section === 'como-jugar') {
      if (currentScreen !== 'home') navigateToScreen('home');
      setTimeout(() => {
        document.getElementById('seccion-como-funciona')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (section === 'premios') {
      if (currentScreen !== 'home') navigateToScreen('home');
      setTimeout(() => {
        document.getElementById('seccion-premios')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (section === 'atencion') {
      setIsSupportModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* 
        PUBLIC VS PRIVATE SEPARATION:
        If currentScreen === 'admin', we render the private section (AdminLogin or AdminDashboard).
        Otherwise, we render the public store with TuBingoNavbar, Home/Card selection, and Footer.
      */}
      {currentScreen === 'admin' ? (
        <main className="flex-1 bg-slate-950">
          {!isAuthenticated ? (
            <AdminLogin
              onSuccess={() => {
                navigateToScreen('admin');
              }}
              onGoToHome={() => navigateToScreen('home')}
            />
          ) : (
            <AdminDashboard
              onViewOrderTicket={(order) => setDigitalCardOrder(order)}
              onGoToHome={() => navigateToScreen('home')}
            />
          )}
        </main>
      ) : (
        <>
          {/* Tu Bingo Top Navbar (Public - No gestión button shown for visitors) */}
          <TuBingoNavbar
            cartCount={cartCards.length}
            onOpenCart={() => setIsCartOpen(true)}
            onNavigate={handleNavClick}
            activeSection={activeNavSection}
            onOpenAdmin={() => navigateToScreen('admin')}
            isAdminOpen={false}
            onLogout={() => navigateToScreen('home')}
          />

          <main className="flex-1">
            {/* 1. HOME SCREEN - Bingos disponibles con diseño visual prioritario */}
            {currentScreen === 'home' && (
              <HomeView
                onSelectBingo={handleSelectBingo}
                onOpenSupport={() => setIsSupportModalOpen(true)}
              />
            )}

            {/* 2. CARD SELECTION SCREEN (matching 3) */}
            {currentScreen === 'select-card' && (
              <CardSelectionView
                bingo={selectedBingo}
                cards={cards}
                onBack={() => navigateToScreen('home')}
                onAddToCart={handleAddToCart}
              />
            )}

            {/* 3. CHECKOUT SCREEN (matching 5) */}
            {currentScreen === 'checkout' && cartCards.length > 0 && (
              <CheckoutView
                cards={cartCards}
                bingo={selectedBingo}
                onBack={() => {
                  navigateToScreen('select-card');
                  setIsCartOpen(true);
                }}
                onSubmitPayment={handleSubmitPayment}
                isProcessing={isProcessingPayment}
              />
            )}

            {/* 4. CONFIRMATION SCREEN (matching 6) */}
            {currentScreen === 'confirmation' && confirmedOrder && (
              <ConfirmationView
                order={confirmedOrder}
                bingo={selectedBingo}
                onViewPurchases={() => {
                  setDigitalCardOrder(confirmedOrder);
                }}
                onOpenTicketModal={(order) => {
                  setDigitalCardOrder(order);
                }}
                onNewGame={() => {
                  setConfirmedOrder(null);
                  navigateToScreen('home');
                }}
              />
            )}
          </main>

          {/* Footer (Public Store) */}
          <TuBingoFooter
            onOpenAdmin={() => navigateToScreen('admin')}
            onNavigate={handleNavClick}
          />
        </>
      )}

      {/* Cart Drawer (matching 4) */}
      <CartDrawer
        isOpen={isCartOpen && currentScreen !== 'admin'}
        onClose={() => setIsCartOpen(false)}
        cartCards={cartCards}
        bingo={selectedBingo}
        onRemoveCard={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onContinueToCheckout={handleContinueToCheckout}
        onKeepPlaying={() => {
          setIsCartOpen(false);
          if (currentScreen !== 'select-card') {
            navigateToScreen('select-card');
          }
        }}
      />

      {/* Digital Ticket Modal (QR + PDF layout + verification) */}
      {digitalCardOrder && (
        <DigitalCardModal
          order={digitalCardOrder}
          isOpen={!!digitalCardOrder}
          onClose={() => setDigitalCardOrder(null)}
        />
      )}

      {/* Customer Support WhatsApp Modal */}
      <CustomerSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Floating WhatsApp Quick Action Button (Public screens only) */}
      {currentScreen !== 'admin' && (
        <WhatsAppFloatingButton
          onClick={() => setIsSupportModalOpen(true)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BingoProvider>
        <MainAppContent />
      </BingoProvider>
    </AdminAuthProvider>
  );
}
