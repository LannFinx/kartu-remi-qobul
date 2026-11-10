import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Crown, Flame, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { GameState } from '../types/game';
import { PlayingCard } from './PlayingCard';

interface ShowdownModalProps {
  isOpen: boolean;
  gameState: GameState;
  onStartNextRound: () => void;
  onResetGame: () => void;
}

export const ShowdownModal: React.FC<ShowdownModalProps> = ({
  isOpen,
  gameState,
  onStartNextRound,
  onResetGame,
}) => {
  const { roundSummary, qobulCallerId, players, config, roundNumber } =
    gameState;

  const caller = players.find((p) => p.id === qobulCallerId);
  const callerSummary = roundSummary?.find((s) => s.isCaller);

  useEffect(() => {
    if (isOpen) {
      const winner = roundSummary?.find((s) => s.isRoundWinner);
      if (winner && !winner.playerId.includes('bot')) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#06B6D4', '#FFFFFF'],
        });
      }
    }
  }, [isOpen, roundSummary]);

  if (!isOpen || !roundSummary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', visualDuration: 0.32, bounce: 0.25 }}
        className="w-full max-w-3xl rounded-3xl bg-[#12492d] border-2 border-amber-300/60 shadow-2xl p-5 sm:p-6 space-y-5 my-6 text-white"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 font-display font-black text-xs shadow">
            <Trophy className="w-3.5 h-3.5" />
            <span>RONDE #{roundNumber} SELESAI</span>
          </div>

          {caller && callerSummary && (
            <div
              className={`mt-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-display font-extrabold text-xs shadow-lg ${
                callerSummary.callerSucceeded
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-red-600 text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              {callerSummary.callerSucceeded ? (
                <span>QOBUL SUKSES! {caller.name} (0 PTS)</span>
              ) : (
                <span>
                  BLUNDER! {caller.name} (+{config.qobulBlunderPenalty} Penalti)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {players.map((player) => {
            const summary = roundSummary.find((s) => s.playerId === player.id);
            const isWinner = summary?.isRoundWinner ?? false;
            const isCaller = summary?.isCaller ?? false;

            return (
              <div
                key={player.id}
                className={`rounded-2xl p-3 border flex flex-col items-center gap-2.5 ${
                  isWinner
                    ? 'bg-amber-400/20 border-amber-300 shadow-lg'
                    : 'bg-black/30 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  <span className="font-display font-extrabold text-xs truncate">
                    {player.name}
                  </span>
                  {isWinner && <Crown className="w-4 h-4 text-amber-300 shrink-0" />}
                  {isCaller && !isWinner && (
                    <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 place-items-center">
                  {player.hand.map((slot) => (
                    <PlayingCard
                      key={slot.card.id}
                      card={slot.card}
                      isFaceUp
                      flipOnMount
                      size="sm"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between w-full pt-1 border-t border-white/10 text-[11px] font-bold">
                  <span className="text-amber-300">
                    +{summary?.appliedPoints ?? 0} pts
                  </span>
                  <span className="text-white/60">
                    Total {player.cumulativeScore}p
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onResetGame}
            className="btn-tactile h-11 px-5 rounded-full bg-black/35 hover:bg-black/50 text-white/90 text-xs font-extrabold inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Skor</span>
          </button>

          <button
            type="button"
            onClick={onStartNextRound}
            className="btn-tactile h-11 px-6 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-xs shadow-xl inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ronde #{roundNumber + 1}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
