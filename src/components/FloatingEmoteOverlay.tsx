import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SmilePlus, X } from 'lucide-react';
import { EmotePayload } from '../engine/onlineRoom';
import { playEmotePopSound } from '../engine/soundEffects';

interface FloatingEmoteOverlayProps {
  activeEmotes: EmotePayload[];
  onSendEmote: (emoji: string, label?: string) => void;
}

const PRESET_EMOTES = [
  { emoji: '🔥', label: 'Membara' },
  { emoji: '😂', label: 'Ngakak' },
  { emoji: '😱', label: 'Kaget' },
  { emoji: '👑', label: 'Sultan' },
  { emoji: '⚡', label: 'Refleks' },
  { emoji: '💬', label: 'QOBUL!' },
];

export const FloatingEmoteOverlay: React.FC<FloatingEmoteOverlayProps> = ({
  activeEmotes,
  onSendEmote,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePickEmote = (emoji: string, label: string) => {
    playEmotePopSound();
    onSendEmote(emoji, label);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        <AnimatePresence>
          {activeEmotes.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              animate={{ opacity: 1, y: -70, scale: [0.9, 1.25, 1.1] }}
              exit={{ opacity: 0, y: -120, scale: 0.8 }}
              transition={{
                duration: 2.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute left-1/2 -translate-x-1/2 bottom-36 flex flex-col items-center gap-1"
            >
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-amber-300/80 shadow-2xl backdrop-blur-xs flex items-center gap-2 text-white">
                <span className="text-xl sm:text-2xl">{item.emoji}</span>
                <div className="flex flex-col text-left leading-none pr-1">
                  <span className="font-display font-black text-[11px] text-amber-300 truncate max-w-[100px]">
                    {item.senderName}
                  </span>
                  {item.label && (
                    <span className="text-[10px] text-white/80 font-bold">
                      {item.label}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 select-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 10 }}
              transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.25 }}
              className="mb-2 p-2 rounded-2xl bg-slate-950/90 border border-white/20 shadow-2xl backdrop-blur-md flex items-center gap-1.5"
            >
              {PRESET_EMOTES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handlePickEmote(item.emoji, item.label)}
                  className="btn-tactile w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 hover:bg-white/25 flex items-center justify-center text-lg sm:text-xl"
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-tactile w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="btn-tactile h-9 sm:h-10 px-3 rounded-full bg-slate-900 border border-amber-300/60 shadow-lg text-white font-display font-extrabold text-xs inline-flex items-center gap-1.5 hover:bg-slate-800"
        >
          <SmilePlus className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Reaksi</span>
        </button>
      </div>
    </>
  );
};

