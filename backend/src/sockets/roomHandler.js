import { createGuestProfile, registerAccount, loginAccount } from '../state/authService.js';
import {
  createRoom,
  joinRoom,
  changePlayerColor,
  removePlayer,
  startGame,
  rollDice,
  buyProperty,
  declineProperty,
  buildHouse,
  sendTradeOffer,
  useSelfResource,
  respondTradeOffer,
  tradeWithState,
  processMaterial,
  stockMall,
  bankAction,
  jailAction,
  sellPropertyToState,
  startAuction,
  placeBid,
  chanceCardDecision,
  startSpecialAuction,
  finishAuctionEarly,
  renameBusiness,
  sendSwapOffer,
  respondSwapOffer,
  submitBorsaInvestment,
  playCasinoAction,
  submitJuryVote,
  submitProsecutorVerdict,
  getRoomBySocketId
} from '../state/roomStore.js';
import { CHANCE_CARDS } from '../constants/chanceCards.js';
import { logGame, clearLog } from '../utils/logger.js';

// Shadow console locally so all console.log calls in this module write to game.log and standard output
const console = {
  ...globalThis.console,
  log: logGame
};

/**
 * Socket.io Oda, Lobi ve Çekirdek Oyun Motoru (Faz 2 & Faz 3) Olay Dinleyicileri
 */
export function registerRoomHandlers(io, socket) {
  console.log(`[Socket Bağlandı]: ${socket.id}`);

  socket.on('client:createRoom', ({ name, colorId }, callback = () => {}) => {
    // Clear old game logs when a new room/game is created
    clearLog();

    const result = createRoom(socket.id, name, colorId);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room } = result;
    Object.defineProperty(room, 'ioInstance', { value: io, enumerable: false, writable: true, configurable: true });
    socket.join(room.code);

    console.log(`[Oda Kuruldu]: ${room.code} - Host: ${name} (${socket.id}) - Renk: ${room.players[0]?.color?.name}`);

    callback({ success: true, room });
    io.to(room.code).emit('server:roomUpdate', {
      roomCode: room.code,
      players: room.players,
      spectators: room.spectators || [],
      isStarted: room.isStarted,
      gameState: room.gameState
    });
  });

  socket.on('client:joinRoom', ({ code, name, colorId, isSpectator }, callback = () => {}) => {
    const result = joinRoom(code, socket.id, name, colorId, isSpectator);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room } = result;
    Object.defineProperty(room, 'ioInstance', { value: io, enumerable: false, writable: true, configurable: true });
    socket.join(room.code);

    console.log(`[Odaya Katıldı]: ${room.code} - Oyuncu: ${name} (${socket.id}) ${isSpectator ? '(Seyirci)' : ''}`);

    callback({ success: true, room });
    io.to(room.code).emit('server:roomUpdate', {
      roomCode: room.code,
      players: room.players,
      spectators: room.spectators || [],
      isStarted: room.isStarted,
      gameState: room.gameState
    });
  });

  socket.on('client:changeColor', ({ colorId }, callback = () => {}) => {
    const result = changePlayerColor(socket.id, colorId);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room } = result;
    io.to(room.code).emit('server:roomUpdate', {
      roomCode: room.code,
      players: room.players,
      spectators: room.spectators || [],
      isStarted: room.isStarted,
      gameState: room.gameState
    });
    callback({ success: true, room });
  });

  socket.on('client:startGame', (callback = () => {}) => {
    const result = startGame(socket.id);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room } = result;
    Object.defineProperty(room, 'ioInstance', { value: io, enumerable: false, writable: true, configurable: true });
    console.log(`[Oyun Başladı]: ${room.code} - ${room.players.length} yatırımcı tahtada`);

    callback({ success: true, room });
    io.to(room.code).emit('server:gameStarted', {
      roomCode: room.code,
      players: room.players,
      gameState: room.gameState,
      startedAt: new Date()
    });
  });

  /**
   * client:rollDice - Faz 2 & Faz 3: Zar atışı, piyon hareketi, maaş ve kira/teklif tetikleyicisi
   */
  socket.on('client:rollDice', (callback = () => {}) => {
    const result = rollDice(socket.id);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const {
      room,
      playerId,
      playerName,
      dice,
      diceTotal,
      oldPosition,
      newPosition,
      isDouble,
      passedGo,
      salaryAmount,
      newBalance,
      currentTurnIndex,
      activePlayerId,
      offerProperty,
      rentPaidData
    } = result;

    console.log(`[Zar Atışı]: ${room.code} - ${playerName}: [${dice[0]}-${dice[1]}] (${diceTotal}) -> Yeni Konum: #${newPosition}${isDouble ? ' (Çift Zar!)' : ''}`);

    // 1. Zar sonucunu ve piyon hareketini bildir
    io.to(room.code).emit('server:diceRolled', {
      playerId,
      playerName,
      dice,
      diceTotal,
      oldPosition,
      newPosition,
      isDouble
    });

    // 2. Başlangıçtan geçildiyse maaş bildir
    if (passedGo) {
      io.to(room.code).emit('server:balanceUpdated', {
        playerId,
        newBalance,
        salaryAmount,
        reason: 'Başlangıç (GO) karesinden geçiş maaşı'
      });
    }

    // 3. Eğer sahipsiz bir şehre gelindiyse teklif modalını aç
    if (offerProperty) {
      console.log(`[Satın Alma Teklifi]: ${room.code} - ${playerName} için #${offerProperty.id} - ${offerProperty.name} (${offerProperty.price} ₺)`);
      io.to(room.code).emit('server:offerProperty', {
        playerId,
        playerName,
        property: offerProperty
      });
    } else if (result.showChanceCard) {
      console.log(`[Şans Kartı Çekildi]: ${room.code} - ${playerName} için Kart #${result.showChanceCard.id} - ${result.showChanceCard.title}`);
      io.to(room.code).emit('server:showChanceCard', {
        playerId,
        playerName,
        card: result.showChanceCard
      });
    } else if (rentPaidData) {
      // 4. Dolu mülke gelindiyse ve kira ödendiyse bildir
      console.log(`[Kira Ödemesi]: ${room.code} - ${rentPaidData.payerName} -> ${rentPaidData.receiverName}: ${rentPaidData.amount} ₺ (${rentPaidData.propertyName})`);
      io.to(room.code).emit('server:rentPaid', rentPaidData);
    }

    if (result.taxPaid > 0) {
      console.log(`[Vergi Kesintisi]: ${room.code} - ${playerName} ${result.taxPaid} ₺ vergi ödedi.`);
      io.to(room.code).emit('server:log', { time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), text: `${playerName}, Hazine/Servet vergisinden tam ${result.taxPaid.toLocaleString('tr-TR')} ₺ ödedi!`, type: 'warning', id: Date.now().toString() });
    }

    if (result.bankInterestReturn > 0) {
      console.log(`[Banka Faiz Dönüşü]: ${room.code} - ${playerName} ${result.bankInterestReturn} ₺ faizli mevduat aldı.`);
      io.to(room.code).emit('server:log', { time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), text: `${playerName}, Merkez Bankası'ndaki mevduatını +%40 faizle toplam ${result.bankInterestReturn.toLocaleString('tr-TR')} ₺ olarak tahsil etti!`, type: 'success', id: Date.now().toString() });
    }

    if (result.sentToJail || newPosition === 13) {
      const reasonText = result.sentToJail ? 'Gümrük Kapısından Doğrudan Sevk (#33 -> #13)' : 'Hapis/Gözaltı Karesine Ulaşıldı (#13)';
      if (result.sentToJail) {
        console.log(`[Sayıştay/Gümrük Hapis]: ${room.code} - ${playerName} hapse gönderildi.`);
        io.to(room.code).emit('server:log', { time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), text: `${playerName}, Gümrük/Sayıştay ihlali nedeniyle doğrudan Hapse (#13) gönderildi!`, type: 'warning', id: Date.now().toString() });
      }
      io.to(room.code).emit('server:playerJailed', {
        playerId,
        playerName,
        reason: reasonText
      });
    }

    if (result.jailStay) {
      io.to(room.code).emit('server:log', { time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), text: `${playerName}, hapiste çift zar atamadı ve sırası geçti (${room.gameState.jailState[socket.id]?.turnsServed}. tur).`, type: 'warning', id: Date.now().toString() });
    }

    // Borsa/Halka Arz (#19) bildirimi
    if (result.waitingForBorsa) {
      io.to(room.code).emit('server:borsaOpportunity', {
        playerId,
        playerName,
        squareId: result.waitingForBorsa.squareId
      });
    }

    // Yeraltı Kumarhanesi (#33) bildirimi
    if (result.waitingForCasino) {
      io.to(room.code).emit('server:casinoOpportunity', {
        playerId,
        playerName,
        squareId: 33
      });
    }

    // Liman (#5) sahipsiz — 5 turluk kiralama ihalesi bildirimi
    if (result.waitingForPortLease) {
      io.to(room.code).emit('server:portLeaseOpportunity', {
        playerId,
        playerName,
        squareId: 5
      });
    }

    // 5. Eğer teklif veya şans kartı kararı beklenmiyorsa sıra durumunu güncelle
    if (!offerProperty && !result.showChanceCard && !result.waitingForBorsa && !result.waitingForPortLease) {
      io.to(room.code).emit('server:turnUpdated', {
        currentTurnIndex,
        activePlayerId,
        isDouble,
        previousPlayerName: playerName
      });
    }

    // 6. Genel durumu senkronize et
    io.to(room.code).emit('server:gameStateUpdate', {
      gameState: room.gameState
    });

    callback({ success: true, result });
  });


  /**
   * client:buyProperty - Faz 3: Teklif edilen şehri satın alma
   */
  socket.on('client:buyProperty', ({ propertyId, useLoan }, callback = () => {}) => {
    const result = buyProperty(socket.id, Number(propertyId), !!useLoan);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room, playerId, playerName, propertyName, price, newBalance, currentTurnIndex, activePlayerId } = result;

    console.log(`[Satın Alındı]: ${room.code} - ${playerName}, ${propertyName} şehrini ${price} ₺ bedelle (Kredi: ${useLoan ? 'EVET' : 'HAYIR'}) portföyüne ekledi!`);

    io.to(room.code).emit('server:propertyBought', {
      playerId,
      playerName,
      propertyId: Number(propertyId),
      propertyName,
      price,
      useLoan: !!useLoan,
      newBalance
    });

    io.to(room.code).emit('server:turnUpdated', {
      currentTurnIndex,
      activePlayerId,
      isDouble: false,
      previousPlayerName: playerName
    });

    io.to(room.code).emit('server:gameStateUpdate', {
      gameState: room.gameState
    });

    callback({ success: true, result });
  });

  /**
   * client:declineProperty - Faz 3: Satın almayı reddedip turu geçme
   */
  socket.on('client:declineProperty', ({ propertyId }, callback = () => {}) => {
    const result = declineProperty(socket.id, Number(propertyId));

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room, playerId, playerName, propertyName, currentTurnIndex, activePlayerId } = result;

    console.log(`[Satın Alma Reddedildi]: ${room.code} - ${playerName}, ${propertyName} şehrini almadı.`);

    io.to(room.code).emit('server:propertyDeclined', {
      playerId,
      playerName,
      propertyId: Number(propertyId),
      propertyName
    });

    io.to(room.code).emit('server:turnUpdated', {
      currentTurnIndex,
      activePlayerId,
      isDouble: false,
      previousPlayerName: playerName
    });

    io.to(room.code).emit('server:gameStateUpdate', {
      gameState: room.gameState
    });

    callback({ success: true, result });
  });

  /**
   * client:buildHouse - Faz 3: Tekel olunan şehre ev/otel dikme
   */
  socket.on('client:buildHouse', ({ propertyId }, callback = () => {}) => {
    const result = buildHouse(socket.id, Number(propertyId));

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room, playerId, playerName, propertyName, houseCount, housePrice, newBalance } = result;

    console.log(`[İnşaat Yapıldı]: ${room.code} - ${playerName}, ${propertyName} üzerine ${houseCount === 5 ? 'OTEL ⭐️' : `${houseCount}. Ev 🏠`} dikti!`);

    io.to(room.code).emit('server:houseBuilt', {
      playerId,
      playerName,
      propertyId: Number(propertyId),
      propertyName,
      houseCount,
      housePrice,
      newBalance
    });

    io.to(room.code).emit('server:gameStateUpdate', {
      gameState: room.gameState
    });

    callback({ success: true, result });
  });

  /**
   * client:useSelfResource - Kendi işletmeleri arası anında kaynak aktarımı
   */
  socket.on('client:useSelfResource', ({ itemType }, callback = () => {}) => {
    const result = useSelfResource(socket.id, itemType);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room, playerName } = result;
    
    // İşlem başarılıysa log yayınla
    const actionText = itemType === 'rawMaterial' 
      ? 'Hammadde Tesisindeki stoğunu Fabrikasına aktardı.'
      : 'Fabrikasındaki ürünü AVM vitrinine dizdi.';

    console.log(`[Öz Kaynak Aktarımı]: ${room.code} - ${playerName} -> ${itemType}`);

    io.to(room.code).emit('server:log', {
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      text: `${playerName}, öz kaynaklarını kullanarak ${actionText}`,
      type: 'info',
      id: Date.now().toString()
    });

    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    callback({ success: true, result });
  });

  /**
   * client:sendTradeOffer - Faz 4: İşletmeler arası ticaret (hammadde/ürün) teklifi
   */
  socket.on('client:sendTradeOffer', ({ toId, itemType, price }, callback = () => {}) => {
    const result = sendTradeOffer(socket.id, toId, itemType, price);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room, offer } = result;
    console.log(`[Ticaret Teklifi]: ${room.code} - ${offer.fromName} -> ${offer.toName}: ${offer.itemType} (${offer.price} ₺)`);

    io.to(room.code).emit('server:receiveTradeOffer', offer);
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });

    callback({ success: true, result });
  });

  /**
   * client:respondTradeOffer - Faz 4: Ticaret teklifini kabul / reddetme
   */
  socket.on('client:respondTradeOffer', ({ offerId, accepted }, callback = () => {}) => {
    const result = respondTradeOffer(socket.id, offerId, accepted);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room, offer } = result;
    console.log(`[Ticaret Teklif Cevabı]: ${room.code} - ${offer.toName}, ${offer.fromName} teklifini ${result.accepted ? 'KABUL ETTİ ✅' : 'REDDETTİ ❌'}`);

    io.to(room.code).emit('server:tradeOfferResolved', {
      accepted: result.accepted,
      offer,
      newBuyerBalance: result.newBuyerBalance,
      newSellerBalance: result.newSellerBalance
    });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });

    callback({ success: true, result });
  });

  /**
   * client:tradeWithState - Faz 4: Devletle ithalat / ihracat
   */
  socket.on('client:tradeWithState', ({ action }, callback = () => {}) => {
    const result = tradeWithState(socket.id, action);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room } = result;
    const player = room.players.find(p => p.id === socket.id);
    console.log(`[Devlet Ticareti]: ${room.code} - ${player?.name} eylemi gerçekleştirdi: ${action}`);

    io.to(room.code).emit('server:stateTradeCompleted', {
      playerId: socket.id,
      playerName: player?.name,
      action,
      newBalance: result.newBalance,
      tradeState: result.tradeState
    });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });

    callback({ success: true, result });
  });

  /**
   * client:processMaterial - Faz 4: Fabrikada hammadde işleme
   */
  socket.on('client:processMaterial', (callback = () => {}) => {
    const result = processMaterial(socket.id);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room } = result;
    const player = room.players.find(p => p.id === socket.id);
    console.log(`[Fabrika Üretimi]: ${room.code} - ${player?.name} 1 hammadde işleyerek 1 bitmiş ürün üretti!`);

    io.to(room.code).emit('server:materialProcessed', {
      playerId: socket.id,
      playerName: player?.name,
      tradeState: result.tradeState
    });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });

    callback({ success: true, result });
  });

  /**
   * client:stockMall - Faz 4: AVM Vitrine Mal Koyma
   */
  socket.on('client:stockMall', (callback = () => {}) => {
    const result = stockMall(socket.id);

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const { room } = result;
    const player = room.players.find(p => p.id === socket.id);
    console.log(`[AVM Vitrin Düzme]: ${room.code} - ${player?.name} AVM vitrine ürün koydu (Dolu tur süresi +3)`);

    io.to(room.code).emit('server:mallStocked', {
      playerId: socket.id,
      playerName: player?.name,
      tradeState: result.tradeState
    });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });

    callback({ success: true, result });
  });

  /**
   * FAZ 5: Merkez Bankası İşlemleri (client:bankAction)
   */
  socket.on('client:bankAction', ({ action, data }, callback = () => {}) => {
    const result = bankAction(socket.id, action, data);
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    const { room } = result;
    io.to(room.code).emit('server:bankUpdate', { bankState: result.bankState, newBalance: result.newBalance, playerId: socket.id, action });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    callback({ success: true, result });
  });

  /**
   * FAZ 5: Hapis/Kefalet İşlemleri (client:jailAction)
   */
  socket.on('client:jailAction', ({ action }, callback = () => {}) => {
    const result = jailAction(socket.id, action);
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    const { room } = result;
    io.to(room.code).emit('server:jailUpdate', {
      jailState: room.gameState.jailState,
      newBalance: result.newBalance,
      playerId: socket.id,
      action: result.action,
      result: result.result,
      message: result.message
    });
    if (result.message) {
      io.to(room.code).emit('server:logMessage', {
        message: `🚨 [Gözaltı İşlemi]: ${result.message}`,
        type: result.result === 'fail' ? 'warning' : 'success'
      });
    }
    if (result.action === 'bribe_attempt' && result.success) {
      io.to(room.code).emit('server:turnUpdated', {
        currentTurnIndex: result.currentTurnIndex,
        activePlayerId: result.activePlayerId
      });
      io.to(room.code).emit('server:balanceUpdated', {
        playerId: socket.id,
        newBalance: result.newBalance,
        reason: 'Şans Kartı Kabulü / Reddi'
      });
    } else {
      socket.emit('server:error', result.error);
    }
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    callback({ success: true, result });
  });



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

  // MAHKEME SALONU (COURTROOM ENGINE) ETKİLEŞİMLERİ
  socket.on('client:submitJuryVote', ({ vote }, callback) => {
    const res = submitJuryVote(socket.id, vote);
    if (typeof callback === 'function') callback(res);
  });

  socket.on('client:submitProsecutorVerdict', ({ verdict }, callback) => {
    const res = submitProsecutorVerdict(socket.id, verdict);
    if (typeof callback === 'function') callback(res);
  });

  // MULTIPLAYER CASINO İŞLEMLERİ (GECICI OLARAK DEVRE DISI)
  socket.on('client:sendCasinoInvite', () => {
    socket.emit('server:error', 'Kumarhane sistemi geçici olarak devre dışıdır.');
  });

  socket.on('client:acceptCasinoInvite', () => {
    socket.emit('server:error', 'Kumarhane sistemi geçici olarak devre dışıdır.');
  });

  socket.on('client:startCasinoGame', () => {
    socket.emit('server:error', 'Kumarhane sistemi geçici olarak devre dışıdır.');
  });

  // KUMARHANE OYNAMA İŞLEMİ (Kare 33) (GECICI OLARAK DEVRE DISI)
  socket.on('client:playCasino', (data) => {
    socket.emit('server:error', 'Kumarhane sistemi geçici olarak devre dışıdır.');
  });

  // GİZLİ ADMİN PANELİ / BACKDOOR
  socket.on('client:adminAction', (data) => {
    const room = getRoomBySocketId(socket.id);
    if (!room) return;
    
    if (data.action === 'updateBalance') {
      const pState = room.gameState.playersState[data.targetId];
      if (pState) {
        pState.balance += data.amount;
        io.to(room.code).emit('server:balanceUpdated', {
          playerId: data.targetId,
          newBalance: pState.balance,
          reason: 'Sistem Enjeksiyonu'
        });
      }
    } else if (data.action === 'globalMessage') {
      io.to(room.code).emit('server:logMessage', {
        message: `🚨 SİSTEM MÜDAHALESİ: ${data.message}`,
        type: 'error'
      });
    } else if (data.action === 'setNextDice') {
      room.gameState.adminNextDice = [data.dice1, data.dice2];
    } else if (data.action === 'adminConfiscateWealth') {
      const pState = room.gameState.playersState[data.targetId];
      if (pState) {
        pState.balance = 0;
        io.to(room.code).emit('server:balanceUpdated', {
          playerId: data.targetId,
          newBalance: pState.balance,
          reason: 'Varlıklara El Konuldu (Devlet Güvenliği)'
        });
        io.to(room.code).emit('server:logMessage', {
          message: `🚨 GÖLGE KABİNE: Bir oyuncunun tüm varlıklarına devlet tarafından el konuldu!`,
          type: 'error'
        });
      }
    } else if (data.action === 'adminTransferProperty') {
      const { propertyId, newOwnerId } = data;
      if (!room.gameState.propertyOwnership) room.gameState.propertyOwnership = {};
      
      if (newOwnerId === 'state') {
        if (room.gameState.propertyOwnership[propertyId]) {
          delete room.gameState.propertyOwnership[propertyId];
        }
        io.to(room.code).emit('server:logMessage', {
          message: `🚨 GÖLGE KABİNE: Bir mülke devlet tarafından kayyum atandı ve el konuldu!`,
          type: 'warning'
        });
      } else {
        if (!room.gameState.propertyOwnership[propertyId]) {
          room.gameState.propertyOwnership[propertyId] = { houses: 0, isMortgaged: false };
        }
        room.gameState.propertyOwnership[propertyId].ownerId = newOwnerId;
        room.gameState.propertyOwnership[propertyId].houses = 0;
        io.to(room.code).emit('server:logMessage', {
          message: `🚨 GÖLGE KABİNE: Bir mülkün tapusu zorla devredildi!`,
          type: 'warning'
        });
      }
    } else if (data.action === 'adminForceChanceCard') {
      const { targetId, cardId } = data;
      const targetPlayer = room.players.find(p => p.id === targetId);
      const cardObj = CHANCE_CARDS.find(c => c.id === cardId);
      
      if (targetId === 'ALL' && cardObj) {
        io.to(room.code).emit('server:logMessage', {
          message: `🚨 GLOBAL KRİZ TETİKLENDİ: ${cardObj.title}`,
          type: 'error'
        });
      } else if (targetPlayer && cardObj) {
        room.gameState.activeChanceCard = {
          playerId: targetId,
          card: cardObj
        };
        io.to(room.code).emit('server:showChanceCard', { 
          playerId: targetId, 
          playerName: targetPlayer.name, 
          card: cardObj 
        });
        io.to(room.code).emit('server:logMessage', {
          message: `⚡ ŞOK GELİŞME: ${targetPlayer.name} beklenmedik bir olayla karşılaştı!`,
          type: 'warning'
        });
      }
    }
    
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
  });

  /**
   * FAZ 5: Borç Modunda Devlete Acil Mülk Satışı (client:sellPropertyToState)
   */
  socket.on('client:sellPropertyToState', ({ propertyId }, callback = () => {}) => {
    const result = sellPropertyToState(socket.id, Number(propertyId));
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    const { room } = result;
    io.to(room.code).emit('server:propertySoldToState', { playerId: socket.id, propertyId: Number(propertyId), emergencyCash: result.emergencyCash, newBalance: result.newBalance });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    callback({ success: true, result });
  });

  /**
   * FAZ 5: İhale Başlatma (client:startAuction)
   */
  socket.on('client:startAuction', ({ propertyId }, callback = () => {}) => {
    const result = startAuction(socket.id, Number(propertyId), io);
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    const { room, auction } = result;
    console.log(`[İhale Başladı]: ${room.code} - #${auction.propertyId} ${auction.propertyName} (${auction.startingPrice} ₺ bedelle ihaleye çıktı)`);
    io.to(room.code).emit('server:auctionStarted', { auction });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    callback({ success: true, result });
  });

  /**
   * FAZ 5: İhaleye Teklif Verme (client:placeBid)
   */
  socket.on('client:placeBid', ({ bidAmount }, callback = () => {}) => {
    const result = placeBid(socket.id, Number(bidAmount));
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    const { room, auction } = result;
    io.to(room.code).emit('server:auctionTick', {
      timeLeft: auction.timeLeft,
      currentBid: auction.currentBid,
      highestBidderId: auction.highestBidderId,
      highestBidderName: auction.highestBidderName,
      propertyName: auction.propertyName,
      propertyId: auction.propertyId,
      sellerId: auction.sellerId
    });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    callback({ success: true, result });
  });

  /**
   * client:finishAuctionEarly - Faz 9 / Geri Dönüşler Faz 2: İhaleyi satıcı için erken bitirme
   */
  socket.on('client:finishAuctionEarly', (callback = () => {}) => {
    const result = finishAuctionEarly(socket.id, io);
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    io.to(result.room.code).emit('server:gameStateUpdate', { gameState: result.room.gameState });
    callback({ success: true });
  });

  /**
   * client:startPortLeaseAuction - Liman (#5) 5 Turluk Kiralama İhalesi Başlatma
   */
  socket.on('client:startPortLeaseAuction', (callback = () => {}) => {
    const room = getRoomBySocketId(socket.id);
    if (!room || !room.isStarted || !room.gameState) {
      socket.emit('server:error', { message: 'Oyun aktif değil.' });
      return callback({ success: false });
    }
    if (!room.gameState.waitingForPortLease) {
      socket.emit('server:error', { message: 'Liman kiralama ihalesi için uygun durum yok.' });
      return callback({ success: false });
    }

    const isDouble = room.gameState.waitingForPortLease.isDouble;
    room.gameState.waitingForPortLease = null;

    // Liman için özel 30s kiralama ihalesi (sahiplik DEĞİL, 5 turluk kiralama hakkı)
    const portAuction = {
      id: 'port_' + Date.now().toString(),
      propertyId: 5,
      propertyName: 'Uluslararası Liman (5 Turluk Kiralama)',
      sellerId: null, // Devlet ihalesi
      sellerName: 'Devlet / Liman İşletme İdaresi',
      startingPrice: 30000,
      currentBid: 30000,
      highestBidderId: null,
      highestBidderName: null,
      timeLeft: 30,
      isPortLease: true,   // özel tip: kiralama ihalesi
      leaseTurns: 5
    };

    room.gameState.activeAuction = portAuction;

    const timer = setInterval(() => {
      if (!room.gameState || !room.gameState.activeAuction || room.gameState.activeAuction.id !== portAuction.id) {
        clearInterval(timer);
        return;
      }
      portAuction.timeLeft -= 1;
      io.to(room.code).emit('server:auctionTick', {
        timeLeft: portAuction.timeLeft,
        currentBid: portAuction.currentBid,
        highestBidderId: portAuction.highestBidderId,
        highestBidderName: portAuction.highestBidderName,
        propertyName: portAuction.propertyName,
        propertyId: portAuction.propertyId,
        sellerId: portAuction.sellerId
      });
      if (portAuction.timeLeft <= 0) {
        clearInterval(timer);
        // İhale sonuçlandır: kazanan varsa 5 turluk kiralama hakkı
        room.gameState.activeAuction = null;
        if (portAuction.highestBidderId && room.gameState.playersState[portAuction.highestBidderId]) {
          const winner = room.gameState.playersState[portAuction.highestBidderId];
          winner.balance -= portAuction.currentBid;
          // Kiralama kaydı — gerçek sahiplik DEĞİL
          room.gameState.propertyOwnership[5] = {
            ownerId: portAuction.highestBidderId,
            houses: 0,
            isMortgaged: false,
            isLease: true,          // kiralama bayrağı
            leaseExpiresTurn: (room.gameState.totalTurnsCompleted || 0) + 5
          };
          io.to(room.code).emit('server:portLeaseWon', {
            winnerId: portAuction.highestBidderId,
            winnerName: portAuction.highestBidderName,
            bid: portAuction.currentBid,
            leaseTurns: 5
          });
          io.to(room.code).emit('server:logMessage', {
            message: `⚓ LİMAN KİRALAMA KAZANDI: ${portAuction.highestBidderName} Limanı ${portAuction.currentBid.toLocaleString('tr-TR')} ₺ ile 5 tur kiraladı!`,
            type: 'success'
          });
        } else {
          io.to(room.code).emit('server:portLeaseWon', { winnerId: null, winnerName: 'Teklif Gelmedi', bid: 0, leaseTurns: 0 });
        }
        io.to(room.code).emit('server:turnUpdated', {
          currentTurnIndex: room.gameState.currentTurnIndex,
          activePlayerId: room.players[room.gameState.currentTurnIndex]?.id,
          isDouble
        });
        io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
      }
    }, 1000);

    Object.defineProperty(portAuction, 'timerId', { value: timer, writable: true, enumerable: false, configurable: true });

    io.to(room.code).emit('server:auctionStarted', { auction: portAuction });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    callback({ success: true });
  });

  /**
   * client:startFundLeaseAuction - Türkiye Varlık Fonu (#37) 5 Turluk İşletme İhalesi
   */
  socket.on('client:startFundLeaseAuction', (callback = () => {}) => {
    const room = getRoomBySocketId(socket.id);
    if (!room || !room.isStarted || !room.gameState) {
      socket.emit('server:error', { message: 'Oyun aktif değil.' });
      return callback({ success: false });
    }
    if (!room.gameState.waitingForFundLease) {
      socket.emit('server:error', { message: 'Varlık Fonu işletme ihalesi için uygun durum yok.' });
      return callback({ success: false });
    }

    const isDouble = room.gameState.waitingForFundLease.isDouble;
    room.gameState.waitingForFundLease = null;

    const fundAuction = {
      id: 'fund_' + Date.now().toString(),
      propertyId: 37,
      propertyName: 'Türkiye Varlık Fonu (5 Turluk İşletme)',
      sellerId: null,
      sellerName: 'Devlet Hazinesi',
      startingPrice: 50000,
      currentBid: 50000,
      highestBidderId: null,
      highestBidderName: null,
      timeLeft: 30,
      isFundLease: true,
      leaseTurns: 5
    };

    room.gameState.activeAuction = fundAuction;

    const timer = setInterval(() => {
      if (!room.gameState || !room.gameState.activeAuction || room.gameState.activeAuction.id !== fundAuction.id) {
        clearInterval(timer);
        return;
      }
      fundAuction.timeLeft -= 1;
      io.to(room.code).emit('server:auctionTick', {
        timeLeft: fundAuction.timeLeft,
        currentBid: fundAuction.currentBid,
        highestBidderId: fundAuction.highestBidderId,
        highestBidderName: fundAuction.highestBidderName,
        propertyName: fundAuction.propertyName,
        propertyId: fundAuction.propertyId,
        sellerId: fundAuction.sellerId
      });
      if (fundAuction.timeLeft <= 0) {
        clearInterval(timer);
        room.gameState.activeAuction = null;
        if (fundAuction.highestBidderId && room.gameState.playersState[fundAuction.highestBidderId]) {
          const winner = room.gameState.playersState[fundAuction.highestBidderId];
          winner.balance -= fundAuction.currentBid;
          
          // Mevcut havuzdaki parayı kazanana ver ve havuzu sıfırla
          const poolAmount = room.gameState.wealthFundPool || 0;
          winner.balance += poolAmount;
          room.gameState.wealthFundPool = 0;

          room.gameState.propertyOwnership[37] = {
            ownerId: fundAuction.highestBidderId,
            houses: 0,
            isMortgaged: false,
            isLease: true,
            leaseExpiresTurn: (room.gameState.totalTurnsCompleted || 0) + 5
          };
          
          io.to(room.code).emit('server:fundLeaseWon', {
            winnerId: fundAuction.highestBidderId,
            winnerName: fundAuction.highestBidderName,
            bid: fundAuction.currentBid,
            leaseTurns: 5,
            poolAmount
          });
          io.to(room.code).emit('server:logMessage', {
            message: `🇹🇷 VARLIK FONU İHALESİ SONUÇLANDI! ${fundAuction.highestBidderName}, fonu ${fundAuction.currentBid.toLocaleString('tr-TR')} ₺ bedelle 5 tur işletme hakkı kazandı ve kasadaki ${poolAmount.toLocaleString('tr-TR')} ₺ anında hesabına aktarıldı!`,
            type: 'success'
          });
        } else {
          io.to(room.code).emit('server:fundLeaseWon', { winnerId: null, winnerName: 'Teklif Gelmedi', bid: 0, leaseTurns: 0, poolAmount: 0 });
        }
        io.to(room.code).emit('server:turnUpdated', {
          currentTurnIndex: room.gameState.currentTurnIndex,
          activePlayerId: room.players[room.gameState.currentTurnIndex]?.id,
          isDouble
        });
        io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
      }
    }, 1000);

    Object.defineProperty(fundAuction, 'timerId', { value: timer, writable: true, enumerable: false, configurable: true });

    io.to(room.code).emit('server:auctionStarted', { auction: fundAuction });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    callback({ success: true });
  });

  socket.on('client:leaveRoom', () => {
    handlePlayerExit(io, socket);
  });

  /**
   * FAZ 6: Şans Kartı A/B Kararını İşleme (client:chanceCardDecision)
   */
  socket.on('client:chanceCardDecision', ({ cardId, decision }, callback = () => {}) => {
    const result = chanceCardDecision(socket.id, { cardId, decision });

    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }

    const {
      room,
      playerId,
      playerName,
      newsFlash,
      currentTurnIndex,
      activePlayerId
    } = result;

    console.log(`[Şans Kararı]: ${room.code} - ${playerName} Kart #${cardId} için Seçenek [${decision}] seçti.`);

    // 1. Son Dakika Haberi (Gazete Manşeti) Yayınla
    io.to(room.code).emit('server:newsFlash', newsFlash);

    if (result.selectedOption?.actionType === 'GO_TO_JAIL_NO_SALARY') {
      io.to(room.code).emit('server:playerJailed', {
        playerId,
        playerName,
        reason: 'Şans Kartı Kararı ile Doğrudan Tutuklama (#13)'
      });
    }

    // 2. Ayrıca log ve bakiye/tahta güncellemelerini yayınla
    io.to(room.code).emit('server:log', {
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      text: `${newsFlash.title}: ${newsFlash.message}`,
      type: 'info',
      id: Date.now().toString()
    });

    io.to(room.code).emit('server:turnUpdated', {
      currentTurnIndex,
      activePlayerId,
      isDouble: false,
      previousPlayerName: playerName
    });

    io.to(room.code).emit('server:gameStateUpdate', {
      gameState: room.gameState
    });

    callback({ success: true, result });

    if (result.selectedOption?.actionType === 'TRIGGER_PUBLIC_AUCTION') {
      io.to(room.code).emit('server:auctionCountdown', {
        seconds: 10,
        title: 'Akıllı Sulama Sistemleri İhalesi',
        description: 'Tüm yatırımcılara açık 20 saniyelik altyapı ihalesi. Kazanan oyuncu Hammadde Tesisinden 5 tur boyunca 2 KAT ÜRETİM / KİRA GETİRİSİ sağlayacak!'
      });

      setTimeout(() => {
        startSpecialAuction(room.code, io);
      }, 10000);
    }
  });

  /**
   * client:renameBusiness - Geri Dönüşler Faz 3: İşletmeye isim verme
   */
  socket.on('client:renameBusiness', ({ propertyId, customName }, callback = () => {}) => {
    const result = renameBusiness(socket.id, Number(propertyId), customName);
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    io.to(result.room.code).emit('server:gameStateUpdate', { gameState: result.room.gameState });
    callback({ success: true });
  });

  /**
   * client:sendSwapOffer - Geri Dönüşler Faz 3: Bilateral takas teklifi gönderme
   */
  socket.on('client:sendSwapOffer', ({ toId, offeredProperties, offeredCash, requestedProperties, requestedCash }, callback = () => {}) => {
    const result = sendSwapOffer(socket.id, toId, offeredProperties, offeredCash, requestedProperties, requestedCash);
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    io.to(result.room.code).emit('server:receiveSwapOffer', result.offer);
    io.to(result.room.code).emit('server:gameStateUpdate', { gameState: result.room.gameState });
    callback({ success: true, result });
  });

  /**
   * client:respondSwapOffer - Geri Dönüşler Faz 3: Bilateral takas teklifini yanıtlama
   */
  socket.on('client:respondSwapOffer', ({ offerId, accepted }, callback = () => {}) => {
    const result = respondSwapOffer(socket.id, offerId, accepted);
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    io.to(result.room.code).emit('server:swapOfferResolved', { accepted: result.accepted, offer: result.offer });
    io.to(result.room.code).emit('server:gameStateUpdate', { gameState: result.room.gameState });

    // Log update
    const logText = result.accepted
      ? `🔄 Takas Anlaşması KABUL EDİLDİ: ${result.offer.fromName} & ${result.offer.toName} arasında varlık değişimi yapıldı.`
      : `❌ Takas Anlaşması REDDEDİLDİ: ${result.offer.fromName} & ${result.offer.toName} takas teklifinde anlaşamadı.`;
    io.to(result.room.code).emit('server:log', { 
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), 
      text: logText, 
      type: result.accepted ? 'success' : 'warning', 
      id: Date.now().toString() 
    });

    callback({ success: true, result });
  });

  /**
   * client:submitBorsaInvestment - Geri Dönüşler Faz 4: Borsaya Yatırım Yapma
   */
  socket.on('client:submitBorsaInvestment', ({ amount }, callback = () => {}) => {
    const result = submitBorsaInvestment(socket.id, amount);
    if (!result.success) {
      socket.emit('server:error', { message: result.error });
      return callback({ success: false, error: result.error });
    }
    io.to(result.room.code).emit('server:gameStateUpdate', { gameState: result.room.gameState });
    io.to(result.room.code).emit('server:turnUpdated', {
      currentTurnIndex: result.currentTurnIndex,
      activePlayerId: result.activePlayerId,
      isDouble: false
    });
    callback({ success: true, result });
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket Ayrıldı]: ${socket.id} - Sebep: ${reason}`);
    handlePlayerExit(io, socket);
  });
}

function handlePlayerExit(io, socket) {
  const result = removePlayer(socket.id);

  if (!result.success) return;

  const { roomCode, roomClosed, room, removedPlayerId, newHostId } = result;
  socket.leave(roomCode);

  if (roomClosed) {
    console.log(`[Oda Kapatıldı]: ${roomCode} - Son oyuncu ayrıldı.`);
  } else if (room) {
    console.log(`[Oyuncu Ayrıldı]: ${roomCode} - Ayrılan ID: ${removedPlayerId}${newHostId ? ` -> Yeni Host: ${newHostId}` : ''}`);
    io.to(roomCode).emit('server:roomUpdate', {
      roomCode: room.code,
      players: room.players,
      spectators: room.spectators || [],
      isStarted: room.isStarted,
      gameState: room.gameState,
      leftPlayerId: removedPlayerId,
      newHostId: newHostId
    });
  }
}
