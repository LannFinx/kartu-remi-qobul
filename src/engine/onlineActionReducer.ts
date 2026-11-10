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
  completeReflexWindowAndAdvance,
  declareQobulShout,
  drawFromDeckPile,
  drawFromDiscardPile,
  swapDrawnCardWithHandSlot,
} from './gameEngine';
import { RemoteGameAction } from './onlineRoom';

export function applyRemoteActionToState(
  state: GameState,
  action: RemoteGameAction
): GameState {
  switch (action.kind) {
    case 'DRAW_DECK':
      return drawFromDeckPile(state);
    case 'DRAW_DISCARD':
      return drawFromDiscardPile(state);
    case 'CHOOSE_SWAP_MODE':
      return {
        ...state,
        turnSubPhase: 'selecting_hand_slot_for_discard_swap',
      };
    case 'CANCEL_SWAP_MODE':
      return {
        ...state,
        turnSubPhase: 'holding_deck_card',
      };
    case 'SWAP_SLOT':
      return swapDrawnCardWithHandSlot(state, action.slotIndex);
    case 'DISCARD_DRAWN':
      return discardDrawnCardAndCheckAbility(state);
    case 'CALL_QOBUL':
      return declareQobulShout(state);
    case 'REFLEX_SLAM':
      return attemptReflexCardSlam(state, action.playerId, action.slotIndex);
    case 'SKIP_REFLEX':
      return completeReflexWindowAndAdvance(state);
    case 'PEEK_OWN':
      return triggerPeekOwnCard(state, action.slotIndex);
    case 'PEEK_OPPONENT':
      return triggerPeekOpponentCard(
        state,
        action.targetPlayerId,
        action.slotIndex
      );
    case 'FINISH_PEEK':
      return finishPeekAndAdvanceTurn(state);
    case 'JACK_SWAP':
      return executeJackOpponentVsOpponentSwap(
        state,
        action.target1,
        action.target2
      );
    case 'QUEEN_SWAP':
      return executeSelfWithOpponentSwap(
        state,
        action.ownSlotIndex,
        action.opponentId,
        action.opponentSlotIndex,
        false
      );
    case 'KING_SWAP':
      return executeSelfWithOpponentSwap(
        state,
        action.ownSlotIndex,
        action.opponentId,
        action.opponentSlotIndex,
        action.wasPeeked
      );
    case 'SKIP_KING_SWAP':
      return finishPeekAndAdvanceTurn(state);
  }
}

