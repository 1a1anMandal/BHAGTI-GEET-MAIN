import { pool } from '../config/db';
import { RoomState, Participant, QueueItem, Bhajan } from '@bhagi-geet/shared';

// In-memory store for active rooms
export const activeRooms = new Map<string, RoomState>();

export class RoomService {
  static generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  static async createRoom(creatorName: string): Promise<{ code: string; roomId: string }> {
    let code = this.generateCode();
    
    // Ensure unique code
    while (true) {
      const { rows } = await pool.query('SELECT id FROM rooms WHERE code = $1', [code]);
      if (rows.length === 0) break;
      code = this.generateCode();
    }

    // Insert into DB
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6); // 6 hours TTL

    const { rows } = await pool.query(
      `INSERT INTO rooms (code, status, expires_at) VALUES ($1, 'waiting', $2) RETURNING id`,
      [code, expiresAt.toISOString()]
    );
    const roomId = rows[0].id;

    // Initialize in-memory state
    activeRooms.set(code, {
      roomId,
      code,
      participants: [],
      leaderId: '', // Will be set when creator joins via socket
      coLeaderIds: [],
      currentBhajanId: null,
      activeParaIdx: 0,
      votes: [],
      expiresAt: expiresAt.getTime(),
    });

    return { code, roomId };
  }

  static async getRoom(code: string): Promise<RoomState | null> {
    const roomState = activeRooms.get(code);
    if (roomState) return roomState;

    // If not in memory, check DB
    const { rows } = await pool.query('SELECT * FROM rooms WHERE code = $1 AND expires_at > NOW()', [code]);
    if (rows.length === 0) return null;

    const dbRoom = rows[0];
    
    // Restore to memory (though it will have 0 participants until they reconnect)
    const newState: RoomState = {
      roomId: dbRoom.id,
      code: dbRoom.code,
      participants: [],
      leaderId: '',
      coLeaderIds: [],
      currentBhajanId: dbRoom.current_bhajan_id,
      activeParaIdx: dbRoom.active_para_idx || 0,
      votes: [], // We could fetch votes from DB if needed
      expiresAt: new Date(dbRoom.expires_at).getTime(),
    };
    
    activeRooms.set(code, newState);
    return newState;
  }
}
