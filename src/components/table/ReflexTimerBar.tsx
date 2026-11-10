import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FastForward } from 'lucide-react';
import { Rank, ReflexVerdict } from '../../types/game';

interface ReflexTimerBarProps {
  isActive: boolean;
  topDiscardRank: Rank | null;
  windowKey: string;
  durationMs: number;
  verdict: ReflexVerdict | null;
  onSkip?: () => void;
}

export const ReflexTimerBar: React.FC<ReflexTimerBarProps> = ({
  isActive,
  topDiscardRank,
  windowKey,
  durationMs,
  verdict,
  onSkip,
}) => {
  return (
    <div className="h-11 flex items-center justify-center z-30 pointer-events-none select-none">
      <AnimatePresence mode="wait">
        {verdict ? (
          <motion.div
            key={verdict.id}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={
              verdict.succeeded
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 1, scale: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', visualDuration: 0.28, bounce: 0.3 }}
            className={`pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-display font-extrabold text-xs shadow-xl border ${
              verdict.succeeded
                ? 'bg-emerald-400 border-emerald-100 text-slate-950'
                : 'bg-red-600 border-red-300 text-white'
            }`}
          >
            <span className="tracking-wide">
              {verdict.succeeded ? 'MATCH: −1 KARTU' : 'SALAH: +1 PENALTI'}
            </span>
          </motion.div>
        ) : isActive && topDiscardRank ? (
          <motion.div
            key={windowKey}
            initial={{ opacity: 0, scale: 0.88, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.2 }}
            className="pointer-events-auto relative inline-flex items-center gap-2.5 pl-3 pr-2 py-1 rounded-full bg-black/65 border border-white/20 shadow-xl backdrop-blur-xs overflow-hidden text-white"
          >
            <span className="font-display font-bold text-[11px] tracking-wide text-amber-300">
              KARTU KEMBAR:
            </span>

            <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-md bg-white text-slate-950 font-black text-xs shadow-xs">
              {topDiscardRank}
            </span>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="btn-tactile inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white/90"
              >
                <span>Lewati</span>
                <FastForward className="w-3 h-3" />
              </button>
            )}

            <motion.span
              key={`bar-${windowKey}`}
              className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-400 origin-left"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: durationMs / 1000, ease: 'linear' }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
