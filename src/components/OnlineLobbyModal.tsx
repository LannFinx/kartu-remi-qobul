import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Copy,
  Globe,
  LogOut,
  Play,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { RoomMember, RoomRole } from '../engine/onlineRoom';

interface OnlineLobbyModalProps {
  isOpen: boolean;
  role: RoomRole;
  roomCode: string;
  statusText: string;
  playerName: string;
  members: RoomMember[];
  totalSeats: number;
  onChangePlayerName: (name: string) => void;
  onCreateHostRoom: () => void;
  onJoinRoom: (code: string) => void;
  onStartOnlineMatch: () => void;
  onLeaveRoom: () => void;
  onClose: () => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isOpen,
  role,
  roomCode,
  statusText,
  playerName,
  members,
  totalSeats,
  onChangePlayerName,
  onCreateHostRoom,
  onJoinRoom,
  onStartOnlineMatch,
  onLeaveRoom,
  onClose,
}) => {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?table=1&room=${roomCode}`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', visualDuration: 0.28, bounce: 0.25 }}
        className="w-full max-w-md rounded-3xl bg-[#12492d] border-2 border-amber-300/60 shadow-2xl p-6 space-y-5 text-white relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="btn-tactile absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/80"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-lg leading-tight">
              Mabar Online
            </h2>
            <span className="text-xs text-emerald-200/80 font-medium">
              {role === 'offline' ? 'Main bareng teman beda layar' : statusText}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/80">Nama Kamu</label>
          <input
            type="text"
            value={playerName}
            maxLength={16}
            onChange={(e) => onChangePlayerName(e.target.value)}
            placeholder="Ketik namamu…"
            className="w-full h-11 px-4 rounded-2xl bg-black/35 border border-white/20 text-sm font-bold text-white placeholder:text-white/40 focus:outline-none focus:border-amber-300"
          />
        </div>

        {role === 'offline' ? (
          <div className="space-y-4 pt-1">
            <button
              type="button"
              onClick={onCreateHostRoom}
              className="btn-tactile w-full h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-sm shadow-lg inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buat Room Baru (Host)</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/15" />
              <span className="text-[11px] font-bold text-white/50 uppercase">
                Atau Gabung
              </span>
              <div className="h-px flex-1 bg-white/15" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={joinCodeInput}
                maxLength={6}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="Kode 4 Digit (mis. 4829)"
                className="flex-1 h-11 px-4 rounded-2xl bg-black/35 border border-white/20 text-sm font-display font-extrabold tracking-widest text-amber-300 placeholder:text-white/35 placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-amber-300"
              />
              <button
                type="button"
                disabled={joinCodeInput.trim().length < 3}
                onClick={() => onJoinRoom(joinCodeInput)}
                className="btn-tactile h-11 px-5 rounded-2xl bg-white text-slate-950 font-display font-extrabold text-xs shadow disabled:opacity-40"
              >
                Gabung
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-black/35 border border-amber-300/40 p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-amber-200/80 uppercase">
                  Kode Room
                </div>
                <div className="font-display font-black text-2xl tracking-widest text-amber-300">
                  {roomCode}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyInvite}
                className="btn-tactile h-10 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-extrabold inline-flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl bg-black/25 border border-white/10 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white/75">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-300" />
                  <span>Kursi Meja ({members.length}/{totalSeats} Pemain)</span>
                </span>
                <span className="text-[11px] text-emerald-300">
                  Sisa kursi diisi Bot
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {Array.from({ length: totalSeats }, (_, idx) => {
                  const member = members.find((m) => m.seatIndex === idx);
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border ${
                        member
                          ? 'bg-emerald-950/80 border-emerald-400/50 text-white'
                          : 'bg-black/20 border-white/10 text-white/45'
                      }`}
                    >
                      <span className="truncate">
                        {member ? member.name : `Bot Kursi #${idx + 1}`}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                          HOST
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onLeaveRoom}
                className="btn-tactile h-11 px-4 rounded-2xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>

              {role === 'host' ? (
                <button
                  type="button"
                  onClick={() => {
                    onStartOnlineMatch();
                    onClose();
                  }}
                  className="btn-tactile flex-1 h-11 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-xs shadow-lg inline-flex items-center justify-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Mulai / Bagi Kartu</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-tactile flex-1 h-11 rounded-2xl bg-white text-slate-950 font-display font-extrabold text-xs shadow-lg"
                >
                  Ke Meja Permainan
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

