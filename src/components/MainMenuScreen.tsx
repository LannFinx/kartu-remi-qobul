import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Play,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { createStandardDeck } from '../engine/deck';
import {
  playCardSlideSound,
  playCardSnapSound,
  setSoundMuted,
} from '../engine/soundEffects';
import { PlayingCard } from './PlayingCard';
import { RulesQuickModal } from './RulesQuickModal';

interface MainMenuScreenProps {
  onStartVsBot: () => void;
  onStartOnlineLobby: () => void;
  onStartTutorial: () => void;
}

const SHOWCASE_CARDS = [
  {
    id: 'K_hearts',
    tilt: -12,
    offsetY: 8,
    title: 'King Merah (♥ / ♦)',
    rule: 'Nilai −1 Poin',
  },
  {
    id: '7_diamonds',
    tilt: -4,
    offsetY: 0,
    title: 'Kartu 7 & 8',
    rule: 'Intip 1 Kartu Sendiri',
  },
  {
    id: '10_clubs',
    tilt: 4,
    offsetY: 0,
    title: 'Kartu 9 & 10',
    rule: 'Intip 1 Kartu Lawan',
  },
  {
    id: 'K_spades',
    tilt: 12,
    offsetY: 8,
    title: 'King Hitam (♠ / ♣)',
    rule: 'Intip & Tukar Kartu',
  },
];

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onStartVsBot,
  onStartOnlineLobby,
  onStartTutorial,
}) => {
  const fullDeck = useMemo(() => createStandardDeck(), []);
  const [flippedIds, setFlippedIds] = useState<string[]>([
    'K_hearts',
    '7_diamonds',
    '10_clubs',
    'K_spades',
  ]);
  const [selectedCardId, setSelectedCardId] = useState<string>('K_hearts');
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const sampleRuleCards = useMemo(() => {
    const ids = [
      'K_hearts',
      'A_spades',
      '7_diamonds',
      '10_clubs',
      'J_spades',
      'Q_hearts',
      'K_spades',
    ];
    return ids
      .map((id) => fullDeck.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [fullDeck]);

  const activeShowcaseMeta =
    SHOWCASE_CARDS.find((item) => item.id === selectedCardId) ??
    SHOWCASE_CARDS[0];

  const handleToggleCard = (id: string) => {
    playCardSnapSound();
    setSelectedCardId(id);
    setFlippedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <main className="min-h-[100dvh] canvas-vignette flex flex-col items-center justify-between px-3 py-4 sm:px-6 sm:py-6 text-slate-900 overflow-x-hidden select-none">
      <header className="w-full max-w-4xl flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-800">
          <span className="font-display font-black text-sm tracking-tight">
            Ahnap<span className="text-emerald-700">Qobul</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-semibold text-slate-500">
            Meja Kartu Remi
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsMuted((prev) => {
                const next = !prev;
                setSoundMuted(next);
                return next;
              });
            }}
            aria-label={isMuted ? 'Nyalakan suara' : 'Matikan suara'}
            className="btn-tactile w-9 h-9 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-950 hover:bg-slate-50 flex items-center justify-center shadow-xs"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-700" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="btn-tactile h-9 px-3.5 rounded-xl bg-white border border-slate-200/90 text-slate-800 hover:bg-slate-50 font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>Aturan</span>
          </button>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.15 }}
        className="w-full max-w-4xl my-auto rounded-[36px] sm:rounded-[48px] bg-[radial-gradient(ellipse_at_50%_35%,#217a4b_0%,#155b36_58%,#0b3820_100%)] border-[6px] sm:border-[8px] border-white shadow-[0_24px_60px_rgba(15,23,42,0.18),inset_0_2px_24px_rgba(0,0,0,0.45)] px-5 py-7 sm:px-12 sm:py-10 flex flex-col items-center text-center text-white gap-6 sm:gap-7 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-3 sm:inset-4 rounded-[26px] sm:rounded-[36px] border border-amber-200/15" />

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div
            className="flex items-center gap-3 text-amber-300/75 text-xs sm:text-sm tracking-[0.25em] font-semibold"
            aria-hidden="true"
          >
            <span>♠</span>
            <span className="text-red-300/80">♥</span>
            <span>♣</span>
            <span className="text-red-300/80">♦</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]">
            Ahnap<span className="text-amber-300">Qobul</span>
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/80 font-medium tracking-wide">
            Empat Kartu. Satu Ingatan. Poin Terendah.
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3.5 py-1">
          <div className="flex items-center justify-center -space-x-3 sm:-space-x-2 py-2">
            {SHOWCASE_CARDS.map((item) => {
              const cardObj = fullDeck.find((c) => c.id === item.id);
              if (!cardObj) return null;
              const isFaceUp = flippedIds.includes(item.id);
              const isFocused = selectedCardId === item.id;

              return (
                <div
                  key={item.id}
                  style={{
                    transform: `translateY(${isFocused ? item.offsetY - 6 : item.offsetY}px)`,
                  }}
                  className="transition-transform duration-200"
                >
                  <PlayingCard
                    card={cardObj}
                    isFaceUp={isFaceUp}
                    size="md"
                    tilt={item.tilt}
                    isSelectable
                    isSelected={isFocused}
                    onClick={() => handleToggleCard(item.id)}
                  />
                </div>
              );
            })}
          </div>

          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/35 border border-white/15 backdrop-blur-xs text-xs">
            <span className="font-display font-extrabold text-amber-300">
              {activeShowcaseMeta.title}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-white/90 font-semibold">
              {activeShowcaseMeta.rule}
            </span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-sm flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              playCardSlideSound();
              onStartVsBot();
            }}
            className="btn-tactile w-full h-13 sm:h-14 rounded-2xl bg-amber-400 hover:bg-amber-300 border border-amber-200 border-b-[4px] border-b-amber-600 text-slate-950 font-display font-black text-sm sm:text-base tracking-wide shadow-[0_8px_20px_rgba(0,0,0,0.28)] flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>MAIN SEKARANG</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                playCardSlideSound();
                onStartOnlineLobby();
              }}
              className="btn-tactile h-11 sm:h-12 rounded-2xl bg-black/35 hover:bg-black/50 border border-white/20 border-b-[3px] border-b-black/60 text-white font-display font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>MABAR ONLINE</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playCardSlideSound();
                onStartTutorial();
              }}
              className="btn-tactile h-11 sm:h-12 rounded-2xl bg-black/35 hover:bg-black/50 border border-white/20 border-b-[3px] border-b-black/60 text-white font-display font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>TUTORIAL</span>
            </button>
          </div>
        </div>
      </motion.section>

      <footer className="text-[11px] font-semibold text-slate-400 tracking-wide">
        AhnapQobul
      </footer>

      <RulesQuickModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        sampleCards={sampleRuleCards}
        blunderPenalty={10}
      />
    </main>
  );
};
