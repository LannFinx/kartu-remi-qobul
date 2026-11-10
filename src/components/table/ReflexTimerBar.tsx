import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FastForward, Flame, Zap } from 'lucide-react';
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
    <div className="h-12 flex items-center justify-center z-30 pointer-events-none">
      <AnimatePresence mode="wait">
        {verdict ? (
          <motion.div
            key={verdict.id}
            initial={{ opacity: 0, scale: 0.75, y: 10 }}
            animate={
              verdict.succeeded
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 1, scale: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }
            }
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', visualDuration: 0.32, bounce: 0.4 }}
            className={`pointer-events-auto inline-flex items-center gap-2.5 px-4 py-2 rounded-full font-display font-extrabold text-sm shadow-xl border-2 ${
              verdict.succeeded
                ? 'bg-emerald-500 border-emerald-200 text-slate-950'
                : 'bg-red-600 border-red-200 text-white'
            }`}
          >
            {verdict.succeeded ? (
              <>
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>MATCH! −1 Kartu</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 fill-white" />
                <span>ZONK! +1 Penalti</span>
              </>
            )}
          </motion.div>
        ) : isActive && topDiscardRank ? (
          <motion.div
            key={windowKey}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', visualDuration: 0.28, bounce: 0.25 }}
            className="pointer-events-auto relative inline-flex items-center gap-3 pl-3.5 pr-2.5 py-1.5 rounded-full bg-slate-950/85 border border-amber-300/60 shadow-xl backdrop-blur-md overflow-hidden"
          >
            <span className="inline-flex items-center gap-1.5 font-display font-extrabold text-xs tracking-wide text-amber-300">
              <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>KEMBAR</span>
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-white text-slate-950 font-black text-xs shadow">
                {topDiscardRank}
              </span>
            </span>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="btn-tactile inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-[11px] font-bold text-white"
              >
                <span>Skip</span>
                <FastForward className="w-3 h-3" />
              </button>
            )}

            <motion.span
              key={`bar-${windowKey}`}
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-300 via-emerald-300 to-amber-300 origin-left"
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
