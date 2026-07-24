const fs = require('fs');

const roomStorePath = '/Users/ismetbaltacioglu/Holding/backend/src/state/roomStore.js';
let content = fs.readFileSync(roomStorePath, 'utf8');

// 1. Add import for ILLEGAL_JOBS_DECK
if (!content.includes("illegalJobsDeck.js")) {
  content = "import { ILLEGAL_JOBS_DECK } from '../constants/illegalJobsDeck.js';\n" + content;
}

// 2. Add tile 7 and 28 landing logic for ILLEGAL_JOB_TILE in rollDice
const illegalLandingCode = `  // İllegal İşler / Kaçak Lojistik (Kare 7 veya 28) Kontrolü
  if (targetSquare.type === 'ILLEGAL_JOB_TILE' || newPosition === 7 || newPosition === 28) {
    if (!room.gameState.activePlayerQuests) room.gameState.activePlayerQuests = {};
    const quest = ILLEGAL_JOBS_DECK[Math.floor(Math.random() * ILLEGAL_JOBS_DECK.length)];
    const activeQuest = {
      ...quest,
      assignedAt: Date.now(),
      currentRolls: 0,
      tilesMoved: 0,
      currentLaps: 0,
      status: 'ACTIVE'
    };
    room.gameState.activePlayerQuests[socketId] = activeQuest;

    if (room.ioInstance) {
      room.ioInstance.to(room.code).emit('server:logMessage', {
        message: '🕵️ İLLEGAL GÖREV ALINDI: ' + activePlayer.name + ', "' + quest.title + '" görevini kabul etti! (' + quest.description + ')',
        type: 'warning'
      });
      room.ioInstance.to(room.code).emit('server:illegalJobAssigned', { playerId: socketId, quest: activeQuest });
    }
  }`;

// Inject before passedGo or end of tile landing in rollDice
const anchor = "  // Başlangıç Karesi (GO) Geçiş Kontrolü ve Dinamik Varlık Maaşı";
if (!content.includes("ILLEGAL_JOB_TILE")) {
  content = content.replace(anchor, illegalLandingCode + "\n\n" + anchor);
}

// 3. Add quest evaluation functions inside roomStore.js
const questLogicCode = `

/**
 * İLLEGAL GÖREV İLERLEME VE DENETİM METODLARI
 */
export function checkPlayerQuestOnRoll(room, socketId, diceTotal) {
  if (!room || !room.gameState || !room.gameState.activePlayerQuests) return;
  const quest = room.gameState.activePlayerQuests[socketId];
  if (!quest) return;

  const playerState = room.gameState.playersState[socketId];
  const activePlayer = room.players.find(p => p.id === socketId);
  const playerName = activePlayer?.name || 'Oyuncu';

  quest.currentRolls = (quest.currentRolls || 0) + 1;

  if (quest.id === 'ILLEGAL_1') {
    quest.tilesMoved = (quest.tilesMoved || 0) + diceTotal;
    if (quest.tilesMoved >= 30) {
      playerState.balance += 100000;
      delete room.gameState.activePlayerQuests[socketId];
      if (room.ioInstance) {
        room.ioInstance.to(room.code).emit('server:logMessage', {
          message: '🚀 İLLEGAL GÖREV BAŞARILI! ' + playerName + ' kaçak konteynerları 30 kare ilerleterek çıkardı (+100.000 ₺ kâr)!',
          type: 'success'
        });
      }
    } else if (quest.currentRolls >= 3) {
      let topPropId = null;
      let maxVal = -1;
      Object.entries(room.gameState.propertyOwnership || {}).forEach(([id, info]) => {
        if (info.ownerId === socketId) {
          const sq = BOARD_DATA.find(s => s.id === Number(id));
          if (sq) {
            const val = sq.price || 0;
            if (val > maxVal) { maxVal = val; topPropId = Number(id); }
          }
        }
      });
      if (topPropId !== null) {
        delete room.gameState.propertyOwnership[topPropId];
      }
      delete room.gameState.activePlayerQuests[socketId];
      if (room.ioInstance) {
        room.ioInstance.to(room.code).emit('server:logMessage', {
          message: '🚨 İLLEGAL GÖREV BAŞARISIZ! ' + playerName + ' 3 zar atışında 30 kareye ulaşamadı. En değerli mülkü devlete geçti!',
          type: 'error'
        });
      }
    }
  } else if (quest.id === 'ILLEGAL_2') {
    if (quest.currentRolls >= 2 && quest.currentLaps < 1) {
      const penaltyCash = Math.floor(playerState.balance * 0.30);
      playerState.balance -= penaltyCash;
      delete room.gameState.activePlayerQuests[socketId];
      if (room.ioInstance) {
        room.ioInstance.to(room.code).emit('server:logMessage', {
          message: '🚨 İLLEGAL GÖREV BAŞARISIZ! ' + playerName + ' 2 zarda sınırdan geçemedi. Kasasının %30\'una (-' + penaltyCash.toLocaleString('tr-TR') + ' ₺) el konuldu!',
          type: 'error'
        });
      }
    }
  }
}

export function checkPlayerQuestOnPassGo(room, socketId) {
  if (!room || !room.gameState || !room.gameState.activePlayerQuests) return;
  const quest = room.gameState.activePlayerQuests[socketId];
  if (!quest) return;

  const playerState = room.gameState.playersState[socketId];
  const activePlayer = room.players.find(p => p.id === socketId);
  const playerName = activePlayer?.name || 'Oyuncu';

  quest.currentLaps = (quest.currentLaps || 0) + 1;

  if (quest.id === 'ILLEGAL_2') {
    if (quest.currentLaps >= 1) {
      playerState.balance += 150000;
      delete room.gameState.activePlayerQuests[socketId];
      if (room.ioInstance) {
        room.ioInstance.to(room.code).emit('server:logMessage', {
          message: '🚀 İLLEGAL GÖREV BAŞARILI! ' + playerName + ' zamanında Başlangıç çizgisinden geçerek transit sevkiyatı tamamladı (+150.000 ₺)!',
          type: 'success'
        });
      }
    }
  } else if (quest.id === 'ILLEGAL_3') {
    if (quest.currentLaps >= 2) {
      playerState.balance += 120000;
      delete room.gameState.activePlayerQuests[socketId];
      if (room.ioInstance) {
        room.ioInstance.to(room.code).emit('server:logMessage', {
          message: '🚀 İLLEGAL GÖREV BAŞARILI! ' + playerName + ' 2 tur boyunca hiçbir ceza karesine basmadan Kırmızı Hat sevkiyatını bitirdi (+120.000 ₺)!',
          type: 'success'
        });
      }
    }
  } else if (quest.id === 'ILLEGAL_4') {
    if (quest.currentLaps >= 2) {
      playerState.balance -= 80000;
      delete room.gameState.activePlayerQuests[socketId];
      if (room.ioInstance) {
        room.ioInstance.to(room.code).emit('server:logMessage', {
          message: '🚨 İLLEGAL GÖREV BAŞARISIZ! ' + playerName + ' 2 tur içinde mülk edinemedi. 80.000 ₺ Kara Para Cezası kesildi!',
          type: 'error'
        });
      }
    }
  }
}

export function checkPlayerQuestOnAcquire(room, socketId, cost) {
  if (!room || !room.gameState || !room.gameState.activePlayerQuests) return;
  const quest = room.gameState.activePlayerQuests[socketId];
  if (!quest || quest.id !== 'ILLEGAL_4') return;

  const playerState = room.gameState.playersState[socketId];
  const activePlayer = room.players.find(p => p.id === socketId);
  const playerName = activePlayer?.name || 'Oyuncu';

  const refund = Math.floor((cost || 0) * 0.50);
  playerState.balance += 50000 + refund;
  delete room.gameState.activePlayerQuests[socketId];

  if (room.ioInstance) {
    room.ioInstance.to(room.code).emit('server:logMessage', {
      message: '🚀 İLLEGAL GÖREV BAŞARILI! ' + playerName + ' içeriden bilgiyle mülk satın aldı (+50.000 ₺ bonus + ' + refund.toLocaleString('tr-TR') + ' ₺ harcama iadesi)!',
      type: 'success'
    });
  }
}
`;

if (!content.includes("checkPlayerQuestOnRoll")) {
  content += questLogicCode;
}

fs.writeFileSync(roomStorePath, content);
console.log('roomStore patched for Illegal Jobs successfully');
