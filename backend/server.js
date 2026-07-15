import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSocket } from './src/config/socket.js';
import { getActiveRoomCount } from './src/state/roomStore.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// CORS
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sağlık kontrolü
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    activeRooms: getActiveRoomCount(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({ ok: true });
});

// Socket.io
const io = initializeSocket(httpServer);

// 0.0.0.0: Docker ağından erişilebilir
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend] http://0.0.0.0:${PORT} | NODE_ENV: ${process.env.NODE_ENV}`);
  console.log('[Socket.io] transports: polling, websocket | CORS: *');
});

export { app, httpServer, io };
