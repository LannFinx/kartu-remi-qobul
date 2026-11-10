import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Flame,
  Globe,
  GraduationCap,
  Play,
  Sparkles,
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
    tilt: -14,
    offsetY: 10,
    badge: 'K Merah = -1 Poin!',
    badgeColor: 'bg-amber-400 text-slate-950',
  },
  {
    id: '7_diamonds',
    tilt: -5,
    offsetY: 0,
    badge: '7 & 8 = Intip Sendiri',
    badgeColor: 'bg-sky-400 text-slate-950',
  },
  {
    id: '10_clubs',
    tilt: 5,
    offsetY: 0,
    badge: '10 = Intip Lawan',
    badgeColor: 'bg-emerald-400 text-slate-950',
  },
  {
    id: 'K_spades',
    tilt: 14,
    offsetY: 10,
    badge: 'K Hitam = Intip & Tukar',
    badgeColor: 'bg-purple-300 text-slate-950',
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
    <main className="min-h-[100dvh] canvas-vignette flex flex-col items-center justify-between px-3 py-3 sm:px-6 sm:py-5 text-slate-900 overflow-x-hidden">
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 text-white border-2 border-slate-700 border-b-[4px] border-b-slate-950 shadow-md">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="font-display font-black text-xs tracking-wide">
            EDISI 2.0 • BLIND START
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
            className="btn-tactile w-10 h-10 rounded-2xl bg-slate-900 border-2 border-slate-700 border-b-[4px] border-b-slate-950 text-white flex items-center justify-center shadow-md"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            className="btn-tactile h-10 px-3.5 rounded-2xl bg-slate-900 border-2 border-slate-700 border-b-[4px] border-b-slate-950 text-white font-display font-extrabold text-xs inline-flex items-center gap-1.5 shadow-md"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Aturan</span>
          </button>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.2 }}
        className="w-full max-w-4xl my-auto rounded-[36px] sm:rounded-[52px] bg-[radial-gradient(ellipse_at_50%_38%,#23804f_0%,#17613a_55%,#0c3d24_100%)] border-[6px] sm:border-[8px] border-white shadow-[0_24px_60px_rgba(15,23,42,0.2),inset_0_2px_20px_rgba(0,0,0,0.4)] px-4 py-6 sm:px-10 sm:py-9 flex flex-col items-center text-center text-white gap-5 sm:gap-6 relative overflow-hidden"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/35 border border-amber-300/50 text-amber-200 font-display font-extrabold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Permainan Kartu Memori & Refleks</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.45)]">
            Ahnap<span className="text-amber-300">Qobul</span>
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-md font-medium">
            4 kartu tertutup rapat, intip pakai kartu sakti, adu cepat buang
            kartu kembar, dan raih poin terkecil!
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 py-1">
          <div className="flex items-center justify-center -space-x-3 sm:-space-x-2 py-2">
            {SHOWCASE_CARDS.map((item) => {
              const cardObj = fullDeck.find((c) => c.id === item.id);
              if (!cardObj) return null;
              const isFaceUp = flippedIds.includes(item.id);
              const isFocused = selectedCardId === item.id;

              return (
                <div
                  key={item.id}
                  style={{ transform: `translateY(${item.offsetY}px)` }}
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

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/40 border border-white/15 text-xs font-bold">
            <span
              className={`px-2 py-0.5 rounded-full font-display font-black text-[10px] ${activeShowcaseMeta.badgeColor}`}
            >
              {activeShowcaseMeta.badge}
            </span>
            <span className="text-white/75 text-[11px]">
              Ketuk kartu di atas untuk membalik!
            </span>
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              playCardSlideSound();
              onStartVsBot();
            }}
            className="btn-tactile w-full h-14 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-100 border-b-[5px] border-b-amber-700 text-slate-950 font-display font-black text-base sm:text-lg shadow-[0_10px_24px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2.5"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>MAIN SEKARANG (Meja 4 Pemain)</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                playCardSlideSound();
                onStartOnlineLobby();
              }}
              className="btn-tactile h-12 rounded-2xl bg-gradient-to-b from-sky-400 to-sky-600 border-2 border-sky-200 border-b-[4px] border-b-sky-800 text-white font-display font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>Mabar Online</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playCardSlideSound();
                onStartTutorial();
              }}
              className="btn-tactile h-12 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 border-2 border-emerald-200 border-b-[4px] border-b-emerald-800 text-slate-950 font-display font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Tutorial (Visual Novel)</span>
            </button>
          </div>
        </div>
      </motion.section>

      <footer className="text-[11px] font-bold text-slate-500">
        AhnapQobul • Mabar Remi Blind Start
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
