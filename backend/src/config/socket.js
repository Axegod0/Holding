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
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: false
    },
    // Polling + WebSocket: en kararlı yapı (Nginx, Cloudflare, proxy uyumlu)
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
    // EIO3 desteği: eski socket.io client versiyonlarıyla uyum
    allowEIO3: true,
    // Ping ayarları: Cloudflare 100s timeout'u aşmamak için
    pingTimeout: 60000,
    pingInterval: 25000,
    // Upgrade için bekleme süresi
    upgradeTimeout: 10000,
    // Maksimum HTTP buffer boyutu
    maxHttpBufferSize: 1e6
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Bağlandı: ${socket.id} | Transport: ${socket.conn.transport.name}`);
    registerRoomHandlers(io, socket);

    socket.conn.on('upgrade', (transport) => {
      console.log(`[Socket.io] Yükseltildi: ${socket.id} → ${transport.name}`);
    });
  });

  return io;
}
