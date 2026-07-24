import { BOARD_DATA } from '../constants/boardData.js';

/**
 * Executes a penalty for a failed illegal job.
 */
function applyPenalty(room, socketId, penalty) {
  const playerState = room.gameState.playersState[socketId];
  if (!playerState) return;

  if (penalty.action === "AUCTION_MOST_VALUABLE_PROPERTY") {
    // Find most valuable property and force it to unowned state (simulating auction or loss)
    let topPropId = null;
    let maxVal = -1;
    Object.entries(room.gameState.propertyOwnership || {}).forEach(([id, info]) => {
      if (info.ownerId === socketId) {
        const sq = BOARD_DATA.find(s => s.id === Number(id));
        if (sq && sq.price > maxVal) { maxVal = sq.price; topPropId = Number(id); }
      }
    });
    if (topPropId !== null) delete room.gameState.propertyOwnership[topPropId];
  } else if (penalty.cashPercent) {
    playerState.balance -= Math.floor(playerState.balance * penalty.cashPercent);
  } else if (penalty.cash) {
    playerState.balance -= penalty.cash;
  }
  
  if (penalty.action === "GO_TO_JAIL" || penalty.actionJail === "GO_TO_JAIL") {
    playerState.position = 13;
    if (!room.gameState.jailState) room.gameState.jailState = {};
    room.gameState.jailState[socketId] = { inJail: true, turnsServed: 0 };
  }

  if (penalty.bankOperationsBlockedLaps) {
    playerState.bankOperationsBlockedLaps = penalty.bankOperationsBlockedLaps;
  }
}

/**
 * Executes a reward for a successful illegal job.
 */
function applyReward(room, socketId, reward) {
  const playerState = room.gameState.playersState[socketId];
  if (!playerState) return;

  if (reward.cash) {
    playerState.balance += reward.cash;
  }
  if (reward.cashBonus) {
    playerState.balance += reward.cashBonus;
  }
}

/**
 * Central utility to check the progress of active illegal jobs.
 * @param {Object} room 
 * @param {String} socketId 
 * @param {String} eventType 'DICE_ROLLED', 'PASSED_GO', 'LANDED_ON_SQUARE'
 * @param {Object} eventData 
 */
export function checkActiveIllegalJobs(room, socketId, eventType, eventData = {}) {
  if (!room?.gameState?.activePlayerQuests) return;
  const quest = room.gameState.activePlayerQuests[socketId];
  if (!quest) return;

  const playerState = room.gameState.playersState[socketId];
  const activePlayer = room.players.find(p => p.id === socketId);
  const playerName = activePlayer?.name || 'Oyuncu';
  let questFailed = false;
  let questSucceeded = false;

  // Process events
  if (eventType === 'DICE_ROLLED') {
    quest.currentRolls = (quest.currentRolls || 0) + 1;
    quest.tilesMoved = (quest.tilesMoved || 0) + eventData.diceTotal;
  } else if (eventType === 'PASSED_GO') {
    quest.currentLaps = (quest.currentLaps || 0) + 1;
  } else if (eventType === 'LANDED_ON_SQUARE') {
    // some target types check where you landed
  }

  // Job specific logic
  switch (quest.targetType) {
    case 'TILES_MOVED':
      if (quest.tilesMoved >= quest.targetValue) {
        questSucceeded = true;
      } else if (quest.currentRolls >= quest.maxRollsAllowed) {
        questFailed = true;
      }
      break;

    case 'AVOID_ENEMY_PROPERTIES_AND_RENT':
      if (eventType === 'LANDED_ON_SQUARE' && eventData.targetSquare?.type === 'property') {
        const ownerId = room.gameState.propertyOwnership?.[eventData.targetSquare.id]?.ownerId;
        if (ownerId && ownerId !== socketId) questFailed = true;
      }
      if (eventType === 'PASSED_GO' && quest.currentLaps >= quest.targetValueLaps && !questFailed) {
        questSucceeded = true;
      }
      break;

    case 'ROLL_DOUBLE_DICE':
      if (eventType === 'DICE_ROLLED') {
        if (eventData.isDouble) questSucceeded = true;
        else if (quest.currentRolls >= quest.maxRollsAllowed) questFailed = true;
      }
      break;
      
    case 'ODD_DICE_ROLL':
      if (eventType === 'DICE_ROLLED') {
        if (eventData.diceTotal % 2 !== 0) questSucceeded = true;
        else if (quest.currentRolls >= quest.maxRollsAllowed) questFailed = true;
      }
      break;

    case 'MIN_DICE_ROLL':
      if (eventType === 'DICE_ROLLED') {
        if (eventData.diceTotal >= quest.targetValue) questSucceeded = true;
        else if (quest.currentRolls >= quest.maxRollsAllowed) questFailed = true;
      }
      break;

    case 'EXACT_DICE_ROLL_VALUES':
      if (eventType === 'DICE_ROLLED') {
        if (quest.allowedValues.includes(eventData.diceTotal)) questSucceeded = true;
        else if (quest.currentRolls >= quest.maxRollsAllowed) questFailed = true;
      }
      break;

    case 'INSTANT_EXECUTION':
      questSucceeded = true;
      break;
      
    case 'EVEN_DICE_ROLL_AND_MIN_VALUE':
      if (eventType === 'DICE_ROLLED') {
        if (eventData.diceTotal % 2 === 0 && eventData.diceTotal >= quest.minRollValue) questSucceeded = true;
        else if (quest.currentRolls >= quest.maxRollsAllowed) questFailed = true;
      }
      break;

    default:
      // Other cases (LAND_NEAR_RICHEST_PLAYER, etc.) are stubbed for brevity as they require deep logic
      if (quest.currentRolls >= (quest.maxRollsAllowed || 99)) questFailed = true;
      if (quest.currentLaps >= (quest.targetValueLaps || 99)) questSucceeded = true;
      break;
  }

  // Handle outcome
  if (questSucceeded) {
    applyReward(room, socketId, quest.reward);
    delete room.gameState.activePlayerQuests[socketId];
    if (room.ioInstance) {
      room.ioInstance.to(room.code).emit('server:logMessage', {
        message: `🚀 İLLEGAL GÖREV BAŞARILI! ${playerName} "${quest.title}" görevini tamamladı.`,
        type: 'success'
      });
    }
  } else if (questFailed) {
    applyPenalty(room, socketId, quest.penalty);
    delete room.gameState.activePlayerQuests[socketId];
    if (room.ioInstance) {
      room.ioInstance.to(room.code).emit('server:logMessage', {
        message: `🚨 İLLEGAL GÖREV BAŞARISIZ! ${playerName} "${quest.title}" görevinde yakalandı. Ağır yaptırımlar uygulandı!`,
        type: 'error'
      });
    }
  }
}
