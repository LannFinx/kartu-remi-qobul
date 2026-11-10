import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  ChevronDown,
  Gamepad2,
  Globe,
  GraduationCap,
  Home,
  RefreshCw,
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
  onBackToMenu?: () => void;
  onOpenTutorial?: () => void;
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
  onBackToMenu,
  onOpenTutorial,
  onOpenLobby,
  onChangePlayerCount,
  onTogglePassAndPlay,
  onToggleMute,
  onOpenRules,
  onRestartRound,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  return (
    <header className="w-full flex items-center justify-between gap-3 px-1 sm:px-2 select-none">
      <div className="flex items-center gap-2">
        {onBackToMenu && (
          <button
            type="button"
            onClick={onBackToMenu}
            aria-label="Kembali ke Main Menu"
            className="btn-tactile h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white border border-slate-200/90 shadow-sm text-slate-700 flex items-center justify-center hover:bg-slate-50 hover:text-slate-950"
          >
            <Home className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 bg-white border border-slate-200/90 shadow-sm rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2">
          <span className="font-display font-black text-sm sm:text-base tracking-tight text-slate-900">
            Ahnap<span className="text-amber-500">Qobul</span>
          </span>
          <span className="text-[11px] font-extrabold text-slate-400">
            R#{roundNumber}
          </span>
          {roomRole !== 'offline' && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
              {roomCode} ({memberCount}P)
            </span>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 max-w-md mx-2 justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={announcerText}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold truncate text-center ${
              isViewerTurn
                ? 'bg-amber-100/90 text-amber-950 font-bold border border-amber-300'
                : 'text-slate-600 bg-white/80 border border-slate-200/80 shadow-xs'
            }`}
          >
            {announcerText}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenLobby}
          className={`btn-tactile h-9 sm:h-10 px-3 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm ${
            roomRole !== 'offline'
              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
              : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{roomRole !== 'offline' ? 'Lobi' : 'Mabar'}</span>
        </button>

        {onOpenTutorial && (
          <button
            type="button"
            onClick={onOpenTutorial}
            aria-label="Tutorial Alya"
            className="btn-tactile h-9 sm:h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm hover:bg-slate-50"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Tutorial</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenRules}
          aria-label="Aturan Main"
          className="btn-tactile h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1 shadow-sm hover:bg-slate-50"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">Aturan</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Nyalakan suara' : 'Matikan suara'}
          className="btn-tactile h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm hover:bg-slate-50"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-600" />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSettingsMenu((prev) => !prev)}
            aria-label="Opsi Meja"
            className="btn-tactile h-9 sm:h-10 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1 shadow-sm hover:bg-slate-50"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{playerCount}P</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showSettingsMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowSettingsMenu(false)}
              />
              <div className="absolute right-0 top-11 z-40 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 flex flex-col gap-1 text-slate-800 text-xs font-medium">
                {roomRole !== 'guest' && (
                  <div className="p-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Jumlah Kursi
                    </span>
                    <div className="grid grid-cols-3 gap-1">
                      {[3, 4, 5].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => {
                            onChangePlayerCount(count);
                            setShowSettingsMenu(false);
                          }}
                          className={`py-1 rounded-lg text-xs font-bold ${
                            playerCount === count
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {count}P
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {roomRole === 'offline' && (
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePassAndPlay();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Pass & Play</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {isPassAndPlayMode ? 'ON' : 'OFF'}
                    </span>
                  </button>
                )}

                {roomRole !== 'guest' && (
                  <button
                    type="button"
                    onClick={() => {
                      onRestartRound();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Bagi Ulang Kartu</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
