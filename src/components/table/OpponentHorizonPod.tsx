import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, Crown, Flame, User } from 'lucide-react';
import { Player } from '../../types/game';
import { calculateHandPoints } from '../../engine/deck';

interface OpponentHorizonPodProps {
  player: Player;
  isActiveTurn: boolean;
  isQobulCaller: boolean;
  revealAllCards: boolean;
  peekedSlotKey: string | null;
  misfireSlotKey?: string | null;
  selectableSlots?: boolean;
  seatActionText?: string | null;
  onSelectSlot?: (playerId: string, slotIndex: number) => void;
}

export const OpponentHorizonPod: React.FC<OpponentHorizonPodProps> = ({
  player,
  isActiveTurn,
  isQobulCaller,
  revealAllCards,
  peekedSlotKey,
  misfireSlotKey = null,
  selectableSlots = false,
  seatActionText = null,
  onSelectSlot,
}) => {
  const rawPoints = calculateHandPoints(player.hand);
  const maxSlotIdx = player.hand.reduce(
    (max, s) => Math.max(max, s.slotIndex),
    3
  );
  const totalMatrixCells = Math.max(4, maxSlotIdx + 1);
  const matrixIndices = Array.from({ length: totalMatrixCells }, (_, i) => i);

  return (
    <div
      className={`relative flex flex-col items-center gap-1 rounded-2xl p-1.5 transition-all duration-200 select-none ${
        isActiveTurn
          ? 'bg-amber-300/20 ring-2 ring-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.4)]'
          : 'bg-black/30 border border-white/10'
      }`}
    >
      <AnimatePresence>
        {seatActionText && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.85 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-display font-black text-[9px] shadow-md whitespace-nowrap"
          >
            {seatActionText}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 max-w-[105px]">
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-slate-950 font-bold text-[9px] shadow-xs"
          style={{ backgroundColor: player.avatarColor }}
        >
          {player.isBot ? (
            <Bot className="w-2.5 h-2.5" />
          ) : (
            <User className="w-2.5 h-2.5" />
          )}
        </span>

        <span className="font-display font-black text-[10px] text-white truncate">
          {player.name}
        </span>

        {isActiveTurn && <Crown className="w-2.5 h-2.5 text-amber-300 shrink-0" />}
        {isQobulCaller && <Flame className="w-2.5 h-2.5 text-red-400 shrink-0" />}

        <span className="text-[9px] font-bold text-amber-200/90 ml-auto tabular-nums">
          {revealAllCards ? `${rawPoints}p` : `${player.cumulativeScore}p`}
        </span>
      </div>

      <div className="flex items-center gap-1 pt-0.5">
        {matrixIndices.map((matrixIdx) => {
          const slot = player.hand.find((s) => s.slotIndex === matrixIdx);

          if (!slot) {
            return (
              <div
                key={`empty_${player.id}_${matrixIdx}`}
                className="w-5 h-7 rounded border border-dashed border-white/20 bg-black/20 flex items-center justify-center text-[8px] text-white/30"
              >
                #{matrixIdx + 1}
              </div>
            );
          }

          const slotKey = `${player.id}_${slot.slotIndex}`;
          const isPeeking = peekedSlotKey === slotKey;
          const isMisfire = misfireSlotKey === slotKey;
          const isFaceUp = revealAllCards || slot.isRevealedToAll || isPeeking;

          return (
            <button
              key={slot.card.id}
              type="button"
              disabled={!selectableSlots}
              onClick={() => onSelectSlot?.(player.id, slot.slotIndex)}
              className={`relative w-5 h-7 rounded transition-transform duration-150 flex flex-col items-center justify-center text-[9px] font-black shadow-xs ${
                selectableSlots
                  ? 'ring-1.5 ring-amber-300 cursor-pointer active:scale-90 hover:scale-105'
                  : ''
              } ${
                isMisfire ? 'animate-shake ring-2 ring-red-500' : ''
              } ${
                isFaceUp
                  ? 'bg-white text-slate-900 border border-slate-300'
                  : 'bg-[#18263e] border border-amber-300/40 text-amber-300'
              }`}
            >
              {isFaceUp ? (
                <span className={slot.card.isRed ? 'text-red-600' : 'text-slate-900'}>
                  {slot.card.rank}
                </span>
              ) : (
                <span className="text-[8px] text-amber-300/80 font-display">
                  #{slot.slotIndex + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
