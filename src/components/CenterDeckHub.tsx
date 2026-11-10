import React from 'react';
import { Flame } from 'lucide-react';
import { Card } from '../types/game';
import { CardBack } from './card/CardBack';
import { CARD_ASPECT, CARD_WIDTHS } from './card/cardMotion';
import { DiscardStack } from './table/DiscardStack';

interface CenterDeckHubProps {
  drawPileCount: number;
  discardPile: Card[];
  canDrawFromDeck: boolean;
  canDrawFromDiscard: boolean;
  qobulCallerName: string | null;
  finalTurnsLeft: number;
  onDrawFromDeck?: () => void;
  onDrawFromDiscard?: () => void;
}

export const CenterDeckHub: React.FC<CenterDeckHubProps> = ({
  drawPileCount,
  discardPile,
  canDrawFromDeck,
  canDrawFromDiscard,
  qobulCallerName,
  finalTurnsLeft,
  onDrawFromDeck,
  onDrawFromDiscard,
}) => {
  const width = CARD_WIDTHS.md;
  const height = width * CARD_ASPECT;
  const depthLayers = Math.min(3, Math.ceil(Math.max(drawPileCount - 1, 0) / 12));

  return (
    <div className="relative flex flex-col items-center justify-center py-3 px-6">
      {qobulCallerName && (
        <div className="mb-3 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>
            QOBUL oleh {qobulCallerName} • Sisa {finalTurnsLeft} Giliran
          </span>
        </div>
      )}

      <div className="flex items-center gap-10 sm:gap-14">
        <div className="flex flex-col items-center gap-2">
          <div className="relative" style={{ width, height }}>
            {Array.from({ length: depthLayers }, (_, layer) => {
              const offset = (depthLayers - layer) * 2.5;
              return (
                <div
                  key={layer}
                  className="absolute inset-0 rounded-[5%/3.6%] shadow-[0_1px_2px_rgba(0,0,0,0.35)] pointer-events-none"
                  style={{ transform: `translate(${offset}px, ${offset}px)` }}
                >
                  <CardBack />
                </div>
              );
            })}

            {drawPileCount > 0 ? (
              <button
                type="button"
                disabled={!canDrawFromDeck}
                onClick={onDrawFromDeck}
                aria-label={`Tarik kartu dari tumpukan (${drawPileCount} tersisa)`}
                className={`relative w-full h-full rounded-[5%/3.6%] select-none outline-none card-transition shadow-[0_1px_2px_rgba(0,0,0,0.35),0_6px_14px_-4px_rgba(0,0,0,0.45)] ${
                  canDrawFromDeck
                    ? 'cursor-pointer card-selectable active:scale-[0.97] ring-2 ring-amber-300/90'
                    : 'cursor-default'
                }`}
              >
                <CardBack />
              </button>
            ) : (
              <div className="w-full h-full rounded-[5%/3.6%] border-2 border-dashed border-white/25 flex items-center justify-center text-xs text-white/50">
                Habis
              </div>
            )}
          </div>
          <span className="text-xs font-medium text-white/70 tabular-nums">
            Dek ({drawPileCount})
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <DiscardStack
            cards={discardPile}
            flipTopOnArrival={false}
            canTakeTop={canDrawFromDiscard}
            size="md"
            onTakeTop={onDrawFromDiscard}
          />
          <span className="text-xs font-medium text-white/70 tabular-nums">
            Buangan ({discardPile.length})
          </span>
        </div>
      </div>
    </div>
  );
};
