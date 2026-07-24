const fs = require('fs');

const path = '/Users/ismetbaltacioglu/Holding/backend/src/sockets/roomHandler.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports to roomStore import block
content = content.replace(
  "  submitBorsaInvestment,\n  playCasinoAction,",
  "  submitBorsaInvestment,\n  playCasinoAction,\n  submitJuryVote,\n  submitProsecutorVerdict,"
);

// 2. Add handlers
const courtroomHandlers = `
  // MAHKEME SALONU (COURTROOM ENGINE) ETKİLEŞİMLERİ
  socket.on('client:submitJuryVote', ({ vote }, callback) => {
    const res = submitJuryVote(socket.id, vote);
    if (typeof callback === 'function') callback(res);
  });

  socket.on('client:submitProsecutorVerdict', ({ verdict }, callback) => {
    const res = submitProsecutorVerdict(socket.id, verdict);
    if (typeof callback === 'function') callback(res);
  });
`;

content = content.replace(
  "  // MULTIPLAYER CASINO İŞLEMLERİ (GECICI OLARAK DEVRE DISI)",
  courtroomHandlers + "\n  // MULTIPLAYER CASINO İŞLEMLERİ (GECICI OLARAK DEVRE DISI)"
);

fs.writeFileSync(path, content);
console.log('roomHandler patched');
