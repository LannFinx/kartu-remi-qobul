import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Eye } from 'lucide-react';
import { Card } from '../types/game';
import { CardBack } from './card/CardBack';
import { CardFace } from './card/CardFace';
import {
  CARD_ASPECT,
  CARD_FLIGHT_SPRING,
  CARD_FLIP_SPRING,
  CARD_WIDTHS,
  CardSize,
} from './card/cardMotion';

interface PlayingCardProps {
  card: Card;
  isFaceUp: boolean;
  isPeekedCorner?: boolean;
  isMisfireShake?: boolean;
  hasOwnerMemoryBadge?: boolean;
  slotNumber?: number;
  size?: CardSize;
  isSelectable?: boolean;
  isSelected?: boolean;
  layoutId?: string;
  tilt?: number;
  flipOnMount?: boolean;
  onClick?: () => void;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceUp,
  isPeekedCorner = false,
  isMisfireShake = false,
  hasOwnerMemoryBadge = false,
  slotNumber,
  size = 'md',
  isSelectable = false,
  isSelected = false,
  layoutId,
  tilt = 0,
  flipOnMount = false,
  onClick,
}) => {
  const showFace = isFaceUp || isPeekedCorner || isMisfireShake;
  const [isFaceMounted, setIsFaceMounted] = useState(showFace || flipOnMount);

  useEffect(() => {
    if (showFace) setIsFaceMounted(true);
  }, [showFace]);

  const restingRotation = showFace ? 0 : 180;
  const mountRotation = flipOnMount ? 180 - restingRotation : restingRotation;
  const isInteractive = isSelectable && Boolean(onClick);
  const lift = isSelected ? -12 : isPeekedCorner ? -8 : 0;
  const width = CARD_WIDTHS[size];

  const accessibleName = showFace
    ? `${card.rank} ${card.suit}`
    : slotNumber !== undefined
      ? `Kartu tertutup nomor ${slotNumber}`
      : 'Kartu tertutup';

  return (
    <motion.button
      type="button"
      layoutId={layoutId}
      onClick={isInteractive ? onClick : undefined}
      disabled={!isInteractive}
      aria-label={accessibleName}
      initial={false}
      animate={{
        y: lift,
        rotate: tilt,
        x: isMisfireShake ? [0, -10, 10, -7, 7, 0] : 0,
      }}
      whileHover={isInteractive ? { y: lift - 6 } : undefined}
      whileTap={isInteractive ? { scale: 0.96 } : undefined}
      transition={CARD_FLIGHT_SPRING}
      style={{ width, height: width * CARD_ASPECT, perspective: width * 6 }}
      className={`relative shrink-0 rounded-[5%/3.6%] select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
        isInteractive ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <span className="absolute inset-0 rounded-[inherit] shadow-[0_1px_2px_rgba(0,0,0,0.35),0_6px_14px_-4px_rgba(0,0,0,0.45)]" />

      <motion.span
        className="absolute inset-0 block"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateY: mountRotation }}
        animate={{ rotateY: restingRotation }}
        transition={CARD_FLIP_SPRING}
        onAnimationComplete={() => {
          if (!showFace) setIsFaceMounted(false);
        }}
      >
        <span className="absolute inset-0 block [backface-visibility:hidden]">
          {isFaceMounted && <CardFace card={card} />}
        </span>
        <span
          className="absolute inset-0 block [backface-visibility:hidden]"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <CardBack />
        </span>
      </motion.span>

      {isMisfireShake && (
        <span className="pointer-events-none absolute -inset-[3px] rounded-[6.5%/4.6%] ring-[3px] ring-red-500 shadow-[0_0_22px_rgba(239,68,68,0.85)]" />
      )}

      {isSelectable && !isSelected && !isMisfireShake && (
        <span className="pointer-events-none absolute -inset-[3px] rounded-[6.5%/4.6%] ring-2 ring-amber-300/90 shadow-[0_0_16px_rgba(252,211,77,0.4)]" />
      )}

      {isSelected && !isMisfireShake && (
        <span className="pointer-events-none absolute -inset-[3px] rounded-[6.5%/4.6%] ring-[3px] ring-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.55)]" />
      )}

      {slotNumber !== undefined && !showFace && (
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/55 text-white/90 font-display font-bold text-[10px] leading-none backdrop-blur-[1px]">
          {slotNumber}
        </span>
      )}

      {hasOwnerMemoryBadge && !showFace && (
        <span
          title="Sudah pernah diintip"
          className="pointer-events-none absolute -top-1.5 -right-1.5 grid place-items-center w-5 h-5 rounded-full bg-white text-sky-700 shadow-md ring-1 ring-black/10"
        >
          <Eye className="w-3 h-3" />
        </span>
      )}
    </motion.button>
  );
};
