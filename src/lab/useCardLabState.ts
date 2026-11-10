import { useEffect, useReducer } from 'react';
import { Card, ReflexVerdict } from '../types/game';
import { createStandardDeck, shuffleCards } from '../engine/deck';
import { playPenaltyBuzzerSound, playSlamSuccessSound } from '../engine/soundEffects';

export type LabPhase =
  | 'dealing'
  | 'idle'
  | 'focused'
  | 'choosing_slot'
  | 'choosing_peek_slot'
  | 'peeking_card'
  | 'reflex_window';

export interface LabState {
  phase: LabPhase;
  drawPile: Card[];
  hand: Array<Card | null>;
  focusedCard: Card | null;
  focusArrivedHidden: boolean;
  discardPile: Card[];
  discardArrivedHidden: boolean;
  knownCardIds: string[];
  peekingSlotIndex: number | null;
  misfireSlotIndex: number | null;
  reflexWindowId: number;
  lastVerdict: ReflexVerdict | null;
}

type LabAction =
  | { type: 'deal_next' }
  | { type: 'open_first_discard' }
  | { type: 'draw_from_deck' }
  | { type: 'discard_focused' }
  | { type: 'start_keep' }
  | { type: 'cancel_keep' }
  | { type: 'keep_into_slot'; slotIndex: number }
  | { type: 'peek_slot'; slotIndex: number }
  | { type: 'finish_peek' }
  | { type: 'attempt_slam'; slotIndex: number }
  | { type: 'clear_misfire' }
  | { type: 'end_reflex_window' }
  | { type: 'reset' };

const INITIAL_HAND_SIZE = 4;
const DEAL_INTERVAL_MS = 130;
const FIRST_DISCARD_DELAY_MS = 380;
export const LAB_REFLEX_DURATION_MS = 2800;

function createFreshState(): LabState {
  return {
    phase: 'dealing',
    drawPile: shuffleCards(createStandardDeck()),
    hand: Array.from({ length: INITIAL_HAND_SIZE }, () => null),
    focusedCard: null,
    focusArrivedHidden: false,
    discardPile: [],
    discardArrivedHidden: false,
    knownCardIds: [],
    peekingSlotIndex: null,
    misfireSlotIndex: null,
    reflexWindowId: 0,
    lastVerdict: null,
  };
}

function takeTopCard(drawPile: Card[]): [Card, Card[]] {
  return [drawPile[drawPile.length - 1], drawPile.slice(0, -1)];
}

function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case 'deal_next': {
      const emptySlot = state.hand.indexOf(null);
      if (state.phase !== 'dealing' || emptySlot === -1) return state;
      const [card, drawPile] = takeTopCard(state.drawPile);
      const hand = state.hand.map((slot, index) => (index === emptySlot ? card : slot));
      return { ...state, drawPile, hand };
    }
    case 'open_first_discard': {
      if (state.phase !== 'dealing') return state;
      const [card, drawPile] = takeTopCard(state.drawPile);
      return {
        ...state,
        drawPile,
        discardPile: [card],
        discardArrivedHidden: true,
        phase: 'idle',
      };
    }
    case 'draw_from_deck': {
      if (state.phase !== 'idle' || state.drawPile.length === 0) return state;
      const [card, drawPile] = takeTopCard(state.drawPile);
      return {
        ...state,
        drawPile,
        focusedCard: card,
        focusArrivedHidden: true,
        lastVerdict: null,
        misfireSlotIndex: null,
        phase: 'focused',
      };
    }
    case 'discard_focused': {
      if (!state.focusedCard) return state;
      const discarded = state.focusedCard;
      const nextDiscard = [...state.discardPile, discarded];

      if (discarded.specialAbility !== 'none') {
        return {
          ...state,
          discardPile: nextDiscard,
          discardArrivedHidden: false,
          focusedCard: null,
          phase: 'choosing_peek_slot',
        };
      }

      return {
        ...state,
        discardPile: nextDiscard,
        discardArrivedHidden: false,
        focusedCard: null,
        reflexWindowId: state.reflexWindowId + 1,
        phase: 'reflex_window',
      };
    }
    case 'peek_slot': {
      const target = state.hand[action.slotIndex];
      if (state.phase !== 'choosing_peek_slot' || !target) return state;
      return {
        ...state,
        peekingSlotIndex: action.slotIndex,
        knownCardIds: state.knownCardIds.includes(target.id)
          ? state.knownCardIds
          : [...state.knownCardIds, target.id],
        phase: 'peeking_card',
      };
    }
    case 'finish_peek': {
      if (state.phase !== 'peeking_card') return state;
      return {
        ...state,
        peekingSlotIndex: null,
        reflexWindowId: state.reflexWindowId + 1,
        phase: 'reflex_window',
      };
    }
    case 'start_keep':
      return state.phase === 'focused' ? { ...state, phase: 'choosing_slot' } : state;
    case 'cancel_keep':
      return state.phase === 'choosing_slot'
        ? { ...state, phase: 'focused', focusArrivedHidden: false }
        : state;
    case 'keep_into_slot': {
      const replacedCard = state.hand[action.slotIndex];
      if (state.phase !== 'choosing_slot' || !state.focusedCard || !replacedCard) return state;
      const keptCard = state.focusedCard;
      return {
        ...state,
        hand: state.hand.map((slot, index) => (index === action.slotIndex ? keptCard : slot)),
        discardPile: [...state.discardPile, replacedCard],
        discardArrivedHidden: true,
        knownCardIds: [...state.knownCardIds, keptCard.id],
        focusedCard: null,
        reflexWindowId: state.reflexWindowId + 1,
        phase: 'reflex_window',
      };
    }
    case 'attempt_slam': {
      const targetCard = state.hand[action.slotIndex];
      const topDiscard = state.discardPile[state.discardPile.length - 1];
      if (state.phase !== 'reflex_window' || !targetCard || !topDiscard) {
        return state;
      }

      if (targetCard.rank === topDiscard.rank) {
        playSlamSuccessSound();
        const remainingHand = state.hand.map((c, idx) =>
          idx === action.slotIndex ? null : c
        );
        return {
          ...state,
          hand: remainingHand,
          discardPile: [...state.discardPile, targetCard],
          discardArrivedHidden: true,
          misfireSlotIndex: null,
          reflexWindowId: state.reflexWindowId + 1,
          lastVerdict: {
            id: `${Date.now()}`,
            actorName: 'Anda',
            succeeded: true,
            detail: 'MATCH! −1 Kartu',
          },
        };
      }

      playPenaltyBuzzerSound();
      if (state.drawPile.length === 0) {
        return {
          ...state,
          misfireSlotIndex: action.slotIndex,
          lastVerdict: {
            id: `${Date.now()}`,
            actorName: 'Anda',
            succeeded: false,
            detail: 'ZONK! +1 Penalti',
          },
        };
      }

      const [penaltyCard, nextDraw] = takeTopCard(state.drawPile);
      return {
        ...state,
        drawPile: nextDraw,
        hand: [...state.hand, penaltyCard],
        misfireSlotIndex: action.slotIndex,
        reflexWindowId: state.reflexWindowId + 1,
        lastVerdict: {
          id: `${Date.now()}`,
          actorName: 'Anda',
          succeeded: false,
          detail: 'ZONK! +1 Penalti',
        },
      };
    }
    case 'clear_misfire':
      return { ...state, misfireSlotIndex: null };
    case 'end_reflex_window': {
      if (state.phase !== 'reflex_window') return state;
      return {
        ...state,
        misfireSlotIndex: null,
        lastVerdict: null,
        phase: 'idle',
      };
    }
    case 'reset':
      return createFreshState();
  }
}

export function useCardLabState() {
  const [state, dispatch] = useReducer(labReducer, undefined, createFreshState);

  const isInitialHandDealt =
    state.hand.length === INITIAL_HAND_SIZE && !state.hand.includes(null);

  useEffect(() => {
    if (state.phase !== 'dealing') return;
    const timer = window.setTimeout(
      () =>
        dispatch(
          isInitialHandDealt ? { type: 'open_first_discard' } : { type: 'deal_next' }
        ),
      isInitialHandDealt ? FIRST_DISCARD_DELAY_MS : DEAL_INTERVAL_MS
    );
    return () => window.clearTimeout(timer);
  }, [state.phase, state.hand, isInitialHandDealt]);

  useEffect(() => {
    if (state.misfireSlotIndex === null) return;
    const timer = window.setTimeout(
      () => dispatch({ type: 'clear_misfire' }),
      950
    );
    return () => window.clearTimeout(timer);
  }, [state.misfireSlotIndex, state.lastVerdict?.id]);

  useEffect(() => {
    if (state.phase !== 'reflex_window') return;
    const timer = window.setTimeout(
      () => dispatch({ type: 'end_reflex_window' }),
      LAB_REFLEX_DURATION_MS
    );
    return () => window.clearTimeout(timer);
  }, [state.phase, state.reflexWindowId]);

  return { state, dispatch };
}
