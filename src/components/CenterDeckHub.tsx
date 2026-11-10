import React from 'react';
import { motion } from 'motion/react';
import { Flame, Hand } from 'lucide-react';
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
    <div className="relative flex flex-col items-center justify-center py-2 px-4">
      {qobulCallerName && (
        <div className="mb-2.5 px-3.5 py-1 rounded-full bg-red-600/90 border-2 border-amber-300 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg">
          <Flame className="w-4 h-4 text-amber-300" />
          <span>
            QOBUL oleh {qobulCallerName} • Sisa {finalTurnsLeft} Giliran!
          </span>
        </div>
      )}

      <div className="flex items-end gap-8 sm:gap-14">
        <div className="relative z-10 flex flex-col items-center gap-2">
          {canDrawFromDeck && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              transition={{
                y: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
                opacity: { duration: 0.2 },
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-display font-black text-[10px] shadow-md border border-amber-100"
            >
              <Hand className="w-3 h-3" />
              <span>Ambil Dek</span>
            </motion.span>
          )}

          <DrawPileStack
            cards={drawPile}
            canDraw={canDrawFromDeck}
            size="md"
            onDraw={() => onDrawFromDeck?.()}
          />

          <span className="px-2.5 py-0.5 rounded-full bg-black/30 text-[11px] font-extrabold text-white/85 tabular-nums">
            Dek ({drawPile.length})
          </span>
        </div>

        <div className="relative z-20 flex flex-col items-center gap-2">
          {canDrawFromDiscard && topDiscard && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              transition={{
                y: { repeat: Infinity, duration: 1.4, ease: 'easeInOut', delay: 0.2 },
                opacity: { duration: 0.2 },
              }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-300 text-slate-950 font-display font-black text-[10px] shadow-md border border-white"
            >
              <span>Tukar ({topDiscard.rank})</span>
            </motion.span>
          )}

          <DiscardStack
            cards={discardPile}
            flipTopOnArrival
            canTakeTop={canDrawFromDiscard}
            size="md"
            onTakeTop={onDrawFromDiscard}
          />

          <span className="px-2.5 py-0.5 rounded-full bg-black/30 text-[11px] font-extrabold text-amber-300 tabular-nums">
            {topDiscard ? `Buangan (${topDiscard.rank})` : 'Buangan (0)'}
          </span>
        </div>
      </div>
    </div>
  );
};
