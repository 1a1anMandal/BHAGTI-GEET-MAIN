import { Server, Socket } from 'socket.io';
import { activeRooms } from '../services/roomService';
import { pool } from '../config/db';

async function broadcastQueue(io: Server, roomCode: string, roomId: string) {
  const { rows } = await pool.query(
    `SELECT q.*, row_to_json(b.*) as bhajan 
     FROM queue q 
     JOIN bhajans b ON q.bhajan_id = b.id 
     WHERE q.room_id = $1 
     ORDER BY q.position ASC`, 
     [roomId]
  );
  
  io.to(roomCode).emit('queue_updated', { queue: rows });
}

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

export function registerQueueHandlers(io: Server, socket: Socket) {
  
  socket.on('accept_vote', async ({ roomCode, bhajanId }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (room.leaderId !== socket.id && !room.coLeaderIds.includes(socket.id)) return;

    try {
      // Check queue size
      const { rows: countRows } = await pool.query('SELECT count(*) FROM queue WHERE room_id = $1', [room.roomId]);
      if (parseInt(countRows[0].count) >= 20) {
        socket.emit('error_msg', { message: 'Queue is full (max 20 items)' });
        return;
      }

      // Check if already in queue
      const { rows: existing } = await pool.query('SELECT id FROM queue WHERE room_id = $1 AND bhajan_id = $2', [room.roomId, bhajanId]);
      if (existing.length > 0) {
        socket.emit('error_msg', { message: 'Bhajan already in queue' });
        // Clean up vote anyway
        await pool.query('DELETE FROM votes WHERE room_id = $1 AND bhajan_id = $2', [room.roomId, bhajanId]);
        await broadcastVotes(io, roomCode, room.roomId);
        return;
      }

      // Get max position
      const { rows: posRows } = await pool.query('SELECT max(position) as max_pos FROM queue WHERE room_id = $1', [room.roomId]);
      const nextPos = (posRows[0].max_pos || 0) + 1;

      // Determine status (if nothing playing, this could be playing immediately, but let's default to upcoming and let load_bhajan handle playing)
      await pool.query(
        'INSERT INTO queue (room_id, bhajan_id, position, status) VALUES ($1, $2, $3, $4)',
        [room.roomId, bhajanId, nextPos, 'upcoming']
      );

      // Delete from votes
      await pool.query('DELETE FROM votes WHERE room_id = $1 AND bhajan_id = $2', [room.roomId, bhajanId]);

      await broadcastQueue(io, roomCode, room.roomId);
      await broadcastVotes(io, roomCode, room.roomId);
    } catch (error) {
      console.error('Error accepting vote:', error);
    }
  });

  socket.on('add_to_queue', async ({ roomCode, bhajanId }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (room.leaderId !== socket.id && !room.coLeaderIds.includes(socket.id)) return;

    try {
      const { rows: countRows } = await pool.query('SELECT count(*) FROM queue WHERE room_id = $1', [room.roomId]);
      if (parseInt(countRows[0].count) >= 20) {
        socket.emit('error_msg', { message: 'Queue is full (max 20 items)' });
        return;
      }

      const { rows: existing } = await pool.query('SELECT id FROM queue WHERE room_id = $1 AND bhajan_id = $2', [room.roomId, bhajanId]);
      if (existing.length > 0) {
        socket.emit('error_msg', { message: 'Bhajan already in queue' });
        return;
      }

      const { rows: posRows } = await pool.query('SELECT max(position) as max_pos FROM queue WHERE room_id = $1', [room.roomId]);
      const nextPos = (posRows[0].max_pos || 0) + 1;

      await pool.query(
        'INSERT INTO queue (room_id, bhajan_id, position, status) VALUES ($1, $2, $3, $4)',
        [room.roomId, bhajanId, nextPos, 'upcoming']
      );

      await broadcastQueue(io, roomCode, room.roomId);
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  });

  socket.on('finish_bhajan', async ({ roomCode }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (room.leaderId !== socket.id && !room.coLeaderIds.includes(socket.id)) return;

    if (!room.currentBhajanId) return;

    try {
      // Mark current in queue as completed
      await pool.query(
        `UPDATE queue SET status = 'completed' WHERE room_id = $1 AND bhajan_id = $2`,
        [room.roomId, room.currentBhajanId]
      );

      // Find next upcoming
      const { rows: nextRows } = await pool.query(
        `SELECT q.*, row_to_json(b.*) as bhajan 
         FROM queue q 
         JOIN bhajans b ON q.bhajan_id = b.id
         WHERE q.room_id = $1 AND q.status = 'upcoming' 
         ORDER BY q.position ASC LIMIT 1`,
        [room.roomId]
      );

      if (nextRows.length > 0) {
        const nextItem = nextRows[0];
        // Mark as playing
        await pool.query(`UPDATE queue SET status = 'playing' WHERE id = $1`, [nextItem.id]);
        
        // Load it
        room.currentBhajanId = nextItem.bhajan_id;
        room.activeParaIdx = 0;
        await pool.query('UPDATE rooms SET current_bhajan_id = $1, active_para_idx = 0 WHERE id = $2', [nextItem.bhajan_id, room.roomId]);

        io.to(roomCode).emit('bhajan_changed', { bhajan: nextItem.bhajan, activeParaIdx: 0 });
      } else {
        // Queue is empty
        room.currentBhajanId = null;
        room.activeParaIdx = 0;
        await pool.query('UPDATE rooms SET current_bhajan_id = NULL, active_para_idx = 0 WHERE id = $1', [room.roomId]);
        
        // Notify empty
        io.to(roomCode).emit('error_msg', { message: 'Queue empty. Add more bhajans.' });
      }

      await broadcastQueue(io, roomCode, room.roomId);
    } catch (error) {
      console.error('Error finishing bhajan:', error);
    }
  });

}
