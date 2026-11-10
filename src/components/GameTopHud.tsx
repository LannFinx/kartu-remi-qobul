import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Gamepad2,
  Globe,
  RefreshCw,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { RoomRole } from '../engine/onlineRoom';

interface GameTopHudProps {
  roundNumber: number;
  roomRole: RoomRole;
  roomCode: string;
  memberCount: number;
  playerCount: number;
  isPassAndPlayMode: boolean;
  isMuted: boolean;
  announcerText: string;
  isViewerTurn: boolean;
  onOpenLobby: () => void;
  onChangePlayerCount: (count: number) => void;
  onTogglePassAndPlay: () => void;
  onToggleMute: () => void;
  onOpenRules: () => void;
  onRestartRound: () => void;
}

export const GameTopHud: React.FC<GameTopHudProps> = ({
  roundNumber,
  roomRole,
  roomCode,
  memberCount,
  playerCount,
  isPassAndPlayMode,
  isMuted,
  announcerText,
  isViewerTurn,
  onOpenLobby,
  onChangePlayerCount,
  onTogglePassAndPlay,
  onToggleMute,
  onOpenRules,
  onRestartRound,
}) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex flex-wrap items-center justify-between gap-2">
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
            <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-display font-black text-[11px] shadow-inner">
              R#{roundNumber}
            </span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 justify-center px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={announcerText}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border-2 border-b-[4px] font-display font-extrabold text-xs shadow-md ${
                isViewerTurn
                  ? 'bg-amber-400 text-slate-950 border-amber-200 border-b-amber-600'
                  : 'bg-slate-900 text-white border-slate-700 border-b-slate-950'
              }`}
            >
              <Sparkles
                className={`w-3.5 h-3.5 shrink-0 ${
                  isViewerTurn ? 'text-slate-950' : 'text-amber-300'
                }`}
              />
              <span>{announcerText}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenLobby}
            className={`btn-tactile h-9 sm:h-10 px-3 sm:px-3.5 rounded-2xl font-display font-black text-xs inline-flex items-center gap-1.5 border-2 border-b-[4px] shadow-md ${
              roomRole !== 'offline'
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-200 border-b-emerald-800 text-slate-950'
                : 'bg-gradient-to-b from-sky-400 to-sky-600 border-sky-200 border-b-sky-800 text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>
              {roomRole !== 'offline'
                ? `Room ${roomCode} (${memberCount}P)`
                : 'Mabar'}
            </span>
          </button>

          {roomRole !== 'guest' && (
            <div className="inline-flex items-center bg-slate-900 border-2 border-slate-700 border-b-[4px] border-b-slate-950 rounded-2xl p-0.5 shadow-md">
              {[3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChangePlayerCount(count)}
                  className={`btn-tactile px-2 sm:px-2.5 py-1 rounded-xl text-[11px] font-display font-black flex items-center gap-0.5 ${
                    playerCount === count
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>{count}P</span>
                </button>
              ))}
            </div>
          )}

          {roomRole === 'offline' && (
            <button
              type="button"
              onClick={onTogglePassAndPlay}
              title="Ganti mode lawan Bot atau Pass & Play"
              className={`btn-tactile h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl font-display font-extrabold text-xs inline-flex items-center gap-1.5 border-2 border-b-[4px] shadow-md ${
                isPassAndPlayMode
                  ? 'bg-cyan-400 border-cyan-200 border-b-cyan-700 text-slate-950'
                  : 'bg-slate-900 border-slate-700 border-b-slate-950 text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">
                {isPassAndPlayMode ? 'Pass & Play' : 'Vs Bot'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Nyalakan suara' : 'Matikan suara'}
            className="btn-tactile w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900 border-2 border-slate-700 border-b-[4px] border-b-slate-950 text-white flex items-center justify-center shadow-md"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            aria-label="Panduan cara bermain"
            className="btn-tactile h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-100 border-b-[4px] border-b-amber-700 text-slate-950 font-display font-black text-xs inline-flex items-center gap-1 shadow-md"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panduan</span>
          </button>

          {roomRole !== 'guest' && (
            <button
              type="button"
              onClick={onRestartRound}
              aria-label="Bagi ulang kartu"
              className="btn-tactile w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 border-2 border-emerald-300 border-b-[4px] border-b-emerald-900 text-white flex items-center justify-center shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex md:hidden justify-center">
        <div
          className={`w-full text-center px-3 py-1.5 rounded-2xl border-2 border-b-[3px] font-display font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 ${
            isViewerTurn
              ? 'bg-amber-400 text-slate-950 border-amber-200 border-b-amber-600'
              : 'bg-slate-900 text-white border-slate-700 border-b-slate-950'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{announcerText}</span>
        </div>
      </div>
    </div>
  );
};
