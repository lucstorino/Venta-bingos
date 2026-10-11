import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Bingo,
  BingoCard,
  Customer,
  MercadoPagoConfig,
  Order,
  Prize,
} from '../types';
import {
  initialBingo,
  initialBingos,
  initialCards,
  initialMercadoPagoConfig,
  initialPrizes,
  initialOrders,
} from '../data/mockBingo';
import { generateSampleCards, generateValidationCode } from '../utils/cardValidator';
import { addOrUpdatePastBingo } from '../data/pastBingos';
import { getBingoImages } from '../services/firebaseBingoStorageService';

export interface StopSalesResult {
  bingo: Bingo;
  totalCards: number;
  soldCards: BingoCard[];
  unsoldCards: BingoCard[];
  cancelledCount: number;
  totalRevenue: number;
  closedAt: number;
}

interface ActiveReservation {
  cardId: string;
  cardNumber: number;
  expiresAt: number;
  remainingSeconds: number;
}

interface BingoContextType {
  bingo: Bingo;
  bingos: Bingo[];
  activeBingoId: string;
  setActiveBingoId: (id: string) => void;
  createBingo: (newBingo: Partial<Bingo>) => Promise<Bingo>;
  updateBingo: (updated: Partial<Bingo>, id?: string) => void;
  deleteBingo: (id: string) => void;
  stopBingoSales: (bingoId?: string) => StopSalesResult;
  reopenBingoSales: (bingoId?: string) => void;
  getBingoUnsoldCards: (bingoId?: string) => {
    soldCards: BingoCard[];
    unsoldCards: BingoCard[];
    total: number;
  };
  cards: BingoCard[];
  prizes: Prize[];
  orders: Order[];
  mpConfig: MercadoPagoConfig;
  activeReservation: ActiveReservation | null;
  reserveCard: (cardId: string) => { success: boolean; message?: string };
  releaseCard: (cardId: string) => void;
  confirmOrderPayment: (
    cardIdOrIds: string | string[],
    customer: Customer,
    paymentMethod?: string
  ) => Promise<{ success: boolean; order?: Order; message?: string }>;
  addPrize: (prize: Omit<Prize, 'id' | 'bingoId'>) => void;
  updatePrize: (id: string, updated: Partial<Prize>) => void;
  deletePrize: (id: string) => void;
  importCardsBatch: (newCards: BingoCard[]) => { added: number };
  generateSampleCardsBatch: (count: number, startNumber?: number) => number;
  clearAllCards: () => void;
  updateCardNumbers: (cardId: string, newNumbers: number[], newCardNumber?: number) => void;
  updateMercadoPagoConfig: (cfg: Partial<MercadoPagoConfig>) => void;
  findOrdersByCustomer: (dniOrPhone: string) => Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  getCardById: (cardId: string) => BingoCard | undefined;
  getCardByNumber: (num: number) => BingoCard | undefined;
  resetAllData: () => void;
  refreshFromBackend: () => Promise<void>;
}

const BingoContext = createContext<BingoContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BINGOS: 'bingo_virtual_bingos_list',
  ACTIVE_BINGO_ID: 'bingo_virtual_active_bingo_id',
  BINGO: 'bingo_virtual_data',
  CARDS: 'bingo_virtual_cards',
  PRIZES: 'bingo_virtual_prizes',
  ORDERS: 'bingo_virtual_orders',
  MP_CONFIG: 'bingo_virtual_mp_config',
  RESERVATION: 'bingo_virtual_active_res',
};

export const BingoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load bingos array from localStorage or defaults
  const [bingos, setBingos] = useState<Bingo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BINGOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      const singleSaved = localStorage.getItem(STORAGE_KEYS.BINGO);
      if (singleSaved) {
        const single = JSON.parse(singleSaved);
        if (single && single.id) {
          const others = initialBingos.filter((b) => b.id !== single.id);
          return [single, ...others];
        }
      }
      return initialBingos;
    } catch {
      return initialBingos;
    }
  });

  const [activeBingoId, setActiveBingoId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BINGO_ID);
      if (savedId) return savedId;
    } catch {}
    return initialBingos[0].id;
  });

  const bingo = bingos.find((b) => b.id === activeBingoId) || bingos[0] || initialBingos[0];

  const [cards, setCards] = useState<BingoCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 90) {
          return parsed;
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with initialCards so cards 01 to 90 exist
          const existingIds = new Set(parsed.map((c: BingoCard) => c.cardNumber));
          const missing = initialCards.filter((c) => !existingIds.has(c.cardNumber));
          return [...parsed, ...missing];
        }
      }
      return initialCards;
    } catch {
      return initialCards;
    }
  });

  const [prizes, setPrizes] = useState<Prize[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRIZES);
      return saved ? JSON.parse(saved) : initialPrizes;
    } catch {
      return initialPrizes;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialOrders;
    } catch {
      return initialOrders;
    }
  });

  const [mpConfig, setMpConfig] = useState<MercadoPagoConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MP_CONFIG);
      return saved ? JSON.parse(saved) : initialMercadoPagoConfig;
    } catch {
      return initialMercadoPagoConfig;
    }
  });

  const [activeReservation, setActiveReservation] = useState<ActiveReservation | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESERVATION);
      if (!saved) return null;
      const parsed: ActiveReservation = JSON.parse(saved);
      if (parsed.expiresAt > Date.now()) {
        const remaining = Math.max(0, Math.floor((parsed.expiresAt - Date.now()) / 1000));
        return { ...parsed, remainingSeconds: remaining };
      }
      return null;
    } catch {
      return null;
    }
  });

  // Sync with Backend API on load
  const refreshFromBackend = useCallback(async () => {
    try {
      // 1. Fetch all bingos
      const bingosListRes = await fetch('/api/bingos');
      if (bingosListRes.ok) {
        const dbBingos = await bingosListRes.json();
        if (Array.isArray(dbBingos) && dbBingos.length > 0) {
          const mapped: Bingo[] = dbBingos.map((b: any) => ({
            id: b.id,
            name: b.name,
            description: b.description,
            drawDate: b.drawDate || b.date,
            drawTime: b.drawTime || b.time,
            price: b.cardPrice || b.price || 2500,
            currency: b.currency || 'ARS',
            status: b.status || 'ACTIVE',
            reservationDurationMinutes: b.maxReservationMinutes || 10,
            location: b.location || 'Sede Central - Transmisión en Vivo',
            organizer: b.organizer || 'Organización Oficial de Bingo',
            termsAndConditions: b.termsAndConditions || b.terms,
            imageUrl: b.imageUrl,
            prizesImageUrl: b.prizesImageUrl,
            supportWhatsapp: '+54 9 387 421-5005',
            supportHours: 'Lunes a Sábados de 09:00 a 20:00 hs',
          }));
          // Merge with Firestore permanently stored images
          const enhanced = await Promise.all(
            mapped.map(async (m) => {
              try {
                const fsImages = await getBingoImages(m.id);
                return {
                  ...m,
                  imageUrl: fsImages.cover || m.imageUrl,
                  prizesImageUrl: fsImages.prizes || m.prizesImageUrl,
                  ticketTemplateImage: fsImages.template || m.ticketTemplateImage,
                  extractoImageUrl: fsImages.extract || m.extractoImageUrl,
                  bannerImageUrl: fsImages.banner || m.bannerImageUrl,
                };
              } catch {
                return m;
              }
            })
          );

          setBingos((prev) => {
            const prevMap = new Map(prev.map((item) => [item.id, item]));
            return enhanced.map((m) => {
              const existing = prevMap.get(m.id);
              return existing ? { ...m, ...existing, imageUrl: m.imageUrl || existing.imageUrl } : m;
            });
          });
        }
      }

      // 2. Fetch active bingo & prizes
      const res = await fetch('/api/bingos/active');
      if (res.ok) {
        const data = await res.json();
        if (data.bingo) {
          const activeB: Partial<Bingo> = {
            id: data.bingo.id,
            name: data.bingo.name,
            description: data.bingo.description,
            drawDate: data.bingo.drawDate || data.bingo.date,
            drawTime: data.bingo.drawTime || data.bingo.time,
            price: data.bingo.cardPrice || data.bingo.price,
            reservationDurationMinutes: data.bingo.maxReservationMinutes,
            termsAndConditions: data.bingo.termsAndConditions || data.bingo.terms,
            imageUrl: data.bingo.imageUrl,
            prizesImageUrl: data.bingo.prizesImageUrl,
          };
          setBingos((prev) => {
            const idx = prev.findIndex((b) => b.id === data.bingo.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...activeB };
              return updated;
            }
            return prev;
          });
        }
        if (Array.isArray(data.prizes) && data.prizes.length > 0) {
          setPrizes(data.prizes);
        }
      }

      // Fetch cards from DB
      const currentActiveId = activeBingoId;
      const cardsRes = await fetch(`/api/bingos/${currentActiveId}/cards`);
      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        if (Array.isArray(cardsData.cards) && cardsData.cards.length > 0) {
          setCards(
            cardsData.cards.map((c: any) => ({
              id: c.id,
              bingoId: c.bingoId,
              cardNumber: c.cardNumber,
              numbers: c.numbers,
              status: c.status,
              reservedUntil: c.reservedUntil ? new Date(c.reservedUntil).getTime() : undefined,
              soldToOrderId: c.soldToOrderId,
            }))
          );
        }
      }

      // Fetch orders
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (Array.isArray(ordersData)) {
          setOrders(
            ordersData.map((o: any) => ({
              id: o.id,
              bingoId: o.bingoId,
              cardId: `card-${o.bingoId}-${o.cardNumber}`,
              cardNumber: o.cardNumber,
              customer: {
                name: o.customerName,
                lastname: o.customerLastname,
                dni: o.customerDni,
                phone: o.customerPhone,
                email: o.customerEmail,
                address: o.customerAddress,
              },
              amount: o.amount,
              status: o.paymentStatus,
              createdAt: new Date(o.createdAt).getTime(),
              paidAt: new Date(o.createdAt).getTime(),
              paymentId: o.paymentId,
              validationCode: o.validationCode,
            }))
          );
        }
      }
    } catch (e) {
      console.warn('Backend SQLite sync notice:', e);
    }
  }, [activeBingoId]);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BINGOS, JSON.stringify(bingos));
      if (bingo) {
        localStorage.setItem(STORAGE_KEYS.BINGO, JSON.stringify(bingo));
      }
    } catch {
      // ignore
    }
  }, [bingos, bingo]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BINGO_ID, activeBingoId);
    } catch {
      // ignore
    }
  }, [activeBingoId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch {
      // ignore
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRIZES, JSON.stringify(prizes));
    } catch {
      // ignore
    }
  }, [prizes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MP_CONFIG, JSON.stringify(mpConfig));
    } catch {
      // ignore
    }
  }, [mpConfig]);

  useEffect(() => {
    try {
      if (activeReservation) {
        localStorage.setItem(STORAGE_KEYS.RESERVATION, JSON.stringify(activeReservation));
      } else {
        localStorage.removeItem(STORAGE_KEYS.RESERVATION);
      }
    } catch {
      // ignore
    }
  }, [activeReservation]);

  // Periodic heartbeat: check expired reservations and update remaining time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      // 1. Release expired cards
      setCards((prevCards) => {
        let hasChanges = false;
        const updated = prevCards.map((card) => {
          if (card.status === 'RESERVED' && card.reservedUntil && card.reservedUntil <= now) {
            hasChanges = true;
            return {
              ...card,
              status: 'AVAILABLE' as const,
              reservedAt: undefined,
              reservedUntil: undefined,
              reservedBySessionId: undefined,
            };
          }
          return card;
        });
        return hasChanges ? updated : prevCards;
      });

      // 2. Update active reservation remaining seconds
      setActiveReservation((current) => {
        if (!current) return null;
        if (current.expiresAt <= now) {
          return null;
        }
        const remaining = Math.max(0, Math.floor((current.expiresAt - now) / 1000));
        return { ...current, remainingSeconds: remaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCardById = useCallback(
    (cardId: string) => cards.find((c) => c.id === cardId),
    [cards]
  );

  const getCardByNumber = useCallback(
    (num: number) => cards.find((c) => c.cardNumber === num),
    [cards]
  );

  const reserveCard = useCallback(
    (cardId: string): { success: boolean; message?: string } => {
      const now = Date.now();
      const targetCard = cards.find((c) => c.id === cardId);

      if (!targetCard) {
        return { success: false, message: 'El cartón seleccionado no fue encontrado.' };
      }

      if (targetCard.status === 'SOLD') {
        return { success: false, message: `El cartón #${targetCard.cardNumber} ya ha sido vendido.` };
      }

      if (targetCard.status === 'RESERVED' && targetCard.reservedUntil && targetCard.reservedUntil > now) {
        // If it's already reserved by someone else
        if (activeReservation?.cardId !== cardId) {
          return {
            success: false,
            message: `El cartón #${targetCard.cardNumber} se encuentra reservado temporalmente por otro participante.`,
          };
        }
      }

      // Duration from bingo configuration in minutes
      const durationMs = (bingo.reservationDurationMinutes || 10) * 60 * 1000;
      const expiresAt = now + durationMs;

      // Release any previous reservation held by this user
      setCards((prev) =>
        prev.map((c) => {
          if (c.id === targetCard.id) {
            return {
              ...c,
              status: 'RESERVED',
              reservedAt: now,
              reservedUntil: expiresAt,
              reservedBySessionId: 'current-session',
            };
          }
          if (activeReservation && c.id === activeReservation.cardId && c.id !== targetCard.id && c.status === 'RESERVED') {
            return {
              ...c,
              status: 'AVAILABLE',
              reservedAt: undefined,
              reservedUntil: undefined,
              reservedBySessionId: undefined,
            };
          }
          return c;
        })
      );

      const reservation: ActiveReservation = {
        cardId: targetCard.id,
        cardNumber: targetCard.cardNumber,
        expiresAt,
        remainingSeconds: Math.floor(durationMs / 1000),
      };

      setActiveReservation(reservation);
      // Notify backend SQLite
      fetch(`/api/cards/${targetCard.id}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: bingo.reservationDurationMinutes || 10 }),
      }).catch(() => {});

      return { success: true };
    },
    [cards, bingo.reservationDurationMinutes, activeReservation]
  );

  const releaseCard = useCallback((cardId: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId && c.status === 'RESERVED'
          ? {
              ...c,
              status: 'AVAILABLE',
              reservedAt: undefined,
              reservedUntil: undefined,
              reservedBySessionId: undefined,
            }
          : c
      )
    );

    setActiveReservation((cur) => (cur?.cardId === cardId ? null : cur));
    // Release in backend SQLite
    fetch(`/api/cards/${cardId}/release`, { method: 'POST' }).catch(() => {});
  }, []);

  const confirmOrderPayment = useCallback(
    async (
      cardIdOrIds: string | string[],
      customer: Customer,
      paymentMethod = 'Mercado Pago'
    ): Promise<{ success: boolean; order?: Order; message?: string }> => {
      const now = Date.now();
      const targetIds = Array.isArray(cardIdOrIds) ? cardIdOrIds : [cardIdOrIds];
      const targetCards = cards.filter((c) => targetIds.includes(c.id));

      if (targetCards.length === 0) {
        return { success: false, message: 'Ningún cartón válido fue encontrado.' };
      }

      // Check if any is already sold
      const alreadySold = targetCards.find((c) => c.status === 'SOLD');
      if (alreadySold) {
        return { success: false, message: `El cartón #${alreadySold.cardNumber} ya está vendido.` };
      }

      const primaryCard = targetCards[0];
      const orderId = `ORD-${Date.now()}-${primaryCard.cardNumber}`;
      const validationCode = generateValidationCode(primaryCard.cardNumber);
      const totalAmount = bingo.price * targetCards.length;

      const comprador = {
        nombreApellido: `${customer.name || ''} ${customer.lastname || ''}`.trim() || 'Cliente',
        dni: customer.dni || '',
        direccion: customer.address || '',
        localidad: customer.city || '',
        telefono: customer.phone || '',
      };

      const newOrder: Order = {
        id: orderId,
        bingoId: bingo.id,
        cardId: primaryCard.id,
        cardNumber: primaryCard.cardNumber,
        cardIds: targetCards.map((c) => c.id),
        cards: targetCards.map((c) => ({ ...c, comprador, customer })),
        cardNumbers: targetCards.map((c) => c.cardNumber),
        totalCards: targetCards.length,
        customer,
        comprador,
        amount: totalAmount,
        status: 'PAID',
        createdAt: now,
        paidAt: now,
        paymentId: `MP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        validationCode,
      };

      // Persist order in backend SQLite
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bingoId: bingo.id,
          cardId: primaryCard.id,
          customer,
          amount: totalAmount,
          paymentMethod,
          paymentId: newOrder.paymentId,
        }),
      }).catch(() => {});

      // Mark all target cards as SOLD
      const targetIdsSet = new Set(targetIds);
      setCards((prev) =>
        prev.map((c) =>
          targetIdsSet.has(c.id)
            ? {
                ...c,
                status: 'SOLD',
                soldToOrderId: orderId,
                soldAt: now,
                comprador,
                customer,
                reservedAt: undefined,
                reservedUntil: undefined,
              }
            : c
        )
      );

      // Add order
      setOrders((prev) => [newOrder, ...prev]);

      // Clear active reservation
      setActiveReservation(null);

      return { success: true, order: newOrder };
    },
    [cards, bingo]
  );

  const createBingo = useCallback(async (newBingoData: Partial<Bingo>): Promise<Bingo> => {
    const tempId = newBingoData.id || `bingo-${Date.now()}`;
    const created: Bingo = {
      id: tempId,
      name: newBingoData.name || 'Nuevo Bingo',
      description: newBingoData.description || 'Sorteo oficial con premios en efectivo y vehículos.',
      drawDate: newBingoData.drawDate || new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
      drawTime: newBingoData.drawTime || '18:00',
      price: newBingoData.price || 2000,
      currency: 'ARS',
      status: (newBingoData.status as any) || 'ACTIVE',
      reservationDurationMinutes: newBingoData.reservationDurationMinutes || 10,
      location: newBingoData.location || 'Sede Central - Transmisión en Vivo',
      organizer: newBingoData.organizer || 'Organización Oficial de Bingo',
      termsAndConditions: newBingoData.termsAndConditions || 'Sorteo oficial autorizado.',
      imageUrl: newBingoData.imageUrl || '/src/assets/images/bingo_casa_card_1789819899795.jpg',
      supportWhatsapp: newBingoData.supportWhatsapp || '+54 9 387 421-5005',
      supportHours: newBingoData.supportHours || 'Lunes a Sábados de 09:00 a 20:00 hs',
      ticketTemplateImage: newBingoData.ticketTemplateImage,
      ...newBingoData,
    };

    setBingos((prev) => [created, ...prev]);
    setActiveBingoId(created.id);

    try {
      const res = await fetch('/api/bingos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: created.id,
          name: created.name,
          description: created.description,
          date: created.drawDate,
          time: created.drawTime,
          cardPrice: created.price,
          currency: created.currency,
          status: created.status,
          maxReservationMinutes: created.reservationDurationMinutes,
          terms: created.termsAndConditions,
          imageUrl: created.imageUrl,
          prizesImageUrl: created.prizesImageUrl,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        // The real backend (bingos_back_js) assigns its own ID (cuid) when creating in
        // Postgres, different from the temporary one generated here. Swap it in local
        // state so future edits/deletes target the right record.
        if (saved?.id && saved.id !== tempId) {
          const realId: string = saved.id;
          created.id = realId;
          setBingos((prev) => prev.map((b) => (b.id === tempId ? { ...b, id: realId } : b)));
          setActiveBingoId((prev) => (prev === tempId ? realId : prev));
        }
      }
    } catch {
      // Backend unreachable: keep the optimistic local bingo as-is.
    }

    return created;
  }, []);

  const updateBingo = useCallback((updated: Partial<Bingo>, id?: string) => {
    const targetId = id || updated.id || activeBingoId;
    setBingos((prev) => {
      return prev.map((b) => {
        if (b.id === targetId) {
          const next = { ...b, ...updated };
          fetch(`/api/bingos/${next.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: next.name,
              description: next.description,
              date: next.drawDate,
              time: next.drawTime,
              cardPrice: next.price,
              maxReservationMinutes: next.reservationDurationMinutes,
              terms: next.termsAndConditions,
              imageUrl: next.imageUrl,
              prizesImageUrl: next.prizesImageUrl,
            }),
          }).catch(() => {});
          return next;
        }
        return b;
      });
    });
  }, [activeBingoId]);

  const deleteBingo = useCallback((id: string) => {
    setBingos((prev) => {
      if (prev.length <= 1) {
        alert('Debe existir al menos un bingo en el sistema.');
        return prev;
      }
      const filtered = prev.filter((b) => b.id !== id);
      if (activeBingoId === id && filtered.length > 0) {
        setActiveBingoId(filtered[0].id);
      }
      return filtered;
    });
    fetch(`/api/bingos/${id}`, { method: 'DELETE' }).catch(() => {});
  }, [activeBingoId]);

  const getBingoUnsoldCards = useCallback(
    (bingoId?: string) => {
      const targetId = bingoId || activeBingoId || bingo.id;
      const targetCards = cards.filter((c) => {
        if (c.bingoId) {
          return (
            c.bingoId === targetId ||
            (c.bingoId === 'bingo-default' && (targetId === bingos[0]?.id || targetId === activeBingoId))
          );
        }
        return targetId === bingos[0]?.id || targetId === activeBingoId;
      });

      const soldCards = targetCards.filter((c) => c.status === 'SOLD');
      const unsoldCards = targetCards.filter((c) => c.status !== 'SOLD');

      return {
        soldCards,
        unsoldCards,
        total: targetCards.length,
      };
    },
    [activeBingoId, bingo, bingos, cards]
  );

  const stopBingoSales = useCallback(
    (targetBingoId?: string): StopSalesResult => {
      const idToStop = targetBingoId || activeBingoId || bingo.id;
      const now = Date.now();
      const currentBingoObj = bingos.find((b) => b.id === idToStop) || bingo;

      const stoppedBingo: Bingo = {
        ...currentBingoObj,
        status: 'FINISHED',
        salesClosed: true,
        salesClosedAt: now,
      };

      // 1. Update bingos list
      setBingos((prev) => prev.map((b) => (b.id === idToStop ? stoppedBingo : b)));

      // 2. Mark unsold / available / reserved cards for this bingo as CANCELLED (dados de baja)
      const soldList: BingoCard[] = [];
      const unsoldList: BingoCard[] = [];

      setCards((prevCards) =>
        prevCards.map((c) => {
          const matchesBingo =
            !c.bingoId ||
            c.bingoId === idToStop ||
            (c.bingoId === 'bingo-default' && (idToStop === bingos[0]?.id || idToStop === activeBingoId));

          if (!matchesBingo) return c;

          if (c.status === 'SOLD') {
            soldList.push(c);
            return c;
          } else {
            const cancelled: BingoCard = {
              ...c,
              status: 'CANCELLED',
              reservedAt: undefined,
              reservedUntil: undefined,
              reservedBySessionId: undefined,
            };
            unsoldList.push(cancelled);
            return cancelled;
          }
        })
      );

      // 3. Clear active reservation
      setActiveReservation(null);

      // 4. Automatically sync with pastBingos so extract can be uploaded
      addOrUpdatePastBingo({
        id: `past-${stoppedBingo.id}`,
        name: stoppedBingo.name,
        drawDate: stoppedBingo.drawDate,
        drawTime: stoppedBingo.drawTime,
        image: stoppedBingo.imageUrl || '/src/assets/images/bingo_casa_card_1789819899795.jpg',
        extractoImage: stoppedBingo.extractoImageUrl || '/extracto_oficial_ejemplo.svg',
        mainPrize: stoppedBingo.description || 'Premios Oficiales',
        totalPrizes: `$ ${(soldList.length * stoppedBingo.price).toLocaleString('es-AR')} recaudados`,
        location: stoppedBingo.location || 'Sede Central Oficial',
      });

      const totalRevenue = soldList.length * stoppedBingo.price;

      return {
        bingo: stoppedBingo,
        totalCards: soldList.length + unsoldList.length,
        soldCards: soldList,
        unsoldCards: unsoldList,
        cancelledCount: unsoldList.length,
        totalRevenue,
        closedAt: now,
      };
    },
    [activeBingoId, bingo, bingos]
  );

  const reopenBingoSales = useCallback(
    (targetBingoId?: string) => {
      const idToReopen = targetBingoId || activeBingoId || bingo.id;

      setBingos((prev) =>
        prev.map((b) => {
          if (b.id === idToReopen) {
            return {
              ...b,
              status: 'ACTIVE',
              salesClosed: false,
              salesClosedAt: undefined,
            };
          }
          return b;
        })
      );

      setCards((prevCards) =>
        prevCards.map((c) => {
          const matchesBingo =
            !c.bingoId ||
            c.bingoId === idToReopen ||
            (c.bingoId === 'bingo-default' && (idToReopen === bingos[0]?.id || idToReopen === activeBingoId));

          if (!matchesBingo) return c;

          if (c.status === 'CANCELLED' && !c.soldToOrderId) {
            return {
              ...c,
              status: 'AVAILABLE',
            };
          }
          return c;
        })
      );
    },
    [activeBingoId, bingo, bingos]
  );

  const addPrize = useCallback(
    (prize: Omit<Prize, 'id' | 'bingoId'>) => {
      const newPrize: Prize = {
        ...prize,
        id: `prize-${Date.now()}`,
        bingoId: bingo.id,
      };
      setPrizes((prev) => [...prev, newPrize]);

      fetch('/api/prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newPrize.id,
          bingoId: bingo.id,
          name: newPrize.name,
          description: newPrize.description,
          amount: newPrize.amount,
          order: newPrize.order,
          iconType: newPrize.iconType,
        }),
      }).catch(() => {});
    },
    [bingo.id]
  );

  const updatePrize = useCallback((id: string, updated: Partial<Prize>) => {
    setPrizes((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    fetch(`/api/prizes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  }, []);

  const deletePrize = useCallback((id: string) => {
    setPrizes((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/prizes/${id}`, { method: 'DELETE' }).catch(() => {});
  }, []);

  const importCardsBatch = useCallback((newCards: BingoCard[]) => {
    setCards((prev) => {
      const existingMap = new Map(prev.map((c) => [c.cardNumber, c]));
      let added = 0;
      newCards.forEach((nc) => {
        if (!existingMap.has(nc.cardNumber)) {
          existingMap.set(nc.cardNumber, nc);
          added++;
        }
      });
      return Array.from(existingMap.values()).sort((a, b) => a.cardNumber - b.cardNumber);
    });

    // Send batch to the backend (real Nest API when reachable, otherwise local SQLite mock).
    fetch(`/api/bingos/${bingo.id}/cards/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cards: newCards.map((c) => ({
          cardNumber: c.cardNumber,
          numbers: c.numbers,
        })),
      }),
    })
      .then(() => refreshFromBackend())
      .catch(() => {});

    return { added: newCards.length };
  }, [bingo.id, refreshFromBackend]);

  const generateSampleCardsBatch = useCallback(
    (count: number, startNumber?: number): number => {
      const existing = new Set(cards.map((c) => c.cardNumber));
      const highest = cards.length > 0 ? Math.max(...cards.map((c) => c.cardNumber)) : 146000;
      const start = startNumber ?? highest + 1;

      const generated = generateSampleCards(count, start, bingo.id, existing);
      importCardsBatch(generated);
      return generated.length;
    },
    [cards, bingo.id, importCardsBatch]
  );

  const clearAllCards = useCallback(() => {
    setCards([]);
    setActiveReservation(null);
  }, []);

  const updateCardNumbers = useCallback((cardId: string, newNumbers: number[], newCardNumber?: number) => {
    const sorted = [...newNumbers].sort((a, b) => a - b);
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            numbers: sorted,
            cardNumber: newCardNumber !== undefined ? newCardNumber : c.cardNumber,
          };
        }
        return c;
      })
    );

    // Sync with backend API
    fetch(`/api/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numbers: sorted, cardNumber: newCardNumber }),
    }).catch(() => {});
  }, []);

  const updateMercadoPagoConfig = useCallback((cfg: Partial<MercadoPagoConfig>) => {
    setMpConfig((prev) => {
      const next = { ...prev, ...cfg };
      fetch('/api/mercadopago/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      }).catch(() => {});
      return next;
    });
  }, []);

  const findOrdersByCustomer = useCallback(
    (query: string): Order[] => {
      const clean = query.trim().toLowerCase();
      if (!clean) return [];
      return orders.filter(
        (o) =>
          o.customer.dni.toLowerCase().includes(clean) ||
          o.customer.phone.toLowerCase().includes(clean) ||
          (o.customer.email && o.customer.email.toLowerCase().includes(clean)) ||
          o.cardNumber.toString().includes(clean) ||
          o.validationCode.toLowerCase().includes(clean)
      );
    },
    [orders]
  );

  const updateOrderStatus = useCallback((orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: newStatus,
          paidAt: newStatus === 'PAID' ? (o.paidAt || Date.now()) : o.paidAt,
        };
      })
    );
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.BINGOS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_BINGO_ID);
    localStorage.removeItem(STORAGE_KEYS.BINGO);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.PRIZES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.MP_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.RESERVATION);
    setBingos(initialBingos);
    setActiveBingoId(initialBingos[0].id);
    setCards(initialCards);
    setPrizes(initialPrizes);
    setOrders([]);
    setMpConfig(initialMercadoPagoConfig);
    setActiveReservation(null);

    // Call backend reset
    fetch('/api/db/reset', { method: 'POST' })
      .then(() => refreshFromBackend())
      .catch(() => {});
  }, [refreshFromBackend]);

  return (
    <BingoContext.Provider
      value={{
        bingo,
        bingos,
        activeBingoId,
        setActiveBingoId,
        createBingo,
        updateBingo,
        deleteBingo,
        stopBingoSales,
        reopenBingoSales,
        getBingoUnsoldCards,
        cards,
        prizes,
        orders,
        mpConfig,
        activeReservation,
        reserveCard,
        releaseCard,
        confirmOrderPayment,
        addPrize,
        updatePrize,
        deletePrize,
        importCardsBatch,
        generateSampleCardsBatch,
        clearAllCards,
        updateCardNumbers,
        updateMercadoPagoConfig,
        findOrdersByCustomer,
        updateOrderStatus,
        deleteOrder,
        getCardById,
        getCardByNumber,
        resetAllData,
        refreshFromBackend,
      }}
    >
      {children}
    </BingoContext.Provider>
  );
};

export const useBingo = () => {
  const context = useContext(BingoContext);
  if (!context) {
    throw new Error('useBingo must be used within a BingoProvider');
  }
  return context;
};
