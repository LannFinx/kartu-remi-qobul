import type { Card, HandSlot, Rank, SpecialAbilityType, Suit } from '../types/game';

const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];

const RANKS: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function resolveCardPointValue(rank: Rank, suit: Suit): number {
  if (rank === 'K') {
    return isRedSuit(suit) ? -1 : 13;
  }
  if (rank === 'A') {
    return 1;
  }
  if (rank === 'J' || rank === 'Q') {
    return 10;
  }
  return parseInt(rank, 10);
}

export function resolveSpecialAbility(
  rank: Rank,
  suit: Suit
): { ability: SpecialAbilityType; label: string } {
  if (rank === '7' || rank === '8') {
    return {
      ability: 'peek_own',
      label: 'Intip 1 Kartu Sendiri',
    };
  }
  if (rank === '10') {
    return {
      ability: 'peek_opponent',
      label: 'Intip 1 Kartu Lawan',
    };
  }
  if (rank === 'J') {
    return {
      ability: 'blind_swap_opponents',
      label: 'Tukar Buta Lawan vs Lawan',
    };
  }
  if (rank === 'Q') {
    return {
      ability: 'blind_swap_self_opponent',
      label: 'Tukar Buta Diri vs Lawan',
    };
  }
  if (rank === 'K' && !isRedSuit(suit)) {
    return {
      ability: 'special_swap_king',
      label: 'Tukar Spesial (Intip / Buta)',
    };
  }
  return {
    ability: 'none',
    label: 'Tanpa Efek Aktif',
  };
}

export function createStandardDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const pointValue = resolveCardPointValue(rank, suit);
      const { ability, label } = resolveSpecialAbility(rank, suit);

      deck.push({
        id: `${rank}_${suit}`,
        suit,
        rank,
        pointValue,
        specialAbility: ability,
        abilityLabel: label,
        isRed: isRedSuit(suit),
      });
    }
  }

  return deck;
}

export function shuffleCards(cards: Card[]): Card[] {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function calculateHandPoints(hand: HandSlot[]): number {
  return hand.reduce((sum, slot) => sum + slot.card.pointValue, 0);
}

export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'spades':
      return '♠';
    case 'hearts':
      return '♥';
    case 'clubs':
      return '♣';
    case 'diamonds':
      return '♦';
  }
}

export function getSuitIndonesianName(suit: Suit): string {
  switch (suit) {
    case 'spades':
      return 'Sekop';
    case 'hearts':
      return 'Hati';
    case 'clubs':
      return 'Keriting';
    case 'diamonds':
      return 'Wajik';
  }
}
