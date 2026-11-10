import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeftRight, Bot, Crown, Flame, Sparkles, User } from 'lucide-react';
import { Card, Player } from '../types/game';
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
  activeHeldCard?: Card | null;
  activeHeldSource?: 'deck' | 'discard' | null;
  recentlySwappedSlotIndex?: number | null;
  seatActionText?: string | null;
  canShoutQobul?: boolean;
  onShoutQobul?: () => void;
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
  activeHeldCard = null,
  activeHeldSource = null,
  recentlySwappedSlotIndex = null,
  seatActionText = null,
  canShoutQobul = false,
  onShoutQobul,
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
      className={`relative flex flex-col items-center gap-2 rounded-3xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 transition-[transform,opacity,background-color,box-shadow] duration-300 ${
        isActiveTurn
          ? 'opacity-100 scale-100 bg-amber-300/15 ring-2 ring-amber-300/90 shadow-[0_0_30px_rgba(251,191,36,0.35)]'
          : isDimmed
            ? 'opacity-50 scale-[0.95] bg-black/10'
            : 'opacity-95 scale-100 bg-black/15'
      }`}
    >
      <AnimatePresence mode="popLayout">
        {seatActionText && (
          <motion.div
            key={seatActionText}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.92 }}
            transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.3 }}
            className="px-3 py-1 rounded-full bg-white text-slate-900 border-2 border-amber-300 shadow-lg font-display font-extrabold text-[11px] flex items-center gap-1.5 max-w-[230px] text-center leading-tight"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{seatActionText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-center gap-2">
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

        {isMainBottomSeat && canShoutQobul && onShoutQobul && (
          <button
            type="button"
            onClick={onShoutQobul}
            className="btn-tactile px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs shadow-md border border-amber-200 inline-flex items-center gap-1 active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 fill-slate-950" />
            <span>QOBUL!</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
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
            const isRecentlySwapped =
              recentlySwappedSlotIndex === slot.slotIndex;

            return (
              <div key={slot.card.id} className="relative">
                <PlayingCard
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
                  isSelected={
                    isSelected || isPeekingThis || isRecentlySwapped
                  }
                  onClick={() => onSelectSlot?.(player.id, slot.slotIndex)}
                />

                <AnimatePresence>
                  {isRecentlySwapped && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-display font-black text-[9px] shadow-md inline-flex items-center gap-0.5 whitespace-nowrap border border-white"
                    >
                      <ArrowLeftRight className="w-2.5 h-2.5" />
                      <span>DITARO</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {activeHeldCard && (
            <motion.div
              key={`held_${activeHeldCard.id}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="flex flex-col items-center gap-1.5 bg-amber-400/20 border-2 border-dashed border-amber-300/80 rounded-2xl p-2 shadow-xl"
            >
              <span className="px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 font-display font-black text-[9px] uppercase tracking-wider whitespace-nowrap">
                {activeHeldSource === 'discard' ? 'Ambil Buangan' : 'Ambil Dek'}
              </span>
              <PlayingCard
                layoutId={activeHeldCard.id}
                card={activeHeldCard}
                isFaceUp={activeHeldSource === 'discard'}
                size="sm"
                tilt={-5}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
