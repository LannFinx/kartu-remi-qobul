import type {
  ActionLogEntry,
  Card,
  GameConfig,
  GameState,
  HandSlot,
  Player,
  RoundSummaryItem,
} from '../types/game';
import {
  calculateHandPoints,
  createStandardDeck,
  getSuitSymbol,
  shuffleCards,
} from './deck.ts';

const AVATAR_COLORS = [
  '#F59E0B',
  '#06B6D4',
  '#10B981',
  '#EC4899',
  '#8B5CF6',
];

const DEFAULT_NAMES = [
  'Anda (Pemain 1)',
  'Raka',
  'Sinta',
  'Bayu',
  'Nadia',
];

function createLogEntry(
  actorName: string,
  message: string,
  badgeType: ActionLogEntry['badgeType'] = 'normal'
): ActionLogEntry {
  const now = new Date();
  const timestamp = now.toTimeString().slice(0, 8);
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp,
    actorName,
    message,
    badgeType,
  };
}

function replenishDrawPileIfNeeded(
  drawPile: Card[],
  discardPile: Card[]
): { nextDraw: Card[]; nextDiscard: Card[] } {
  if (drawPile.length > 0 || discardPile.length <= 1) {
    return { nextDraw: drawPile, nextDiscard: discardPile };
  }
  const topDiscard = discardPile[discardPile.length - 1];
  const recyclable = discardPile.slice(0, -1);
  return {
    nextDraw: shuffleCards(recyclable),
    nextDiscard: [topDiscard],
  };
}

export function createInitialGameState(
  config: GameConfig,
  existingPlayers?: Player[],
  nextRoundNumber = 1
): GameState {
  const fullDeck = shuffleCards(createStandardDeck());
  let cursor = 0;

  const players: Player[] = Array.from({ length: config.playerCount }, (_, idx) => {
    const handCards = fullDeck.slice(cursor, cursor + 4);
    cursor += 4;

    const hand: HandSlot[] = handCards.map((card, slotIndex) => ({
      slotIndex,
      card,
      isRevealedToAll: false,
      hasBeenPeekedByOwner: false,
    }));

    const previous = existingPlayers?.[idx];
    const isBot = idx > 0 && idx >= config.playerCount - config.botCount;

    return {
      id: `player_${idx + 1}`,
      name: previous?.name ?? DEFAULT_NAMES[idx] ?? `Pemain ${idx + 1}`,
      isBot,
      avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      hand,
      cumulativeScore: previous?.cumulativeScore ?? 0,
      lastRoundRawScore: null,
      lastRoundFinalScore: null,
    };
  });

  const initialDiscard = fullDeck[cursor];
  const remainingDeck = fullDeck.slice(cursor + 1);

  return {
    config,
    roundNumber: nextRoundNumber,
    players,
    currentPlayerIndex: 0,
    turnSubPhase: 'awaiting_draw_or_qobul',
    drawPile: remainingDeck,
    discardPile: [initialDiscard],
    drawnCardBuffer: null,
    drawnFromSource: null,
    activeAbility: null,
    qobulCallerId: null,
    finalTurnsQueue: [],
    isRoundOver: false,
    roundSummary: null,
    lastReflexVerdict: null,
    actionLogs: [
      createLogEntry(
        'Meja Qobul',
        `Ronde #${nextRoundNumber} dimulai dengan Blind Start! 4 kartu tiap pemain tertutup rapat.`,
        'normal'
      ),
    ],
  };
}

export function evaluateRoundShowdown(state: GameState): GameState {
  const revealedPlayers = state.players.map((player) => ({
    ...player,
    hand: player.hand.map((slot) => ({
      ...slot,
      isRevealedToAll: true,
    })),
  }));

  const rawScoreMap = new Map<string, number>();
  revealedPlayers.forEach((p) => {
    rawScoreMap.set(p.id, calculateHandPoints(p.hand));
  });

  const callerId = state.qobulCallerId;
  let callerStrictlyLowest = false;

  if (callerId) {
    const callerScore = rawScoreMap.get(callerId) ?? 0;
    const otherScores = revealedPlayers
      .filter((p) => p.id !== callerId)
      .map((p) => rawScoreMap.get(p.id) ?? 0);
    callerStrictlyLowest = otherScores.every((score) => callerScore < score);
  }

  const appliedScoreMap = new Map<string, number>();
  revealedPlayers.forEach((p) => {
    const raw = rawScoreMap.get(p.id) ?? 0;
    if (p.id === callerId) {
      if (callerStrictlyLowest) {
        appliedScoreMap.set(p.id, raw < 0 ? raw : 0);
      } else {
        appliedScoreMap.set(p.id, raw + state.config.qobulBlunderPenalty);
      }
    } else {
      appliedScoreMap.set(p.id, raw);
    }
  });

  const minAppliedScore = Math.min(...Array.from(appliedScoreMap.values()));

  const updatedPlayers = revealedPlayers.map((p) => {
    const raw = rawScoreMap.get(p.id) ?? 0;
    const applied = appliedScoreMap.get(p.id) ?? raw;
    return {
      ...p,
      lastRoundRawScore: raw,
      lastRoundFinalScore: applied,
      cumulativeScore: p.cumulativeScore + applied,
    };
  });

  const roundSummary: RoundSummaryItem[] = updatedPlayers.map((p) => ({
    playerId: p.id,
    playerName: p.name,
    rawPoints: p.lastRoundRawScore ?? 0,
    appliedPoints: p.lastRoundFinalScore ?? 0,
    isCaller: p.id === callerId,
    callerSucceeded: p.id === callerId ? callerStrictlyLowest : null,
    isRoundWinner: (p.lastRoundFinalScore ?? 0) === minAppliedScore,
  }));

  const callerPlayer = updatedPlayers.find((p) => p.id === callerId);
  const verdictLog = callerPlayer
    ? callerStrictlyLowest
      ? createLogEntry(
          callerPlayer.name,
          `QOBUL BERHASIL! Nilai terendah murni (${callerPlayer.lastRoundRawScore} poin).`,
          'qobul'
        )
      : createLogEntry(
          callerPlayer.name,
          `BLUNDER QOBUL! Gagal jadi yang terendah, terkena penalti +${state.config.qobulBlunderPenalty} poin!`,
          'penalty'
        )
    : createLogEntry('Meja Qobul', 'Ronde selesai, seluruh kartu dibuka!', 'normal');

  return {
    ...state,
    players: updatedPlayers,
    turnSubPhase: 'turn_completed',
    isRoundOver: true,
    roundSummary,
    actionLogs: [verdictLog, ...state.actionLogs],
  };
}

export function advanceToNextPlayerTurn(state: GameState): GameState {
  if (state.qobulCallerId !== null) {
    const currentPlayer = state.players[state.currentPlayerIndex];
    const remainingQueue = state.finalTurnsQueue.filter(
      (id) => id !== currentPlayer.id
    );

    if (remainingQueue.length === 0) {
      return evaluateRoundShowdown({
        ...state,
        finalTurnsQueue: [],
      });
    }

    const nextPlayerId = remainingQueue[0];
    const nextIndex = state.players.findIndex((p) => p.id === nextPlayerId);

    return {
      ...state,
      currentPlayerIndex: nextIndex >= 0 ? nextIndex : 0,
      turnSubPhase: 'awaiting_draw_or_qobul',
      drawnCardBuffer: null,
      drawnFromSource: null,
      activeAbility: null,
      finalTurnsQueue: remainingQueue,
    };
  }

  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnSubPhase: 'awaiting_draw_or_qobul',
    drawnCardBuffer: null,
    drawnFromSource: null,
    activeAbility: null,
  };
}

export function drawFromDeckPile(state: GameState): GameState {
  if (state.turnSubPhase !== 'awaiting_draw_or_qobul' || state.isRoundOver) {
    return state;
  }

  const { nextDraw, nextDiscard } = replenishDrawPileIfNeeded(
    state.drawPile,
    state.discardPile
  );

  if (nextDraw.length === 0) {
    return evaluateRoundShowdown(state);
  }

  const drawnCard = nextDraw[nextDraw.length - 1];
  const remainingDeck = nextDraw.slice(0, -1);
  const actor = state.players[state.currentPlayerIndex];

  return {
    ...state,
    drawPile: remainingDeck,
    discardPile: nextDiscard,
    drawnCardBuffer: drawnCard,
    drawnFromSource: 'deck',
    turnSubPhase: 'holding_deck_card',
    lastTableMove: {
      id: `move_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'draw_deck',
      label: `${actor.name} mengambil kartu dari Dek`,
    },
    actionLogs: [
      createLogEntry(actor.name, 'Mengambil 1 kartu dari Draw Pile.', 'normal'),
      ...state.actionLogs,
    ],
  };
}

export function drawFromDiscardPile(state: GameState): GameState {
  if (
    state.turnSubPhase !== 'awaiting_draw_or_qobul' ||
    state.discardPile.length === 0 ||
    state.isRoundOver
  ) {
    return state;
  }

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const remainingDiscard = state.discardPile.slice(0, -1);
  const actor = state.players[state.currentPlayerIndex];

  return {
    ...state,
    discardPile: remainingDiscard,
    drawnCardBuffer: topDiscard,
    drawnFromSource: 'discard',
    turnSubPhase: 'selecting_hand_slot_for_discard_swap',
    lastTableMove: {
      id: `move_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'draw_discard',
      label: `${actor.name} mengambil ${topDiscard.rank}${getSuitSymbol(topDiscard.suit)} dari Buangan`,
    },
    actionLogs: [
      createLogEntry(
        actor.name,
        `Mengambil ${topDiscard.rank}${getSuitSymbol(topDiscard.suit)} terbuka dari Discard Pile.`,
        'normal'
      ),
      ...state.actionLogs,
    ],
  };
}

export function enterReflexMatchingWindow(state: GameState): GameState {
  if (state.isRoundOver || state.discardPile.length === 0) {
    return advanceToNextPlayerTurn(state);
  }
  return {
    ...state,
    turnSubPhase: 'reflex_matching_window',
    matchClaimedThisWindow: false,
    drawnCardBuffer: null,
    drawnFromSource: null,
    activeAbility: null,
  };
}

export function completeReflexWindowAndAdvance(state: GameState): GameState {
  if (state.turnSubPhase !== 'reflex_matching_window') {
    return state;
  }
  return advanceToNextPlayerTurn({
    ...state,
    matchClaimedThisWindow: false,
    lastReflexVerdict: null,
  });
}

export function attemptReflexCardSlam(
  state: GameState,
  playerId: string,
  slotIndex: number
): GameState {
  if (
    state.turnSubPhase !== 'reflex_matching_window' ||
    state.discardPile.length === 0 ||
    state.isRoundOver
  ) {
    return state;
  }

  const player = state.players.find((p) => p.id === playerId);
  const targetSlot = player?.hand.find((s) => s.slotIndex === slotIndex);
  if (!player || !targetSlot) return state;

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const isActiveActor =
    state.players[state.currentPlayerIndex]?.id === player.id;

  if (state.matchClaimedThisWindow) {
    const { nextDraw, nextDiscard } = replenishDrawPileIfNeeded(
      state.drawPile,
      state.discardPile
    );

    const penaltyCard = nextDraw[nextDraw.length - 1];
    const remainingDeck = penaltyCard ? nextDraw.slice(0, -1) : nextDraw;

    const updatedPlayers = state.players.map((p) => {
      if (p.id !== player.id || !penaltyCard) return p;
      const maxExistingIndex = p.hand.reduce(
        (maxIdx, s) => Math.max(maxIdx, s.slotIndex),
        3
      );
      return {
        ...p,
        hand: [
          ...p.hand,
          {
            slotIndex: maxExistingIndex + 1,
            card: penaltyCard,
            isRevealedToAll: false,
            hasBeenPeekedByOwner: false,
          },
        ],
      };
    });

    const detail = `TELAT! ${player.name} kalah cepat menaruh kartu kembar. Kena +1 kartu penalti!`;

    return {
      ...state,
      players: updatedPlayers,
      drawPile: remainingDeck,
      discardPile: nextDiscard,
      lastTableMove: {
        id: `move_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        actorId: player.id,
        actorName: player.name,
        kind: 'slam_late',
        label: `${player.name} telat match! +1 Kartu Penalti`,
        targetPlayerId: player.id,
        targetSlotIndex: slotIndex,
      },
      lastReflexVerdict: {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        actorName: player.name,
        succeeded: false,
        isLate: true,
        detail,
      },
      actionLogs: [
        createLogEntry(player.name, detail, 'penalty'),
        ...state.actionLogs,
      ],
    };
  }

  if (targetSlot.card.rank === topDiscard.rank) {
    const remainingHand: HandSlot[] = player.hand.filter(
      (slot) => slot.slotIndex !== slotIndex
    );

    const updatedPlayers = state.players.map((p) =>
      p.id === player.id ? { ...p, hand: remainingHand } : p
    );

    const dropTypeLabel = isActiveActor ? 'DOUBLE DROP' : 'SLAM REFLEKS';
    const detail = `${dropTypeLabel}! ${player.name} membuang kembaran ${targetSlot.card.rank}${getSuitSymbol(targetSlot.card.suit)} (sisa ${remainingHand.length} kartu).`;

    const nextState: GameState = {
      ...state,
      matchClaimedThisWindow: true,
      players: updatedPlayers,
      discardPile: [...state.discardPile, targetSlot.card],
      lastTableMove: {
        id: `move_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        actorId: player.id,
        actorName: player.name,
        kind: 'slam_match',
        label: `${player.name} buang cepat kembar ${targetSlot.card.rank}${getSuitSymbol(targetSlot.card.suit)}!`,
        targetPlayerId: player.id,
        targetSlotIndex: slotIndex,
      },
      lastReflexVerdict: {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        actorName: player.name,
        succeeded: true,
        isLate: false,
        detail,
      },
      actionLogs: [
        createLogEntry(player.name, detail, 'ability'),
        ...state.actionLogs,
      ],
    };

    if (remainingHand.length === 0) {
      return evaluateRoundShowdown(nextState);
    }

    return nextState;
  }

  const { nextDraw, nextDiscard } = replenishDrawPileIfNeeded(
    state.drawPile,
    state.discardPile
  );

  const penaltyCard = nextDraw[nextDraw.length - 1];
  const remainingDeck = penaltyCard ? nextDraw.slice(0, -1) : nextDraw;

  const updatedPlayers = state.players.map((p) => {
    if (p.id !== player.id) return p;
    if (!penaltyCard) return p;

    const maxExistingIndex = p.hand.reduce(
      (maxIdx, s) => Math.max(maxIdx, s.slotIndex),
      3
    );
    const appendedHand: HandSlot[] = [
      ...p.hand,
      {
        slotIndex: maxExistingIndex + 1,
        card: penaltyCard,
        isRevealedToAll: false,
        hasBeenPeekedByOwner: false,
      },
    ];
    return { ...p, hand: appendedHand };
  });

  const detail = `SALAH TEBAK! Slot #${slotIndex + 1} milik ${player.name} bukan angka ${topDiscard.rank} — Dihukum +1 Kartu Penalti tertutup!`;

  return {
    ...state,
    players: updatedPlayers,
    drawPile: remainingDeck,
    discardPile: nextDiscard,
    lastTableMove: {
      id: `move_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actorId: player.id,
      actorName: player.name,
      kind: 'slam_penalty',
      label: `${player.name} salah tebak! +1 Kartu Penalti`,
      targetPlayerId: player.id,
      targetSlotIndex: slotIndex,
    },
    lastReflexVerdict: {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actorName: player.name,
      succeeded: false,
      isLate: false,
      detail,
    },
    actionLogs: [
      createLogEntry(player.name, detail, 'penalty'),
      ...state.actionLogs,
    ],
  };
}

export function swapDrawnCardWithHandSlot(
  state: GameState,
  slotIndex: number
): GameState {
  const actor = state.players[state.currentPlayerIndex];
  const targetSlot = actor?.hand.find((s) => s.slotIndex === slotIndex);
  if (!state.drawnCardBuffer || !actor || !targetSlot) {
    return state;
  }

  const oldCard = targetSlot.card;
  const newCard = state.drawnCardBuffer;

  const updatedPlayers = state.players.map((p, idx) => {
    if (idx !== state.currentPlayerIndex) return p;
    return {
      ...p,
      hand: p.hand.map((slot) =>
        slot.slotIndex === slotIndex
          ? {
              ...slot,
              card: newCard,
              hasBeenPeekedByOwner: true,
            }
          : slot
      ),
    };
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    discardPile: [...state.discardPile, oldCard],
    drawnCardBuffer: null,
    drawnFromSource: null,
    lastTableMove: {
      id: `move_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actorId: actor.id,
      actorName: actor.name,
      kind: 'swap_card',
      label: `${actor.name} menaruh kartu ke Slot #${slotIndex + 1} & membuang ${oldCard.rank}${getSuitSymbol(oldCard.suit)}`,
      targetPlayerId: actor.id,
      targetSlotIndex: slotIndex,
    },
    actionLogs: [
      createLogEntry(
        actor.name,
        `Menukar kartu slot #${slotIndex + 1} dan membuang ${oldCard.rank}${getSuitSymbol(oldCard.suit)}.`,
        'normal'
      ),
      ...state.actionLogs,
    ],
  };

  return enterReflexMatchingWindow(nextState);
}

export function declareQobulShout(state: GameState): GameState {
  if (
    state.turnSubPhase !== 'awaiting_draw_or_qobul' ||
    state.qobulCallerId !== null ||
    state.isRoundOver
  ) {
    return state;
  }

  const caller = state.players[state.currentPlayerIndex];
  const queue: string[] = [];

  for (let offset = 1; offset < state.players.length; offset += 1) {
    const idx = (state.currentPlayerIndex + offset) % state.players.length;
    queue.push(state.players[idx].id);
  }

  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    qobulCallerId: caller.id,
    finalTurnsQueue: queue,
    currentPlayerIndex: nextIndex,
    turnSubPhase: 'awaiting_draw_or_qobul',
    actionLogs: [
      createLogEntry(
        caller.name,
        'BERSERU "QOBUL!" — Putaran terakhir dimulai! Kartu pemanggil TIDAK dikunci!',
        'qobul'
      ),
      ...state.actionLogs,
    ],
  };
}
