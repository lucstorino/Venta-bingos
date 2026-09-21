import { BingoCard } from '../types';

export interface ParseResult {
  validCards: BingoCard[];
  errors: { line: number; raw: string; reason: string }[];
  duplicateCount: number;
  totalParsed: number;
}

/**
 * Parses CSV lines in format:
 * numero_carton,n1,n2,n3,n4,n5,n6,n7,n8,n9,n10
 */
export function parseCardsCSV(
  csvContent: string,
  bingoId: string,
  existingCardNumbers: Set<number>
): ParseResult {
  const lines = csvContent.split(/\r?\n/);
  const validCards: BingoCard[] = [];
  const errors: { line: number; raw: string; reason: string }[] = [];
  const seenInBatch = new Set<number>();
  let duplicateCount = 0;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Skip possible header
    if (
      index === 0 &&
      (trimmed.toLowerCase().includes('numero') ||
        trimmed.toLowerCase().includes('carton') ||
        trimmed.toLowerCase().includes('card'))
    ) {
      return;
    }

    // Support comma or semicolon separated
    const parts = trimmed.split(/[,;\t]/).map((p) => p.trim()).filter((p) => p.length > 0);

    if (parts.length < 11) {
      errors.push({
        line: index + 1,
        raw: trimmed,
        reason: `Debe tener número de cartón y exactamente 10 números de juego (encontrados ${parts.length - 1})`,
      });
      return;
    }

    const cardNumber = parseInt(parts[0], 10);
    if (isNaN(cardNumber) || cardNumber <= 0) {
      errors.push({
        line: index + 1,
        raw: trimmed,
        reason: `Número de cartón inválido: "${parts[0]}"`,
      });
      return;
    }

    if (seenInBatch.has(cardNumber)) {
      duplicateCount++;
      errors.push({
        line: index + 1,
        raw: trimmed,
        reason: `Cartón #${cardNumber} duplicado en el mismo archivo`,
      });
      return;
    }

    if (existingCardNumbers.has(cardNumber)) {
      duplicateCount++;
      errors.push({
        line: index + 1,
        raw: trimmed,
        reason: `Cartón #${cardNumber} ya existe en este bingo`,
      });
      return;
    }

    const numbers: number[] = [];
    let numberError = false;
    for (let i = 1; i <= 10; i++) {
      const num = parseInt(parts[i], 10);
      if (isNaN(num) || num < 1 || num > 99) {
        errors.push({
          line: index + 1,
          raw: trimmed,
          reason: `Número de juego inválido en columna ${i + 1}: "${parts[i]}"`,
        });
        numberError = true;
        break;
      }
      numbers.push(num);
    }

    if (numberError) return;

    // Check duplicates inside the card
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== 10) {
      errors.push({
        line: index + 1,
        raw: trimmed,
        reason: `El cartón tiene números repetidos dentro de su combinación`,
      });
      return;
    }

    seenInBatch.add(cardNumber);
    validCards.push({
      id: `card-${bingoId}-${cardNumber}`,
      bingoId,
      cardNumber,
      numbers: numbers.sort((a, b) => a - b),
      status: 'AVAILABLE',
    });
  });

  return {
    validCards,
    errors,
    duplicateCount,
    totalParsed: lines.length,
  };
}

/**
 * Generates sample physical cards for instant testing
 */
export function generateSampleCards(
  count: number,
  startNumber: number,
  bingoId: string,
  existingNumbers: Set<number>
): BingoCard[] {
  const cards: BingoCard[] = [];
  let currentNum = startNumber;

  while (cards.length < count) {
    if (!existingNumbers.has(currentNum)) {
      // Pick 10 unique numbers between 1 and 90
      const pool = Array.from({ length: 90 }, (_, i) => i + 1);
      const picked: number[] = [];
      for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        picked.push(pool[randomIndex]);
        pool.splice(randomIndex, 1);
      }
      picked.sort((a, b) => a - b);

      cards.push({
        id: `card-${bingoId}-${currentNum}`,
        bingoId,
        cardNumber: currentNum,
        numbers: picked,
        status: 'AVAILABLE',
      });
    }
    currentNum++;
  }

  return cards;
}

export function generateValidationCode(cardNumber: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BNG-${cardNumber}-${randomStr}`;
}
