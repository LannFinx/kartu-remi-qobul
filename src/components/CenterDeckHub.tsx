import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../types/game';
import { DiscardStack } from './table/DiscardStack';
import { DrawPileStack } from './table/DrawPileStack';

interface CenterDeckHubProps {
  drawPile: Card[];
  discardPile: Card[];
  canDrawFromDeck: boolean;
  canDrawFromDiscard: boolean;
  qobulCallerName: string | null;
  finalTurnsLeft: number;
  onDrawFromDeck?: () => void;
  onDrawFromDiscard?: () => void;
}

export const CenterDeckHub: React.FC<CenterDeckHubProps> = ({
  drawPile,
  discardPile,
  canDrawFromDeck,
  canDrawFromDiscard,
  qobulCallerName,
  finalTurnsLeft,
  onDrawFromDeck,
  onDrawFromDiscard,
}) => {
  const topDiscard =
    discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  return (
    <div className="relative flex flex-col items-center justify-center py-1.5 px-4 select-none">
      {qobulCallerName && (
        <div className="mb-2 px-3 py-1 rounded-full bg-red-600/90 border border-white/25 text-white text-xs font-display font-extrabold flex items-center gap-1.5 shadow-md">
          <span>QOBUL: {qobulCallerName}</span>
          <span className="text-white/40">•</span>
          <span className="text-amber-200">Sisa {finalTurnsLeft} Giliran</span>
        </div>
      )}

      <div className="flex items-end gap-7 sm:gap-12">
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          {canDrawFromDeck && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: [0, -3, 0] }}
              transition={{
                y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
                opacity: { duration: 0.2 },
              }}
              className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-display font-black text-[10px] tracking-wide shadow-md"
            >
              AMBIL DEK
            </motion.span>
          )}

          <DrawPileStack
            cards={drawPile}
            canDraw={canDrawFromDeck}
            size="md"
            onDraw={() => onDrawFromDeck?.()}
          />

          <span className="px-2.5 py-0.5 rounded-full bg-black/25 text-[10px] font-bold text-white/80 tabular-nums">
            Dek ({drawPile.length})
          </span>
        </div>

        <div className="relative z-20 flex flex-col items-center gap-1.5">
          {canDrawFromDiscard && topDiscard && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: [0, -3, 0] }}
              transition={{
                y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.2 },
                opacity: { duration: 0.2 },
              }}
              className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-display font-black text-[10px] tracking-wide shadow-md"
            >
              AMBIL ({topDiscard.rank})
            </motion.span>
          )}

          <DiscardStack
            cards={discardPile}
            flipTopOnArrival
            canTakeTop={canDrawFromDiscard}
            size="md"
            onTakeTop={onDrawFromDiscard}
          />

          <span className="px-2.5 py-0.5 rounded-full bg-black/25 text-[10px] font-bold text-amber-300 tabular-nums">
            {topDiscard ? `Buangan (${topDiscard.rank})` : 'Buangan'}
          </span>
        </div>
      </div>
    </div>
  );
};
