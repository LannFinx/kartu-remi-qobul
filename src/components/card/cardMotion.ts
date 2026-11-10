export type CardSize = 'sm' | 'md' | 'lg';

export const CARD_WIDTHS: Record<CardSize, number> = {
  sm: 56,
  md: 84,
  lg: 168,
};

export const CARD_ASPECT = 1.4;

export const CARD_FLIGHT_SPRING = {
  type: 'spring',
  visualDuration: 0.42,
  bounce: 0.16,
} as const;

export const CARD_FLIP_SPRING = {
  type: 'spring',
  visualDuration: 0.5,
  bounce: 0.1,
} as const;

export function resolveRestingTilt(cardId: string, maxDegrees: number): number {
  let hash = 0;
  for (let index = 0; index < cardId.length; index += 1) {
    hash = (hash * 31 + cardId.charCodeAt(index)) | 0;
  }
  const normalized = (Math.abs(hash) % 1000) / 1000;
  return (normalized * 2 - 1) * maxDegrees;
}

