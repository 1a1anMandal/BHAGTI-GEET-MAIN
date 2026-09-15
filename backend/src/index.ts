import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';
import path from 'path';
import bhajansRouter from './routes/bhajans';
import roomsRouter from './routes/rooms';
import { CleanupService } from './services/cleanupService';
import { ClientToServerEvents, ServerToClientEvents } from '@bhagi-geet/shared';
import { registerRoomHandlers } from './socket/roomHandler';
import { registerLyricsHandlers } from './socket/lyricsHandler';
import { registerVoteHandlers } from './socket/voteHandler';
import { registerQueueHandlers } from './socket/queueHandler';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const server = http.createServer(app);

// Use exact CORS origin in production, wildcard in dev
const corsOrigin = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/bhajans', bhajansRouter);
app.use('/api/rooms', roomsRouter);

// Setup Socket.io
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Register Socket handlers
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  registerRoomHandlers(io, socket);
  registerLyricsHandlers(io, socket);
  registerVoteHandlers(io, socket);
  registerQueueHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Leave room logic is handled within roomHandler via a wrapper or by listening to disconnect there
  });
});

// Start cleanup cron
CleanupService.startCleanupCron();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
