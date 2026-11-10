import React from 'react';
import { Card } from '../../types/game';
import { PlayingCard } from '../PlayingCard';
import { CardBack } from '../card/CardBack';
import { CARD_ASPECT, CARD_WIDTHS, CardSize } from '../card/cardMotion';

interface DrawPileStackProps {
  cards: Card[];
  canDraw: boolean;
  size?: CardSize;
  onDraw: () => void;
}

const CARDS_PER_DEPTH_LAYER = 12;
const MAX_DEPTH_LAYERS = 3;

export const DrawPileStack: React.FC<DrawPileStackProps> = ({
  cards,
  canDraw,
  size = 'md',
  onDraw,
}) => {
  const width = CARD_WIDTHS[size];
  const height = width * CARD_ASPECT;
  const topCard = cards[cards.length - 1];
  const depthLayers = Math.min(
    MAX_DEPTH_LAYERS,
    Math.ceil(Math.max(cards.length - 1, 0) / CARDS_PER_DEPTH_LAYER)
  );

  return (
    <div className="relative" style={{ width, height }}>
      {Array.from({ length: depthLayers }, (_, layer) => {
        const offset = (depthLayers - layer) * 2;
        return (
          <div
            key={layer}
            className="absolute inset-0 rounded-[5%/3.6%] shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
            style={{ transform: `translate(${offset}px, ${offset}px)` }}
          >
            <CardBack />
          </div>
        );
      })}

      {topCard ? (
        <PlayingCard
          key={topCard.id}
          layoutId={topCard.id}
          card={topCard}
          isFaceUp={false}
          size={size}
          isSelectable={canDraw}
          onClick={onDraw}
        />
      ) : (
        <div className="absolute inset-0 rounded-[5%/3.6%] border-2 border-dashed border-white/25" />
      )}
    </div>
  );
};

