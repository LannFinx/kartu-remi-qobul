import React from 'react';
import { BookOpen, ShieldAlert, Sparkles, Trophy, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white">
              Panduan Aturan Qobul (Variasi Blind Start)
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4 space-y-2">
            <div className="font-display font-bold text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>1. Blind Start & Tujuan</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Setiap pemain mendapat 4 kartu tertutup rapat (2x2). Dilarang mengintip di awal! Pemenang adalah pemilik total nilai kartu terkecil.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4 space-y-2">
            <div className="font-display font-bold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>2. Aktifasi Kartu Sakti</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Efek kartu sakti (7, 8, 10, J, Q, K Hitam) hanya aktif jika diambil langsung dari Draw Pile lalu langsung dibuang ke Discard Pile.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-4 space-y-2">
            <div className="font-display font-bold text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>3. Seruan "QOBUL!"</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Memicu 1 giliran terakhir bagi lawan. Kartu pemanggil TIDAK dikunci! Jika gagal jadi yang terendah murni, kena penalti +{blunderPenalty} poin.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-400">
            Nilai Poin & Kemampuan Khusus Kartu
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 place-items-center">
            {sampleCards.map((card) => (
              <div
                key={card.id}
                className="flex flex-col items-center gap-2 bg-slate-950/80 border border-white/10 p-2.5 rounded-2xl w-full"
              >
                <PlayingCard card={card} isFaceUp size="sm" />
                <div className="text-center">
                  <div className="text-[11px] font-bold text-white leading-tight">
                    {card.abilityLabel}
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
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

