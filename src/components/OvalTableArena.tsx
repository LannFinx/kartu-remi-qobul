import React from 'react';
import { GameState } from '../types/game';
import { CenterDeckHub } from './CenterDeckHub';
import { PlayerSeat } from './PlayerSeat';
import { ReflexTimerBar } from './table/ReflexTimerBar';

interface OvalTableArenaProps {
  gameState: GameState;
  viewerPlayerIndex?: number;
  revealAllCards: boolean;
  peekedSlotKey: string | null;
  misfireSlotKey?: string | null;
  reflexDurationMs?: number;
  onSelectCardSlot: (playerId: string, slotIndex: number) => void;
  onSkipReflexWindow?: () => void;
  onDrawFromDeck?: () => void;
  onDrawFromDiscard?: () => void;
}

export const OvalTableArena: React.FC<OvalTableArenaProps> = ({
  gameState,
  viewerPlayerIndex = 0,
  revealAllCards,
  peekedSlotKey,
  misfireSlotKey = null,
  reflexDurationMs = 2800,
  onSelectCardSlot,
  onSkipReflexWindow,
  onDrawFromDeck,
  onDrawFromDiscard,
}) => {
  const {
    players,
    currentPlayerIndex,
    qobulCallerId,
    finalTurnsQueue,
    drawPile,
    discardPile,
    turnSubPhase,
    lastReflexVerdict,
  } = gameState;

  const total = players.length;
  const safeViewerIdx =
    viewerPlayerIndex >= 0 && viewerPlayerIndex < total ? viewerPlayerIndex : 0;

  const rotatedIndices: number[] = [];
  for (let offset = 0; offset < total; offset += 1) {
    rotatedIndices.push((safeViewerIdx + offset) % total);
  }

  const bottomPlayerIndex = rotatedIndices[0];
  const opponentIndices = rotatedIndices.slice(1);

  const topDiscard =
    discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  const qobulCaller = players.find((p) => p.id === qobulCallerId) ?? null;
  const isViewerActiveTurn =
    currentPlayerIndex === safeViewerIdx &&
    !gameState.isRoundOver &&
    !players[safeViewerIdx]?.isBot;

  const canHumanDraw =
    isViewerActiveTurn && turnSubPhase === 'awaiting_draw_or_qobul';

  const isReflexPhase = turnSubPhase === 'reflex_matching_window';

  const renderSeat = (playerIndex: number, isMainBottom = false) => {
    const player = players[playerIndex];
    if (!player) return null;

    const isActive = currentPlayerIndex === playerIndex && !gameState.isRoundOver;
    const isDimmed = !isActive && !isReflexPhase && !gameState.isRoundOver;

    const isWaitingForSlotSwap =
      isActive &&
      playerIndex === safeViewerIdx &&
      !player.isBot &&
      turnSubPhase === 'selecting_hand_slot_for_discard_swap';

    const canSlamDuringReflex =
      playerIndex === safeViewerIdx &&
      !player.isBot &&
      isReflexPhase &&
      !gameState.isRoundOver;

    return (
      <PlayerSeat
        key={player.id}
        player={player}
        isMainBottomSeat={isMainBottom}
        isActiveTurn={isActive}
        isDimmed={isDimmed}
        isQobulCaller={qobulCallerId === player.id}
        revealAllCards={revealAllCards}
        peekedSlotKey={peekedSlotKey}
        misfireSlotKey={misfireSlotKey}
        selectableSlots={isWaitingForSlotSwap || canSlamDuringReflex}
        onSelectSlot={onSelectCardSlot}
      />
    );
  };

  let topRowIndices: number[] = [];
  let leftWingIndex: number | null = null;
  let rightWingIndex: number | null = null;

  if (opponentIndices.length === 2) {
    topRowIndices = [opponentIndices[0], opponentIndices[1]];
  } else if (opponentIndices.length === 3) {
    leftWingIndex = opponentIndices[0];
    topRowIndices = [opponentIndices[1]];
    rightWingIndex = opponentIndices[2];
  } else if (opponentIndices.length >= 4) {
    leftWingIndex = opponentIndices[0];
    topRowIndices = [opponentIndices[1], opponentIndices[2]];
    rightWingIndex = opponentIndices[3];
  }

  return (
    <div className="relative w-full rounded-[32px] sm:rounded-[48px] bg-[radial-gradient(ellipse_at_50%_45%,#23804f_0%,#17613a_55%,#0c3d24_100%)] border-[6px] sm:border-[8px] border-white shadow-[0_20px_50px_rgba(15,23,42,0.16),inset_0_2px_18px_rgba(0,0,0,0.35)] px-3 py-4 sm:px-7 sm:py-6 flex flex-col justify-between gap-4 sm:gap-5 overflow-hidden">
      <div className="relative z-10 flex lg:hidden flex-wrap items-start justify-center gap-2 sm:gap-4">
        {opponentIndices.map((idx) => (
          <div key={`mob_${players[idx]?.id}`} className="flex justify-center">
            {renderSeat(idx, false)}
          </div>
        ))}
      </div>

      <div className="relative z-10 hidden lg:flex flex-wrap items-start justify-center gap-8">
        {topRowIndices.map((idx) => (
          <div key={players[idx]?.id} className="flex justify-center">
            {renderSeat(idx, false)}
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-4 my-0.5">
        <div className="hidden lg:flex lg:col-span-3 justify-center">
          {leftWingIndex !== null && renderSeat(leftWingIndex, false)}
        </div>

        <div className="lg:col-span-6 flex flex-col items-center justify-center gap-2">
          <ReflexTimerBar
            isActive={isReflexPhase}
            topDiscardRank={topDiscard?.rank ?? null}
            windowKey={`table-reflex-${discardPile.length}-${topDiscard?.id ?? 'none'}`}
            durationMs={reflexDurationMs}
            verdict={lastReflexVerdict}
            onSkip={onSkipReflexWindow}
          />

          <CenterDeckHub
            drawPileCount={drawPile.length}
            discardPile={discardPile}
            canDrawFromDeck={Boolean(canHumanDraw)}
            canDrawFromDiscard={Boolean(canHumanDraw && discardPile.length > 0)}
            qobulCallerName={qobulCaller ? qobulCaller.name : null}
            finalTurnsLeft={finalTurnsQueue.length}
            onDrawFromDeck={onDrawFromDeck}
            onDrawFromDiscard={onDrawFromDiscard}
          />
        </div>

        <div className="hidden lg:flex lg:col-span-3 justify-center">
          {rightWingIndex !== null && renderSeat(rightWingIndex, false)}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {players[bottomPlayerIndex] && renderSeat(bottomPlayerIndex, true)}
      </div>
    </div>
  );
};
