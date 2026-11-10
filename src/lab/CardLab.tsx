import React from 'react';
import { LayoutGroup } from 'motion/react';
import { Check, Crown, Eye, Globe, Home, RotateCcw, Users } from 'lucide-react';
import { PlayingCard } from '../components/PlayingCard';
import {
  VisualNovelBanner,
  VnMood,
} from '../components/VisualNovelCharacter';
import { DrawPileStack } from '../components/table/DrawPileStack';
import { DiscardStack } from '../components/table/DiscardStack';
import { FocusedCardModal } from '../components/table/FocusedCardModal';
import { ReflexTimerBar } from '../components/table/ReflexTimerBar';
import { CARD_ASPECT, CARD_WIDTHS } from '../components/card/cardMotion';
import {
  playCardSlideSound,
  playCardSnapSound,
  playPeekSound,
} from '../engine/soundEffects';
import {
  LAB_REFLEX_DURATION_MS,
  LabPhase,
  useCardLabState,
} from './useCardLabState';

const PHASE_BADGE: Record<LabPhase, string> = {
  dealing: 'Membagi 4 kartu Blind Start…',
  idle: 'Giliranmu • Ketuk Dek untuk Ambil Kartu',
  focused: '',
  choosing_slot: 'Ketuk Salah Satu Slot Matriks 2×2 untuk Menaruh Kartu',
  choosing_peek_slot: 'Ketuk Slot #1 di Matriks 2×2 untuk Mengintip!',
  peeking_card: 'Hafalkan Angkanya, Lalu Klik Oke Hafal!',
  reflex_window: 'Jeda Refleks • Ketuk Kartu Kembar (Slot #1 = 7)!',
};

interface TutorialChapterMeta {
  mood: VnMood;
  title: string;
  dialogue: string;
  actionHint?: string;
}

const TUTORIAL_CHAPTERS: Record<number, TutorialChapterMeta> = {
  1: {
    mood: 'happy',
    title: 'Blind Start & Matriks 2×2',
    dialogue:
      'Semua 4 kartu tertutup rapat di awal. Misi utamamu: kumpulkan total poin serendah mungkin!',
    actionHint: 'Klik "Lanjut" untuk mulai.',
  },
  2: {
    mood: 'excited',
    title: 'Ambil Kartu',
    dialogue:
      'Sekarang giliranmu! Ketuk tumpukan Dek untuk mengambil 1 kartu.',
    actionHint: 'Ketuk tumpukan Dek (kiri).',
  },
  3: {
    mood: 'wink',
    title: 'Kartu Sakti 7 & 8',
    dialogue:
      'Dapat 7♦! Angka 7 & 8 bisa mengintip kartumu sendiri jika langsung dibuang.',
    actionHint: 'Pilih "Pakai Efek" di modal kartu.',
  },
  4: {
    mood: 'serious',
    title: 'Intip & Hafalkan',
    dialogue:
      'Ketuk Kartu #1 (kiri atas) di mejamu untuk mengintip isinya, lalu klik Tutup.',
    actionHint: 'Ketuk Kartu #1 di mejamu.',
  },
  5: {
    mood: 'shocked',
    title: 'Jeda Refleks (Slam)',
    dialogue:
      'Kartu 7 baru saja dibuang! Jika kartumu juga angka 7, ketuk cepat untuk membuangnya!',
    actionHint: 'Ketuk Kartu #1 yang bernilai 7!',
  },
  6: {
    mood: 'excited',
    title: 'Tukar King Merah (-1 Poin)',
    dialogue:
      'Ambil kartu Dek lagi untuk mendapatkan King Merah (K♥ = -1 poin!), lalu tukar ke mejamu.',
    actionHint: 'Ambil Dek, pilih Tukar, lalu klik slot kartu.',
  },
  7: {
    mood: 'proud',
    title: 'Tutorial Selesai!',
    dialogue:
      'Kamu sudah menguasai aturan dasar! Jika poinmu sudah terkecil di permainan asli, teriak QOBUL!',
    actionHint: 'Siap bertanding? Klik "Mulai Main".',
  },
};

const pillButton =
  'btn-tactile h-9 sm:h-10 px-3 sm:px-3.5 rounded-2xl text-xs font-display font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

interface CardLabProps {
  onBackToMenu?: () => void;
  onOpenFullTable?: () => void;
  onOpenOnlineLobby?: () => void;
}

export const CardLab: React.FC<CardLabProps> = ({
  onBackToMenu,
  onOpenFullTable,
  onOpenOnlineLobby,
}) => {
  const { state, dispatch } = useCardLabState();
  const { phase, focusedCard, tutorialStep } = state;
  const emptySlotWidth = CARD_WIDTHS.md;
  const emptySlotHeight = Math.round(emptySlotWidth * CARD_ASPECT);
  const topDiscard = state.discardPile[state.discardPile.length - 1] ?? null;

  const currentChapter =
    TUTORIAL_CHAPTERS[tutorialStep] ?? TUTORIAL_CHAPTERS[7];

  return (
    <LayoutGroup>
      <main className="min-h-[100dvh] flex flex-col items-center justify-between canvas-vignette text-slate-900 px-2.5 py-2.5 sm:px-5 sm:py-3.5 overflow-x-hidden gap-2.5">
        <header className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onBackToMenu && (
              <button
                type="button"
                onClick={onBackToMenu}
                aria-label="Kembali ke Main Menu"
                className={`${pillButton} bg-slate-900 border-2 border-slate-700 border-b-[4px] border-b-slate-950 text-white inline-flex items-center gap-1.5 shadow-md`}
              >
                <Home className="w-3.5 h-3.5 text-amber-300" />
                <span>Menu</span>
              </button>
            )}

            <div className="inline-flex items-center gap-2 bg-gradient-to-b from-[#1e6f43] to-[#114227] border-2 border-amber-300 border-b-[4px] border-b-amber-600 rounded-2xl px-3 py-1.5 shadow-md text-white select-none">
              <span className="font-display font-black text-sm sm:text-base tracking-tight">
                Ahnap<span className="text-amber-300">Qobul</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-display font-black text-[10px] uppercase">
                Tutorial VN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                playCardSlideSound();
                dispatch({ type: 'reset' });
              }}
              className={`${pillButton} bg-slate-900 border-2 border-slate-700 border-b-[4px] border-b-slate-950 text-white inline-flex items-center gap-1.5 shadow-md`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi</span>
            </button>
            {onOpenOnlineLobby && (
              <button
                type="button"
                onClick={onOpenOnlineLobby}
                className={`${pillButton} bg-gradient-to-b from-sky-400 to-sky-600 border-2 border-sky-200 border-b-[4px] border-b-sky-800 text-white shadow-md inline-flex items-center gap-1.5`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Mabar</span>
              </button>
            )}
            {onOpenFullTable && (
              <button
                type="button"
                onClick={onOpenFullTable}
                className={`${pillButton} bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-100 border-b-[4px] border-b-amber-700 text-slate-950 shadow-md inline-flex items-center gap-1.5`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Main 4P</span>
              </button>
            )}
          </div>
        </header>

        <VisualNovelBanner
          mood={currentChapter.mood}
          stepNumber={tutorialStep}
          totalSteps={7}
          title={currentChapter.title}
          dialogue={currentChapter.dialogue}
          actionHint={currentChapter.actionHint}
          canAdvanceNext={tutorialStep === 1 && phase === 'idle'}
          nextButtonLabel="Lanjut"
          onNextStep={() => dispatch({ type: 'advance_intro' })}
          onFinishToGame={onOpenFullTable}
          onRestartTutorial={() => {
            playCardSlideSound();
            dispatch({ type: 'reset' });
          }}
        />

        <section className="flex-1 w-full max-w-4xl rounded-[32px] sm:rounded-[48px] bg-[radial-gradient(ellipse_at_50%_40%,#23804f_0%,#17613a_52%,#0c3d24_100%)] border-[6px] sm:border-[8px] border-white shadow-[0_20px_50px_rgba(15,23,42,0.16),inset_0_2px_18px_rgba(0,0,0,0.35)] px-4 py-4 sm:px-8 sm:py-6 flex flex-col items-center justify-between gap-4 text-white">
          <div className="min-h-[44px] flex items-center justify-center">
            <ReflexTimerBar
              isActive={phase === 'reflex_window'}
              topDiscardRank={topDiscard?.rank ?? null}
              windowKey={`lab-reflex-${state.reflexWindowId}`}
              durationMs={LAB_REFLEX_DURATION_MS}
              verdict={state.lastVerdict}
              onSkip={() => dispatch({ type: 'end_reflex_window' })}
            />

            {phase === 'choosing_slot' && focusedCard && (
              <div className="flex items-center gap-3 bg-black/35 border border-white/15 px-4 py-1.5 rounded-full">
                <PlayingCard
                  layoutId={focusedCard.id}
                  card={focusedCard}
                  isFaceUp
                  size="sm"
                />
                <span className="text-xs font-display font-extrabold text-amber-300">
                  Ketuk salah satu slot matriks 2×2 di bawah!
                </span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'cancel_keep' })}
                  className={`${pillButton} bg-white/15 hover:bg-white/25 text-white`}
                >
                  Batal
                </button>
              </div>
            )}

            {phase === 'peeking_card' && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'finish_peek' })}
                className={`${pillButton} bg-amber-400 text-slate-950 hover:bg-amber-300 inline-flex items-center gap-1.5 shadow-lg`}
              >
                <Check className="w-4 h-4" />
                <span>Oke, Hafal!</span>
              </button>
            )}
          </div>

          <div className="flex items-end gap-8 sm:gap-12">
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <DrawPileStack
                cards={state.drawPile}
                canDraw={phase === 'idle'}
                onDraw={() => {
                  playCardSlideSound();
                  dispatch({ type: 'draw_from_deck' });
                }}
              />
              <span className="px-2.5 py-0.5 rounded-full bg-black/25 text-[11px] font-extrabold text-white/85 tabular-nums">
                Dek ({state.drawPile.length})
              </span>
            </div>

            <div className="relative z-20 flex flex-col items-center gap-1.5">
              <DiscardStack
                cards={state.discardPile}
                flipTopOnArrival={state.discardArrivedHidden}
              />
              <span className="px-2.5 py-0.5 rounded-full bg-black/25 text-[11px] font-extrabold text-amber-300">
                {topDiscard ? `Buangan (${topDiscard.rank})` : 'Buangan'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 rounded-3xl px-4 py-2.5 bg-amber-300/15 ring-2 ring-amber-300/90 shadow-[0_0_28px_rgba(251,191,36,0.32)]">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-display font-extrabold text-xs shadow">
                <Crown className="w-3.5 h-3.5" />
                <span>Matriks 2×2 Anda</span>
              </div>

              <div className="grid grid-cols-2 gap-3 place-items-center">
                {state.hand.map((card, slotIndex) => {
                  const isPeekingThis =
                    phase === 'peeking_card' &&
                    state.peekingSlotIndex === slotIndex;
                  const isMisfireThis = state.misfireSlotIndex === slotIndex;
                  const isCardSelectable =
                    phase === 'choosing_slot' ||
                    phase === 'choosing_peek_slot' ||
                    phase === 'reflex_window';

                  return card ? (
                    <PlayingCard
                      key={card.id}
                      layoutId={card.id}
                      card={card}
                      isFaceUp={isPeekingThis}
                      isPeekedCorner={isPeekingThis}
                      isMisfireShake={isMisfireThis}
                      size="md"
                      slotNumber={slotIndex + 1}
                      hasOwnerMemoryBadge={state.knownCardIds.includes(card.id)}
                      flipOnMount={state.knownCardIds.includes(card.id)}
                      isSelectable={isCardSelectable}
                      onClick={() => {
                        if (phase === 'choosing_slot') {
                          playCardSnapSound();
                          dispatch({ type: 'keep_into_slot', slotIndex });
                        } else if (phase === 'choosing_peek_slot') {
                          playPeekSound();
                          dispatch({ type: 'peek_slot', slotIndex });
                        } else if (phase === 'reflex_window') {
                          dispatch({ type: 'attempt_slam', slotIndex });
                        }
                      }}
                    />
                  ) : (
                    <div
                      key={`empty-${slotIndex}`}
                      className="rounded-xl border-2 border-dashed border-white/20 bg-black/15 flex flex-col items-center justify-center gap-0.5 text-white/30 select-none"
                      style={{
                        width: emptySlotWidth,
                        height: emptySlotHeight,
                      }}
                    >
                      <span className="font-display font-extrabold text-xs">
                        #{slotIndex + 1}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        Kosong
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-6 flex items-center justify-center">
              {PHASE_BADGE[phase] && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/35 border border-white/15 text-[11px] font-extrabold text-amber-200">
                  {phase === 'choosing_peek_slot' && (
                    <Eye className="w-3.5 h-3.5 text-sky-300" />
                  )}
                  <span>{PHASE_BADGE[phase]}</span>
                </span>
              )}
            </div>
          </div>
        </section>

        <FocusedCardModal
          card={focusedCard}
          isOpen={phase === 'focused'}
          flipOnMount={state.focusArrivedHidden}
          onKeepAndSwap={() => dispatch({ type: 'start_keep' })}
          onDiscardOrUseAbility={() => {
            playCardSnapSound();
            dispatch({ type: 'discard_focused' });
          }}
        />
      </main>
    </LayoutGroup>
  );
};
