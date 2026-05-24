import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL ?? 'http://localhost:3000' },
  });
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
  });
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
}
