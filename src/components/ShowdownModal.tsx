import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Crown, RotateCcw } from 'lucide-react';
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
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#06B6D4', '#FFFFFF'],
        });
      }
    }
  }, [isOpen, roundSummary]);

  if (!isOpen || !roundSummary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', visualDuration: 0.32, bounce: 0.2 }}
        className="w-full max-w-3xl rounded-3xl bg-[#11442a] border-2 border-amber-300/50 shadow-2xl p-5 sm:p-7 space-y-5 my-6 text-white"
      >
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="font-display font-extrabold text-xs uppercase tracking-widest text-amber-300">
            Hasil Putaran #{roundNumber}
          </span>

          <h2 className="font-display font-black text-2xl tracking-tight text-white">
            Pembuktian Kartu
          </h2>

          {caller && callerSummary && (
            <div
              className={`mt-1 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-display font-extrabold text-xs shadow-md ${
                callerSummary.callerSucceeded
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-red-600 text-white'
              }`}
            >
              <span>
                {callerSummary.callerSucceeded
                  ? `Qobul Berhasil: ${caller.name} (0 Poin)`
                  : `Qobul Gagal: ${caller.name} (+${config.qobulBlunderPenalty} Penalti)`}
              </span>
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
                    ? 'bg-amber-400/20 border-amber-300/80 shadow-md'
                    : 'bg-black/30 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  <span className="font-display font-extrabold text-xs truncate">
                    {player.name}
                  </span>
                  {isWinner ? (
                    <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                  ) : isCaller ? (
                    <span className="text-[10px] font-bold text-red-300">
                      QOBUL
                    </span>
                  ) : null}
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

                <div className="flex items-center justify-between w-full pt-1.5 border-t border-white/10 text-[11px] font-bold">
                  <span className="text-amber-300 tabular-nums">
                    +{summary?.appliedPoints ?? 0} poin
                  </span>
                  <span className="text-white/60 tabular-nums">
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
            onClick={onStartNextRound}
            className="btn-tactile px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs sm:text-sm tracking-wide shadow-lg"
          >
            Lanjut Putaran Berikutnya
          </button>

          <button
            type="button"
            onClick={onResetGame}
            className="btn-tactile px-4 py-2.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white font-display font-bold text-xs inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mulai Ulang</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
