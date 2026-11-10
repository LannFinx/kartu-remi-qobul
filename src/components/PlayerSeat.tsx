import React from 'react';
import { Bot, Crown, Flame, User } from 'lucide-react';
import { Player } from '../types/game';
import { calculateHandPoints } from '../engine/deck';
import { PlayingCard } from './PlayingCard';
import { CARD_ASPECT, CARD_WIDTHS } from './card/cardMotion';

interface PlayerSeatProps {
  player: Player;
  isMainBottomSeat: boolean;
  isActiveTurn: boolean;
  isDimmed?: boolean;
  isQobulCaller: boolean;
  revealAllCards: boolean;
  peekedSlotKey: string | null;
  misfireSlotKey?: string | null;
  selectableSlots?: boolean;
  selectedSlotIndex?: number | null;
  onSelectSlot?: (playerId: string, slotIndex: number) => void;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isMainBottomSeat,
  isActiveTurn,
  isDimmed = false,
  isQobulCaller,
  revealAllCards,
  peekedSlotKey,
  misfireSlotKey = null,
  selectableSlots = false,
  selectedSlotIndex = null,
  onSelectSlot,
}) => {
  const cardSize = isMainBottomSeat ? 'md' : 'sm';
  const rawPoints = calculateHandPoints(player.hand);

  const slotW = CARD_WIDTHS[cardSize];
  const slotH = Math.round(slotW * CARD_ASPECT);

  const maxSlotIdx = player.hand.reduce(
    (max, s) => Math.max(max, s.slotIndex),
    3
  );
  const totalMatrixCells = Math.max(4, maxSlotIdx + 1);
  const matrixIndices = Array.from({ length: totalMatrixCells }, (_, i) => i);

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-3xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 transition-[transform,opacity,background-color,box-shadow] duration-300 ${
        isActiveTurn
          ? 'opacity-100 scale-100 bg-amber-300/15 ring-2 ring-amber-300/90 shadow-[0_0_30px_rgba(251,191,36,0.35)]'
          : isDimmed
            ? 'opacity-50 scale-[0.95] bg-black/10'
            : 'opacity-95 scale-100 bg-black/15'
      }`}
    >
      <div
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full border backdrop-blur-sm transition-[background-color,border-color,box-shadow] duration-200 ${
          isActiveTurn
            ? 'bg-amber-400 text-slate-950 border-amber-100 shadow-[0_4px_14px_rgba(251,191,36,0.5)]'
            : isQobulCaller
              ? 'bg-red-600 text-white border-red-300 shadow-lg'
              : 'bg-black/45 text-white border-white/15'
        }`}
      >
        <span
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 text-slate-950 font-bold text-xs shadow-inner"
          style={{ backgroundColor: player.avatarColor }}
        >
          {player.isBot ? (
            <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          )}
        </span>

        <span className="font-display font-extrabold text-[11px] sm:text-xs tracking-tight truncate max-w-[96px] sm:max-w-[120px]">
          {player.name}
        </span>

        {isActiveTurn && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-950/15 text-[9px] font-black uppercase tracking-wider">
            <Crown className="w-3 h-3 shrink-0" />
            GILIRAN
          </span>
        )}

        {isQobulCaller && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/30 text-[10px] font-black uppercase">
            <Flame className="w-3 h-3 text-amber-300" />
            QOBUL
          </span>
        )}

        {revealAllCards ? (
          <span className="px-1.5 py-0.5 rounded-full bg-black/25 text-[10px] font-extrabold tabular-nums">
            {rawPoints} pts
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px] font-bold opacity-85 tabular-nums">
            {player.cumulativeScore}p
          </span>
        )}
      </div>

      <div
        className={`grid grid-cols-2 place-items-center ${
          isMainBottomSeat ? 'gap-2.5 sm:gap-3' : 'gap-1.5 sm:gap-2'
        }`}
      >
        {matrixIndices.map((matrixIdx) => {
          const slot = player.hand.find((s) => s.slotIndex === matrixIdx);

          if (!slot) {
            return (
              <div
                key={`empty_matrix_${player.id}_${matrixIdx}`}
                style={{ width: slotW, height: slotH }}
                className="rounded-xl border-2 border-dashed border-white/15 bg-black/15 flex flex-col items-center justify-center gap-0.5 text-white/25 select-none"
              >
                <span className="font-display font-extrabold text-[10px]">
                  #{matrixIdx + 1}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider">
                  Kosong
                </span>
              </div>
            );
          }

          const slotKey = `${player.id}_${slot.slotIndex}`;
          const isPeekingThis = peekedSlotKey === slotKey;
          const isMisfireThis = misfireSlotKey === slotKey;
          const isSelected = selectedSlotIndex === slot.slotIndex;

          return (
            <PlayingCard
              key={slot.card.id}
              layoutId={slot.card.id}
              card={slot.card}
              isFaceUp={revealAllCards || slot.isRevealedToAll}
              isPeekedCorner={isPeekingThis}
              isMisfireShake={isMisfireThis}
              hasOwnerMemoryBadge={
                isMainBottomSeat && slot.hasBeenPeekedByOwner
              }
              slotNumber={slot.slotIndex + 1}
              size={cardSize}
              isSelectable={selectableSlots}
              isSelected={isSelected || isPeekingThis}
              onClick={() => onSelectSlot?.(player.id, slot.slotIndex)}
            />
          );
        })}
      </div>
    </div>
  );
};
