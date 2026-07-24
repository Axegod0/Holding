const fs = require('fs');

const path = '/Users/ismetbaltacioglu/Holding/backend/src/state/roomStore.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Trigger in rollDice
if (!content.includes("checkPlayerQuestOnRoll(room, socketId, diceTotal);")) {
  const diceTotalAnchor = "const diceTotal = dice1 + dice2;";
  content = content.replace(
    diceTotalAnchor,
    diceTotalAnchor + "\n  checkPlayerQuestOnRoll(room, socketId, diceTotal);"
  );
}

// 2. Trigger in passedGo
if (!content.includes("checkPlayerQuestOnPassGo(room, socketId);")) {
  const passGoAnchor = "expiredEffects = cardEffectService.decrementLaps(room, socketId);";
  content = content.replace(
    passGoAnchor,
    passGoAnchor + "\n    checkPlayerQuestOnPassGo(room, socketId);"
  );
}

// 3. Trigger in buyProperty
if (!content.includes("checkPlayerQuestOnAcquire(room, socketId, property.price);")) {
  const buyPropertyAnchor = "playerState.balance -= property.price;";
  content = content.replace(
    buyPropertyAnchor,
    buyPropertyAnchor + "\n  checkPlayerQuestOnAcquire(room, socketId, property.price);"
  );
}

fs.writeFileSync(path, content);
console.log('Quest triggers added to roomStore.js');
