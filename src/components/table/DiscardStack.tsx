import React from 'react';
import { Card } from '../../types/game';
import { PlayingCard } from '../PlayingCard';
import { CARD_ASPECT, CARD_WIDTHS, CardSize, resolveRestingTilt } from '../card/cardMotion';

interface DiscardStackProps {
  cards: Card[];
  flipTopOnArrival: boolean;
  canTakeTop?: boolean;
  size?: CardSize;
  onTakeTop?: () => void;
}

const VISIBLE_DISCARDS = 4;
const MAX_TILT_DEGREES = 9;

export const DiscardStack: React.FC<DiscardStackProps> = ({
  cards,
  flipTopOnArrival,
  canTakeTop = false,
  size = 'md',
  onTakeTop,
}) => {
  const width = CARD_WIDTHS[size];
  const visibleCards = cards.slice(-VISIBLE_DISCARDS);
  const topCardId = visibleCards[visibleCards.length - 1]?.id;

  return (
    <div className="relative" style={{ width, height: width * CARD_ASPECT }}>
      {visibleCards.length === 0 && (
        <div className="absolute inset-0 rounded-[5%/3.6%] border-2 border-dashed border-white/25" />
      )}

      {visibleCards.map((card) => {
        const isTop = card.id === topCardId;
        return (
          <div key={card.id} className="absolute inset-0">
            <PlayingCard
              layoutId={card.id}
              card={card}
              isFaceUp
              size={size}
              tilt={resolveRestingTilt(card.id, MAX_TILT_DEGREES)}
              flipOnMount={isTop && flipTopOnArrival}
              isSelectable={isTop && canTakeTop}
              onClick={isTop ? onTakeTop : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

