import { Server, Socket } from 'socket.io';
import { activeRooms } from '../services/roomService';
import { pool } from '../config/db';
import { Participant, QueueItem, Bhajan } from '@bhagi-geet/shared';

// Helper to handle a user leaving a room
async function handleLeaveRoom(io: Server, socket: Socket, roomCode: string) {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  const participantIdx = room.participants.findIndex(p => p.socketId === socket.id);
  if (participantIdx === -1) return;

  const participant = room.participants[participantIdx];
  room.participants.splice(participantIdx, 1);
  socket.leave(roomCode);

  // If it's a leader leaving
  if (participant.role === 'leader') {
    if (room.coLeaderIds.length > 0) {
      // Promote oldest co-leader to leader
      // 1. Find all co-leaders
      const coLeaders = room.participants.filter(p => p.role === 'co-leader');
      if (coLeaders.length > 0) {
        // Sort by joinedAt ascending
        coLeaders.sort((a, b) => a.joinedAt - b.joinedAt);
        const newLeader = coLeaders[0];
        
        newLeader.role = 'leader';
        room.leaderId = newLeader.socketId;
        room.coLeaderIds = room.coLeaderIds.filter(id => id !== newLeader.socketId);
        
        // Notify them
        io.to(newLeader.socketId).emit('promoted', { newRole: 'leader' });
        io.to(roomCode).emit('members_updated', { members: room.participants });
      }
    } else {
      // No co-leaders left, disband room
      io.to(roomCode).emit('room_disbanded', { reason: 'All leaders left the room' });
      activeRooms.delete(roomCode);
      await pool.query('UPDATE rooms SET status = $1 WHERE code = $2', ['ended', roomCode]);
      return;
    }
  } else if (participant.role === 'co-leader') {
    room.coLeaderIds = room.coLeaderIds.filter(id => id !== socket.id);
  }

  // Broadcast update
  io.to(roomCode).emit('participant_event', { 
    type: 'left', 
    name: participant.name, 
    totalCount: room.participants.length 
  });
  
  // Update leaders' view of members
  io.to(roomCode).emit('members_updated', { members: room.participants });
}

export function registerRoomHandlers(io: Server, socket: Socket) {
  
  socket.on('join_room', async ({ roomCode, name }) => {
    const room = activeRooms.get(roomCode);
    if (!room) {
      socket.emit('error_msg', { message: 'Room not found or expired' });
      return;
    }

    if (room.participants.length >= 50) {
      socket.emit('error_msg', { message: 'Room is full' });
      return;
    }

    // Determine role (first person is leader)
    let role: 'leader' | 'co-leader' | 'member' = 'member';
    if (!room.leaderId && room.participants.length === 0) {
      role = 'leader';
      room.leaderId = socket.id;
    }

    const participant: Participant = {
      socketId: socket.id,
      name,
      role,
      joinedAt: Date.now()
    };

    room.participants.push(participant);
    socket.join(roomCode);
    
    // Attach room code to socket for disconnect handler
    (socket as any).roomCode = roomCode;

    // Fetch queue and current bhajan
    const { rows: queueRows } = await pool.query(
      `SELECT q.*, row_to_json(b.*) as bhajan 
       FROM queue q 
       JOIN bhajans b ON q.bhajan_id = b.id 
       WHERE q.room_id = $1 
       ORDER BY q.position ASC`, 
       [room.roomId]
    );

    let currentBhajan: Bhajan | null = null;
    if (room.currentBhajanId) {
      const { rows: bRows } = await pool.query('SELECT * FROM bhajans WHERE id = $1', [room.currentBhajanId]);
      currentBhajan = bRows[0] || null;
    }

    // Send full state to the joining user
    socket.emit('room_state', {
      ...room,
      queue: queueRows,
      currentBhajan
    });

    // Notify others
    socket.to(roomCode).emit('participant_event', { 
      type: 'joined', 
      name, 
      totalCount: room.participants.length 
    });
    io.to(roomCode).emit('members_updated', { members: room.participants });
  });

  socket.on('leave_room', ({ roomCode }) => {
    handleLeaveRoom(io, socket, roomCode);
  });

  socket.on('disconnect', () => {
    const roomCode = (socket as any).roomCode;
    if (roomCode) {
      handleLeaveRoom(io, socket, roomCode);
    }
  });

  socket.on('promote_member', ({ roomCode, targetSocketId }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (socket.id !== room.leaderId) {
      socket.emit('error_msg', { message: 'Only the leader can promote members' });
      return;
    }

    if (room.coLeaderIds.length >= 3) {
      socket.emit('error_msg', { message: 'Maximum 3 co-leaders allowed' });
      return;
    }

    const target = room.participants.find(p => p.socketId === targetSocketId);
    if (target && target.role === 'member') {
      target.role = 'co-leader';
      room.coLeaderIds.push(targetSocketId);
      
      io.to(targetSocketId).emit('promoted', { newRole: 'co-leader' });
      io.to(roomCode).emit('members_updated', { members: room.participants });
    }
  });

  socket.on('demote_coleader', ({ roomCode, targetSocketId }) => {
    const room = activeRooms.get(roomCode);
    if (!room) return;

    if (socket.id !== room.leaderId) {
      socket.emit('error_msg', { message: 'Only the leader can demote co-leaders' });
      return;
    }

    const target = room.participants.find(p => p.socketId === targetSocketId);
    if (target && target.role === 'co-leader') {
      target.role = 'member';
      room.coLeaderIds = room.coLeaderIds.filter(id => id !== targetSocketId);
      
      io.to(targetSocketId).emit('demoted', { newRole: 'member' });
      io.to(roomCode).emit('members_updated', { members: room.participants });
    }
  });
}
