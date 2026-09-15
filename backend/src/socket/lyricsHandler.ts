import { Server, Socket } from 'socket.io';
import { activeRooms } from '../services/roomService';
import { pool } from '../config/db';

export function registerLyricsHandlers(io: Server, socket: Socket) {
  
  socket.on('next_para', async ({ roomCode }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    // Check if leader or co-leader
    if (room.leaderId !== socket.id && !room.coLeaderIds.includes(socket.id)) return;
    if (!room.currentBhajanId) return;

    // We need to know how many paragraphs the bhajan has
    const { rows } = await pool.query('SELECT lyrics FROM bhajans WHERE id = $1', [room.currentBhajanId]);
    if (rows.length === 0) return;
    
    const lyrics = rows[0].lyrics;
    
    if (room.activeParaIdx < lyrics.length - 1) {
      room.activeParaIdx++;
      
      // Update DB asynchronously (fire and forget)
      pool.query('UPDATE rooms SET active_para_idx = $1 WHERE id = $2', [room.activeParaIdx, room.roomId]).catch(console.error);
      
      io.to(roomCode).emit('para_changed', { activeParaIdx: room.activeParaIdx });
    } else {
      // Last paragraph reached, we can optionally auto-complete here
      // But we have a specific finish_bhajan event or auto-transition
      // For now, let's keep it simple and just not advance
    }
  });

  socket.on('prev_para', ({ roomCode }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (room.leaderId !== socket.id && !room.coLeaderIds.includes(socket.id)) return;

    if (room.activeParaIdx > 0) {
      room.activeParaIdx--;
      
      pool.query('UPDATE rooms SET active_para_idx = $1 WHERE id = $2', [room.activeParaIdx, room.roomId]).catch(console.error);
      
      io.to(roomCode).emit('para_changed', { activeParaIdx: room.activeParaIdx });
    }
  });

  socket.on('load_bhajan', async ({ roomCode, bhajanId }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (room.leaderId !== socket.id && !room.coLeaderIds.includes(socket.id)) return;

    const { rows } = await pool.query('SELECT * FROM bhajans WHERE id = $1', [bhajanId]);
    if (rows.length === 0) return;

    const bhajan = rows[0];

    room.currentBhajanId = bhajanId;
    room.activeParaIdx = 0;

    await pool.query('UPDATE rooms SET current_bhajan_id = $1, active_para_idx = 0 WHERE id = $2', [bhajanId, room.roomId]);

    io.to(roomCode).emit('bhajan_changed', { bhajan, activeParaIdx: 0 });
  });

}
