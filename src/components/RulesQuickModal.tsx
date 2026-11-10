import React from 'react';
import { X } from 'lucide-react';
import { Card } from '../types/game';
import { PlayingCard } from './PlayingCard';

interface RulesQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleCards: Card[];
  blunderPenalty: number;
}

export const RulesQuickModal: React.FC<RulesQuickModalProps> = ({
  isOpen,
  onClose,
  sampleCards,
  blunderPenalty,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#11442a] border-2 border-amber-300/40 shadow-2xl p-5 sm:p-7 space-y-6 my-6 text-white">
        <div className="flex items-center justify-between border-b border-white/15 pb-3.5">
          <div>
            <h2 className="font-display font-black text-lg sm:text-xl tracking-tight text-white">
              Aturan Meja AhnapQobul
            </h2>
            <p className="text-xs text-emerald-200/75 font-medium">
              Raih total nilai poin kartu terendah di akhir putaran
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup aturan"
            className="btn-tactile w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 flex items-center justify-center text-white/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-white/10 rounded-2xl bg-black/30 border border-white/10 px-4 py-1 text-xs sm:text-sm">
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-display font-extrabold text-amber-300">
              Matriks 2×2 Tertutup
            </span>
            <span className="text-white/85 sm:text-right">
              4 kartu awal tertutup rapat. Intip hanya lewat efek kartu khusus.
            </span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-display font-extrabold text-amber-300">
              Adu Cepat Kartu Kembar
            </span>
            <span className="text-white/85 sm:text-right">
              Buang kartu berangka sama ke buangan. Salah atau telat: +1 kartu penalti.
            </span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-display font-extrabold text-amber-300">
              Seruan Qobul
            </span>
            <span className="text-white/85 sm:text-right">
              Lawan mendapat 1 giliran terakhir. Gagal terendah murni: +{blunderPenalty} poin.
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-display font-bold text-xs uppercase tracking-widest text-emerald-200/70">
            Nilai Poin & Kemampuan Kartu
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 place-items-center">
            {sampleCards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col items-center gap-2 bg-black/30 border border-white/10 p-2.5 rounded-2xl w-full"
              >
                <PlayingCard card={card} isFaceUp size="sm" />
                <div className="text-center">
                  <div className="text-[11px] font-bold text-white leading-tight">
                    {card.abilityLabel}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5 tabular-nums">
                    {card.pointValue} Poin
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
