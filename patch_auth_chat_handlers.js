const fs = require('fs');

const path = '/Users/ismetbaltacioglu/Holding/backend/src/sockets/roomHandler.js';
let content = fs.readFileSync(path, 'utf8');

// Add authService imports at top
if (!content.includes("authService.js")) {
  content = "import { createGuestProfile, registerAccount, loginAccount } from '../state/authService.js';\n" + content;
}

const newHandlers = `
  // --- AUTH SYSTEM HANDLERS ---
  socket.on('client:guestLogin', (data, callback) => {
    const profile = createGuestProfile();
    if (typeof callback === 'function') callback({ success: true, profile });
  });

  socket.on('client:registerAccount', (data, callback) => {
    const res = registerAccount(data || {});
    if (typeof callback === 'function') callback(res);
  });

  socket.on('client:loginAccount', (data, callback) => {
    const res = loginAccount(data || {});
    if (typeof callback === 'function') callback(res);
  });

  // --- CANLI CHAT VE SİSTEM LOG PANELİ HANDLERS ---
  socket.on('client:sendChatMessage', ({ message }, callback) => {
    const room = getRoomBySocketId(socket.id);
    if (!room) return;

    const sender = room.players.find(p => p.id === socket.id);
    const senderName = sender?.name || 'Oyuncu';

    const msgObj = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      senderId: socket.id,
      senderName,
      message: (message || '').trim().substring(0, 200),
      timestamp: Date.now(),
      tab: 'GLOBAL_CHAT'
    };

    if (!room.chatMessages) room.chatMessages = [];
    room.chatMessages.push(msgObj);

    io.to(room.code).emit('server:chatMessage', msgObj);
    if (typeof callback === 'function') callback({ success: true, message: msgObj });
  });

  socket.on('client:sendCourtChatMessage', ({ message }, callback) => {
    const room = getRoomBySocketId(socket.id);
    if (!room) return;

    const sender = room.players.find(p => p.id === socket.id);
    const senderName = sender?.name || 'Oyuncu';

    const msgObj = {
      id: 'court_msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      senderId: socket.id,
      senderName,
      message: (message || '').trim().substring(0, 200),
      timestamp: Date.now(),
      tab: 'COURT_CHAT'
    };

    io.to(room.code).emit('server:courtChatMessage', msgObj);
    if (typeof callback === 'function') callback({ success: true, message: msgObj });
  });
`;

if (!content.includes("client:sendChatMessage")) {
  content = content.replace("  // MAHKEME SALONU (COURTROOM ENGINE) ETKİLEŞİMLERİ", newHandlers + "\n  // MAHKEME SALONU (COURTROOM ENGINE) ETKİLEŞİMLERİ");
}

fs.writeFileSync(path, content);
console.log('roomHandler patched with Auth & Chat handlers');
