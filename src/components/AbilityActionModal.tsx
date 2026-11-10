import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeftRight, Check, Shuffle, Sparkles, X } from 'lucide-react';
import { ActiveAbilityContext, Player } from '../types/game';
import { PlayingCard } from './PlayingCard';
import { CARD_ASPECT, CARD_WIDTHS } from './card/cardMotion';

interface AbilityActionModalProps {
  isOpen: boolean;
  activeAbility: ActiveAbilityContext | null;
  activePlayer: Player;
  allPlayers: Player[];
  onTriggerPeekOwn: (slotIndex: number) => void;
  onTriggerPeekOpponent: (targetPlayerId: string, slotIndex: number) => void;
  onFinishPeek: () => void;
  onExecuteJackSwap: (
    target1: { playerId: string; slotIndex: number },
    target2: { playerId: string; slotIndex: number }
  ) => void;
  onExecuteQueenSwap: (
    ownSlotIndex: number,
    opponentId: string,
    opponentSlotIndex: number
  ) => void;
  onExecuteKingSwap: (
    ownSlotIndex: number,
    opponentId: string,
    opponentSlotIndex: number,
    wasPeeked: boolean
  ) => void;
  onSkipKingSwap: () => void;
}

export const AbilityActionModal: React.FC<AbilityActionModalProps> = ({
  isOpen,
  activeAbility,
  activePlayer,
  allPlayers,
  onTriggerPeekOwn,
  onTriggerPeekOpponent,
  onFinishPeek,
  onExecuteJackSwap,
  onExecuteQueenSwap,
  onExecuteKingSwap,
  onSkipKingSwap,
}) => {
  const [selectedOwnSlot, setSelectedOwnSlot] = useState<number | null>(null);
  const [firstTarget, setFirstTarget] = useState<{
    playerId: string;
    slotIndex: number;
  } | null>(null);

  if (!isOpen || !activeAbility) return null;

  const opponents = allPlayers.filter((p) => p.id !== activePlayer.id);
  const {
    abilityType,
    sourceCard,
    peekedCardPreview,
    kingOwnPeek,
    kingOpponentPeek,
  } = activeAbility;

  const resetLocalSelections = () => {
    setSelectedOwnSlot(null);
    setFirstTarget(null);
  };

  const smWidth = CARD_WIDTHS.sm;
  const smHeight = Math.round(smWidth * CARD_ASPECT);

  const renderMiniGrid = (
    player: Player,
    onTapSlot: (slotIndex: number) => void,
    selectedSlot: number | null,
    revealedSlot: number | null = null,
    lockAllSlots = false
  ) => {
    const maxSlotIdx = player.hand.reduce(
      (max, s) => Math.max(max, s.slotIndex),
      3
    );
    const totalMatrixSlots = Math.max(4, maxSlotIdx + 1);
    const matrixIndices = Array.from({ length: totalMatrixSlots }, (_, i) => i);

    return (
      <div className="flex flex-col items-center gap-2 bg-black/30 border border-white/15 rounded-2xl p-3">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: player.avatarColor }}
          />
          <span className="font-display font-bold text-xs text-white truncate max-w-[115px]">
            {player.name}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 place-items-center">
          {matrixIndices.map((matrixIdx) => {
            const slot = player.hand.find((s) => s.slotIndex === matrixIdx);
            if (!slot) {
              return (
                <div
                  key={`empty_${player.id}_${matrixIdx}`}
                  style={{ width: smWidth, height: smHeight }}
                  className="rounded-lg border border-dashed border-white/15 bg-black/15 flex items-center justify-center text-[10px] font-bold text-white/25 select-none"
                >
                  #{matrixIdx + 1}
                </div>
              );
            }

            const isRevealed = revealedSlot === slot.slotIndex;
            const isPicked = selectedSlot === slot.slotIndex;
            return (
              <PlayingCard
                key={slot.card.id}
                card={slot.card}
                isFaceUp={isRevealed}
                flipOnMount={isRevealed}
                size="sm"
                slotNumber={slot.slotIndex + 1}
                isSelectable={!lockAllSlots && !isRevealed}
                isSelected={isPicked || isRevealed}
                onClick={() => {
                  if (!lockAllSlots) {
                    onTapSlot(slot.slotIndex);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const getKingHeaderText = () => {
    if (!kingOwnPeek && !kingOpponentPeek) {
      return 'Intip 1 Kartumu & 1 Kartu Lawan';
    }
    if (!kingOwnPeek) {
      return 'Ketuk 1 Kartumu untuk Diintip';
    }
    if (!kingOpponentPeek) {
      return 'Ketuk 1 Kartu Lawan untuk Diintip';
    }
    return 'Mau Tukar Kedua Kartu Ini?';
  };

  const badgeTitleMap: Record<typeof abilityType, string> = {
    none: '',
    peek_own: 'Intip 1 Kartumu',
    peek_opponent: 'Intip 1 Kartu Lawan',
    blind_swap_opponents: firstTarget
      ? 'Pilih Kartu Lawan Ke-2'
      : 'Pilih Kartu Lawan Ke-1',
    blind_swap_self_opponent:
      selectedOwnSlot === null ? '1. Pilih Kartumu' : '2. Pilih Kartu Lawan',
    special_swap_king: getKingHeaderText(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', visualDuration: 0.28, bounce: 0.2 }}
        className="w-full max-w-xl max-h-[88dvh] sm:max-h-[90dvh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl bg-[#11442a] border-t-2 sm:border-2 border-amber-300/70 shadow-2xl p-4 sm:p-6 flex flex-col items-center gap-4 text-white"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-amber-300/40">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="font-display font-extrabold text-xs sm:text-sm tracking-wide text-amber-200">
            {sourceCard.rank} • {badgeTitleMap[abilityType]}
          </span>
        </div>

        {abilityType === 'peek_own' && (
          <>
            {peekedCardPreview ? (
              <div className="flex flex-col items-center gap-4">
                <PlayingCard
                  card={peekedCardPreview.card}
                  isFaceUp
                  flipOnMount
                  size="lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    resetLocalSelections();
                    onFinishPeek();
                  }}
                  className="btn-tactile h-11 px-6 rounded-full bg-amber-400 text-slate-950 font-display font-extrabold text-sm shadow-lg inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Oke, Hafal!</span>
                </button>
              </div>
            ) : (
              renderMiniGrid(activePlayer, onTriggerPeekOwn, null)
            )}
          </>
        )}

        {abilityType === 'peek_opponent' && (
          <>
            {peekedCardPreview ? (
              <div className="flex flex-col items-center gap-4">
                <PlayingCard
                  card={peekedCardPreview.card}
                  isFaceUp
                  flipOnMount
                  size="lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    resetLocalSelections();
                    onFinishPeek();
                  }}
                  className="btn-tactile h-11 px-6 rounded-full bg-amber-400 text-slate-950 font-display font-extrabold text-sm shadow-lg inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Oke, Hafal!</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                {opponents.map((opp) => (
                  <div key={opp.id}>
                    {renderMiniGrid(
                      opp,
                      (slotIdx) => onTriggerPeekOpponent(opp.id, slotIdx),
                      null
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {abilityType === 'blind_swap_opponents' && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-wrap justify-center gap-3">
              {opponents.map((opp) => (
                <div key={opp.id}>
                  {renderMiniGrid(
                    opp,
                    (slotIdx) => {
                      if (!firstTarget || firstTarget.playerId === opp.id) {
                        setFirstTarget({ playerId: opp.id, slotIndex: slotIdx });
                      } else {
                        const t1 = firstTarget;
                        resetLocalSelections();
                        onExecuteJackSwap(t1, {
                          playerId: opp.id,
                          slotIndex: slotIdx,
                        });
                      }
                    },
                    firstTarget?.playerId === opp.id
                      ? firstTarget.slotIndex
                      : null
                  )}
                </div>
              ))}
            </div>

            {opponents.length < 2 && (
              <button
                type="button"
                onClick={onFinishPeek}
                className="btn-tactile h-10 px-5 rounded-full bg-white/15 text-xs font-bold"
              >
                Lewati
              </button>
            )}
          </div>
        )}

        {abilityType === 'blind_swap_self_opponent' && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {renderMiniGrid(
              activePlayer,
              (slotIdx) => setSelectedOwnSlot(slotIdx),
              selectedOwnSlot
            )}

            <Shuffle className="w-5 h-5 text-amber-300 shrink-0" />

            <div className="flex flex-wrap justify-center gap-3">
              {opponents.map((opp) => (
                <div key={opp.id}>
                  {renderMiniGrid(
                    opp,
                    (oppSlotIdx) => {
                      const fallbackOwn = activePlayer.hand[0]?.slotIndex ?? 0;
                      const ownIdx = selectedOwnSlot ?? fallbackOwn;
                      resetLocalSelections();
                      onExecuteQueenSwap(ownIdx, opp.id, oppSlotIdx);
                    },
                    null
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {abilityType === 'special_swap_king' && (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 w-full">
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                  {kingOwnPeek ? '✓ Kartumu Terbuka' : '1. Intip 1 Kartumu'}
                </span>
                {renderMiniGrid(
                  activePlayer,
                  (ownSlotIdx) => onTriggerPeekOwn(ownSlotIdx),
                  kingOwnPeek?.slotIndex ?? null,
                  kingOwnPeek?.slotIndex ?? null,
                  Boolean(kingOwnPeek)
                )}
              </div>

              <ArrowLeftRight className="w-5 h-5 text-amber-300 shrink-0 hidden sm:block" />

              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300">
                  {kingOpponentPeek
                    ? '✓ Kartu Lawan Terbuka'
                    : '2. Intip 1 Kartu Lawan'}
                </span>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {opponents.map((opp) => {
                    const isRevealedOpp =
                      kingOpponentPeek?.playerId === opp.id
                        ? kingOpponentPeek.slotIndex
                        : null;
                    return (
                      <div key={opp.id}>
                        {renderMiniGrid(
                          opp,
                          (oppSlotIdx) =>
                            onTriggerPeekOpponent(opp.id, oppSlotIdx),
                          isRevealedOpp,
                          isRevealedOpp,
                          Boolean(kingOpponentPeek)
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {kingOwnPeek && kingOpponentPeek && (
                <button
                  type="button"
                  onClick={() => {
                    resetLocalSelections();
                    onExecuteKingSwap(
                      kingOwnPeek.slotIndex,
                      kingOpponentPeek.playerId,
                      kingOpponentPeek.slotIndex,
                      true
                    );
                  }}
                  className="btn-tactile h-11 px-6 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-sm shadow-lg inline-flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Tukar Kedua Kartu</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  resetLocalSelections();
                  onSkipKingSwap();
                }}
                className="btn-tactile h-11 px-5 rounded-full bg-white/15 hover:bg-white/25 text-white font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Jangan Tukar</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
