import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { playComicalLateSound } from '../../engine/soundEffects';

interface LatePenaltyModalProps {
  isOpen: boolean;
  actorName: string;
  onDismiss: () => void;
}

export const LatePenaltyModal: React.FC<LatePenaltyModalProps> = ({
  isOpen,
  actorName,
  onDismiss,
}) => {
  useEffect(() => {
    if (isOpen) {
      playComicalLateSound();
      const timer = window.setTimeout(() => {
        onDismiss();
      }, 2400);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, onDismiss]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onDismiss}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -6, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: [0, -4, 4, -2, 2, 0],
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: -16 }}
            transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.35 }}
            className="w-full max-w-xs rounded-3xl bg-[#14231a] border-2 border-red-500/80 shadow-[0_20px_50px_rgba(220,38,38,0.35)] p-5 text-center text-white flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-3xl">
              <svg
                viewBox="0 0 64 64"
                className="w-10 h-10 overflow-visible"
                aria-hidden="true"
              >
                <circle
                  cx="32"
                  cy="34"
                  r="24"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="3"
                />
                <circle cx="32" cy="34" r="18" fill="#ffffff" />
                <line
                  x1="32"
                  y1="34"
                  x2="32"
                  y2="22"
                  stroke="#0f172a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1="32"
                  y1="34"
                  x2="41"
                  y2="34"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="32" cy="34" r="2.5" fill="#0f172a" />
                <path
                  d="M26 10 L38 10"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M32 10 L32 14"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="14"
                  y1="16"
                  x2="20"
                  y2="22"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="50"
                  y1="16"
                  x2="44"
                  y2="22"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-black text-2xl tracking-wider text-red-400">
                TELAT!
              </h2>
              <p className="text-xs text-white/80 font-medium leading-relaxed">
                <span className="font-bold text-white">{actorName}</span> kalah
                cepat menaruh kartu kembar.
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-red-600/90 border border-red-300 font-display font-black text-xs tracking-wide text-white shadow-sm">
              +1 KARTU PENALTI
            </div>

            <span className="text-[10px] text-white/40 font-semibold tracking-wider">
              Ketuk untuk lanjut
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

