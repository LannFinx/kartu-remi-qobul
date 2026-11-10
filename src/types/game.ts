export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export type SpecialAbilityType =
  | 'none'
  | 'peek_own'
  | 'peek_opponent'
  | 'blind_swap_opponents'
  | 'blind_swap_self_opponent'
  | 'special_swap_king';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  pointValue: number;
  specialAbility: SpecialAbilityType;
  abilityLabel: string;
  isRed: boolean;
}

export interface HandSlot {
  slotIndex: number;
  card: Card;
  isRevealedToAll: boolean;
  hasBeenPeekedByOwner: boolean;
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  avatarColor: string;
  hand: HandSlot[];
  cumulativeScore: number;
  lastRoundRawScore: number | null;
  lastRoundFinalScore: number | null;
}

export type TurnSubPhase =
  | 'awaiting_draw_or_qobul'
  | 'holding_deck_card'
  | 'selecting_hand_slot_for_discard_swap'
  | 'executing_special_ability'
  | 'reflex_matching_window'
  | 'turn_completed';

export interface ReflexVerdict {
  id: string;
  actorName: string;
  succeeded: boolean;
  detail: string;
}

export interface ActiveAbilityContext {
  abilityType: SpecialAbilityType;
  sourceCard: Card;
  step:
    | 'select_own_card_to_peek'
    | 'select_opponent_card_to_peek'
    | 'select_first_opponent_card'
    | 'select_second_opponent_card'
    | 'select_own_card_for_queen_swap'
    | 'select_opponent_card_for_queen_swap'
    | 'choose_king_mode'
    | 'king_peek_phase'
    | 'king_confirm_swap_phase';
  selectedFirstTarget?: {
    playerId: string;
    slotIndex: number;
  };
  selectedSecondTarget?: {
    playerId: string;
    slotIndex: number;
  };
  peekedCardPreview?: {
    playerId: string;
    slotIndex: number;
    card: Card;
  };
  kingOwnPeek?: {
    slotIndex: number;
    card: Card;
  };
  kingOpponentPeek?: {
    playerId: string;
    slotIndex: number;
    card: Card;
  };
}

export interface ActionLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  message: string;
  badgeType: 'normal' | 'ability' | 'qobul' | 'penalty';
}

export interface RoundSummaryItem {
  playerId: string;
  playerName: string;
  rawPoints: number;
  appliedPoints: number;
  isCaller: boolean;
  callerSucceeded: boolean | null;
  isRoundWinner: boolean;
}

export interface GameConfig {
  playerCount: number;
  qobulBlunderPenalty: 10 | 20;
  botCount: number;
}

export interface TableMoveAnnouncement {
  id: string;
  actorId: string;
  actorName: string;
  kind:
    | 'draw_deck'
    | 'draw_discard'
    | 'swap_card'
    | 'discard_card'
    | 'ability'
    | 'slam_match'
    | 'slam_penalty'
    | 'qobul';
  label: string;
  targetPlayerId?: string;
  targetSlotIndex?: number;
}

export interface GameState {
  config: GameConfig;
  roundNumber: number;
  players: Player[];
  currentPlayerIndex: number;
  turnSubPhase: TurnSubPhase;
  drawPile: Card[];
  discardPile: Card[];
  drawnCardBuffer: Card | null;
  drawnFromSource: 'deck' | 'discard' | null;
  activeAbility: ActiveAbilityContext | null;
  qobulCallerId: string | null;
  finalTurnsQueue: string[];
  isRoundOver: boolean;
  roundSummary: RoundSummaryItem[] | null;
  actionLogs: ActionLogEntry[];
  lastReflexVerdict: ReflexVerdict | null;
  lastTableMove?: TableMoveAnnouncement | null;
}

