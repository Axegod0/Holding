import { Server } from 'socket.io';
import { registerRoomHandlers } from '../sockets/roomHandler.js';

/**
 * Socket.io Sunucusunu Başlatır ve Yapılandırır
 * @param {import('http').Server} httpServer - Express HTTP sunucusu
 * @returns {import('socket.io').Server}
 */
export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 20000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
  });

  return io;
}
