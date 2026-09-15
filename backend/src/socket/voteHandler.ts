import { Server, Socket } from 'socket.io';
import { activeRooms } from '../services/roomService';
import { pool } from '../config/db';

async function broadcastVotes(io: Server, roomCode: string, roomId: string) {
  const { rows } = await pool.query(
    `SELECT v.bhajan_id as "bhajanId", b.title, COUNT(*) as count 
     FROM votes v
     JOIN bhajans b ON v.bhajan_id = b.id
     WHERE v.room_id = $1
     GROUP BY v.bhajan_id, b.title
     ORDER BY count DESC`,
    [roomId]
  );
  
  io.to(roomCode).emit('votes_updated', { votes: rows.map(r => ({ ...r, count: parseInt(r.count) })) });
}

export function registerVoteHandlers(io: Server, socket: Socket) {
  
  socket.on('cast_vote', async ({ roomCode, bhajanId, voterName }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    try {
      // Insert vote, ignore if already exists (handled by UNIQUE constraint or ON CONFLICT DO NOTHING)
      await pool.query(
        `INSERT INTO votes (room_id, bhajan_id, voter_name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [room.roomId, bhajanId, voterName]
      );
      
      // Update room state votes representation (optional, we can just rely on DB)
      await broadcastVotes(io, roomCode, room.roomId);
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  });

  socket.on('reject_vote', async ({ roomCode, bhajanId }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (room.leaderId !== socket.id && !room.coLeaderIds.includes(socket.id)) return;

    try {
      await pool.query(`DELETE FROM votes WHERE room_id = $1 AND bhajan_id = $2`, [room.roomId, bhajanId]);
      await broadcastVotes(io, roomCode, room.roomId);
    } catch (error) {
      console.error('Error rejecting vote:', error);
    }
  });

  // accept_vote will be handled in queueHandler since it moves the item to the queue and deletes the vote
}
