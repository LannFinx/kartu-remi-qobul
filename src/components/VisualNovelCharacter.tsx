import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, RotateCcw } from 'lucide-react';

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
  return (
    <motion.aside
      key={`vn_step_${stepNumber}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200/90 shadow-sm px-4 py-3 text-slate-800 flex items-center gap-3.5"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0">
        <DealerAvatarSvg mood={mood} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2 truncate">
            <span className="font-display font-black text-xs text-slate-900">
              Alya
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {title}
            </span>
          </div>

          <span className="text-[10px] font-bold text-slate-400 tabular-nums shrink-0">
            {stepNumber}/{totalSteps}
          </span>
        </div>

        <p className="text-xs sm:text-[13px] text-slate-700 font-normal leading-snug line-clamp-2 sm:line-clamp-none">
          {dialogue}
        </p>

        {actionHint && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md w-fit">
            <span>👉</span>
            <span>{actionHint}</span>
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1.5">
        {canAdvanceNext && onNextStep && (
          <button
            type="button"
            onClick={onNextStep}
            className="btn-tactile h-8 px-3 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1 shadow-xs hover:bg-amber-300"
          >
            <span>{nextButtonLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {stepNumber >= totalSteps && onFinishToGame && (
          <div className="flex items-center gap-1">
            {onRestartTutorial && (
              <button
                type="button"
                onClick={onRestartTutorial}
                aria-label="Ulangi Tutorial"
                className="btn-tactile h-8 w-8 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onFinishToGame}
              className="btn-tactile h-8 px-3 rounded-lg bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs hover:bg-emerald-500"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Mulai Main</span>
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
