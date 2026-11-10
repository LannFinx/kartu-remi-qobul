import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Flame,
  Gamepad2,
  Globe,
  RefreshCw,
  Shield,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AbilityActionModal } from './components/AbilityActionModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { OvalTableArena } from './components/OvalTableArena';
import { PlayingCard } from './components/PlayingCard';
import { RulesQuickModal } from './components/RulesQuickModal';
import { ShowdownModal } from './components/ShowdownModal';
import { FocusedCardModal } from './components/table/FocusedCardModal';
import { createStandardDeck } from './engine/deck';
import { executeBotReflexCheck, executeSmartBotTurn } from './engine/botEngine';
import {
  completeReflexWindowAndAdvance,
  createInitialGameState,
} from './engine/gameEngine';
import { applyRemoteActionToState } from './engine/onlineActionReducer';
import {
  generateRoomCode,
  getOrCreateClientId,
  OnlineRoomTransport,
  RemoteGameAction,
  RoomMember,
  RoomPacket,
  RoomRole,
} from './engine/onlineRoom';
import {
  playCardSlideSound,
  playCardSnapSound,
  playPeekSound,
  playPenaltyBuzzerSound,
  playQobulBuzzerSound,
  playSlamSuccessSound,
  playVictoryChime,
  setSoundMuted,
} from './engine/soundEffects';

const REFLEX_WINDOW_MS = 2800;

interface AppProps {
  autoOpenLobby?: boolean;
}

export const App: React.FC<AppProps> = ({ autoOpenLobby = false }) => {
  const clientId = useMemo(() => getOrCreateClientId(), []);
  const [playerName, setPlayerName] = useState<string>('Pemain 1');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [blunderPenalty] = useState<10 | 20>(10);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(autoOpenLobby);
  const [isMuted, setIsMutedState] = useState<boolean>(false);
  const [isPassAndPlayMode, setIsPassAndPlayMode] = useState<boolean>(false);
  const [isPrivacyCurtainActive, setIsPrivacyCurtainActive] =
    useState<boolean>(false);
  const [misfireSlotKey, setMisfireSlotKey] = useState<string | null>(null);

  const [roomRole, setRoomRole] = useState<RoomRole>('offline');
  const [roomCode, setRoomCode] = useState<string>('');
  const [roomStatus, setRoomStatus] = useState<string>('Offline');
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([]);

  const [gameState, setGameState] = useState(() =>
    createInitialGameState({
      playerCount: 4,
      qobulBlunderPenalty: 10,
      botCount: 3,
    })
  );

  const transportRef = useRef<OnlineRoomTransport | null>(null);
  const roleRef = useRef<RoomRole>(roomRole);
  roleRef.current = roomRole;
  const roomCodeRef = useRef<string>(roomCode);
  roomCodeRef.current = roomCode;
  const membersRef = useRef<RoomMember[]>(roomMembers);
  membersRef.current = roomMembers;

  const fullReferenceDeck = useMemo(() => createStandardDeck(), []);
  const sampleRuleCards = useMemo(() => {
    const targetIds = [
      'K_hearts',
      'A_spades',
      '7_diamonds',
      '10_clubs',
      'J_spades',
      'Q_hearts',
      'K_spades',
    ];
    return targetIds
      .map((id) => fullReferenceDeck.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [fullReferenceDeck]);

  const viewerPlayerIndex = useMemo(() => {
    if (roomRole === 'offline') return 0;
    const found = roomMembers.find((m) => m.clientId === clientId);
    return found ? found.seatIndex : 0;
  }, [roomRole, roomMembers, clientId]);

  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const topDiscard =
    gameState.discardPile[gameState.discardPile.length - 1] ?? null;

  useEffect(() => {
    const transport = new OnlineRoomTransport(
      (packet: RoomPacket) => {
        if (packet.type === 'JOIN_REQUEST' && roleRef.current === 'host') {
          setRoomMembers((prevMembers) => {
            const existing = prevMembers.find(
              (m) => m.clientId === packet.clientId
            );
            const assignedSeat = existing
              ? existing.seatIndex
              : Math.min(prevMembers.length, 4);
            const nextMembers = existing
              ? prevMembers.map((m) =>
                  m.clientId === packet.clientId
                    ? { ...m, name: packet.name }
                    : m
                )
              : [
                  ...prevMembers,
                  {
                    clientId: packet.clientId,
                    name: packet.name,
                    seatIndex: assignedSeat,
                  },
                ];

            setGameState((prevState) => {
              const updatedPlayers = prevState.players.map((p, idx) => {
                const mem = nextMembers.find((m) => m.seatIndex === idx);
                return mem
                  ? { ...p, name: mem.name, isBot: false }
                  : p;
              });
              const nextState = { ...prevState, players: updatedPlayers };
              transport.broadcastFromHost({
                type: 'ROOM_SYNC',
                roomCode: roomCodeRef.current,
                members: nextMembers,
                state: nextState,
              });
              return nextState;
            });

            return nextMembers;
          });
        } else if (
          packet.type === 'ROOM_SYNC' &&
          roleRef.current === 'guest'
        ) {
          setRoomMembers(packet.members);
          setGameState(packet.state);
        } else if (
          packet.type === 'CLIENT_ACTION' &&
          roleRef.current === 'host'
        ) {
          setGameState((prevState) => {
            const nextState = applyRemoteActionToState(
              prevState,
              packet.action
            );
            transport.broadcastFromHost({
              type: 'ROOM_SYNC',
              roomCode: roomCodeRef.current,
              members: membersRef.current,
              state: nextState,
            });
            return nextState;
          });
        }
      },
      (status) => setRoomStatus(status)
    );

    transportRef.current = transport;

    const urlRoom = new URLSearchParams(window.location.search).get('room');
    if (urlRoom) {
      const clean = urlRoom
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 8);
      if (clean.length >= 2) {
        setRoomRole('guest');
        setRoomCode(clean);
        setIsLobbyOpen(true);
        transport.joinRoom(clean, clientId, 'Teman');
      }
    }

    return () => transport.destroy();
  }, [clientId]);

  useEffect(() => {
    if (roomRole === 'host' && transportRef.current) {
      transportRef.current.broadcastFromHost({
        type: 'ROOM_SYNC',
        roomCode,
        members: roomMembers,
        state: gameState,
      });
    }
  }, [gameState, roomMembers, roomRole, roomCode]);

  useEffect(() => {
    if (gameState.isRoundOver) {
      playVictoryChime();
    }
  }, [gameState.isRoundOver]);

  useEffect(() => {
    if (!misfireSlotKey) return;
    const timer = window.setTimeout(() => setMisfireSlotKey(null), 950);
    return () => window.clearTimeout(timer);
  }, [misfireSlotKey]);

  useEffect(() => {
    if (
      roomRole === 'guest' ||
      gameState.turnSubPhase !== 'reflex_matching_window' ||
      gameState.isRoundOver
    ) {
      return;
    }

    const botTimer = window.setTimeout(() => {
      setGameState((prev) => {
        const next = executeBotReflexCheck(prev);
        if (next !== prev && next.lastReflexVerdict?.succeeded) {
          playSlamSuccessSound();
        }
        return next;
      });
    }, 1250);

    const endTimer = window.setTimeout(() => {
      setGameState((prev) => {
        const next = completeReflexWindowAndAdvance(prev);
        if (
          isPassAndPlayMode &&
          roomRole === 'offline' &&
          !next.isRoundOver &&
          next.currentPlayerIndex !== prev.currentPlayerIndex
        ) {
          setIsPrivacyCurtainActive(true);
        }
        return next;
      });
    }, REFLEX_WINDOW_MS);

    return () => {
      window.clearTimeout(botTimer);
      window.clearTimeout(endTimer);
    };
  }, [
    roomRole,
    gameState.turnSubPhase,
    gameState.discardPile.length,
    gameState.isRoundOver,
    isPassAndPlayMode,
  ]);

  useEffect(() => {
    if (
      roomRole === 'guest' ||
      !activePlayer ||
      !activePlayer.isBot ||
      gameState.isRoundOver ||
      gameState.turnSubPhase === 'reflex_matching_window'
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setGameState((prev) => {
        const next = executeSmartBotTurn(prev);
        if (next.turnSubPhase !== prev.turnSubPhase) {
          playCardSlideSound();
        }
        return next;
      });
    }, 950);

    return () => window.clearTimeout(timer);
  }, [roomRole, activePlayer, gameState.turnSubPhase, gameState.isRoundOver]);

  const dispatchAction = (action: RemoteGameAction) => {
    if (roomRole === 'guest') {
      transportRef.current?.sendToHost({
        type: 'CLIENT_ACTION',
        clientId,
        action,
      });
      return;
    }
    setGameState((prev) => applyRemoteActionToState(prev, action));
  };

  const handleCreateHostRoom = () => {
    const code = generateRoomCode();
    const initialMember: RoomMember = {
      clientId,
      name: playerName.trim() || 'Host',
      seatIndex: 0,
    };
    setRoomRole('host');
    setRoomCode(code);
    setRoomMembers([initialMember]);
    setIsPassAndPlayMode(false);
    transportRef.current?.startHost(code);

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p, idx) =>
        idx === 0 ? { ...p, name: initialMember.name, isBot: false } : p
      ),
    }));
  };

  const handleJoinRoom = (code: string) => {
    const clean = code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8);
    if (!clean) return;
    setRoomRole('guest');
    setRoomCode(clean);
    setIsPassAndPlayMode(false);
    transportRef.current?.joinRoom(
      clean,
      clientId,
      playerName.trim() || 'Teman'
    );
  };

  const handleLeaveRoom = () => {
    transportRef.current?.destroy();
    setRoomRole('offline');
    setRoomCode('');
    setRoomMembers([]);
    setRoomStatus('Offline');
  };

  const handleDealNewSimulation = (
    nextPlayers = playerCount,
    passAndPlay = isPassAndPlayMode
  ) => {
    if (roomRole === 'guest') return;
    setPlayerCount(nextPlayers);
    setIsPrivacyCurtainActive(false);
    setMisfireSlotKey(null);
    playCardSlideSound();

    const fresh = createInitialGameState({
      playerCount: nextPlayers,
      qobulBlunderPenalty: blunderPenalty,
      botCount: passAndPlay ? 0 : nextPlayers - 1,
    });

    if (roomRole === 'host') {
      const syncedPlayers = fresh.players.map((p, idx) => {
        const mem = roomMembers.find((m) => m.seatIndex === idx);
        return mem ? { ...p, name: mem.name, isBot: false } : p;
      });
      setGameState({ ...fresh, players: syncedPlayers });
    } else {
      setGameState(fresh);
    }
  };

  const handleSelectCardSlot = (playerId: string, slotIndex: number) => {
    const viewerPlayer = gameState.players[viewerPlayerIndex];
    if (
      gameState.turnSubPhase === 'selecting_hand_slot_for_discard_swap' &&
      gameState.drawnCardBuffer &&
      playerId === activePlayer?.id &&
      gameState.currentPlayerIndex === viewerPlayerIndex
    ) {
      playCardSnapSound();
      dispatchAction({ kind: 'SWAP_SLOT', slotIndex });
      return;
    }

    if (
      gameState.turnSubPhase === 'reflex_matching_window' &&
      viewerPlayer &&
      playerId === viewerPlayer.id
    ) {
      const targetSlot = viewerPlayer.hand.find(
        (s) => s.slotIndex === slotIndex
      );
      if (!targetSlot || !topDiscard) return;

      if (targetSlot.card.rank === topDiscard.rank) {
        playSlamSuccessSound();
      } else {
        playPenaltyBuzzerSound();
        setMisfireSlotKey(`${playerId}_${slotIndex}`);
      }

      dispatchAction({ kind: 'REFLEX_SLAM', playerId, slotIndex });
    }
  };

  const isViewerActiveHuman =
    !gameState.isRoundOver &&
    gameState.currentPlayerIndex === viewerPlayerIndex &&
    !activePlayer?.isBot;

  const isViewerHoldingDeckCard =
    isViewerActiveHuman &&
    gameState.turnSubPhase === 'holding_deck_card' &&
    Boolean(gameState.drawnCardBuffer);

  const isViewerSelectingSlotSwap =
    isViewerActiveHuman &&
    gameState.turnSubPhase === 'selecting_hand_slot_for_discard_swap' &&
    Boolean(gameState.drawnCardBuffer);

  return (
    <div className="min-h-[100dvh] canvas-vignette text-slate-900 px-2.5 py-2.5 sm:px-6 sm:py-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-2.5 sm:space-y-3.5">
        <header className="flex flex-wrap items-center justify-between gap-2.5 bg-white/95 border border-slate-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.08)] rounded-2xl sm:rounded-full px-3.5 py-2.5 sm:px-5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-display font-black text-xs flex items-center justify-center shadow-sm">
              Q
            </span>
            <span className="font-display font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
              QOBUL
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
              Ronde #{gameState.roundNumber}
            </span>
            {roomRole !== 'offline' && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs">
                Room {roomCode} ({roomMembers.length}P)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsLobbyOpen(true)}
              className={`btn-tactile px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm ${
                roomRole !== 'offline'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-sky-500 hover:bg-sky-400 text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>
                {roomRole !== 'offline' ? `Room ${roomCode}` : 'Mabar Online'}
              </span>
            </button>

            {roomRole !== 'guest' && (
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-full p-0.5">
                {[3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleDealNewSimulation(count)}
                    className={`btn-tactile px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      playerCount === count
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
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
                onClick={() => {
                  const nextMode = !isPassAndPlayMode;
                  setIsPassAndPlayMode(nextMode);
                  handleDealNewSimulation(playerCount, nextMode);
                }}
                className={`btn-tactile px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  isPassAndPlayMode
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-600" />
                <span>{isPassAndPlayMode ? 'Pass & Play' : 'Vs Bots'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (!isViewerActiveHuman) return;
                playQobulBuzzerSound();
                dispatchAction({ kind: 'CALL_QOBUL' });
              }}
              disabled={
                !isViewerActiveHuman ||
                gameState.turnSubPhase !== 'awaiting_draw_or_qobul' ||
                gameState.qobulCallerId !== null ||
                gameState.isRoundOver
              }
              className="btn-tactile px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm disabled:opacity-40"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>QOBUL!</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMutedState((prev) => {
                  const next = !prev;
                  setSoundMuted(next);
                  return next;
                });
              }}
              aria-label={isMuted ? 'Nyalakan suara' : 'Matikan suara'}
              className="btn-tactile p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsRulesOpen(true)}
              className="btn-tactile px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aturan</span>
            </button>

            {roomRole !== 'guest' && (
              <button
                type="button"
                onClick={() => handleDealNewSimulation(playerCount)}
                className="btn-tactile px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ulang</span>
              </button>
            )}
          </div>
        </header>

        {isViewerSelectingSlotSwap && gameState.drawnCardBuffer && (
          <div className="flex items-center justify-center gap-3 bg-white/95 border border-slate-200 shadow-md rounded-full px-4 py-2 w-fit mx-auto">
            <PlayingCard
              layoutId={gameState.drawnCardBuffer.id}
              card={gameState.drawnCardBuffer}
              isFaceUp
              size="sm"
            />
            <span className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-display font-extrabold text-xs shadow-sm">
              Ketuk Kartumu untuk Tukar
            </span>
            {gameState.drawnFromSource === 'deck' && (
              <button
                type="button"
                onClick={() => dispatchAction({ kind: 'CANCEL_SWAP_MODE' })}
                className="btn-tactile px-3 py-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800"
              >
                Batal
              </button>
            )}
          </div>
        )}

        <OvalTableArena
          gameState={gameState}
          viewerPlayerIndex={viewerPlayerIndex}
          revealAllCards={false}
          peekedSlotKey={null}
          misfireSlotKey={misfireSlotKey}
          reflexDurationMs={REFLEX_WINDOW_MS}
          onSelectCardSlot={handleSelectCardSlot}
          onSkipReflexWindow={() => dispatchAction({ kind: 'SKIP_REFLEX' })}
          onDrawFromDeck={() => {
            if (!isViewerActiveHuman) return;
            playCardSlideSound();
            dispatchAction({ kind: 'DRAW_DECK' });
          }}
          onDrawFromDiscard={() => {
            if (!isViewerActiveHuman) return;
            playCardSnapSound();
            dispatchAction({ kind: 'DRAW_DISCARD' });
          }}
        />
      </div>

      <FocusedCardModal
        card={gameState.drawnCardBuffer}
        isOpen={isViewerHoldingDeckCard}
        flipOnMount
        onKeepAndSwap={() => {
          playCardSlideSound();
          dispatchAction({ kind: 'CHOOSE_SWAP_MODE' });
        }}
        onDiscardOrUseAbility={() => {
          playCardSnapSound();
          dispatchAction({ kind: 'DISCARD_DRAWN' });
        }}
      />

      <OnlineLobbyModal
        isOpen={isLobbyOpen}
        role={roomRole}
        roomCode={roomCode}
        statusText={roomStatus}
        playerName={playerName}
        members={roomMembers}
        totalSeats={playerCount}
        onChangePlayerName={setPlayerName}
        onCreateHostRoom={handleCreateHostRoom}
        onJoinRoom={handleJoinRoom}
        onStartOnlineMatch={() => handleDealNewSimulation(playerCount, false)}
        onLeaveRoom={handleLeaveRoom}
        onClose={() => setIsLobbyOpen(false)}
      />

      {isPrivacyCurtainActive && roomRole === 'offline' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-lg p-4">
          <div className="max-w-sm w-full rounded-3xl bg-slate-900 border-2 border-amber-400/50 p-7 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7" />
            </div>

            <h2 className="font-display font-extrabold text-xl text-white">
              Giliran {activePlayer?.name}
            </h2>

            <button
              type="button"
              onClick={() => {
                playCardSlideSound();
                setIsPrivacyCurtainActive(false);
              }}
              className="btn-tactile w-full py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-sm shadow-lg"
            >
              Mulai Giliran
            </button>
          </div>
        </div>
      )}

      <RulesQuickModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        sampleCards={sampleRuleCards}
        blunderPenalty={blunderPenalty}
      />

      <AbilityActionModal
        isOpen={
          isViewerActiveHuman &&
          gameState.turnSubPhase === 'executing_special_ability'
        }
        activeAbility={gameState.activeAbility}
        activePlayer={activePlayer}
        allPlayers={gameState.players}
        onTriggerPeekOwn={(slotIndex) => {
          playPeekSound();
          dispatchAction({ kind: 'PEEK_OWN', slotIndex });
        }}
        onTriggerPeekOpponent={(targetPlayerId, slotIndex) => {
          playPeekSound();
          dispatchAction({ kind: 'PEEK_OPPONENT', targetPlayerId, slotIndex });
        }}
        onFinishPeek={() => {
          playCardSlideSound();
          dispatchAction({ kind: 'FINISH_PEEK' });
        }}
        onExecuteJackSwap={(target1, target2) => {
          playCardSnapSound();
          dispatchAction({ kind: 'JACK_SWAP', target1, target2 });
        }}
        onExecuteQueenSwap={(ownSlotIndex, opponentId, opponentSlotIndex) => {
          playCardSnapSound();
          dispatchAction({
            kind: 'QUEEN_SWAP',
            ownSlotIndex,
            opponentId,
            opponentSlotIndex,
          });
        }}
        onExecuteKingSwap={(
          ownSlotIndex,
          opponentId,
          opponentSlotIndex,
          wasPeeked
        ) => {
          playCardSnapSound();
          dispatchAction({
            kind: 'KING_SWAP',
            ownSlotIndex,
            opponentId,
            opponentSlotIndex,
            wasPeeked,
          });
        }}
        onSkipKingSwap={() => dispatchAction({ kind: 'SKIP_KING_SWAP' })}
      />

      <ShowdownModal
        isOpen={gameState.isRoundOver}
        gameState={gameState}
        onStartNextRound={() => {
          if (roomRole === 'guest') return;
          setMisfireSlotKey(null);
          playCardSlideSound();
          setGameState((prev) =>
            createInitialGameState(
              prev.config,
              prev.players,
              prev.roundNumber + 1
            )
          );
        }}
        onResetGame={() => handleDealNewSimulation(playerCount)}
      />
    </div>
  );
};

export default App;
