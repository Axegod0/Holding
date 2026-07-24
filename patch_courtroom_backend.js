const fs = require('fs');

const roomStorePath = '/Users/ismetbaltacioglu/Holding/backend/src/state/roomStore.js';
let content = fs.readFileSync(roomStorePath, 'utf8');

// 1. Add import
if (!content.includes("courtroomCrimes.js")) {
  content = "import { COURTROOM_CRIMES } from '../constants/courtroomCrimes.js';\n" + content;
}

// 2. Replace tile 33 landing logic in rollDice
const oldTile33Block = `  // Yeraltı Kumarhanesi / Blackjack (Kare 33) Kontrolü (GECICI OLARAK DEVRE DISI BIRAKILDI)
  if (newPosition === 33) {
    if (room.ioInstance) {
      room.ioInstance.to(room.code).emit('server:logMessage', {
        message: '🎰 Kumarhane (Blackjack) ve davet sistemi revizyon nedeniyle geçici olarak kapalıdır.',
        type: 'warning'
      });
    }
    advanceToNextTurn(room, isDouble);
    const nextActivePlayerId = room.players[room.gameState.currentTurnIndex]?.id;
    return {
      success: true,
      room,
      playerId: socketId,
      playerName: activePlayer.name,
      dice: [dice1, dice2],
      diceTotal,
      oldPosition,
      newPosition,
      isDouble,
      passedGo,
      salaryAmount,
      newBalance: playerState.balance,
      currentTurnIndex: room.gameState.currentTurnIndex,
      activePlayerId: nextActivePlayerId
    };
  }`;

const newTile33Block = `  // Mahkeme Salonu (Kare 33) Kontrolü
  if (newPosition === 33) {
    startCourtroomSession(room, socketId, isDouble);
    return {
      success: true,
      room,
      playerId: socketId,
      playerName: activePlayer.name,
      dice: [dice1, dice2],
      diceTotal,
      oldPosition,
      newPosition,
      isDouble,
      passedGo,
      salaryAmount,
      newBalance: playerState.balance,
      currentTurnIndex: room.gameState.currentTurnIndex,
      waitingForCourtroom: true
    };
  }`;

if (content.includes("if (newPosition === 33)")) {
  content = content.replace(oldTile33Block, newTile33Block);
}

// 3. Append Courtroom helper functions at bottom of roomStore.js
const courtroomFunctions = `

/**
 * MAHKEME SALONU (COURTROOM ENGINE) VE ADALET TEPER MEKANİĞİ
 */
export function startCourtroomSession(room, defendantSocketId, isDouble = false) {
  if (!room || !room.gameState) return null;

  const defendant = room.players.find(p => p.id === defendantSocketId);
  if (!defendant) return null;

  let prosecutor = room.players.find(p => p.id === room.createdBy);
  if (!prosecutor) prosecutor = room.players[0];

  if (prosecutor.id === defendantSocketId && room.players.length > 1) {
    prosecutor = room.players.find(p => p.id !== defendantSocketId) || prosecutor;
  }

  const crime = COURTROOM_CRIMES[Math.floor(Math.random() * COURTROOM_CRIMES.length)];

  if (room.courtroomTimer) {
    clearTimeout(room.courtroomTimer);
    room.courtroomTimer = null;
  }

  const durationSeconds = 40; // Preparation phase duration
  const courtroomState = {
    active: true,
    crime,
    defendantId: defendantSocketId,
    defendantName: defendant.name,
    prosecutorId: prosecutor.id,
    prosecutorName: prosecutor.name,
    phase: 'PREPARATION',
    durationSeconds,
    phaseEndTime: Date.now() + (durationSeconds * 1000),
    votes: {},
    finalVerdict: null,
    resultMessage: '',
    isBackfire: false,
    isDouble
  };

  room.gameState.courtroomState = courtroomState;

  scheduleCourtroomPhaseTransition(room.code, 'DEFENSE', 40000);

  if (room.ioInstance) {
    room.ioInstance.to(room.code).emit('server:courtroomStarted', { courtroomState });
    room.ioInstance.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
  }

  return courtroomState;
}

function scheduleCourtroomPhaseTransition(roomCode, nextPhase, delayMs) {
  const room = rooms.get(roomCode);
  if (!room) return;

  if (room.courtroomTimer) {
    clearTimeout(room.courtroomTimer);
  }

  room.courtroomTimer = setTimeout(() => {
    advanceCourtroomPhase(roomCode, nextPhase);
  }, delayMs);
}

export function advanceCourtroomPhase(roomCode, forcedNextPhase = null) {
  const room = rooms.get(roomCode);
  if (!room || !room.gameState || !room.gameState.courtroomState || !room.gameState.courtroomState.active) return;

  const state = room.gameState.courtroomState;
  let nextPhase = forcedNextPhase;

  if (!nextPhase) {
    if (state.phase === 'PREPARATION') nextPhase = 'DEFENSE';
    else if (state.phase === 'DEFENSE') nextPhase = 'JURY_VOTING';
    else if (state.phase === 'JURY_VOTING') nextPhase = 'PROSECUTOR_VERDICT';
    else if (state.phase === 'PROSECUTOR_VERDICT') {
      const votes = Object.values(state.votes || {});
      const beraatCount = votes.filter(v => v === 'BERAAT').length;
      const hapisCount = votes.filter(v => v === 'HAPIS').length;
      const autoVerdict = hapisCount > beraatCount ? 'HAPIS' : 'BERAAT';
      submitProsecutorVerdict(state.prosecutorId, autoVerdict);
      return;
    }
  }

  if (!nextPhase) return;

  state.phase = nextPhase;
  let nextDuration = 60;
  if (nextPhase === 'DEFENSE') nextDuration = 60;
  else if (nextPhase === 'JURY_VOTING') nextDuration = 10;
  else if (nextPhase === 'PROSECUTOR_VERDICT') nextDuration = 15;

  state.durationSeconds = nextDuration;
  state.phaseEndTime = Date.now() + (nextDuration * 1000);

  if (nextPhase === 'DEFENSE') {
    scheduleCourtroomPhaseTransition(roomCode, 'JURY_VOTING', 60000);
  } else if (nextPhase === 'JURY_VOTING') {
    scheduleCourtroomPhaseTransition(roomCode, 'PROSECUTOR_VERDICT', 10000);
  } else if (nextPhase === 'PROSECUTOR_VERDICT') {
    scheduleCourtroomPhaseTransition(roomCode, null, 15000);
  }

  if (room.ioInstance) {
    room.ioInstance.to(roomCode).emit('server:courtroomPhaseUpdate', { courtroomState: state });
    room.ioInstance.to(roomCode).emit('server:gameStateUpdate', { gameState: room.gameState });
  }
}

export function submitJuryVote(socketId, vote) {
  const code = socketToRoom.get(socketId);
  if (!code) return { success: false, error: 'Oda bulunamadı.' };
  const room = rooms.get(code);
  if (!room || !room.gameState || !room.gameState.courtroomState) {
    return { success: false, error: 'Aktif mahkeme oturumu bulunamadı.' };
  }

  const state = room.gameState.courtroomState;
  if (state.phase !== 'JURY_VOTING') {
    return { success: false, error: 'Oy verme aşamasında değilsiniz.' };
  }

  if (socketId === state.defendantId) {
    return { success: false, error: 'Sanık oy kullanamaz.' };
  }

  if (vote !== 'BERAAT' && vote !== 'HAPIS') {
    return { success: false, error: 'Geçersiz oy seçeneği.' };
  }

  state.votes[socketId] = vote;

  const juryMembers = room.players.filter(p => p.id !== state.defendantId && p.id !== state.prosecutorId);
  const totalVotesCount = Object.keys(state.votes).length;

  if (room.ioInstance) {
    room.ioInstance.to(code).emit('server:courtroomVoteUpdate', { courtroomState: state });
  }

  if (juryMembers.length > 0 && totalVotesCount >= juryMembers.length) {
    advanceCourtroomPhase(code, 'PROSECUTOR_VERDICT');
  }

  return { success: true, courtroomState: state };
}

export function submitProsecutorVerdict(socketId, verdict) {
  const code = socketToRoom.get(socketId);
  if (!code) return { success: false, error: 'Oda bulunamadı.' };
  const room = rooms.get(code);
  if (!room || !room.gameState || !room.gameState.courtroomState) {
    return { success: false, error: 'Aktif mahkeme oturumu bulunamadı.' };
  }

  const state = room.gameState.courtroomState;
  if (socketId !== state.prosecutorId && socketId !== 'SYSTEM') {
    return { success: false, error: 'Sadece Savcı/Hakim karar verebilir.' };
  }

  if (verdict !== 'BERAAT' && verdict !== 'HAPIS') {
    return { success: false, error: 'Geçersiz karar.' };
  }

  if (room.courtroomTimer) {
    clearTimeout(room.courtroomTimer);
    room.courtroomTimer = null;
  }

  const votes = Object.values(state.votes || {});
  const beraatCount = votes.filter(v => v === 'BERAAT').length;
  const hapisCount = votes.filter(v => v === 'HAPIS').length;

  // Adalet Teper (Justice Backfires / Yetki İstismarı) Check:
  const isBeraatMajority = beraatCount > hapisCount || (beraatCount > 0 && hapisCount === 0);
  const isBackfire = isBeraatMajority && verdict === 'HAPIS';

  state.finalVerdict = verdict;
  state.phase = 'RESOLVED';
  state.durationSeconds = 0;
  state.phaseEndTime = Date.now();

  const defState = room.gameState.playersState[state.defendantId];
  const prosState = room.gameState.playersState[state.prosecutorId];

  if (isBackfire) {
    state.isBackfire = true;
    state.resultMessage = \`🔥 ADALET TEPTİ! Savcı \${state.prosecutorName} Yetkisini Kötüye Kullandığı İçin Hapse Atıldı, \${state.defendantName} Serbest!\`;

    if (prosState) {
      prosState.position = 13;
      if (!room.gameState.jailState) room.gameState.jailState = {};
      room.gameState.jailState[state.prosecutorId] = { inJail: true, turnsServed: 0, noSalaryThisTurn: true };
    }
  } else if (verdict === 'BERAAT') {
    state.resultMessage = \`⚖️ MAHKEME KARARI: \${state.defendantName} hakkında BERAAT kararı verildi! Serbest bırakıldı.\`;
  } else {
    state.resultMessage = \`🔒 MAHKEME KARARI: \${state.defendantName} hakkında HAPİS kararı tescillendi! 1 tur Hapse gönderildi.\`;

    if (defState) {
      defState.position = 13;
      if (!room.gameState.jailState) room.gameState.jailState = {};
      room.gameState.jailState[state.defendantId] = { inJail: true, turnsServed: 0, noSalaryThisTurn: true };
    }
  }

  if (room.ioInstance) {
    room.ioInstance.to(code).emit('server:courtroomEnded', { courtroomState: state });
    room.ioInstance.to(code).emit('server:logMessage', {
      message: state.resultMessage,
      type: isBackfire ? 'error' : (verdict === 'BERAAT' ? 'success' : 'warning')
    });
    room.ioInstance.to(code).emit('server:gameStateUpdate', { gameState: room.gameState });
  }

  setTimeout(() => {
    delete room.gameState.courtroomState;
    advanceToNextTurn(room, state.isDouble);
    if (room.ioInstance) {
      room.ioInstance.to(code).emit('server:gameStateUpdate', { gameState: room.gameState });
    }
  }, 6000);

  return { success: true, courtroomState: state };
}
`;

content += courtroomFunctions;
fs.writeFileSync(roomStorePath, content);
console.log('roomStore patched for Courtroom');
