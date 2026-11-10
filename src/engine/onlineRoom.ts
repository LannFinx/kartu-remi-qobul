import { DataConnection, Peer, PeerOptions } from 'peerjs';
import { GameState } from '../types/game';

export type RoomRole = 'offline' | 'host' | 'guest';

export interface RoomMember {
  clientId: string;
  name: string;
  seatIndex: number;
}

export type RemoteGameAction =
  | { kind: 'DRAW_DECK' }
  | { kind: 'DRAW_DISCARD' }
  | { kind: 'CHOOSE_SWAP_MODE' }
  | { kind: 'CANCEL_SWAP_MODE' }
  | { kind: 'SWAP_SLOT'; slotIndex: number }
  | { kind: 'DISCARD_DRAWN' }
  | { kind: 'CALL_QOBUL' }
  | { kind: 'REFLEX_SLAM'; playerId: string; slotIndex: number }
  | { kind: 'SKIP_REFLEX' }
  | { kind: 'PEEK_OWN'; slotIndex: number }
  | { kind: 'PEEK_OPPONENT'; targetPlayerId: string; slotIndex: number }
  | { kind: 'FINISH_PEEK' }
  | {
      kind: 'JACK_SWAP';
      target1: { playerId: string; slotIndex: number };
      target2: { playerId: string; slotIndex: number };
    }
  | {
      kind: 'QUEEN_SWAP';
      ownSlotIndex: number;
      opponentId: string;
      opponentSlotIndex: number;
    }
  | {
      kind: 'KING_SWAP';
      ownSlotIndex: number;
      opponentId: string;
      opponentSlotIndex: number;
      wasPeeked: boolean;
    }
  | { kind: 'SKIP_KING_SWAP' };

export interface EmotePayload {
  id: string;
  clientId: string;
  senderSeatIndex: number;
  senderName: string;
  emoji: string;
  label?: string;
}

export type RoomPacket =
  | {
      type: 'JOIN_REQUEST';
      clientId: string;
      name: string;
    }
  | {
      type: 'ROOM_SYNC';
      roomCode: string;
      members: RoomMember[];
      state: GameState;
    }
  | {
      type: 'CLIENT_ACTION';
      clientId: string;
      action: RemoteGameAction;
    }
  | {
      type: 'PING';
      clientId: string;
      timestamp: number;
    }
  | {
      type: 'PONG';
      clientId: string;
      timestamp: number;
    }
  | {
      type: 'EMOTE';
      emote: EmotePayload;
    };

const PEER_PREFIX = 'qobul-room-v2-';

const STUN_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

const PEER_BASE_CONFIG: PeerOptions = {
  config: {
    iceServers: STUN_ICE_SERVERS,
    iceCandidatePoolSize: 10,
  },
};

export function generateRoomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function getOrCreateClientId(): string {
  const key = 'qobul_client_id';
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const created = `client_${Math.random().toString(36).slice(2, 9)}`;
  window.sessionStorage.setItem(key, created);
  return created;
}

export function maskOpponentHiddenCards(
  state: GameState,
  viewerSeatIndex: number
): GameState {
  if (state.isRoundOver) return state;
  const viewerPlayer = state.players[viewerSeatIndex];
  if (!viewerPlayer) return state;

  const maskedPlayers = state.players.map((p) => {
    if (p.id === viewerPlayer.id) return p;
    const maskedHand = p.hand.map((slot) => {
      if (slot.isRevealedToAll) return slot;
      return {
        ...slot,
        card: {
          ...slot.card,
          rank: 'A' as const,
          suit: 'spades' as const,
          pointValue: 0,
          specialAbility: 'none' as const,
          abilityLabel: '',
        },
      };
    });
    return { ...p, hand: maskedHand };
  });

  return { ...state, players: maskedPlayers };
}

export class OnlineRoomTransport {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private channel: BroadcastChannel | null = null;
  private heartbeatInterval: number | null = null;
  private reconnectTimeout: number | null = null;
  private currentClientId: string = '';
  private currentRoomCode: string = '';
  private currentRole: RoomRole = 'offline';

  private onPacket: (packet: RoomPacket) => void;
  private onStatusChange: (status: string) => void;
  private onLatencyChange?: (latencyMs: number) => void;
  private onEmote?: (emote: EmotePayload) => void;

  constructor(
    onPacket: (packet: RoomPacket) => void,
    onStatusChange: (status: string) => void,
    onLatencyChange?: (latencyMs: number) => void,
    onEmote?: (emote: EmotePayload) => void
  ) {
    this.onPacket = onPacket;
    this.onStatusChange = onStatusChange;
    this.onLatencyChange = onLatencyChange;
    this.onEmote = onEmote;
  }

  private handleInternalPacket(packet: RoomPacket): void {
    if (packet.type === 'PING') {
      const reply: RoomPacket = {
        type: 'PONG',
        clientId: this.currentClientId,
        timestamp: packet.timestamp,
      };
      if (this.currentRole === 'host') {
        const guestConn = this.connections.get(packet.clientId);
        if (guestConn && guestConn.open) {
          guestConn.send(reply);
        } else {
          this.broadcastFromHost(reply);
        }
      } else {
        this.sendToHost(reply);
      }
      return;
    }

    if (packet.type === 'PONG') {
      const rtt = Math.max(12, Math.round(Date.now() - packet.timestamp));
      this.onLatencyChange?.(rtt);
      return;
    }

    if (packet.type === 'EMOTE') {
      this.onEmote?.(packet.emote);
      if (this.currentRole === 'host') {
        this.broadcastFromHost(packet);
      }
      return;
    }

    this.onPacket(packet);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      const pingPacket: RoomPacket = {
        type: 'PING',
        clientId: this.currentClientId,
        timestamp: Date.now(),
      };
      if (this.currentRole === 'guest') {
        this.sendToHost(pingPacket);
      } else if (this.currentRole === 'host') {
        this.broadcastFromHost(pingPacket);
      }
    }, 3000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  startHost(roomCode: string): void {
    this.destroy();
    this.currentRole = 'host';
    this.currentRoomCode = roomCode.trim().toUpperCase();
    this.currentClientId = getOrCreateClientId();

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`${PEER_PREFIX}${this.currentRoomCode}`);
      this.channel.onmessage = (ev) => {
        if (ev.data && typeof ev.data === 'object') {
          this.handleInternalPacket(ev.data as RoomPacket);
        }
      };
    }

    const peer = new Peer(`${PEER_PREFIX}${this.currentRoomCode}`, PEER_BASE_CONFIG);
    this.peer = peer;

    peer.on('open', () => {
      this.onStatusChange('Room Aktif (Online)');
      this.startHeartbeat();
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        this.connections.set(conn.peer, conn);
        this.onStatusChange(`Pemain Terhubung (${this.connections.size})`);
      });

      conn.on('data', (raw) => {
        if (raw && typeof raw === 'object') {
          this.handleInternalPacket(raw as RoomPacket);
        }
      });

      conn.on('close', () => {
        this.connections.delete(conn.peer);
        this.onStatusChange(`Room Aktif (${this.connections.size} Pemain)`);
      });

      conn.on('error', () => {
        this.connections.delete(conn.peer);
      });
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        this.onStatusChange('Kode Bentrok (Ganti Kode)');
      } else {
        this.onStatusChange('Menghubungkan Server...');
      }
    });
  }

  joinRoom(roomCode: string, clientId: string, playerName: string): void {
    this.destroy();
    this.currentRole = 'guest';
    this.currentRoomCode = roomCode.trim().toUpperCase();
    this.currentClientId = clientId;

    const joinPacket: RoomPacket = {
      type: 'JOIN_REQUEST',
      clientId,
      name: playerName.trim() || 'Teman',
    };

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`${PEER_PREFIX}${this.currentRoomCode}`);
      this.channel.onmessage = (ev) => {
        if (ev.data && typeof ev.data === 'object') {
          this.handleInternalPacket(ev.data as RoomPacket);
        }
      };
      this.channel.postMessage(joinPacket);
    }

    const peer = new Peer(PEER_BASE_CONFIG);
    this.peer = peer;

    peer.on('open', () => {
      this.onStatusChange('Menghubungkan ke Host...');
      this.connectToHostPeer(joinPacket);
    });

    peer.on('error', () => {
      this.onStatusChange('Mencoba Menghubungkan Ulang...');
    });
  }

  private connectToHostPeer(joinPacket: RoomPacket): void {
    if (!this.peer) return;

    const conn = this.peer.connect(`${PEER_PREFIX}${this.currentRoomCode}`, {
      reliable: true,
    });
    this.hostConnection = conn;

    conn.on('open', () => {
      this.onStatusChange('Terhubung ke Host');
      conn.send(joinPacket);
      this.startHeartbeat();
    });

    conn.on('data', (raw) => {
      if (raw && typeof raw === 'object') {
        this.handleInternalPacket(raw as RoomPacket);
      }
    });

    conn.on('close', () => {
      this.onStatusChange('Terputus. Menghubungkan Ulang...');
      this.reconnectTimeout = window.setTimeout(() => {
        if (this.peer && !this.peer.destroyed) {
          this.connectToHostPeer(joinPacket);
        }
      }, 2500);
    });

    conn.on('error', () => {
      this.onStatusChange('Mencari Host...');
    });
  }

  broadcastFromHost(packet: RoomPacket): void {
    this.channel?.postMessage(packet);
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(packet);
      }
    });
  }

  sendToHost(packet: RoomPacket): void {
    this.channel?.postMessage(packet);
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(packet);
    }
  }

  sendEmote(emote: EmotePayload): void {
    const packet: RoomPacket = {
      type: 'EMOTE',
      emote,
    };
    if (this.currentRole === 'host') {
      this.handleInternalPacket(packet);
    } else {
      this.sendToHost(packet);
    }
  }

  destroy(): void {
    this.stopHeartbeat();
    this.connections.forEach((c) => c.close());
    this.connections.clear();
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.currentRole = 'offline';
  }
}
