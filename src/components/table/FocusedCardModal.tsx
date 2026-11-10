import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeftRight, Eye, Shuffle, Trash2, Wand2 } from 'lucide-react';
import { Card, SpecialAbilityType } from '../../types/game';
import { PlayingCard } from '../PlayingCard';

interface FocusedCardModalProps {
  card: Card | null;
  isOpen: boolean;
  flipOnMount?: boolean;
  onKeepAndSwap: () => void;
  onDiscardOrUseAbility: () => void;
}

const ABILITY_META: Record<
  Exclude<SpecialAbilityType, 'none'>,
  { label: string; badgeClass: string; Icon: React.FC<{ className?: string }> }
> = {
  peek_own: {
    label: 'Intip Kartu Sendiri',
    badgeClass: 'bg-sky-400 text-slate-950',
    Icon: Eye,
  },
  peek_opponent: {
    label: 'Intip Kartu Lawan',
    badgeClass: 'bg-cyan-300 text-slate-950',
    Icon: Eye,
  },
  blind_swap_opponents: {
    label: 'Tukar 2 Lawan',
    badgeClass: 'bg-violet-400 text-slate-950',
    Icon: Shuffle,
  },
  blind_swap_self_opponent: {
    label: 'Tukar Buta',
    badgeClass: 'bg-amber-300 text-slate-950',
    Icon: ArrowLeftRight,
  },
  special_swap_king: {
    label: 'Intip & Tukar',
    badgeClass: 'bg-rose-500 text-white',
    Icon: Wand2,
  },
};

export const FocusedCardModal: React.FC<FocusedCardModalProps> = ({
  card,
  isOpen,
  flipOnMount = true,
  onKeepAndSwap,
  onDiscardOrUseAbility,
}) => {
  const hasAbility = card && card.specialAbility !== 'none';
  const abilityInfo =
    card && card.specialAbility !== 'none'
      ? ABILITY_META[card.specialAbility]
      : null;

  const pointBadgeClass = !card
    ? ''
    : card.pointValue < 0
      ? 'bg-emerald-400 text-slate-950'
      : card.pointValue >= 13
        ? 'bg-red-600 text-white'
        : 'bg-white text-slate-950';

  return (
    <>
      <AnimatePresence>
        {isOpen && card && (
          <motion.div
            key="focused-card-backdrop"
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.14 } }}
            transition={{ duration: 0.18 }}
          />
        )}
      </AnimatePresence>

      {isOpen && card && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 pointer-events-none px-4 select-none">
          <motion.div
            className="flex items-center gap-2 pointer-events-auto"
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.25 }}
          >
            <span
              className={`px-3 py-1 rounded-full font-display font-black text-xs tracking-wider shadow-lg ${pointBadgeClass}`}
            >
              {card.pointValue > 0 ? `+${card.pointValue}` : card.pointValue} POIN
            </span>

            {abilityInfo && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-display font-extrabold text-xs shadow-lg ${abilityInfo.badgeClass}`}
              >
                <abilityInfo.Icon className="w-3.5 h-3.5" />
                <span>{abilityInfo.label}</span>
              </span>
            )}
          </motion.div>

          <PlayingCard
            layoutId={card.id}
            card={card}
            isFaceUp
            size="lg"
            flipOnMount={flipOnMount}
          />

          <motion.div
            className="flex items-center gap-3 pointer-events-auto"
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.12,
              type: 'spring',
              visualDuration: 0.3,
              bounce: 0.2,
            }}
          >
            <button
              type="button"
              onClick={onKeepAndSwap}
              className="btn-tactile h-12 px-6 rounded-full bg-white text-slate-950 font-display font-black text-xs sm:text-sm tracking-wide shadow-xl hover:bg-white/95 inline-flex items-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>SIMPAN & TUKAR</span>
            </button>

            <button
              type="button"
              onClick={onDiscardOrUseAbility}
              className={`btn-tactile h-12 px-6 rounded-full font-display font-black text-xs sm:text-sm tracking-wide shadow-xl inline-flex items-center gap-2 ${
                hasAbility
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 ring-2 ring-amber-200/60'
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/25'
              }`}
            >
              {hasAbility ? (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>PAKAI KEMAMPUAN</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>BUANG KARTU</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
