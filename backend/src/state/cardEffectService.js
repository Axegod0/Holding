/**
 * cardEffectService.js
 * Tracks lap-based chance card effects for players.
 * A "lap" is defined as passing the Start (Başlangıç) tile.
 */

// Initialize the activeCardEffects object in room.gameState if it doesn't exist
export function initCardEffects(room) {
  if (!room.gameState.activeCardEffects) {
    room.gameState.activeCardEffects = {};
  }
}

/**
 * Add a lap-based effect to a player.
 * @param {Object} room - The room object
 * @param {String} playerId - The socket ID of the player
 * @param {String} effectType - The type of the effect (e.g. 'RENT_DECREASE', 'DOUBLE_RENT')
 * @param {Number} durationLaps - How many times the player needs to pass Start for the effect to expire
 * @param {Object} data - Additional data for the effect (target player, target property, etc.)
 */
export function addEffect(room, playerId, effectType, durationLaps, data = {}) {
  initCardEffects(room);
  
  if (!room.gameState.activeCardEffects[playerId]) {
    room.gameState.activeCardEffects[playerId] = [];
  }

  // Remove existing effect of the same type if it exists to overwrite
  room.gameState.activeCardEffects[playerId] = room.gameState.activeCardEffects[playerId].filter(e => e.type !== effectType);

  room.gameState.activeCardEffects[playerId].push({
    type: effectType,
    lapsRemaining: durationLaps,
    data: data
  });
}

/**
 * Decrements the lap counter for all active effects of a player.
 * This should be called whenever a player passes the Start (GO) tile.
 * @param {Object} room 
 * @param {String} playerId 
 * @returns {Array} - Array of expired effect types (useful if we want to notify the frontend)
 */
export function decrementLaps(room, playerId) {
  if (!room?.gameState?.activeCardEffects?.[playerId]) return [];

  const effects = room.gameState.activeCardEffects[playerId];
  const expiredEffects = [];

  for (let i = effects.length - 1; i >= 0; i--) {
    const effect = effects[i];
    // We only decrement if it has a lap duration > 0.
    // Laps = 0 usually means immediate action, shouldn't be added here, but just in case.
    if (effect.lapsRemaining > 0) {
      effect.lapsRemaining -= 1;
    }

    if (effect.lapsRemaining <= 0) {
      expiredEffects.push({ type: effect.type, data: effect.data });
      effects.splice(i, 1);
    }
  }

  return expiredEffects;
}

/**
 * Check if a specific effect type is currently active for a player.
 * @param {Object} room 
 * @param {String} playerId 
 * @param {String} effectType 
 * @returns {Boolean}
 */
export function hasActiveEffect(room, playerId, effectType) {
  if (!room?.gameState?.activeCardEffects?.[playerId]) return false;
  return room.gameState.activeCardEffects[playerId].some(e => e.type === effectType);
}

/**
 * Get the data associated with an active effect type for a player.
 * @param {Object} room 
 * @param {String} playerId 
 * @param {String} effectType 
 * @returns {Object|null}
 */
export function getActiveEffectData(room, playerId, effectType) {
  if (!room?.gameState?.activeCardEffects?.[playerId]) return null;
  const effect = room.gameState.activeCardEffects[playerId].find(e => e.type === effectType);
  return effect ? effect.data : null;
}

/**
 * Removes a specific effect manually.
 */
export function removeEffect(room, playerId, effectType) {
  if (!room?.gameState?.activeCardEffects?.[playerId]) return;
  room.gameState.activeCardEffects[playerId] = room.gameState.activeCardEffects[playerId].filter(e => e.type !== effectType);
}

/**
 * Remove an effect from ALL players (global effects like financial report leak)
 */
export function removeEffectFromAll(room, effectType) {
  if (!room?.gameState?.activeCardEffects) return;
  for (const pid of Object.keys(room.gameState.activeCardEffects)) {
    room.gameState.activeCardEffects[pid] = room.gameState.activeCardEffects[pid].filter(e => e.type !== effectType);
  }
}

/**
 * Get all effects of a certain type across all players
 */
export function getAllActiveEffectsOfType(room, effectType) {
  if (!room?.gameState?.activeCardEffects) return [];
  const results = [];
  for (const pid of Object.keys(room.gameState.activeCardEffects)) {
    const effect = room.gameState.activeCardEffects[pid].find(e => e.type === effectType);
    if (effect) {
      results.push({ playerId: pid, ...effect });
    }
  }
  return results;
}
