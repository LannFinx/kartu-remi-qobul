import { DataConnection, Peer } from 'peerjs';
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
    };

const PEER_PREFIX = 'qobul-room-v2-';

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

export class OnlineRoomTransport {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private channel: BroadcastChannel | null = null;
  private onPacket: (packet: RoomPacket) => void;
  private onStatusChange: (status: string) => void;

  constructor(
    onPacket: (packet: RoomPacket) => void,
    onStatusChange: (status: string) => void
  ) {
    this.onPacket = onPacket;
    this.onStatusChange = onStatusChange;
  }

  startHost(roomCode: string): void {
    this.destroy();
    const cleanCode = roomCode.trim().toUpperCase();

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`${PEER_PREFIX}${cleanCode}`);
      this.channel.onmessage = (ev) => {
        if (ev.data && typeof ev.data === 'object') {
          this.onPacket(ev.data as RoomPacket);
        }
      };
    }

    const peer = new Peer(`${PEER_PREFIX}${cleanCode}`);
    this.peer = peer;

    peer.on('open', () => {
      this.onStatusChange('Room Aktif');
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        this.connections.set(conn.peer, conn);
      });
      conn.on('data', (raw) => {
        if (raw && typeof raw === 'object') {
          this.onPacket(raw as RoomPacket);
        }
      });
      conn.on('close', () => {
        this.connections.delete(conn.peer);
      });
    });

    peer.on('error', () => {
      this.onStatusChange('Mode Lokal / Tab');
    });
  }

  joinRoom(roomCode: string, clientId: string, playerName: string): void {
    this.destroy();
    const cleanCode = roomCode.trim().toUpperCase();

    const joinPacket: RoomPacket = {
      type: 'JOIN_REQUEST',
      clientId,
      name: playerName.trim() || 'Teman',
    };

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(`${PEER_PREFIX}${cleanCode}`);
      this.channel.onmessage = (ev) => {
        if (ev.data && typeof ev.data === 'object') {
          this.onPacket(ev.data as RoomPacket);
        }
      };
      this.channel.postMessage(joinPacket);
    }

    const peer = new Peer();
    this.peer = peer;

    peer.on('open', () => {
      this.onStatusChange('Menghubungkan…');
      const conn = peer.connect(`${PEER_PREFIX}${cleanCode}`, {
        reliable: true,
      });
      this.hostConnection = conn;

      conn.on('open', () => {
        this.onStatusChange('Terhubung');
        conn.send(joinPacket);
      });

      conn.on('data', (raw) => {
        if (raw && typeof raw === 'object') {
          this.onPacket(raw as RoomPacket);
        }
      });
    });

    peer.on('error', () => {
      this.onStatusChange('Terhubung via Tab');
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

  destroy(): void {
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
  }
}

