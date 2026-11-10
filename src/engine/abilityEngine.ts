import type {
  ActionLogEntry,
  ActiveAbilityContext,
  GameState,
} from '../types/game';
import { getSuitSymbol } from './deck.ts';
import { enterReflexMatchingWindow } from './gameEngine.ts';

function buildAbilityLog(
  actorName: string,
  message: string
): ActionLogEntry {
  const now = new Date();
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now.toTimeString().slice(0, 8),
    actorName,
    message,
    badgeType: 'ability',
  };
}

export function discardDrawnCardAndCheckAbility(
  state: GameState
): GameState {
  if (
    state.turnSubPhase !== 'holding_deck_card' ||
    !state.drawnCardBuffer ||
    state.drawnFromSource !== 'deck'
  ) {
    return state;
  }

  const card = state.drawnCardBuffer;
  const actor = state.players[state.currentPlayerIndex];
  const updatedDiscard = [...state.discardPile, card];

  if (card.specialAbility === 'none') {
    const nextState: GameState = {
      ...state,
      discardPile: updatedDiscard,
      drawnCardBuffer: null,
      drawnFromSource: null,
      actionLogs: [
        buildAbilityLog(
          actor.name,
          `Membuang langsung ${card.rank}${getSuitSymbol(card.suit)} (tanpa efek sakti).`
        ),
        ...state.actionLogs,
      ],
    };
    return enterReflexMatchingWindow(nextState);
  }

  let initialStep: ActiveAbilityContext['step'] = 'select_own_card_to_peek';
  if (card.specialAbility === 'peek_opponent') {
    initialStep = 'select_opponent_card_to_peek';
  } else if (card.specialAbility === 'blind_swap_opponents') {
    initialStep = 'select_first_opponent_card';
  } else if (card.specialAbility === 'blind_swap_self_opponent') {
    initialStep = 'select_own_card_for_queen_swap';
  } else if (card.specialAbility === 'special_swap_king') {
    initialStep = 'choose_king_mode';
  }

  return {
    ...state,
    discardPile: updatedDiscard,
    drawnCardBuffer: null,
    drawnFromSource: null,
    turnSubPhase: 'executing_special_ability',
    activeAbility: {
      abilityType: card.specialAbility,
      sourceCard: card,
      step: initialStep,
    },
    actionLogs: [
      buildAbilityLog(
        actor.name,
        `Membuang ${card.rank}${getSuitSymbol(card.suit)} & mengaktifkan efek: ${card.abilityLabel}!`
      ),
      ...state.actionLogs,
    ],
  };
}

export function triggerPeekOwnCard(
  state: GameState,
  slotIndex: number
): GameState {
  if (
    !state.activeAbility ||
    (state.activeAbility.abilityType !== 'peek_own' &&
      state.activeAbility.abilityType !== 'special_swap_king')
  ) {
    return state;
  }

  if (
    state.activeAbility.abilityType === 'special_swap_king' &&
    state.activeAbility.kingOwnPeek
  ) {
    return state;
  }

  const actor = state.players[state.currentPlayerIndex];
  const targetCard = actor.hand.find((s) => s.slotIndex === slotIndex)?.card;
  if (!targetCard) return state;

  const updatedPlayers = state.players.map((p, idx) => {
    if (idx !== state.currentPlayerIndex) return p;
    return {
      ...p,
      hand: p.hand.map((slot) =>
        slot.slotIndex === slotIndex
          ? { ...slot, hasBeenPeekedByOwner: true }
          : slot
      ),
    };
  });

  if (state.activeAbility.abilityType === 'special_swap_king') {
    return {
      ...state,
      players: updatedPlayers,
      activeAbility: {
        ...state.activeAbility,
        kingOwnPeek: {
          slotIndex,
          card: targetCard,
        },
      },
      actionLogs: [
        buildAbilityLog(
          actor.name,
          `Efek KING HITAM: Mengintip kartu sendiri di slot #${slotIndex + 1}.`
        ),
        ...state.actionLogs,
      ],
    };
  }

  return {
    ...state,
    players: updatedPlayers,
    activeAbility: {
      ...state.activeAbility,
      peekedCardPreview: {
        playerId: actor.id,
        slotIndex,
        card: targetCard,
      },
    },
    actionLogs: [
      buildAbilityLog(
        actor.name,
        `Mengintip rahasia kartu miliknya sendiri di slot #${slotIndex + 1}.`
      ),
      ...state.actionLogs,
    ],
  };
}

export function triggerPeekOpponentCard(
  state: GameState,
  targetPlayerId: string,
  slotIndex: number
): GameState {
  if (
    !state.activeAbility ||
    (state.activeAbility.abilityType !== 'peek_opponent' &&
      state.activeAbility.abilityType !== 'special_swap_king')
  ) {
    return state;
  }

  if (
    state.activeAbility.abilityType === 'special_swap_king' &&
    state.activeAbility.kingOpponentPeek
  ) {
    return state;
  }

  const actor = state.players[state.currentPlayerIndex];
  if (targetPlayerId === actor.id) return state;

  const opponent = state.players.find((p) => p.id === targetPlayerId);
  const targetCard = opponent?.hand.find((s) => s.slotIndex === slotIndex)?.card;
  if (!opponent || !targetCard) return state;

  if (state.activeAbility.abilityType === 'special_swap_king') {
    return {
      ...state,
      activeAbility: {
        ...state.activeAbility,
        kingOpponentPeek: {
          playerId: opponent.id,
          slotIndex,
          card: targetCard,
        },
      },
      actionLogs: [
        buildAbilityLog(
          actor.name,
          `Efek KING HITAM: Mengintip kartu ${opponent.name} di slot #${slotIndex + 1}.`
        ),
        ...state.actionLogs,
      ],
    };
  }

  return {
    ...state,
    activeAbility: {
      ...state.activeAbility,
      peekedCardPreview: {
        playerId: opponent.id,
        slotIndex,
        card: targetCard,
      },
    },
    actionLogs: [
      buildAbilityLog(
        actor.name,
        `Mengintip rahasia kartu milik ${opponent.name} di slot #${slotIndex + 1}.`
      ),
      ...state.actionLogs,
    ],
  };
}

export function finishPeekAndAdvanceTurn(state: GameState): GameState {
  return enterReflexMatchingWindow({
    ...state,
    activeAbility: null,
  });
}

export function executeJackOpponentVsOpponentSwap(
  state: GameState,
  firstTarget: { playerId: string; slotIndex: number },
  secondTarget: { playerId: string; slotIndex: number }
): GameState {
  const actor = state.players[state.currentPlayerIndex];
  if (
    firstTarget.playerId === actor.id ||
    secondTarget.playerId === actor.id ||
    firstTarget.playerId === secondTarget.playerId
  ) {
    return state;
  }

  const firstPlayer = state.players.find((p) => p.id === firstTarget.playerId);
  const secondPlayer = state.players.find((p) => p.id === secondTarget.playerId);
  if (!firstPlayer || !secondPlayer) return state;

  const cardA = firstPlayer.hand.find((s) => s.slotIndex === firstTarget.slotIndex)?.card;
  const cardB = secondPlayer.hand.find((s) => s.slotIndex === secondTarget.slotIndex)?.card;
  if (!cardA || !cardB) return state;

  const updatedPlayers = state.players.map((p) => {
    if (p.id === firstPlayer.id) {
      return {
        ...p,
        hand: p.hand.map((slot) =>
          slot.slotIndex === firstTarget.slotIndex
            ? { ...slot, card: cardB, hasBeenPeekedByOwner: false }
            : slot
        ),
      };
    }
    if (p.id === secondPlayer.id) {
      return {
        ...p,
        hand: p.hand.map((slot) =>
          slot.slotIndex === secondTarget.slotIndex
            ? { ...slot, card: cardA, hasBeenPeekedByOwner: false }
            : slot
        ),
      };
    }
    return p;
  });

  return enterReflexMatchingWindow({
    ...state,
    players: updatedPlayers,
    activeAbility: null,
    actionLogs: [
      buildAbilityLog(
        actor.name,
        `Efek JACK: Menukar buta kartu ${firstPlayer.name} (#${firstTarget.slotIndex + 1}) dengan ${secondPlayer.name} (#${secondTarget.slotIndex + 1})!`
      ),
      ...state.actionLogs,
    ],
  });
}

export function executeSelfWithOpponentSwap(
  state: GameState,
  ownSlotIndex: number,
  opponentId: string,
  opponentSlotIndex: number,
  wasPeekedByKing = false
): GameState {
  const actor = state.players[state.currentPlayerIndex];
  if (opponentId === actor.id) return state;

  const opponent = state.players.find((p) => p.id === opponentId);
  if (!opponent) return state;

  const ownCard = actor.hand.find((s) => s.slotIndex === ownSlotIndex)?.card;
  const oppCard = opponent.hand.find((s) => s.slotIndex === opponentSlotIndex)?.card;
  if (!ownCard || !oppCard) return state;

  const updatedPlayers = state.players.map((p) => {
    if (p.id === actor.id) {
      return {
        ...p,
        hand: p.hand.map((slot) =>
          slot.slotIndex === ownSlotIndex
            ? { ...slot, card: oppCard, hasBeenPeekedByOwner: wasPeekedByKing }
            : slot
        ),
      };
    }
    if (p.id === opponent.id) {
      return {
        ...p,
        hand: p.hand.map((slot) =>
          slot.slotIndex === opponentSlotIndex
            ? { ...slot, card: ownCard, hasBeenPeekedByOwner: false }
            : slot
        ),
      };
    }
    return p;
  });

  const labelPrefix = wasPeekedByKing ? 'Efek KING HITAM' : 'Efek QUEEN';

  return enterReflexMatchingWindow({
    ...state,
    players: updatedPlayers,
    activeAbility: null,
    actionLogs: [
      buildAbilityLog(
        actor.name,
        `${labelPrefix}: Menukar kartu slot #${ownSlotIndex + 1} miliknya dengan kartu ${opponent.name} (#${opponentSlotIndex + 1})!`
      ),
      ...state.actionLogs,
    ],
  });
}
