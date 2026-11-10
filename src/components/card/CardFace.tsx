import React from 'react';
import * as deck from '@letele/playing-cards';
import { Card, Rank, Suit } from '../../types/game';

const SUIT_PREFIX: Record<Suit, string> = {
  hearts: 'H',
  diamonds: 'D',
  clubs: 'C',
  spades: 'S',
};

const RANK_SUFFIX: Record<Rank, string> = {
  A: 'a',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  J: 'j',
  Q: 'q',
  K: 'k',
};

interface CardFaceProps {
  card: Card;
}

export const CardFace: React.FC<CardFaceProps> = ({ card }) => {
  const FaceSvg = deck[`${SUIT_PREFIX[card.suit]}${RANK_SUFFIX[card.rank]}`];

  return (
    <FaceSvg
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};
