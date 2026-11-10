import { GameState } from '../types/game';
import {
  discardDrawnCardAndCheckAbility,
  executeJackOpponentVsOpponentSwap,
  executeSelfWithOpponentSwap,
  finishPeekAndAdvanceTurn,
  triggerPeekOpponentCard,
  triggerPeekOwnCard,
} from './abilityEngine';
import {
  attemptReflexCardSlam,
  declareQobulShout,
  drawFromDeckPile,
  drawFromDiscardPile,
  swapDrawnCardWithHandSlot,
} from './gameEngine';

export function executeBotReflexCheck(state: GameState): GameState {
  if (
    state.turnSubPhase !== 'reflex_matching_window' ||
    state.discardPile.length === 0 ||
    state.isRoundOver ||
    state.matchClaimedThisWindow
  ) {
    return state;
  }

  const topDiscard = state.discardPile[state.discardPile.length - 1];

  for (const player of state.players) {
    if (!player.isBot) continue;
    const matchingSlot = player.hand.find(
      (slot) => slot.hasBeenPeekedByOwner && slot.card.rank === topDiscard.rank
    );
    if (matchingSlot && Math.random() < 0.78) {
      return attemptReflexCardSlam(state, player.id, matchingSlot.slotIndex);
    }
  }

  return state;
}

export function executeSmartBotTurn(state: GameState): GameState {
  const currentActor = state.players[state.currentPlayerIndex];
  if (!currentActor || !currentActor.isBot || state.isRoundOver) {
    return state;
  }

  const { turnSubPhase, drawnCardBuffer, discardPile, qobulCallerId, activeAbility } =
    state;

  if (turnSubPhase === 'awaiting_draw_or_qobul') {
    const peekedSlots = currentActor.hand.filter((s) => s.hasBeenPeekedByOwner);
    const knownPoints = peekedSlots.reduce((sum, s) => sum + s.card.pointValue, 0);

    const shouldShoutQobul =
      qobulCallerId === null &&
      peekedSlots.length >= 2 &&
      knownPoints <= 7 &&
      Math.random() < 0.85;

    if (shouldShoutQobul) {
      return declareQobulShout(state);
    }

    const topDiscard =
      discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

    if (topDiscard && (topDiscard.pointValue <= 4 || topDiscard.pointValue === -1)) {
      return drawFromDiscardPile(state);
    }

    return drawFromDeckPile(state);
  }

  if (turnSubPhase === 'selecting_hand_slot_for_discard_swap') {
    const unpeekedSlot = currentActor.hand.find((s) => !s.hasBeenPeekedByOwner);
    let targetSlot = unpeekedSlot ? unpeekedSlot.slotIndex : -1;
    if (targetSlot === -1) {
      let maxVal = -999;
      currentActor.hand.forEach((s) => {
        if (s.card.pointValue > maxVal) {
          maxVal = s.card.pointValue;
          targetSlot = s.slotIndex;
        }
      });
    }
    const fallbackSlot = currentActor.hand[0]?.slotIndex ?? 0;
    return swapDrawnCardWithHandSlot(state, targetSlot >= 0 ? targetSlot : fallbackSlot);
  }

  if (turnSubPhase === 'holding_deck_card' && drawnCardBuffer) {
    if (drawnCardBuffer.specialAbility !== 'none') {
      return discardDrawnCardAndCheckAbility(state);
    }

    if (drawnCardBuffer.pointValue <= 4 || drawnCardBuffer.pointValue === -1) {
      const unpeekedSlot = currentActor.hand.find((s) => !s.hasBeenPeekedByOwner);
      let targetSlot = unpeekedSlot ? unpeekedSlot.slotIndex : -1;
      if (targetSlot === -1) {
        let maxVal = -999;
        currentActor.hand.forEach((s) => {
          if (s.card.pointValue > maxVal) {
            maxVal = s.card.pointValue;
            targetSlot = s.slotIndex;
          }
        });
      }
      const fallbackSlot = currentActor.hand[0]?.slotIndex ?? 0;
      return swapDrawnCardWithHandSlot(state, targetSlot >= 0 ? targetSlot : fallbackSlot);
    }

    return discardDrawnCardAndCheckAbility(state);
  }

  if (turnSubPhase === 'executing_special_ability' && activeAbility) {
    const opponents = state.players.filter(
      (p) => p.id !== currentActor.id && p.hand.length > 0
    );
    const ownFallbackSlot = currentActor.hand[0]?.slotIndex ?? 0;

    if (activeAbility.abilityType === 'peek_own') {
      const unpeeked = currentActor.hand.find((s) => !s.hasBeenPeekedByOwner);
      const slotToPeek = unpeeked ? unpeeked.slotIndex : ownFallbackSlot;
      const peekedState = triggerPeekOwnCard(state, slotToPeek);
      return finishPeekAndAdvanceTurn(peekedState);
    }

    if (activeAbility.abilityType === 'peek_opponent') {
      const targetOpp = opponents[0] ?? currentActor;
      const oppSlot = targetOpp.hand[0]?.slotIndex ?? 0;
      const peekedState = triggerPeekOpponentCard(state, targetOpp.id, oppSlot);
      return finishPeekAndAdvanceTurn(peekedState);
    }

    if (activeAbility.abilityType === 'blind_swap_opponents') {
      if (opponents.length >= 2) {
        return executeJackOpponentVsOpponentSwap(
          state,
          { playerId: opponents[0].id, slotIndex: opponents[0].hand[0]?.slotIndex ?? 0 },
          { playerId: opponents[1].id, slotIndex: opponents[1].hand[0]?.slotIndex ?? 0 }
        );
      }
      return finishPeekAndAdvanceTurn(state);
    }

    if (activeAbility.abilityType === 'blind_swap_self_opponent') {
      const targetOpp = opponents[0];
      if (!targetOpp) return finishPeekAndAdvanceTurn(state);
      return executeSelfWithOpponentSwap(
        state,
        ownFallbackSlot,
        targetOpp.id,
        targetOpp.hand[0]?.slotIndex ?? 0,
        false
      );
    }

    if (activeAbility.abilityType === 'special_swap_king') {
      const targetOpp = opponents[0];
      if (!targetOpp) return finishPeekAndAdvanceTurn(state);
      return executeSelfWithOpponentSwap(
        state,
        ownFallbackSlot,
        targetOpp.id,
        targetOpp.hand[0]?.slotIndex ?? 0,
        true
      );
    }
  }

  return state;
}

