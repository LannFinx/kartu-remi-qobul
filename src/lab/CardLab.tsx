import React from 'react';
import { Check, Crown, Eye, Globe, RotateCcw, Users } from 'lucide-react';
import { PlayingCard } from '../components/PlayingCard';
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
  dealing: 'Membagi kartu…',
  idle: 'Giliranmu • Tarik Kartu',
  focused: '',
  choosing_slot: 'Ketuk Kartumu untuk Tukar',
  choosing_peek_slot: 'Ketuk 1 Kartumu untuk Intip',
  peeking_card: 'Hafalkan Kartumu!',
  reflex_window: 'Jeda Refleks • Ketuk Kartu Kembar!',
};

const pillButton =
  'btn-tactile h-9 sm:h-10 px-3.5 sm:px-4 rounded-full text-xs font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

interface CardLabProps {
  onOpenFullTable?: () => void;
  onOpenOnlineLobby?: () => void;
}

export const CardLab: React.FC<CardLabProps> = ({
  onOpenFullTable,
  onOpenOnlineLobby,
}) => {
  const { state, dispatch } = useCardLabState();
  const { phase, focusedCard } = state;
  const emptySlotWidth = CARD_WIDTHS.md;
  const emptySlotHeight = Math.round(emptySlotWidth * CARD_ASPECT);
  const topDiscard = state.discardPile[state.discardPile.length - 1] ?? null;

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-between canvas-vignette text-slate-900 px-2.5 py-2.5 sm:px-6 sm:py-4 overflow-x-hidden">
      <header className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2.5 bg-gradient-to-b from-[#1e6f43] to-[#114227] border-2 border-amber-300 border-b-[4px] border-b-amber-600 rounded-2xl px-3.5 py-1.5 shadow-[0_6px_16px_rgba(15,23,42,0.16)] text-white select-none">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <span className="absolute -rotate-12 -translate-x-1 w-4 h-5 rounded-[3px] bg-white border border-slate-300 shadow text-[9px] font-black text-red-600 flex items-center justify-center">
              K♥
            </span>
            <span className="absolute rotate-12 translate-x-1 w-4 h-5 rounded-[3px] bg-amber-300 border border-amber-600 shadow text-[9px] font-black text-slate-950 flex items-center justify-center">
              A♠
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-display font-black text-base sm:text-lg tracking-tight text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.45)]">
              Ahnap<span className="text-amber-300">Qobul</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-display font-black text-[10px] uppercase">
              Latihan
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
            <span>Ulang</span>
          </button>
          {onOpenOnlineLobby && (
            <button
              type="button"
              onClick={onOpenOnlineLobby}
              className={`${pillButton} bg-gradient-to-b from-sky-400 to-sky-600 border-2 border-sky-200 border-b-[4px] border-b-sky-800 text-white shadow-md inline-flex items-center gap-1.5`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Mabar Online</span>
            </button>
          )}
          {onOpenFullTable && (
            <button
              type="button"
              onClick={onOpenFullTable}
              className={`${pillButton} bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-100 border-b-[4px] border-b-amber-700 text-slate-950 shadow-md inline-flex items-center gap-1.5`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Meja 4 Pemain</span>
            </button>
          )}
        </div>
      </header>

      <section className="flex-1 w-full max-w-4xl my-2.5 sm:my-3 rounded-[32px] sm:rounded-[48px] bg-[radial-gradient(ellipse_at_50%_40%,#23804f_0%,#17613a_52%,#0c3d24_100%)] border-[6px] sm:border-[8px] border-white shadow-[0_20px_50px_rgba(15,23,42,0.16),inset_0_2px_18px_rgba(0,0,0,0.35)] px-4 py-5 sm:px-8 sm:py-7 flex flex-col items-center justify-between gap-4 text-white">
        <div className="min-h-[48px] flex items-center justify-center">
          <ReflexTimerBar
            isActive={phase === 'reflex_window'}
            topDiscardRank={topDiscard?.rank ?? null}
            windowKey={`lab-reflex-${state.reflexWindowId}`}
            durationMs={LAB_REFLEX_DURATION_MS}
            verdict={state.lastVerdict}
            onSkip={() => dispatch({ type: 'end_reflex_window' })}
          />

          {phase === 'choosing_slot' && focusedCard && (
            <div className="flex items-center gap-3 bg-black/35 border border-white/15 px-4 py-2 rounded-full">
              <PlayingCard
                layoutId={focusedCard.id}
                card={focusedCard}
                isFaceUp
                size="sm"
              />
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
              {state.drawPile.length} kartu
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

        <div className="flex flex-col items-center gap-2.5">
          <div className="flex flex-col items-center gap-2 rounded-3xl px-4 py-3 bg-amber-300/15 ring-2 ring-amber-300/90 shadow-[0_0_28px_rgba(251,191,36,0.32)]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-display font-extrabold text-xs shadow">
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

          <div className="h-7 flex items-center justify-center">
            {PHASE_BADGE[phase] && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/35 border border-white/15 text-xs font-extrabold text-amber-200">
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
  );
};
