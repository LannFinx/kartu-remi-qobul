import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Play, RotateCcw, Sparkles } from 'lucide-react';

export type VnMood =
  | 'happy'
  | 'excited'
  | 'wink'
  | 'serious'
  | 'shocked'
  | 'proud';

interface VisualNovelBannerProps {
  mood: VnMood;
  stepNumber: number;
  totalSteps: number;
  title: string;
  dialogue: string;
  actionHint?: string;
  canAdvanceNext?: boolean;
  nextButtonLabel?: string;
  onNextStep?: () => void;
  onFinishToGame?: () => void;
  onRestartTutorial?: () => void;
}

const MOOD_BADGE: Record<VnMood, { label: string; color: string }> = {
  happy: { label: 'Alya • Bandar Qobul', color: 'bg-emerald-400 text-slate-950' },
  excited: { label: 'Alya • Semangat!', color: 'bg-amber-400 text-slate-950' },
  wink: { label: 'Alya • Tips Rahasia', color: 'bg-sky-400 text-slate-950' },
  serious: { label: 'Alya • Fokus Hafalan', color: 'bg-purple-300 text-slate-950' },
  shocked: { label: 'Alya • Awas Refleks!', color: 'bg-rose-400 text-slate-950' },
  proud: { label: 'Alya • Master Qobul!', color: 'bg-amber-300 text-slate-950' },
};

const DealerAvatarSvg: React.FC<{ mood: VnMood }> = ({ mood }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-full h-full select-none overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vnBgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e6f43" />
          <stop offset="100%" stopColor="#0d3820" />
        </linearGradient>
        <linearGradient id="vnHairGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="vnSuitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
      </defs>

      <circle
        cx="60"
        cy="60"
        r="54"
        fill="url(#vnBgGrad)"
        stroke="#fbbf24"
        strokeWidth="3.5"
      />

      <path
        d="M25 65 C22 32, 40 16, 60 16 C80 16, 98 32, 95 65 C93 85, 88 98, 84 104 L36 104 C32 98, 27 85, 25 65 Z"
        fill="url(#vnHairGrad)"
      />

      <path
        d="M32 108 C35 88, 46 82, 60 82 C74 82, 85 88, 88 108 Z"
        fill="url(#vnSuitGrad)"
        stroke="#fbbf24"
        strokeWidth="2"
      />

      <polygon points="52,85 60,93 68,85 60,89" fill="#ffffff" />
      <polygon points="53,89 60,92 53,95" fill="#ef4444" />
      <polygon points="67,89 60,92 67,95" fill="#ef4444" />
      <circle cx="60" cy="92" r="2.2" fill="#fbbf24" />

      <rect x="54" y="73" width="12" height="14" rx="5" fill="#fde68a" />

      <ellipse cx="60" cy="56" rx="24" ry="25" fill="#fef3c7" />

      <ellipse cx="44" cy="61" rx="4.5" ry="2.5" fill="#fda4af" opacity="0.75" />
      <ellipse cx="76" cy="61" rx="4.5" ry="2.5" fill="#fda4af" opacity="0.75" />

      {mood === 'wink' ? (
        <>
          <path
            d="M42 53 Q48 48 54 53"
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <ellipse cx="72" cy="53" rx="4.2" ry="5" fill="#1e1b4b" />
          <circle cx="70.5" cy="51" r="1.6" fill="#ffffff" />
        </>
      ) : mood === 'shocked' ? (
        <>
          <circle cx="48" cy="53" r="5" fill="#1e1b4b" />
          <circle cx="46.5" cy="51" r="1.8" fill="#ffffff" />
          <circle cx="72" cy="53" r="5" fill="#1e1b4b" />
          <circle cx="70.5" cy="51" r="1.8" fill="#ffffff" />
        </>
      ) : mood === 'proud' ? (
        <>
          <path
            d="M42 54 Q48 47 54 54"
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M66 54 Q72 47 78 54"
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <ellipse cx="48" cy="53" rx="4.2" ry="5" fill="#1e1b4b" />
          <circle cx="46.5" cy="51" r="1.6" fill="#ffffff" />
          <ellipse cx="72" cy="53" rx="4.2" ry="5" fill="#1e1b4b" />
          <circle cx="70.5" cy="51" r="1.6" fill="#ffffff" />
        </>
      )}

      {mood === 'serious' ? (
        <>
          <line
            x1="42"
            y1="44"
            x2="54"
            y2="46"
            stroke="#1e1b4b"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <line
            x1="78"
            y1="44"
            x2="66"
            y2="46"
            stroke="#1e1b4b"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M42 45 Q48 42 54 45"
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M66 45 Q72 42 78 45"
            fill="none"
            stroke="#1e1b4b"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      )}

      {mood === 'excited' || mood === 'proud' ? (
        <path
          d="M53 65 Q60 74 67 65 Z"
          fill="#fb7185"
          stroke="#1e1b4b"
          strokeWidth="2"
        />
      ) : mood === 'shocked' ? (
        <ellipse
          cx="60"
          cy="67"
          rx="4"
          ry="5"
          fill="#fb7185"
          stroke="#1e1b4b"
          strokeWidth="2"
        />
      ) : (
        <path
          d="M54 65 Q60 70 66 65"
          fill="none"
          stroke="#1e1b4b"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}

      <path
        d="M33 46 C38 28, 82 28, 87 46 C78 36, 42 36, 33 46 Z"
        fill="url(#vnHairGrad)"
      />

      <path
        d="M36 28 C44 14, 76 14, 84 28 L78 33 L42 33 Z"
        fill="#15803d"
        stroke="#fbbf24"
        strokeWidth="2.2"
      />
      <circle cx="60" cy="24" r="4" fill="#fbbf24" />
    </svg>
  );
};

export const VisualNovelBanner: React.FC<VisualNovelBannerProps> = ({
  mood,
  stepNumber,
  totalSteps,
  title,
  dialogue,
  actionHint,
  canAdvanceNext = false,
  nextButtonLabel = 'Lanjut',
  onNextStep,
  onFinishToGame,
  onRestartTutorial,
}) => {
  const badge = MOOD_BADGE[mood];

  return (
    <motion.div
      key={`vn_step_${stepNumber}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', visualDuration: 0.28, bounce: 0.22 }}
      className="w-full max-w-3xl rounded-3xl bg-slate-900/95 border-2 border-amber-300 border-b-[5px] border-b-amber-600 shadow-[0_14px_34px_rgba(15,23,42,0.28)] px-3.5 py-3 sm:px-5 sm:py-4 text-white flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4"
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        className="w-20 h-20 sm:w-24 sm:h-24 shrink-0"
      >
        <DealerAvatarSvg mood={mood} />
      </motion.div>

      <div className="flex-1 flex flex-col gap-1.5 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2">
          <div className="inline-flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full font-display font-black text-[10px] uppercase tracking-wider shadow-sm ${badge.color}`}
            >
              {badge.label}
            </span>
            <span className="font-display font-extrabold text-xs sm:text-sm text-amber-300">
              {title}
            </span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-extrabold text-white/80 tabular-nums">
            Chapter {stepNumber}/{totalSteps}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
          {dialogue}
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 pt-1">
          {actionHint ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/50 text-amber-200 font-display font-extrabold text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{actionHint}</span>
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            {canAdvanceNext && onNextStep && (
              <button
                type="button"
                onClick={onNextStep}
                className="btn-tactile h-9 px-4 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-100 border-b-[3px] border-b-amber-700 text-slate-950 font-display font-black text-xs shadow-md inline-flex items-center gap-1"
              >
                <span>{nextButtonLabel}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {stepNumber >= totalSteps && onFinishToGame && (
              <>
                {onRestartTutorial && (
                  <button
                    type="button"
                    onClick={onRestartTutorial}
                    className="btn-tactile h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onFinishToGame}
                  className="btn-tactile h-9 px-4 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 border-2 border-emerald-200 border-b-[3px] border-b-emerald-800 text-slate-950 font-display font-black text-xs shadow-md inline-flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Main Lawan Bot!</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

