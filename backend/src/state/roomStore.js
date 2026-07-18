import { PAWN_COLORS, getRandomAvailableColor } from '../constants/colors.js';
import { BOARD_DATA } from '../constants/boardData.js';
import { CHANCE_CARDS } from '../constants/chanceCards.js';

/**
 * Bellek içi (In-Memory) Oda ve Oyuncu Yönetim Mağazası (Store)
 * odalar: Map<roomCode, RoomObject>
 * socketToRoom: Map<socketId, roomCode>
 */
const rooms = new Map();
const socketToRoom = new Map();

/**
 * 6 haneli benzersiz alfasayısal (A-Z, 0-9) oda kodu üretir.
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

export function createRoom(socketId, playerName, preferredColorId = null) {
  if (!playerName || !playerName.trim()) {
    return { success: false, error: 'Geçerli bir oyuncu ismi girmelisiniz.' };
  }

  if (socketToRoom.has(socketId)) {
    removePlayer(socketId);
  }

  const code = generateRoomCode();
  let color = null;
  if (preferredColorId) {
    color = PAWN_COLORS.find(c => c.id === preferredColorId);
  }
  if (!color) color = getRandomAvailableColor([]);
  
  const hostPlayer = {
    id: socketId,
    name: playerName.trim(),
    isHost: true,
    color
  };

  const newRoom = {
    code,
    players: [hostPlayer],
    isStarted: false,
    gameState: null,
    createdAt: new Date()
  };

  rooms.set(code, newRoom);
  socketToRoom.set(socketId, code);

  return { success: true, room: newRoom };
}

export function joinRoom(roomCode, socketId, playerName, preferredColorId = null) {
  if (!roomCode || !roomCode.trim()) {
    return { success: false, error: 'Oda kodu gereklidir.' };
  }
  if (!playerName || !playerName.trim()) {
    return { success: false, error: 'Geçerli bir oyuncu ismi girmelisiniz.' };
  }

  const code = roomCode.trim().toUpperCase();
  const room = rooms.get(code);

  if (!room) {
    return { success: false, error: 'Oda bulunamadı. Lütfen 6 haneli kodu kontrol edin.' };
  }

  if (room.isStarted) {
    return { success: false, error: 'Bu odada oyun çoktan başlamış. Odaya katılınamaz.' };
  }

  if (room.players.length >= 6) {
    return { success: false, error: 'Oda kapasitesi dolu (Maksimum 6 oyuncu).' };
  }

  const existingPlayer = room.players.find(p => p.id === socketId);
  if (existingPlayer) {
    existingPlayer.name = playerName.trim();
    if (preferredColorId && !room.players.some(p => p.id !== socketId && p.color?.id === preferredColorId)) {
      const foundColor = PAWN_COLORS.find(c => c.id === preferredColorId);
      if (foundColor) existingPlayer.color = foundColor;
    }
    return { success: true, room };
  }

  if (socketToRoom.has(socketId)) {
    removePlayer(socketId);
  }

  const usedColorIds = room.players.map(p => p.color.id);
  let color = null;
  if (preferredColorId && !usedColorIds.includes(preferredColorId)) {
    color = PAWN_COLORS.find(c => c.id === preferredColorId);
  }
  if (!color) color = getRandomAvailableColor(usedColorIds);

  const newPlayer = {
    id: socketId,
    name: playerName.trim(),
    isHost: false,
    color
  };

  room.players.push(newPlayer);
  socketToRoom.set(socketId, code);

  return { success: true, room };
}

export function changePlayerColor(socketId, colorId) {
  const code = socketToRoom.get(socketId);
  if (!code) return { success: false, error: 'Oda bulunamadı.' };
  const room = rooms.get(code);
  if (!room) return { success: false, error: 'Oda bulunamadı.' };
  if (room.isStarted) return { success: false, error: 'Oyun başladıktan sonra renk değiştirilemez.' };

  const player = room.players.find(p => p.id === socketId);
  if (!player) return { success: false, error: 'Oyuncu bulunamadı.' };

  const usedColorIds = room.players.filter(p => p.id !== socketId).map(p => p.color.id);
  if (usedColorIds.includes(colorId)) {
    return { success: false, error: 'Bu renk başka bir oyuncu tarafından alınmış.' };
  }

  const newColor = PAWN_COLORS.find(c => c.id === colorId);
  if (!newColor) return { success: false, error: 'Geçersiz renk seçildi.' };

  player.color = newColor;
  return { success: true, room };
}

export function removePlayer(socketId) {
  const code = socketToRoom.get(socketId);
  if (!code) {
    return { success: false };
  }

  socketToRoom.delete(socketId);
  const room = rooms.get(code);
  if (!room) {
    return { success: false };
  }

  const removedPlayerIndex = room.players.findIndex(p => p.id === socketId);
  if (removedPlayerIndex === -1) {
    return { success: false };
  }

  const [removedPlayer] = room.players.splice(removedPlayerIndex, 1);
  const wasHost = removedPlayer.isHost;

  if (room.players.length === 0) {
    rooms.delete(code);
    return {
      success: true,
      roomCode: code,
      roomClosed: true,
      removedPlayerId: socketId
    };
  }

  let newHostId = null;
  if (wasHost && room.players.length > 0) {
    room.players[0].isHost = true;
    newHostId = room.players[0].id;
  }

  if (room.gameState && room.gameState.playersState[socketId]) {
    delete room.gameState.playersState[socketId];
    // Sahip olunan mülkleri serbest bırak (sahipliğini kaldır)
    Object.keys(room.gameState.propertyOwnership || {}).forEach(propId => {
      if (room.gameState.propertyOwnership[propId]?.ownerId === socketId) {
        delete room.gameState.propertyOwnership[propId];
      }
    });

    if (removedPlayerIndex < room.gameState.currentTurnIndex) {
      room.gameState.currentTurnIndex = Math.max(0, room.gameState.currentTurnIndex - 1);
    } else if (room.gameState.currentTurnIndex >= room.players.length) {
      room.gameState.currentTurnIndex = 0;
    }
  }

  return {
    success: true,
    roomCode: code,
    roomClosed: false,
    room,
    removedPlayerId: socketId,
    newHostId
  };
}

export function getRoomBySocketId(socketId) {
  const code = socketToRoom.get(socketId);
  return code ? rooms.get(code) || null : null;
}

export function getRoom(roomCode) {
  if (!roomCode) return null;
  return rooms.get(roomCode.trim().toUpperCase()) || null;
}

/**
 * Host tarafından oyunu başlatır ve Faz 3/4 Çekirdek Oyun, Ticaret & Mülkiyet durumunu (gameState) kurar.
 */
export function startGame(socketId) {
  const room = getRoomBySocketId(socketId);
  if (!room) {
    return { success: false, error: 'Herhangi bir odada bulunmuyorsunuz.' };
  }

  const player = room.players.find(p => p.id === socketId);
  if (!player || !player.isHost) {
    return { success: false, error: 'Oyunu sadece oda kurucusu (Host) başlatabilir.' };
  }

  if (room.players.length < 2) {
    return { success: false, error: 'Oyunu başlatmak için odada en az 2 oyuncu olmalıdır.' };
  }

  room.isStarted = true;

  const playersState = {};
  const bankState = {};
  const jailState = {};

  room.players.forEach(p => {
    playersState[p.id] = {
      balance: 250000,
      position: 0,
      totalAssetValue: 0
    };
    bankState[p.id] = {
      deposit: 0,
      loans: []
    };
    jailState[p.id] = {
      inJail: false,
      turnsServed: 0
    };
  });

  room.gameState = {
    boardData: BOARD_DATA,
    currentTurnIndex: 0,
    playersState,
    propertyOwnership: {}, // { [propertyId]: { ownerId: "socketId", houses: 0 } }
    waitingForPropertyDecision: null, // { playerId, propertyId, isDouble }
    tradeState: {
      15: { stock: 0 }, // Hammaddeci: üretilen hammadde miktarı (Yeni ID: 15)
      24: { rawMaterialStock: 0, productStock: 0 }, // Fabrikacı: hammadde ve ürün stokları (Yeni ID: 24)
      35: { productStock: 0, activeStockTurns: 0 } // AVM: depodaki ürün ve vitrin doluluk turu (ID: 35)
    },
    activeTradeOffer: null, // { id, fromId, fromName, toId, toName, itemType, price }
    bankState,
    jailState,
    activeAuction: null,
    interestRate: 5, // Merkez Bankası baz faiz oranı (Dinamik %3 - %8)
    wealthFundPool: 0, // Türkiye Varlık Fonu (ID 37) Devlet Kasası Havuzu
    auctionCooldown: 0, // Dinamik İhale Soğuma Süresi
    marketSaturationTarget: null, // Dinamik İhale Hedefi
    marketSaturationTurns: 0 // Dinamik İhale Şartlarının Sağlandığı Tur Sayısı
  };

  return { success: true, room };
}

/**
 * Oyuncunun toplam varlık değerini (totalAssetValue) mülk ve ev maliyetlerine göre dinamik hesaplar
 */
export function calculatePlayerTotalAssetValue(room, playerId) {
  if (!room || !room.gameState) return 0;
  const ownership = room.gameState.propertyOwnership || {};
  let total = 0;

  Object.entries(ownership).forEach(([propId, data]) => {
    if (data && data.ownerId === playerId) {
      const square = BOARD_DATA.find(s => s.id === Number(propId));
      if (square) {
        total += (square.price || 0) + (data.houses || 0) * (square.housePrice || 0);
      }
    }
  });

  if (room.gameState.playersState[playerId]) {
    room.gameState.playersState[playerId].totalAssetValue = total;
  }
  return total;
}

/**
 * Bir oyuncunun belirtilen renk grubundaki TÜM mülklere sahip olup olmadığını (Tekel / Monopoly) kontrol eder
 */
export function checkGroupMonopoly(room, playerId, groupName) {
  if (!room || !room.gameState || !groupName) return false;
  const groupSquares = BOARD_DATA.filter(s => s.type === 'property' && s.group === groupName);
  if (groupSquares.length === 0) return false;

  return groupSquares.every(s => room.gameState.propertyOwnership[s.id]?.ownerId === playerId);
}

/**
 * Tur sırasını bir sonraki oyuncuya geçirir ve Otomatik Üretim, Şans Kartı Buffları, ile Bileşik Faizleri işletir.
 */
export function advanceToNextTurn(room, isDouble) {
  if (!room || !room.gameState || !room.players || room.players.length === 0) return;

  if (!isDouble) {
    room.gameState.currentTurnIndex = (room.gameState.currentTurnIndex + 1) % room.players.length;
    room.gameState.stateTradeUsedThisTurn = {};
    room.gameState.totalTurnsCompleted = (room.gameState.totalTurnsCompleted || 0) + 1;

    // Kiralık mülklerin süresinin dolup dolmadığını kontrol et
    if (room.gameState.propertyOwnership) {
      Object.entries(room.gameState.propertyOwnership).forEach(([propId, info]) => {
        if (info.isLease && room.gameState.totalTurnsCompleted >= info.leaseExpiresTurn) {
          delete room.gameState.propertyOwnership[propId];
          const io = room.ioInstance;
          if (io) {
            io.to(room.code).emit('server:logMessage', {
              message: `⚓ LİMAN SÖZLEŞMESİ BİTTİ: Uluslararası Liman (#5) kiralama süresi sona erdi ve tekrar sahipsiz kaldı!`,
              type: 'warning'
            });
          }
        }
      });
    }

    const roundsCompleted = Math.floor(room.gameState.totalTurnsCompleted / room.players.length);

    // Yeni Dinamik İhale Sistemi (Piyasa Doygunluğu Algoritması)
    if (roundsCompleted >= 5) {
      if (room.gameState.auctionCooldown > 0) {
        room.gameState.auctionCooldown -= 1;
      } else if (!room.gameState.activeAuction && (!room.gameState.autoAuctionQueue || room.gameState.autoAuctionQueue.length === 0)) {
        const unownedSpecialProps = [5, 15, 24, 29, 35].filter(id => !room.gameState.propertyOwnership?.[id]);
        
        if (unownedSpecialProps.length > 0) {
          const targetId = room.gameState.marketSaturationTarget || unownedSpecialProps[0];
          if (!unownedSpecialProps.includes(targetId)) {
            room.gameState.marketSaturationTarget = unownedSpecialProps[0];
            room.gameState.marketSaturationTurns = 0;
          } else {
            room.gameState.marketSaturationTarget = targetId;
            const targetSquare = BOARD_DATA.find(s => s.id === targetId);
            const targetPrice = targetSquare?.price || 150000;
            
            let playersWithEnoughCash = 0;
            room.players.forEach(p => {
              if ((room.gameState.playersState[p.id]?.balance || 0) >= targetPrice) {
                playersWithEnoughCash++;
              }
            });

            if (playersWithEnoughCash >= 2) {
              room.gameState.marketSaturationTurns = (room.gameState.marketSaturationTurns || 0) + 1;
              if (room.gameState.marketSaturationTurns >= 2 * room.players.length) {
                room.gameState.auctionCooldown = 5 * room.players.length;
                room.gameState.marketSaturationTurns = 0;
                
                room.gameState.autoAuctionQueue = [targetId];
                const io = room.ioInstance;
                if (io) {
                  io.to(room.code).emit('server:logMessage', {
                    message: `⚡ [PİYASA DOYGUNLUĞU]: Piyasadaki nakit bolluğu nedeniyle sahipsiz ${targetSquare.name} için zorunlu açık ihale başlatılıyor!`,
                    type: 'warning'
                  });
                  io.to(room.code).emit('server:autoAuctionNotice', {
                    message: `Piyasa Doygunluğu İhalesi: ${targetSquare.name} ihalesi başlıyor!`
                  });
                }
                setTimeout(() => {
                  startNextAutoAuction(room, room.ioInstance);
                }, 3000);
              }
            } else {
              room.gameState.marketSaturationTurns = 0;
            }
          }
        }
      }
    }
  }

  const nextActivePlayer = room.players[room.gameState.currentTurnIndex];
  if (!nextActivePlayer) return;

  // Sadece tur yeni oyuncuya geçtiğinde (çift zar atıp aynı oyuncuda kalmadıysa) tur başı mekaniklerini uygula
  if (!isDouble) {
    // 0. Borsa Yatırımları Geri Sayımı
    if (room.gameState.borsaInvestments) {
      room.gameState.borsaInvestments.forEach(inv => {
        if (inv.playerId === nextActivePlayer.id) {
          inv.turnsLeft -= 1;
          if (inv.turnsLeft <= 0) {
            const win = Math.random() < 0.55;
            const playerState = room.gameState.playersState[inv.playerId];
            if (playerState) {
              if (win) {
                const payout = inv.amount * 2;
                playerState.balance += payout;
                room.gameState.gameLogs = room.gameState.gameLogs || [];
                room.gameState.gameLogs.push({
                  id: Date.now().toString() + Math.random().toString(),
                  text: `📈 BORSA SONUCU: ${nextActivePlayer.name} %55 ihtimalle kazandı! Yatırdığı ${inv.amount.toLocaleString('tr-TR')} ₺ ikiye katlanarak ${payout.toLocaleString('tr-TR')} ₺ olarak kasasına döndü.`,
                  type: 'success',
                  time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                });
              } else {
                const refund = Math.round(inv.amount * 0.5);
                playerState.balance += refund;
                room.gameState.gameLogs = room.gameState.gameLogs || [];
                room.gameState.gameLogs.push({
                  id: Date.now().toString() + Math.random().toString(),
                  text: `📉 BORSA SONUCU: ${nextActivePlayer.name} %45 ihtimalle kaybetti! Yatırdığı ${inv.amount.toLocaleString('tr-TR')} ₺ değer kaybetti ve sadece ${refund.toLocaleString('tr-TR')} ₺ kurtarılarak iade edildi (Kayıp: -%50).`,
                  type: 'warning',
                  time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                });
              }
              calculatePlayerTotalAssetValue(room, inv.playerId);
            }
          }
        }
      });
      // Temizle
      room.gameState.borsaInvestments = room.gameState.borsaInvestments.filter(inv => inv.turnsLeft > 0);
    }

    // 1. Hammaddeci (ID 15) sahibi ise +1 stok otomatik artar
    if (room.gameState.propertyOwnership[15]?.ownerId === nextActivePlayer.id) {
      const buffs = room.gameState.chanceBuffs?.[nextActivePlayer.id] || {};
      if (!buffs.haltedFactoryTurns && !buffs.haltedBusinessTurns) {
        let produced = 1;
        if (buffs.irrigationTender && buffs.irrigationTender.turnsLeft > 0) {
          produced = 2;
        }
        if (room.gameState.tradeState?.[15]) {
          room.gameState.tradeState[15].stock = (room.gameState.tradeState[15].stock || 0) + produced;
        }
      }
    }
    // 2. AVM (ID 35) sahibi ise activeStockTurns 0'dan büyükse 1 azalır
    if (room.gameState.propertyOwnership[35]?.ownerId === nextActivePlayer.id) {
      const buffs = room.gameState.chanceBuffs?.[nextActivePlayer.id] || {};
      if (room.gameState.tradeState?.[35] && room.gameState.tradeState[35].activeStockTurns > 0) {
        if (!buffs.haltedBusinessTurns) {
          room.gameState.tradeState[35].activeStockTurns -= 1;
        }
      }
    }
    // 3. Şans Kartı Buff / Debuff Sürelerini Düşür ve Etkileri İşle
    if (room.gameState.chanceBuffs?.[nextActivePlayer.id]) {
      const buffs = room.gameState.chanceBuffs[nextActivePlayer.id];
      if (buffs.turnsLeft && buffs.turnsLeft > 0) {
        buffs.turnsLeft -= 1;
        if (buffs.turnsLeft <= 0 && !buffs.rentMultiplier && !buffs.earningsRatio && !buffs.qatarPartner) {
          delete room.gameState.chanceBuffs[nextActivePlayer.id];
        }
      }
      if (buffs.rentMultiplier && buffs.rentTurns > 0) {
        buffs.rentTurns -= 1;
        if (buffs.rentTurns <= 0) delete buffs.rentMultiplier;
      }
      if (buffs.earningsRatio && buffs.earningsTurns > 0) {
        buffs.earningsTurns -= 1;
        if (buffs.earningsTurns <= 0) delete buffs.earningsRatio;
      }
      if (buffs.taxImmunity && buffs.taxImmunityTurns > 0) {
        buffs.taxImmunityTurns -= 1;
        if (buffs.taxImmunityTurns <= 0) delete buffs.taxImmunity;
      }
      if (buffs.buildDiscount && buffs.buildDiscountTurns > 0) {
        buffs.buildDiscountTurns -= 1;
        if (buffs.buildDiscountTurns <= 0) delete buffs.buildDiscount;
      }
      if (buffs.penaltyRatio && buffs.penaltyRatioTurns > 0) {
        buffs.penaltyRatioTurns -= 1;
        if (buffs.penaltyRatioTurns <= 0) delete buffs.penaltyRatio;
      }
      if (buffs.tenderIncome && buffs.tenderIncomeTurns > 0) {
        buffs.tenderIncomeTurns -= 1;
        const pState = room.gameState.playersState[nextActivePlayer.id];
        if (pState) {
          let income = buffs.tenderIncome;
          if (buffs.earningsRatio) income = Math.round(income * buffs.earningsRatio);
          if (buffs.penaltyRatio) income = Math.round(income * (1 - buffs.penaltyRatio));
          pState.balance += income;
        }
        if (buffs.tenderIncomeTurns <= 0) delete buffs.tenderIncome;
      }
      if (buffs.haltedHotelTurns && buffs.haltedHotelTurns > 0) {
        buffs.haltedHotelTurns -= 1;
        if (buffs.haltedHotelTurns <= 0) delete buffs.haltedHotelTurns;
      }
      if (buffs.haltedBusinessTurns && buffs.haltedBusinessTurns > 0) {
        buffs.haltedBusinessTurns -= 1;
        if (buffs.haltedBusinessTurns <= 0) delete buffs.haltedBusinessTurns;
      }
      if (buffs.haltedFactoryTurns && buffs.haltedFactoryTurns > 0) {
        buffs.haltedFactoryTurns -= 1;
        if (buffs.haltedFactoryTurns <= 0) delete buffs.haltedFactoryTurns;
      }
      if (buffs.movieSetHalt && buffs.movieSetHalt > 0) {
        buffs.movieSetHalt -= 1;
        if (buffs.movieSetHalt <= 0) delete buffs.movieSetHalt;
      }
      if (buffs.irrigationTender && buffs.irrigationTender.turnsLeft > 0) {
        buffs.irrigationTender.turnsLeft -= 1;
        if (buffs.irrigationTender.turnsLeft <= 0) delete buffs.irrigationTender;
      }
      if (buffs.housingSupport) {
        if (buffs.housingSupport.level2Turns > 0) buffs.housingSupport.level2Turns -= 1;
        if (buffs.housingSupport.level3Turns > 0) buffs.housingSupport.level3Turns -= 1;
        if (buffs.housingSupport.level2Turns <= 0 && buffs.housingSupport.level3Turns <= 0) delete buffs.housingSupport;
      }
    }
    // 3.5. Faiz oranı dalgalanması (%30 ihtimalle)
    if (Math.random() < 0.30) {
      const oldRate = room.gameState.interestRate || 5;
      const newRate = Math.floor(Math.random() * 6) + 3; // 3 to 8
      if (oldRate !== newRate) {
        room.gameState.interestRate = newRate;
        const io = room.ioInstance;
        if (io) {
          io.to(room.code).emit('server:logMessage', {
            message: `🏦 MERKEZ BANKASI: Para Politikası Kurulu faiz oranını %${newRate} olarak güncelledi!`,
            type: 'info'
          });
        }
      }
    }

    // 4. FAZ 7: Bankacılık Bileşik Faiz (Compound Interest) İşletimi (Dinamik)
    const baseRate = room.gameState.interestRate || 5;
    if (room.gameState.bankState?.[nextActivePlayer.id]) {
      const bState = room.gameState.bankState[nextActivePlayer.id];
      if (bState.deposit > 0) {
        const oldDeposit = bState.deposit;
        bState.deposit = Math.round(bState.deposit * (1 + baseRate / 100));
        const diff = bState.deposit - oldDeposit;
        if (diff > 0 && room.ioInstance) {
          room.ioInstance.to(room.code).emit('server:logMessage', {
            message: `🏦 FAİZ TAHKİKİ: ${nextActivePlayer.name} mevduatından +${diff.toLocaleString('tr-TR')} ₺ bileşik faiz getirisi kazandı!`,
            type: 'success'
          });
        }
      }
      if (bState.loans && bState.loans.length > 0) {
        bState.loans.forEach(loan => {
          const rate = loan.isRemote ? (baseRate + 4) : baseRate;
          loan.repayAmount = Math.round(loan.repayAmount * (1 + rate / 100));
        });
      }
    }
  }
}

/**
 * Sırası gelen oyuncunun zar atması (Faz 2, Faz 3 & Faz 4: Kira, AVM Ayakbastı Kirası ve Satın Alma Kontrolü)
 */
export function rollDice(socketId) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil veya oda durumuna ulaşılamadı.' };
  }

  if (room.gameState.waitingForPropertyDecision) {
    return { success: false, error: 'Lütfen önce ekrandaki satın alma teklifine yanıt verin veya turu geçin!' };
  }

  if (room.gameState.activeTradeOffer && room.gameState.activeTradeOffer.toId === socketId) {
    return { success: false, error: 'Bekleyen bir ticaret teklifiniz var! Lütfen önce teklifi kabul veya reddedin.' };
  }

  const activePlayer = room.players[room.gameState.currentTurnIndex];
  if (!activePlayer || activePlayer.id !== socketId) {
    return { success: false, error: 'Sıra sizde değil, sadece sırası gelen aktif yatırımcı zar atabilir!' };
  }

  const playerState = room.gameState.playersState[socketId];
  if (!playerState) {
    return { success: false, error: 'Oyuncu durumu bulunamadı.' };
  }

  // Borç Modu (Debt Mode) Kontrolü
  if (playerState.balance < 0) {
    return { success: false, error: 'Borç Modundasınız! Turunuza devam etmek için önce borcunuzu ödemeli veya mülk satıp/ihaleye çıkarmalısınız.' };
  }

  let dice1 = Math.floor(Math.random() * 6) + 1;
  let dice2 = Math.floor(Math.random() * 6) + 1;

  if (room.gameState.adminNextDice) {
    dice1 = room.gameState.adminNextDice[0];
    dice2 = room.gameState.adminNextDice[1];
    room.gameState.adminNextDice = null;
  }

  const diceTotal = dice1 + dice2;
  const isDouble = dice1 === dice2;

  // Hapis (Jail) Kontrolü
  if (room.gameState.jailState?.[socketId]?.inJail) {
    const jailObj = room.gameState.jailState[socketId];
    if (isDouble) {
      jailObj.inJail = false;
      jailObj.turnsServed = 0;
      // Çift attığı için hapisten çıktı, normal ilerleme yapacak
    } else if ((jailObj.turnsServed || 0) >= 2) {
      // 3. turun sonu (2 tur önceden yatmıştı, bu 3. deneme)
      // Çift atamadı ama 3 tur dolduğu için kefaletsiz otomatik tahliye ediliyor ve ilerliyor!
      jailObj.inJail = false;
      jailObj.turnsServed = 0;
    } else {
      jailObj.turnsServed = (jailObj.turnsServed || 0) + 1;
      room.gameState.currentTurnIndex = (room.gameState.currentTurnIndex + 1) % room.players.length;
      const nextActivePlayerId = room.players[room.gameState.currentTurnIndex]?.id;
      return {
        success: true,
        room,
        playerId: socketId,
        playerName: activePlayer.name,
        dice: [dice1, dice2],
        diceTotal,
        oldPosition: playerState.position,
        newPosition: playerState.position,
        isDouble: false,
        jailStay: true,
        message: 'Hapistesiniz! Çift zar atamadığınız için çıkamadınız ve sıranız geçti.',
        newBalance: playerState.balance,
        currentTurnIndex: room.gameState.currentTurnIndex,
        activePlayerId: nextActivePlayerId
      };
    }
  }

  const oldPosition = playerState.position;
  const newPosition = (oldPosition + diceTotal) % 40;
  playerState.position = newPosition;

  // Başlangıç Karesi (GO) Geçiş Kontrolü ve Dinamik Varlık Maaşı
  const passedGo = (oldPosition + diceTotal) >= 40;
  let salaryAmount = 0;
  if (passedGo) {
    calculatePlayerTotalAssetValue(room, socketId);
    salaryAmount = Math.round(15000 + (playerState.totalAssetValue * 0.05));
    if (room.gameState.goBonus?.[socketId] > 0) {
      salaryAmount += room.gameState.goBonus[socketId];
      room.gameState.goBonus[socketId] = 0;
    }
    if (room.gameState.chanceBuffs?.[socketId]?.earningsRatio) {
      salaryAmount = Math.round(salaryAmount * room.gameState.chanceBuffs[socketId].earningsRatio);
    }
    if (room.gameState.chanceBuffs?.[socketId]?.penaltyRatio) {
      salaryAmount = Math.round(salaryAmount * (1 - room.gameState.chanceBuffs[socketId].penaltyRatio));
    }
    playerState.balance += salaryAmount;
  }

  const targetSquare = BOARD_DATA.find(s => s.id === newPosition);
  let offerProperty = null;
  let rentPaidData = null;

  // Borsa / Halka Arz (Kare 19) Kontrolü
  if (newPosition === 19) {
    room.gameState.waitingForBorsa = {
      playerId: socketId,
      squareId: newPosition,
      isDouble
    };
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
      activePlayerId: activePlayer.id,
      waitingForBorsa: room.gameState.waitingForBorsa
    };
  }

  // Yeraltı Kumarhanesi / Blackjack (Kare 33) Kontrolü
  if (newPosition === 33) {
    room.gameState.waitingForCasino = {
      playerId: socketId,
      isDouble
    };
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
      activePlayerId: activePlayer.id,
      waitingForCasino: room.gameState.waitingForCasino
    };
  }

  const roundsCompleted = Math.floor((room.gameState.totalTurnsCompleted || 0) / room.players.length);

  // Uluslararası Liman (#5) — Sahipsizse 5 turluk kiralama ihalesi başlat
  if (newPosition === 5 && !room.gameState.propertyOwnership[5]) {
    if (roundsCompleted < 5) {
      if (room.ioInstance) {
        room.ioInstance.to(room.code).emit('server:logMessage', {
          message: 'Liman (#5) ihalesi 5. tur tamamlanana kadar kapalıdır.',
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
    }

    room.gameState.waitingForPortLease = {
      playerId: socketId,
      isDouble
    };
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
      activePlayerId: activePlayer.id,
      waitingForBorsa: room.gameState.waitingForBorsa,
      waitingForPortLease: room.gameState.waitingForPortLease
    };
  }

  // Türkiye Varlık Fonu (#37) — Sahipsizse 5 turluk işletme ihalesi başlat
  if (newPosition === 37 && !room.gameState.propertyOwnership[37]) {
    if (roundsCompleted < 5) {
      if (room.ioInstance) {
        room.ioInstance.to(room.code).emit('server:logMessage', {
          message: 'Türkiye Varlık Fonu (#37) ihalesi 5. tur tamamlanana kadar kapalıdır.',
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
    }

    room.gameState.waitingForFundLease = {
      playerId: socketId,
      isDouble
    };
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
      activePlayerId: activePlayer.id,
      waitingForBorsa: room.gameState.waitingForBorsa,
      waitingForFundLease: room.gameState.waitingForFundLease
    };
  }

  if (targetSquare && (targetSquare.type === 'property' || targetSquare.type === 'TRADE' || targetSquare.type === 'station' || targetSquare.type === 'utility' || targetSquare.type === 'PORT' || targetSquare.type === 'MEDIA' || targetSquare.id === 5 || targetSquare.id === 29)) {
    const ownershipInfo = room.gameState.propertyOwnership[newPosition];

    // 1. Sahipsiz Şehir / Ticaret Mülkü -> Teklif (Offer) Gönder, Tur Sırasını Beklet!
    if (!ownershipInfo) {
      offerProperty = targetSquare;
      room.gameState.waitingForPropertyDecision = {
        playerId: socketId,
        propertyId: newPosition,
        isDouble
      };
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
        activePlayerId: activePlayer.id,
        offerProperty,
        rentPaidData: null
      };
    }

    // 2. Başkasına Ait Şehir / Ticaret Mülkü -> Otomatik Kira ve AVM Ayakbastı Kirası
    if (ownershipInfo.ownerId !== socketId) {
      const ownerId = ownershipInfo.ownerId;
      const ownerState = room.gameState.playersState[ownerId];
      const ownerPlayer = room.players.find(p => p.id === ownerId);
      const houses = ownershipInfo.houses || 0;

      // Eğer mülk ipotekliyse, borç kapanana kadar KESİNLİKLE kira tahsil edilemez!
      if (ownershipInfo.isMortgaged) {
        rentPaidData = {
          payerId: socketId,
          payerName: activePlayer.name,
          receiverId: ownerId,
          receiverName: ownerPlayer?.name || 'Mülk Sahibi',
          amount: 0,
          propertyName: targetSquare.name,
          houses,
          isMortgaged: true
        };
      } else {
        const isAvmOwner = room.gameState.propertyOwnership?.[35]?.ownerId === ownerId;
        const avmActiveTurns = room.gameState.tradeState?.[35]?.activeStockTurns || 0;
        const hasAvmBonus = isAvmOwner && avmActiveTurns > 0;

        if (targetSquare.type === 'property') {
          const hasMonopoly = checkGroupMonopoly(room, ownerId, targetSquare.group);
          let rentAmount = targetSquare.rent?.[0] || 0;
          if (houses === 0 && hasMonopoly) {
            rentAmount = (targetSquare.rent?.[0] || 0) * 2;
          } else if (houses > 0) {
            rentAmount = targetSquare.rent?.[houses] || targetSquare.rent?.[0] || 0;
          }

          if (room.gameState.chanceBuffs?.[ownerId]?.rentMultiplier > 1 && (targetSquare.group === 'group7' || targetSquare.group === 'green' || targetSquare.id === 31 || targetSquare.id === 32 || targetSquare.id === 34)) {
            rentAmount = Math.round(rentAmount * room.gameState.chanceBuffs[ownerId].rentMultiplier);
          }

          if (room.gameState.chanceBuffs?.[ownerId]?.housingSupport) {
            const hSup = room.gameState.chanceBuffs[ownerId].housingSupport;
            if (houses === 2 && hSup.level2Turns > 0) rentAmount *= 2;
            else if (houses === 3 && hSup.level3Turns > 0) rentAmount *= 2;
          }

          if (room.gameState.chanceBuffs?.[ownerId]?.haltedHotelTurns > 0 && houses >= 1) {
            rentAmount = 0;
          }
          if (room.gameState.chanceBuffs?.[ownerId]?.movieSetHalt > 0) {
            rentAmount = 0;
          }

          if (hasAvmBonus) rentAmount = Math.round(rentAmount * 1.5);

          playerState.balance -= rentAmount;
          if (ownerState) {
            let ownerReceived = rentAmount;
            if (room.gameState.chanceBuffs?.[ownerId]?.earningsRatio) {
              ownerReceived = Math.round(ownerReceived * room.gameState.chanceBuffs[ownerId].earningsRatio);
            }
            if (room.gameState.chanceBuffs?.[ownerId]?.penaltyRatio) {
              ownerReceived = Math.round(ownerReceived * (1 - room.gameState.chanceBuffs[ownerId].penaltyRatio));
            }
            if (room.gameState.chanceBuffs?.[ownerId]?.qatarPartner) {
              ownerReceived = Math.round(ownerReceived * 0.60);
            }
            ownerState.balance += ownerReceived;
          }

          rentPaidData = {
            payerId: socketId,
            payerName: activePlayer.name,
            receiverId: ownerId,
            receiverName: ownerPlayer?.name || 'Mülk Sahibi',
            amount: rentAmount,
            propertyName: targetSquare.name,
            houses,
            isMonopolyDouble: houses === 0 && hasMonopoly
          };
        } else if (targetSquare.type === 'TRADE' && targetSquare.subType === 'MALL') {
          // FAZ 3/4 AVM Kira (Ayakbastı) Mekaniği (En Acımasız Kısım)
          const activeTurns = room.gameState.tradeState?.[35]?.activeStockTurns || 0;
          let rentAmount = activeTurns > 0 ? 2600000 : 5000;

          if (room.gameState.chanceBuffs?.[ownerId]?.haltedBusinessTurns > 0) {
            rentAmount = 0;
          }

          if (hasAvmBonus) rentAmount = Math.round(rentAmount * 1.5);

          playerState.balance -= rentAmount;
          if (ownerState) {
            let ownerReceived = rentAmount;
            if (room.gameState.chanceBuffs?.[ownerId]?.earningsRatio) {
              ownerReceived = Math.round(ownerReceived * room.gameState.chanceBuffs[ownerId].earningsRatio);
            }
            if (room.gameState.chanceBuffs?.[ownerId]?.penaltyRatio) {
              ownerReceived = Math.round(ownerReceived * (1 - room.gameState.chanceBuffs[ownerId].penaltyRatio));
            }
            if (room.gameState.chanceBuffs?.[ownerId]?.qatarPartner) {
              ownerReceived = Math.round(ownerReceived * 0.60);
            }
            ownerState.balance += ownerReceived;
          }

          rentPaidData = {
            payerId: socketId,
            payerName: activePlayer.name,
            receiverId: ownerId,
            receiverName: ownerPlayer?.name || 'AVM Sahibi',
            amount: rentAmount,
            propertyName: targetSquare.name,
            houses: activeTurns > 0 ? 5 : 0,
            isMonopolyDouble: activeTurns > 0,
            isMallRent: true
          };
        } else if (targetSquare.id === 5 || targetSquare.type === 'station' || targetSquare.type === 'PORT') {
          // Uluslararası Liman Lojistik Vergi/Transit Ücreti
          let rentAmount = targetSquare.rent?.[0] || 35000;
          if (room.gameState.chanceBuffs?.[ownerId]?.haltedBusinessTurns > 0) {
            rentAmount = 0;
          }

          if (hasAvmBonus) rentAmount = Math.round(rentAmount * 1.5);

          playerState.balance -= rentAmount;
          if (ownerState) {
            let ownerReceived = rentAmount;
            if (room.gameState.chanceBuffs?.[ownerId]?.earningsRatio) {
              ownerReceived = Math.round(ownerReceived * room.gameState.chanceBuffs[ownerId].earningsRatio);
            }
            if (room.gameState.chanceBuffs?.[ownerId]?.penaltyRatio) {
              ownerReceived = Math.round(ownerReceived * (1 - room.gameState.chanceBuffs[ownerId].penaltyRatio));
            }
            ownerState.balance += ownerReceived;
          }

          rentPaidData = {
            payerId: socketId,
            payerName: activePlayer.name,
            receiverId: ownerId,
            receiverName: ownerPlayer?.name || 'Liman İşletmecisi',
            amount: rentAmount,
            propertyName: targetSquare.name,
            houses: 0,
            isMonopolyDouble: false
          };
        } else if (targetSquare.id === 29 || targetSquare.type === 'utility' || targetSquare.type === 'MEDIA') {
          // Medya & PR Danışmanlık Ücreti (Kira/Hizmet Bedeli)
          let rentAmount = targetSquare.rent?.[0] || 25000;
          if (room.gameState.chanceBuffs?.[ownerId]?.haltedBusinessTurns > 0) {
            rentAmount = 0;
          }

          if (hasAvmBonus) rentAmount = Math.round(rentAmount * 1.5);

          playerState.balance -= rentAmount;
          if (ownerState) {
            let ownerReceived = rentAmount;
            if (room.gameState.chanceBuffs?.[ownerId]?.earningsRatio) {
              ownerReceived = Math.round(ownerReceived * room.gameState.chanceBuffs[ownerId].earningsRatio);
            }
            ownerState.balance += ownerReceived;
          }

          rentPaidData = {
            payerId: socketId,
            payerName: activePlayer.name,
            receiverId: ownerId,
            receiverName: ownerPlayer?.name || 'Medya Patronu',
            amount: rentAmount,
            propertyName: targetSquare.name,
            houses: 0,
            isMonopolyDouble: false
          };
        } else if (targetSquare.type === 'TRADE') {
          // Diğer Ticaret Tesisleri (Hammadde / Fabrika) Hizmet Bedeli
          let rentAmount = targetSquare.rent?.[0] || 15000;
          if (room.gameState.chanceBuffs?.[ownerId]?.haltedBusinessTurns > 0) {
            rentAmount = 0;
          }

          if (hasAvmBonus) rentAmount = Math.round(rentAmount * 1.5);

          playerState.balance -= rentAmount;
          if (ownerState) {
            ownerState.balance += rentAmount;
          }

          rentPaidData = {
            payerId: socketId,
            payerName: activePlayer.name,
            receiverId: ownerId,
            receiverName: ownerPlayer?.name || 'Tesis Sahibi',
            amount: rentAmount,
            propertyName: targetSquare.name,
            houses: 0,
            isMonopolyDouble: false
          };
        }
      }
    }
  }

  let taxPaid = 0;
  let bankInterestReturn = 0;
  let sentToJail = false;

  // Şans Kartı Karesi (CHANCE - ID 2, 7, 17, 22, 33, 36) -> Rastgele Kart Çek ve A/B Seçimi Bekle!
  if (targetSquare && targetSquare.type === 'chance') {
    if (!room.gameState.usedChanceCards) {
      room.gameState.usedChanceCards = [];
    }

    const hasBusiness = Object.entries(room.gameState.propertyOwnership || {}).some(([propId, info]) => {
      if (info.ownerId !== socketId) return false;
      const sqId = Number(propId);
      const sq = BOARD_DATA.find(s => s.id === sqId);
      return (sq && sq.type === 'TRADE') || sqId === 5 || sqId === 12 || sqId === 15 || sqId === 24 || sqId === 25 || sqId === 28 || sqId === 35;
    });

    let validCards = CHANCE_CARDS.filter(c => {
      if (c.requiresBusinessOwner && !hasBusiness) return false;
      return true;
    });
    if (validCards.length === 0) validCards = CHANCE_CARDS.filter(c => !c.requiresBusinessOwner);

    let availableCards = validCards.filter(c => !room.gameState.usedChanceCards.includes(c.id));
    if (availableCards.length <= 5) {
      room.gameState.usedChanceCards = [];
      availableCards = validCards;
    }

    const rawCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    if (rawCard && !room.gameState.usedChanceCards.includes(rawCard.id)) {
      room.gameState.usedChanceCards.push(rawCard.id);
    }
    const randomCard = JSON.parse(JSON.stringify(rawCard));
    if (randomCard.description) {
      randomCard.description = randomCard.description.replace(/\$\{playerName\}|\[Oyuncu İsmi\]|\{playerName\}/g, activePlayer.name || 'Oyuncu');
    }
    if (randomCard.title) {
      randomCard.title = randomCard.title.replace(/\$\{playerName\}|\[Oyuncu İsmi\]|\{playerName\}/g, activePlayer.name || 'Oyuncu');
    }

    room.gameState.waitingForChanceDecision = {
      playerId: socketId,
      cardId: randomCard.id,
      isDouble
    };
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
      activePlayerId: activePlayer.id,
      offerProperty: null,
      showChanceCard: randomCard
    };
  }

  // Hazine ve Servet Vergisi (%10 Nakit Kesintisi - ID 4 ve ID 38)
  if (targetSquare && targetSquare.type === 'tax') {
    if (room.gameState.chanceBuffs?.[socketId]?.taxImmunity) {
      taxPaid = 0;
    } else {
      taxPaid = Math.round(Math.max(0, playerState.balance * 0.10));
      playerState.balance -= taxPaid;

      const fundOwnerId = room.gameState.propertyOwnership?.[37]?.ownerId;
      if (fundOwnerId && room.gameState.playersState[fundOwnerId]) {
        room.gameState.playersState[fundOwnerId].balance += taxPaid;
      } else {
        room.gameState.wealthFundPool = (room.gameState.wealthFundPool || 0) + taxPaid;
      }
    }
  }

  // Sayıştay Denetimi & Hapis karesine doğrudan geliş (ID 13)
  if (targetSquare && targetSquare.type === 'jail') {
    if (!room.gameState.jailState) room.gameState.jailState = {};
    room.gameState.jailState[socketId] = { inJail: true, turnsServed: 0 };
    sentToJail = true;
  }

  // Eski Gümrük Kapısı mantığı kaldırıldı, Kare 33 artık CASINO ve yukarıda ele alınıyor.

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
    activePlayerId: nextActivePlayerId,
    offerProperty: null,
    rentPaidData,
    taxPaid,
    bankInterestReturn
  };
}

/**
 * Satın Alma Kabulü (client:buyProperty) - hem CITY hem TRADE mülkleri için
 */
export function buyProperty(socketId, propertyId, useLoan = false) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil veya oda bulunamadı.' };
  }

  const decision = room.gameState.waitingForPropertyDecision;
  if (!decision || decision.playerId !== socketId || decision.propertyId !== propertyId) {
    return { success: false, error: 'Bekleyen geçerli bir satın alma teklifiniz bulunmuyor.' };
  }

  const player = room.players.find(p => p.id === socketId);
  const playerState = room.gameState.playersState[socketId];
  const square = BOARD_DATA.find(s => s.id === propertyId);

  if (!square || !playerState) {
    return { success: false, error: 'Mülk veya oyuncu bilgisine ulaşılamadı.' };
  }

  if (playerState.balance < 0) {
    return { success: false, error: 'Borç Modunda mülk satın alınamaz! Önce borcunuzu kapatın.' };
  }

  const loanAmount = useLoan ? Math.round(square.price * 0.70) : 0;
  const netCost = square.price - loanAmount;

  if (playerState.balance < netCost) {
    if (useLoan) {
      return { success: false, error: `Yetersiz bakiye. Kredili satın alma için en az %30 peşinat (${netCost.toLocaleString('tr-TR')} ₺) gereklidir.` };
    } else {
      return { success: false, error: 'Yetersiz bakiye. Bu mülkü satın alacak kadar paranız yok.' };
    }
  }

  // Satın alımı gerçekleştir
  playerState.balance -= netCost;
  room.gameState.propertyOwnership[propertyId] = {
    ownerId: socketId,
    houses: 0,
    isMortgaged: useLoan
  };

  // Kredi borcunu bankState içerisine işle
  if (useLoan) {
    if (!room.gameState.bankState) room.gameState.bankState = {};
    if (!room.gameState.bankState[socketId]) room.gameState.bankState[socketId] = { deposit: 0, loans: [] };
    
    const isRemote = playerState.position !== 20;
    const baseRate = room.gameState.interestRate || 5;
    const rate = isRemote ? (baseRate + 4) : baseRate;
    const initialRepay = Math.round(loanAmount * (1 + rate / 100));
    room.gameState.bankState[socketId].loans.push({
      propertyId,
      loanAmount,
      repayAmount: initialRepay,
      isRemote
    });
  }

  calculatePlayerTotalAssetValue(room, socketId);

  const wasDouble = decision.isDouble;
  room.gameState.waitingForPropertyDecision = null;

  advanceToNextTurn(room, wasDouble);
  const nextActivePlayerId = room.players[room.gameState.currentTurnIndex]?.id;

  return {
    success: true,
    room,
    playerId: socketId,
    playerName: player?.name,
    propertyId,
    propertyName: square.name,
    price: square.price,
    useLoan,
    newBalance: playerState.balance,
    currentTurnIndex: room.gameState.currentTurnIndex,
    activePlayerId: nextActivePlayerId
  };
}

/**
 * Satın Alma Reddi (client:declineProperty)
 */
export function declineProperty(socketId, propertyId) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil.' };
  }

  const decision = room.gameState.waitingForPropertyDecision;
  if (!decision || decision.playerId !== socketId || decision.propertyId !== propertyId) {
    return { success: false, error: 'Bekleyen geçerli bir teklifiniz bulunmuyor.' };
  }

  if (room.gameState.playersState[socketId]?.balance < 0) {
    return { success: false, error: 'Borç Modunda tur geçilemez! Önce borcunuzu ödemeli veya mülk satıp/ihaleye çıkarmalısınız.' };
  }

  const player = room.players.find(p => p.id === socketId);
  const square = BOARD_DATA.find(s => s.id === propertyId);
  const wasDouble = decision.isDouble;
  room.gameState.waitingForPropertyDecision = null;

  advanceToNextTurn(room, wasDouble);
  const nextActivePlayerId = room.players[room.gameState.currentTurnIndex]?.id;

  return {
    success: true,
    room,
    playerId: socketId,
    playerName: player?.name,
    propertyId,
    propertyName: square?.name,
    currentTurnIndex: room.gameState.currentTurnIndex,
    activePlayerId: nextActivePlayerId
  };
}

/**
 * Ev / Otel İnşaatı (client:buildHouse)
 */
export function buildHouse(socketId, propertyId) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil.' };
  }

  const ownership = room.gameState.propertyOwnership[propertyId];
  if (!ownership || ownership.ownerId !== socketId) {
    return { success: false, error: 'Bu mülk size ait değil, üzerine ev/otel dikemezsiniz!' };
  }

  const square = BOARD_DATA.find(s => s.id === propertyId);
  if (!square || square.type !== 'property') {
    return { success: false, error: 'Bu kare inşaata uygun bir şehir değil.' };
  }

  const hasMonopoly = checkGroupMonopoly(room, socketId, square.group);
  if (!hasMonopoly) {
    return { success: false, error: 'İnşaat yapabilmek için bu renk grubundaki (Tekel) TÜM şehirlere sahip olmalısınız!' };
  }

  const currentHouses = ownership.houses || 0;
  if (currentHouses >= 5) {
    return { success: false, error: 'Bu mülk üzerinde zaten maksimum seviye (Otel) inşaat yapılmış durumda!' };
  }

  const playerState = room.gameState.playersState[socketId];
  const player = room.players.find(p => p.id === socketId);
  const cost = square.housePrice || 0;

  if (playerState.balance < 0) {
    return { success: false, error: 'Borç Modunda inşaat yapılamaz! Önce borcunuzu kapatın.' };
  }

  if (playerState.balance < cost) {
    return { success: false, error: `İnşaat için bakiyeniz yetersiz (Gereken: ${cost.toLocaleString('tr-TR')} ₺)` };
  }

  playerState.balance -= cost;
  ownership.houses = currentHouses + 1;

  calculatePlayerTotalAssetValue(room, socketId);

  return {
    success: true,
    room,
    playerId: socketId,
    playerName: player?.name,
    propertyId,
    propertyName: square.name,
    houseCount: ownership.houses,
    housePrice: cost,
    newBalance: playerState.balance
  };
}

/**
 * Kendi mülkleri arasında hammadde/ürün aktarımı (Self-Trade)
 */
export function useSelfResource(socketId, itemType) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil.' };
  }

  const playerState = room.gameState.playersState[socketId];
  if (!playerState) {
    return { success: false, error: 'Oyuncu bulunamadı.' };
  }

  if (!room.gameState.tradeState) room.gameState.tradeState = {};

  if (itemType === 'rawMaterial') {
    if (room.gameState.propertyOwnership[15]?.ownerId !== socketId) return { success: false, error: 'Hammadde Tesisi sizin değil!' };
    if (room.gameState.propertyOwnership[24]?.ownerId !== socketId) return { success: false, error: 'Fabrika sizin değil!' };
    
    if (!room.gameState.tradeState[15] || room.gameState.tradeState[15].stock < 1) {
      return { success: false, error: 'Yeterli hammadde stoğu yok.' };
    }

    room.gameState.tradeState[15].stock -= 1;
    if (!room.gameState.tradeState[24]) room.gameState.tradeState[24] = { rawMaterial: 0, productStock: 0 };
    room.gameState.tradeState[24].rawMaterial += 1;
    
    return { success: true, room, playerName: room.players.find(p => p.id === socketId)?.name };

  } else if (itemType === 'product') {
    if (room.gameState.propertyOwnership[24]?.ownerId !== socketId) return { success: false, error: 'Fabrika sizin değil!' };
    if (room.gameState.propertyOwnership[35]?.ownerId !== socketId) return { success: false, error: 'AVM sizin değil!' };

    if (!room.gameState.tradeState[24] || room.gameState.tradeState[24].productStock < 1) {
      return { success: false, error: 'Yeterli ürün stoğu yok.' };
    }

    room.gameState.tradeState[24].productStock -= 1;
    if (!room.gameState.tradeState[35]) room.gameState.tradeState[35] = { productStock: 0, activeStockTurns: 0 };
    room.gameState.tradeState[35].productStock += 1;

    return { success: true, room, playerName: room.players.find(p => p.id === socketId)?.name };
  }

  return { success: false, error: 'Geçersiz işlem tipi.' };
}

/**
 * FAZ 4: Oyuncular Arası Ticaret Teklifi Gönderme (sendTradeOffer)
 */
export function sendTradeOffer(socketId, toId, itemType, price) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil.' };
  }

  const offerPrice = Number(price);
  if (isNaN(offerPrice) || !Number.isInteger(offerPrice) || offerPrice <= 0) {
    return { success: false, error: 'Lütfen geçerli bir pozitif tam sayı fiyat teklif edin.' };
  }

  const sender = room.players.find(p => p.id === socketId);
  const target = room.players.find(p => p.id === toId);
  if (!sender || !target || socketId === toId) {
    return { success: false, error: 'Geçersiz alıcı oyuncu.' };
  }

  if (room.gameState.playersState[socketId]?.balance < 0) {
    return { success: false, error: 'Borç Modunda ticaret teklifi verilemez! Önce borcunuzu kapatın.' };
  }

  if (itemType === 'rawMaterial') {
    if (room.gameState.propertyOwnership[15]?.ownerId !== socketId) {
      return { success: false, error: 'Sadece Hammadde Tesisinin (ID 15) sahibi hammadde teklifi verebilir!' };
    }
    if ((room.gameState.tradeState?.[15]?.stock || 0) < 1) {
      return { success: false, error: 'Elinde satacak hiç hammadde stokun yok!' };
    }
    if (room.gameState.propertyOwnership[24]?.ownerId !== toId) {
      return { success: false, error: 'Hammadde teklifini sadece Fabrika sahibine gönderebilirsin!' };
    }
  } else if (itemType === 'product') {
    if (room.gameState.propertyOwnership[24]?.ownerId !== socketId) {
      return { success: false, error: 'Sadece Fabrika (ID 24) sahibi bitmiş ürün teklifi verebilir!' };
    }
    if ((room.gameState.tradeState?.[24]?.productStock || 0) < 1) {
      return { success: false, error: 'Elinde satacak hiç bitmiş ürün stokun yok!' };
    }
    if (room.gameState.propertyOwnership[35]?.ownerId !== toId) {
      return { success: false, error: 'Ürün teklifini sadece AVM sahibine gönderebilirsin!' };
    }
  } else {
    return { success: false, error: 'Geçersiz ticaret ürünü tipi.' };
  }

  const offer = {
    id: Date.now().toString(),
    fromId: socketId,
    fromName: sender.name,
    toId,
    toName: target.name,
    itemType,
    price: offerPrice
  };

  room.gameState.activeTradeOffer = offer;

  return { success: true, room, offer };
}

/**
 * FAZ 4: Ticaret Teklidine Yanıt (respondTradeOffer)
 */
export function respondTradeOffer(socketId, offerId, accepted) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil.' };
  }

  const offer = room.gameState.activeTradeOffer;
  if (!offer || offer.id !== offerId || offer.toId !== socketId) {
    return { success: false, error: 'Bekleyen geçerli bir ticaret teklifi bulunamadı.' };
  }

  room.gameState.activeTradeOffer = null;

  if (!accepted) {
    return { success: true, room, accepted: false, offer };
  }

  const buyerState = room.gameState.playersState[socketId];
  const sellerState = room.gameState.playersState[offer.fromId];
  if (!buyerState || !sellerState) {
    return { success: false, error: 'Oyuncu bilgisi bulunamadı.' };
  }

  if (buyerState.balance < offer.price) {
    return { success: false, error: 'Yetersiz bakiye. Teklifi kabul edecek kadar paranız yok.' };
  }

  if (offer.itemType === 'rawMaterial') {
    if ((room.gameState.tradeState?.[15]?.stock || 0) < 1) {
      return { success: false, error: 'Satıcı oyuncunun elinde yeterli hammadde kalmamış!' };
    }
    buyerState.balance -= offer.price;
    sellerState.balance += offer.price;
    room.gameState.tradeState[15].stock -= 1;
    room.gameState.tradeState[24].rawMaterialStock = (room.gameState.tradeState[24].rawMaterialStock || 0) + 1;
  } else if (offer.itemType === 'product') {
    if ((room.gameState.tradeState?.[24]?.productStock || 0) < 1) {
      return { success: false, error: 'Satıcı oyuncunun elinde yeterli bitmiş ürün kalmamış!' };
    }
    buyerState.balance -= offer.price;
    sellerState.balance += offer.price;
    room.gameState.tradeState[24].productStock -= 1;
    room.gameState.tradeState[35].productStock = (room.gameState.tradeState[35].productStock || 0) + 1;
  }

  return { success: true, room, accepted: true, offer, newBuyerBalance: buyerState.balance, newSellerBalance: sellerState.balance };
}

/**
 * FAZ 4: Devletle Ticaret (tradeWithState)
 */
export function tradeWithState(socketId, action) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil.' };
  }

  const playerState = room.gameState.playersState[socketId];
  if (!playerState) return { success: false, error: 'Oyuncu durumu bulunamadı.' };

  // Tur başına maksimum 1 kez işlem yapma limiti (Fabrikacı için)
  if (action === 'buy_raw_from_state' || action === 'sell_product_to_state') {
    if (!room.gameState.stateTradeUsedThisTurn) {
      room.gameState.stateTradeUsedThisTurn = {};
    }
    if (room.gameState.stateTradeUsedThisTurn[socketId] >= 1) {
      return { success: false, error: 'Devletle (hammadde alımı veya ürün satımı) tur başına sadece 1 kez işlem yapabilirsiniz.' };
    }
  }

  if (action === 'sell_raw_to_state') {
    if (room.gameState.propertyOwnership[15]?.ownerId !== socketId) return { success: false, error: 'Bu işlem için Hammadde Tesisine (ID 15) sahip olmalısınız.' };
    if ((room.gameState.tradeState?.[15]?.stock || 0) < 1) return { success: false, error: 'Devlete satacak hammadde stokunuz yok.' };
    room.gameState.tradeState[15].stock -= 1;
    playerState.balance += 20000;
  } else if (action === 'buy_raw_from_state') {
    if (room.gameState.propertyOwnership[24]?.ownerId !== socketId) return { success: false, error: 'Bu işlem için Fabrikaya (ID 24) sahip olmalısınız.' };
    if (playerState.balance < 10000) return { success: false, error: 'Devletten hammadde ithal etmek için bakiyeniz yetersiz (10.000 ₺).' };
    playerState.balance -= 10000;
    room.gameState.tradeState[24].rawMaterialStock = (room.gameState.tradeState[24].rawMaterialStock || 0) + 1;
    // Limit sayacını artır
    room.gameState.stateTradeUsedThisTurn[socketId] = (room.gameState.stateTradeUsedThisTurn[socketId] || 0) + 1;
  } else if (action === 'sell_product_to_state') {
    if (room.gameState.propertyOwnership[24]?.ownerId !== socketId) return { success: false, error: 'Bu işlem için Fabrikaya (ID 24) sahip olmalısınız.' };
    if ((room.gameState.tradeState?.[24]?.productStock || 0) < 1) return { success: false, error: 'Devlete satacak bitmiş ürününüz yok.' };
    room.gameState.tradeState[24].productStock -= 1;
    playerState.balance += 20000;
    // Limit sayacını artır
    room.gameState.stateTradeUsedThisTurn[socketId] = (room.gameState.stateTradeUsedThisTurn[socketId] || 0) + 1;
  } else if (action === 'buy_product_from_state') {
    if (room.gameState.propertyOwnership[35]?.ownerId !== socketId) return { success: false, error: 'Bu işlem için AVM (ID 35) sahibi olmalısınız.' };
    if (playerState.balance < 120000) return { success: false, error: 'Devletten acil ürün çekmek için bakiyeniz yetersiz (120.000 ₺).' };
    playerState.balance -= 120000;
    room.gameState.tradeState[35].productStock = (room.gameState.tradeState[35].productStock || 0) + 1;
  } else {
    return { success: false, error: 'Geçersiz devlet ticareti eylemi.' };
  }

  return { success: true, room, action, newBalance: playerState.balance, tradeState: room.gameState.tradeState };
}

/**
 * FAZ 4: Fabrikada Üretim (processMaterial)
 */
export function processMaterial(socketId) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) return { success: false, error: 'Oyun aktif değil.' };
  if (room.gameState.propertyOwnership[24]?.ownerId !== socketId) return { success: false, error: 'Sadece Fabrika (ID 24) sahibi üretim yapabilir.' };
  if ((room.gameState.tradeState?.[24]?.rawMaterialStock || 0) < 1) return { success: false, error: 'Üretim için yeterli hammadde yok!' };

  room.gameState.tradeState[24].rawMaterialStock -= 1;
  room.gameState.tradeState[24].productStock = (room.gameState.tradeState[24].productStock || 0) + 1;

  return { success: true, room, tradeState: room.gameState.tradeState };
}

/**
 * FAZ 4: AVM Vitrine Koyma (stockMall)
 */
export function stockMall(socketId) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) return { success: false, error: 'Oyun aktif değil.' };
  if (room.gameState.propertyOwnership[35]?.ownerId !== socketId) return { success: false, error: 'Sadece AVM (ID 35) sahibi vitrine mal dizebilir.' };
  if ((room.gameState.tradeState?.[35]?.productStock || 0) < 1) return { success: false, error: 'Vitrine koymak için depoda bitmiş ürününüz yok!' };

  room.gameState.tradeState[35].productStock -= 1;
  room.gameState.tradeState[35].activeStockTurns = (room.gameState.tradeState[35].activeStockTurns || 0) + 3;

  return { success: true, room, tradeState: room.gameState.tradeState };
}

/**
 * FAZ 5: Merkez Bankası İşlemleri (bankAction) - Mevduat Yatırma ve Kredi/İpotek Alma
 */
export function bankAction(socketId, action, data) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) return { success: false, error: 'Oyun aktif değil.' };

  const playerState = room.gameState.playersState[socketId];
  if (!playerState) return { success: false, error: 'Oyuncu durumu bulunamadı.' };
  if (!room.gameState.bankState) room.gameState.bankState = {};
  if (!room.gameState.bankState[socketId]) room.gameState.bankState[socketId] = { deposit: 0, loans: [] };

  if (action === 'deposit') {
    if (playerState.position !== 20) {
      return { success: false, error: 'Yüksek getirili mevduata sadece Merkez Bankası (#20) karesindeyken para yatırabilirsiniz.' };
    }
    const amount = Number(data?.amount || 0);
    if (isNaN(amount) || !Number.isInteger(amount) || amount <= 0 || playerState.balance < amount) {
      return { success: false, error: 'Yatırılacak tutar geçersiz (pozitif bir tam sayı olmalı) veya nakit bakiyeniz yetersiz.' };
    }
    playerState.balance -= amount;
    room.gameState.bankState[socketId].deposit += amount;
  } else if (action === 'withdraw_deposit') {
    const currentDep = room.gameState.bankState[socketId].deposit || 0;
    if (currentDep <= 0) {
      return { success: false, error: 'Çekilecek aktif bir mevduat bakiyeniz bulunmuyor.' };
    }
    playerState.balance += currentDep;
    room.gameState.bankState[socketId].deposit = 0;
  } else if (action === 'loan') {
    const propertyId = Number(data?.propertyId);
    const ownership = room.gameState.propertyOwnership[propertyId];
    if (!ownership || ownership.ownerId !== socketId) {
      return { success: false, error: 'Bu mülk size ait değil, ipotek alamazsınız.' };
    }
    const square = BOARD_DATA.find(s => s.id === propertyId);
    if (!square) return { success: false, error: 'Mülk bulunamadı.' };
    const alreadyLoan = room.gameState.bankState[socketId].loans.find(l => l.propertyId === propertyId);
    if (alreadyLoan || ownership.isMortgaged) {
      return { success: false, error: 'Bu mülk üzerinde zaten aktif bir kredi ipoteği bulunuyor.' };
    }
    const maxLimit = Math.round(square.price * 0.70);
    const requestedAmount = Number(data?.amount || maxLimit);
    if (isNaN(requestedAmount) || !Number.isInteger(requestedAmount) || requestedAmount <= 0 || requestedAmount > maxLimit) {
      return { success: false, error: `İstenecek kredi miktarı geçersiz veya en fazla değerin %70'i olan ${maxLimit.toLocaleString('tr-TR')} ₺ olabilir.` };
    }
    const isRemote = playerState.position !== 20;
    const baseRate = room.gameState.interestRate || 5;
    const rate = isRemote ? (baseRate + 4) : baseRate;
    const initialRepay = Math.round(requestedAmount * (1 + rate / 100));
    playerState.balance += requestedAmount;
    ownership.isMortgaged = true;
    room.gameState.bankState[socketId].loans.push({
      propertyId,
      loanAmount: requestedAmount,
      repayAmount: initialRepay,
      isRemote
    });
  } else if (action === 'repay_loan') {
    const propertyId = Number(data?.propertyId);
    const loanIndex = room.gameState.bankState[socketId].loans.findIndex(l => l.propertyId === propertyId);
    if (loanIndex === -1) return { success: false, error: 'Bu mülke ait aktif bir kredi borcu yok.' };
    const loan = room.gameState.bankState[socketId].loans[loanIndex];
    if (playerState.balance < loan.repayAmount) {
      return { success: false, error: `Krediyi kapatmak için bakiyeniz yetersiz (${loan.repayAmount.toLocaleString('tr-TR')} ₺).` };
    }
    playerState.balance -= loan.repayAmount;
    room.gameState.bankState[socketId].loans.splice(loanIndex, 1);
    const ownership = room.gameState.propertyOwnership[propertyId];
    if (ownership) {
      ownership.isMortgaged = false;
    }
  } else {
    return { success: false, error: 'Geçersiz banka işlemi.' };
  }

  calculatePlayerTotalAssetValue(room, socketId);
  return { success: true, room, action, newBalance: playerState.balance, bankState: room.gameState.bankState };
}

/**
 * FAZ 5: Sayıştay Denetimi / Hapis İşlemleri (jailAction) - %5 Oransal Kefalet ile Çıkış
 */
export function jailAction(socketId, action) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) return { success: false, error: 'Oyun aktif değil.' };

  const playerState = room.gameState.playersState[socketId];
  if (!playerState) return { success: false, error: 'Oyuncu bulunamadı.' };

  // Eğer oyuncu 13. karede (Sayıştay/Gözaltı) ise ve jailState inJail false ise onar
  if (playerState.position === 13 && !room.gameState.jailState?.[socketId]?.inJail) {
    if (!room.gameState.jailState) room.gameState.jailState = {};
    room.gameState.jailState[socketId] = { inJail: true, turnsServed: 0 };
  }

  const jailInfo = room.gameState.jailState?.[socketId];
  if (!jailInfo || !jailInfo.inJail) {
    return { success: false, error: 'Hapiste değilsiniz.' };
  }

  if (action === 'pay_bail') {
    // Kural: Toplam net varlığın %5'i (Bakiye + Mülk Değeri)
    calculatePlayerTotalAssetValue(room, socketId);
    const netWorth = (playerState.balance || 0) + (playerState.totalAssetValue || 0);
    const bailAmount = Math.max(5000, Math.round(netWorth * 0.05));
    if (playerState.balance < bailAmount) {
      return { success: false, error: `Kefalet bedelini (Net Varlık %5 = ${bailAmount.toLocaleString('tr-TR')} ₺) ödeyecek kadar nakit bakiyeniz yok.` };
    }
    playerState.balance -= bailAmount;
    
    const fundOwnerId = room.gameState.propertyOwnership?.[37]?.ownerId;
    if (fundOwnerId && room.gameState.playersState[fundOwnerId]) {
      room.gameState.playersState[fundOwnerId].balance += bailAmount;
    } else {
      room.gameState.wealthFundPool = (room.gameState.wealthFundPool || 0) + bailAmount;
    }
    room.gameState.jailState[socketId] = { inJail: false, turnsServed: 0 };
    calculatePlayerTotalAssetValue(room, socketId);
    return {
      success: true,
      room,
      action: 'pay_bail',
      bailAmount,
      newBalance: playerState.balance,
      message: `Kefalet ödendi! (Net Varlık %5 = ${bailAmount.toLocaleString('tr-TR')} ₺) Gözaltı kararı kaldırıldı, şimdi normal zar atarak ilerleyebilirsiniz!`
    };
  }

  if (action === 'bribe_attempt') {
    const isSuccess = Math.random() < 0.50;
    if (isSuccess) {
      room.gameState.jailState[socketId] = { inJail: false, turnsServed: 0 };
      calculatePlayerTotalAssetValue(room, socketId);
      return {
        success: true,
        room,
        action: 'bribe_attempt',
        result: 'success',
        newBalance: playerState.balance,
        message: 'Rüşvet işe yaradı! Gözaltından serbest bırakıldınız, şimdi zar atıp ilerleyebilirsiniz!'
      };
    } else {
      playerState.balance -= 100000;
      jailInfo.turnsServed = (jailInfo.turnsServed || 0) + 1;
      calculatePlayerTotalAssetValue(room, socketId);
      advanceToNextTurn(room, false);
      const nextActivePlayerId = room.players[room.gameState.currentTurnIndex]?.id;
      return {
        success: true,
        room,
        action: 'bribe_attempt',
        result: 'fail',
        penalty: 100000,
        newBalance: playerState.balance,
        currentTurnIndex: room.gameState.currentTurnIndex,
        activePlayerId: nextActivePlayerId,
        message: 'Rüşvet verirken yakalandınız! 100.000 TL ceza kesildi ve gözaltı süreniz devam ediyor, sıranız geçti.'
      };
    }
  }

  return { success: false, error: 'Geçersiz hapis işlemi.' };
}

/**
 * FAZ 5: Borç Modunda Mülkü Devlete Satış (-%30 Acil Satış bedeli: %70 nakit)
 */
export function sellPropertyToState(socketId, propertyId) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) return { success: false, error: 'Oyun aktif değil.' };

  const playerState = room.gameState.playersState[socketId];
  const ownership = room.gameState.propertyOwnership[propertyId];
  if (!ownership || ownership.ownerId !== socketId) {
    return { success: false, error: 'Bu mülk size ait değil.' };
  }

  if (ownership.isMortgaged) {
    return { success: false, error: 'Bu mülk üzerinde aktif bir banka ipoteği bulunmaktadır! Satış yapabilmek için önce ipoteği kaldırmalısınız.' };
  }

  const square = BOARD_DATA.find(s => s.id === Number(propertyId));
  if (!square) return { success: false, error: 'Mülk bulunamadı.' };

  const totalValue = (square.price || 0) + (ownership.houses || 0) * (square.housePrice || 0);
  const emergencyCash = Math.round(totalValue * 0.70);

  delete room.gameState.propertyOwnership[propertyId];
  playerState.balance += emergencyCash;
  calculatePlayerTotalAssetValue(room, socketId);

  return { success: true, room, propertyId, emergencyCash, newBalance: playerState.balance };
}

/**
 * FAZ 5: İhale Başlatma (startAuction) - Mülkü %65 bedelle 30s canlı ihaleye çıkarma
 */
export function startAuction(socketId, propertyId, io) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) return { success: false, error: 'Oyun aktif değil.' };

  const roundsCompleted = Math.floor((room.gameState.totalTurnsCompleted || 0) / room.players.length);
  if (roundsCompleted < 5) {
    return { success: false, error: 'İhaleler 5. tur tamamlanana kadar (Tüm oyuncular başlangıçtan 5 kez geçene kadar) kapalıdır.' };
  }

  if (room.gameState.activeAuction) {
    return { success: false, error: 'Odada zaten devam eden aktif bir ihale bulunmaktadır!' };
  }

  const player = room.players.find(p => p.id === socketId);
  const ownership = room.gameState.propertyOwnership[propertyId];
  if (!ownership || ownership.ownerId !== socketId) {
    return { success: false, error: 'İhaleye çıkarmak istediğiniz mülk size ait değil.' };
  }

  if (ownership.isMortgaged) {
    return { success: false, error: 'Bu mülk üzerinde aktif bir banka ipoteği bulunmaktadır! İhaleye çıkarabilmek için önce ipoteği kaldırmalısınız.' };
  }

  const square = BOARD_DATA.find(s => s.id === Number(propertyId));
  if (!square) return { success: false, error: 'Mülk bulunamadı.' };

  const totalValue = (square.price || 0) + (ownership.houses || 0) * (square.housePrice || 0);
  const startingPrice = Math.round(totalValue * 0.65);

  const auctionObj = {
    id: Date.now().toString(),
    propertyId: Number(propertyId),
    propertyName: square.name,
    sellerId: socketId,
    sellerName: player?.name || 'Satıcı',
    startingPrice,
    currentBid: startingPrice,
    highestBidderId: null,
    highestBidderName: null,
    timeLeft: 30
  };

  room.gameState.activeAuction = auctionObj;

  // Sunucu taraflı 1 saniyelik zamanlayıcıyı başlat
  const timer = setInterval(() => {
    if (!room.gameState || !room.gameState.activeAuction || room.gameState.activeAuction.id !== auctionObj.id) {
      clearInterval(timer);
      return;
    }

    room.gameState.activeAuction.timeLeft -= 1;
    const current = room.gameState.activeAuction;

    if (current.timeLeft <= 0) {
      clearInterval(timer);
      concludeAuction(room, io);
    } else {
      if (io) {
        io.to(room.code).emit('server:auctionTick', {
          timeLeft: current.timeLeft,
          currentBid: current.currentBid,
          highestBidderId: current.highestBidderId,
          highestBidderName: current.highestBidderName,
          propertyName: current.propertyName,
          propertyId: current.propertyId,
          sellerId: current.sellerId
        });
      }
    }
  }, 1000);

  Object.defineProperty(auctionObj, 'timerId', {
    value: timer,
    writable: true,
    enumerable: false,
    configurable: true
  });

  return { success: true, room, auction: auctionObj };
}

/**
 * FAZ 9 / Geri Dönüşler Faz 2: İhaleyi Satıcı Oyuncu İçin Erken Bitirme (finishAuctionEarly)
 */
export function finishAuctionEarly(socketId, io) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) return { success: false, error: 'Oyun aktif değil.' };

  const auction = room.gameState.activeAuction;
  if (!auction) {
    return { success: false, error: 'Devam eden aktif bir ihale bulunmuyor.' };
  }

  if (auction.sellerId !== socketId) {
    return { success: false, error: 'İhaleyi sadece ihaleyi başlatan satıcı erken bitirebilir.' };
  }

  if (auction.timerId) {
    clearInterval(auction.timerId);
  }

  // İhaleyi hemen sonuçlandır
  concludeAuction(room, io);

  return { success: true, room };
}

/**
 * FAZ 5: İhaleye Teklif Verme (placeBid)
 */
export function placeBid(socketId, bidAmount) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState || !room.gameState.activeAuction) {
    return { success: false, error: 'Devam eden aktif bir ihale yok.' };
  }

  const auction = room.gameState.activeAuction;
  if (auction.sellerId === socketId) {
    return { success: false, error: 'Kendi mülkünüzün ihalesine teklif veremezsiniz!' };
  }

  const playerState = room.gameState.playersState[socketId];
  const player = room.players.find(p => p.id === socketId);
  if (!playerState || !player) return { success: false, error: 'Oyuncu bilgisi bulunamadı.' };

  const amount = Number(bidAmount);
  if (isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
    return { success: false, error: 'Lütfen geçerli bir tam sayı teklif miktarı girin.' };
  }
  if (amount <= auction.currentBid) {
    return { success: false, error: `Teklifiniz mevcut en yüksek tekliften (${auction.currentBid.toLocaleString('tr-TR')} ₺) büyük olmalıdır.` };
  }

  if (playerState.balance < amount) {
    return { success: false, error: `Bu teklifi vermek için nakit bakiyeniz yetersiz (${amount.toLocaleString('tr-TR')} ₺).` };
  }

  auction.currentBid = amount;
  auction.highestBidderId = socketId;
  auction.highestBidderName = player.name;

  // Son 10 saniyede teklif geldiyse süreyi 10 saniyeye uzat
  if (auction.timeLeft < 10) {
    auction.timeLeft = 10;
  }

  return { success: true, room, auction };
}

/**
 * FAZ 5: İhaleyi Sonuçlandırma (concludeAuction Helper)
 */
/**
 * FAZ 10 / Geri Dönüşler: 10. Tur Otomatik Açık Artırma (startNextAutoAuction)
 */
export function startNextAutoAuction(room, io) {
  if (!room || !room.gameState || !room.gameState.autoAuctionQueue || room.gameState.autoAuctionQueue.length === 0) {
    if (room && room.gameState) room.gameState.isAutoAuctionRunning = false;
    if (io) io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    return;
  }

  room.gameState.isAutoAuctionRunning = true;
  const nextPropId = room.gameState.autoAuctionQueue.shift();
  const square = BOARD_DATA.find(s => s.id === nextPropId);
  if (!square) {
    startNextAutoAuction(room, io);
    return;
  }

  // Eğer mülk arada satın alınmışsa veya sahiplenildiyse sonrakine geç
  if (room.gameState.propertyOwnership?.[nextPropId]) {
    startNextAutoAuction(room, io);
    return;
  }

  const startPrice = Math.round((square.price || 150000) * 0.40);
  const auctionObj = {
    propertyId: nextPropId,
    propertyName: square.name,
    sellerId: null, // Devlet / Sistem
    sellerName: 'Devlet / Özelleştirme İdaresi (Piyasa Doygunluğu İhalesi)',
    currentBid: startPrice,
    highestBidderId: null,
    highestBidderName: null,
    timeLeft: 30,
    isSpecialAuction: false,
    isAutoAuction: true
  };

  room.gameState.activeAuction = auctionObj;

  if (io) {
    io.to(room.code).emit('server:auctionStarted', { auction: auctionObj });
    io.to(room.code).emit('server:logMessage', {
      message: `⚡ [PİYASA DOYGUNLUĞU İHALESİ]: Sahipsiz ${square.name} (#${nextPropId}) için 30 saniyelik açık ihale başladı! Başlangıç bedeli: ${startPrice.toLocaleString('tr-TR')} ₺`,
      type: 'warning'
    });
    io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
  }

  const timer = setInterval(() => {
    if (!room.gameState || !room.gameState.activeAuction || room.gameState.activeAuction !== auctionObj) {
      clearInterval(timer);
      return;
    }

    auctionObj.timeLeft -= 1;
    if (io) {
      io.to(room.code).emit('server:auctionTick', {
        timeLeft: auctionObj.timeLeft,
        currentBid: auctionObj.currentBid,
        highestBidderId: auctionObj.highestBidderId,
        highestBidderName: auctionObj.highestBidderName,
        propertyName: auctionObj.propertyName,
        propertyId: auctionObj.propertyId,
        sellerId: auctionObj.sellerId
      });
    }

    if (auctionObj.timeLeft <= 0) {
      clearInterval(timer);
      concludeAuction(room, io);
    }
  }, 1000);

  Object.defineProperty(auctionObj, 'timerId', {
    value: timer,
    writable: true,
    enumerable: false,
    configurable: true
  });
}

function concludeAuction(room, io) {
  if (!room.gameState || !room.gameState.activeAuction) return;
  const auction = room.gameState.activeAuction;
  if (auction.timerId) clearInterval(auction.timerId);
  room.gameState.activeAuction = null;

  const sellerState = room.gameState.playersState[auction.sellerId];
  const square = BOARD_DATA.find(s => s.id === auction.propertyId);

  // 1. Kazanan Var ise:
  if (auction.highestBidderId && room.gameState.playersState[auction.highestBidderId]) {
    const winnerState = room.gameState.playersState[auction.highestBidderId];
    winnerState.balance -= auction.currentBid;
    if (sellerState) sellerState.balance += auction.currentBid;

    if (auction.isSpecialAuction && auction.benefitType === 'irrigation_tender') {
      const hasHammadde = Object.entries(room.gameState.propertyOwnership || {}).some(
        ([pId, info]) => info.ownerId === auction.highestBidderId && (pId === '12' || pId === '15' || BOARD_DATA.find(b => b.id === Number(pId))?.subType === 'RAW_MATERIAL')
      );

      if (hasHammadde) {
        if (!room.gameState.chanceBuffs) room.gameState.chanceBuffs = {};
        if (!room.gameState.chanceBuffs[auction.highestBidderId]) room.gameState.chanceBuffs[auction.highestBidderId] = {};
        room.gameState.chanceBuffs[auction.highestBidderId].irrigationTender = { turnsLeft: 5, multiplier: 2 };
      } else {
        winnerState.balance += 120000;
        if (io) {
          io.to(room.code).emit('server:balanceUpdated', {
            playerId: auction.highestBidderId,
            newBalance: winnerState.balance,
            reason: 'Sulama İhalesi Nakit Teşvik Ödülü (Hammadde Tesisi Yok)'
          });
          io.to(room.code).emit('server:logMessage', {
            message: `⚡ [Sulama İhalesi Sonucu]: ${auction.highestBidderName}, Hammadde Tesisi (#12/#15) bulunmadığı için 2x Üretim Gücü yerine 120.000 ₺ Nakit Teşvik Ödülü aldı!`,
            type: 'success'
          });
        }
      }
    } else if (auction.propertyId !== null) {
      if (!room.gameState.propertyOwnership) room.gameState.propertyOwnership = {};
      if (!room.gameState.propertyOwnership[auction.propertyId]) {
        room.gameState.propertyOwnership[auction.propertyId] = { ownerId: auction.highestBidderId, houses: 0 };
      } else {
        room.gameState.propertyOwnership[auction.propertyId].ownerId = auction.highestBidderId;
      }
    }

    calculatePlayerTotalAssetValue(room, auction.highestBidderId);
    if (sellerState) calculatePlayerTotalAssetValue(room, auction.sellerId);

    if (io) {
      io.to(room.code).emit('server:auctionConcluded', {
        success: true,
        propertyId: auction.propertyId,
        propertyName: auction.propertyName,
        winnerId: auction.highestBidderId,
        winnerName: auction.highestBidderName,
        finalPrice: auction.currentBid,
        sellerId: auction.sellerId,
        roomState: {
          playersState: room.gameState.playersState,
          propertyOwnership: room.gameState.propertyOwnership
        }
      });
      io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    }
  } else {
    // 2. Teklif Gelmediyse: Özel ihale ise iptal olur, normal mülk ise Devlet %50 fiyata el koyar (Auto-Auction ise Devlette kalır)
    if (auction.isSpecialAuction) {
      if (io) {
        io.to(room.code).emit('server:auctionConcluded', {
          success: true,
          propertyId: null,
          propertyName: auction.propertyName,
          winnerId: null,
          winnerName: 'Hiç kimse (İhaleye teklif gelmedi)',
          finalPrice: 0,
          sellerId: null,
          roomState: {
            playersState: room.gameState.playersState,
            propertyOwnership: room.gameState.propertyOwnership
          }
        });
        io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
      }
    } else if (auction.isAutoAuction) {
      delete room.gameState.propertyOwnership[auction.propertyId];
      if (io) {
        io.to(room.code).emit('server:auctionConcluded', {
          success: true,
          propertyId: auction.propertyId,
          propertyName: auction.propertyName,
          winnerId: null,
          winnerName: 'Devlet / Özelleştirme İdaresi (İhaleye Teklif Gelmedi - Devlette Kaldı)',
          finalPrice: 0,
          sellerId: null,
          roomState: {
            playersState: room.gameState.playersState,
            propertyOwnership: room.gameState.propertyOwnership
          }
        });
        io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
      }
    } else {
      const statePrice = Math.round((square?.price || 100000) * 0.50);
      if (sellerState) sellerState.balance += statePrice;
      delete room.gameState.propertyOwnership[auction.propertyId];
      if (sellerState) calculatePlayerTotalAssetValue(room, auction.sellerId);

      if (io) {
        io.to(room.code).emit('server:auctionConcluded', {
          success: true,
          propertyId: auction.propertyId,
          propertyName: auction.propertyName,
          winnerId: null,
          winnerName: 'Devlet (İhale Boş Kaldı - %50 Alım)',
          finalPrice: statePrice,
          sellerId: auction.sellerId,
          roomState: {
            playersState: room.gameState.playersState,
            propertyOwnership: room.gameState.propertyOwnership
          }
        });
        io.to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
      }
    }
  }

  // 10. Tur Otomatik Açık Artırma (Auto-Auction) Sırası Devam Ediyorsa
  if (room.gameState.autoAuctionQueue && room.gameState.autoAuctionQueue.length > 0) {
    setTimeout(() => {
      startNextAutoAuction(room, io || room.ioInstance);
    }, 3000);
  } else if (room.gameState.isAutoAuctionRunning) {
    room.gameState.isAutoAuctionRunning = false;
    if (io || room.ioInstance) {
      (io || room.ioInstance).to(room.code).emit('server:logMessage', {
        message: `🏁 [PİYASA DOYGUNLUĞU İHALESİ TAMAMLANDI!]: İhale süreci sona erdi.`,
        type: 'success'
      });
      (io || room.ioInstance).to(room.code).emit('server:gameStateUpdate', { gameState: room.gameState });
    }
  }
}

export function startSpecialAuction(roomCode, io) {
  const room = rooms.get(roomCode);
  if (!room || !room.isStarted || !room.gameState) return;

  const roundsCompleted = Math.floor((room.gameState.totalTurnsCompleted || 0) / room.players.length);
  if (roundsCompleted < 5) {
    return;
  }

  if (room.gameState.activeAuction?.timerId) {
    clearInterval(room.gameState.activeAuction.timerId);
  }

  const auctionObj = {
    id: Date.now().toString(),
    isSpecialAuction: true,
    propertyId: null,
    propertyName: 'Akıllı Sulama Sistemleri İhalesi (5 Tur 2x Getiri)',
    sellerId: null,
    sellerName: 'Devlet / Tarım Bakanlığı',
    startingPrice: 30000,
    currentBid: 30000,
    highestBidderId: null,
    highestBidderName: null,
    timeLeft: 20,
    benefitType: 'irrigation_tender'
  };

  room.gameState.activeAuction = auctionObj;

  const timer = setInterval(() => {
    if (!room.gameState.activeAuction || room.gameState.activeAuction.id !== auctionObj.id) {
      clearInterval(timer);
      return;
    }

    auctionObj.timeLeft -= 1;
    if (io) {
      io.to(roomCode).emit('server:auctionTick', {
        timeLeft: auctionObj.timeLeft,
        currentBid: auctionObj.currentBid,
        highestBidderId: auctionObj.highestBidderId,
        highestBidderName: auctionObj.highestBidderName,
        propertyName: auctionObj.propertyName,
        propertyId: auctionObj.propertyId,
        sellerId: auctionObj.sellerId
      });
    }

    if (auctionObj.timeLeft <= 0) {
      clearInterval(timer);
      concludeAuction(room, io);
    }
  }, 1000);

  Object.defineProperty(auctionObj, 'timerId', {
    value: timer,
    writable: true,
    enumerable: false,
    configurable: true
  });

  if (io) {
    io.to(roomCode).emit('server:startSpecialAuction', { auction: auctionObj });
    io.to(roomCode).emit('server:auctionStarted', { auction: auctionObj });
    io.to(roomCode).emit('server:gameStateUpdate', { gameState: room.gameState });
  }
}

export function chanceCardDecision(socketId, { cardId, decision }) {
  const code = socketToRoom.get(socketId);
  if (!code) return { success: false, error: 'Oda bulunamadı.' };
  const room = rooms.get(code);
  if (!room || !room.gameState) return { success: false, error: 'Oyun başlamamış.' };

  const waiting = room.gameState.waitingForChanceDecision;
  if (!waiting || waiting.playerId !== socketId || waiting.cardId !== cardId) {
    return { success: false, error: 'Bekleyen bir şans kartı kararınız yok veya geçersiz.' };
  }

  const card = CHANCE_CARDS.find(c => c.id === cardId);
  if (!card) return { success: false, error: 'Kart bulunamadı.' };

  const selectedOption = decision === 'A' ? card.optionA : card.optionB;
  const playerState = room.gameState.playersState[socketId];
  const player = room.players.find(p => p.id === socketId);

  let newsFlashTitle = `📰 BORSADA SON DAKİKA: ${card.title.toUpperCase()}`;
  let newsFlashMessage = `${player?.name || 'Oyuncu'} şans kartında [Seçenek ${decision}: ${selectedOption.label}] kararını aldı. `;

  // Maliyet kesintisi veya nakit girişi (Örn: Katar ortaklığı cost = -150000)
  if (selectedOption.cost !== 0 && selectedOption.cost !== undefined) {
    playerState.balance -= selectedOption.cost;

    if (selectedOption.cost > 0) {
      if (selectedOption.actionType === 'bribe_media') {
        const mediaOwnerId = room.gameState.propertyOwnership?.[29]?.ownerId || room.gameState.propertyOwnership?.[28]?.ownerId;
        if (mediaOwnerId) {
          if (mediaOwnerId !== socketId) {
            const mediaOwnerState = room.gameState.playersState[mediaOwnerId];
            const mediaOwnerPlayer = room.players.find(p => p.id === mediaOwnerId);
            if (mediaOwnerState) {
              mediaOwnerState.balance += selectedOption.cost;
              newsFlashMessage += `Ödenen ${selectedOption.cost?.toLocaleString('tr-TR')} ₺ rüşvet/PR bedeli doğrudan Medya Şirketi sahibi ${mediaOwnerPlayer?.name || 'Oyuncu'}'nun kasasına aktarıldı! `;
            }
          } else {
            // Medya sahibi kendisi ise ödeme yapmaz (net 0)
            playerState.balance += selectedOption.cost; // İade et
            newsFlashMessage += `Sahibi olduğu Medya Şirketi sayesinde herhangi bir PR/rüşvet bedeli ödemedi (Kendi PR şirketi)! `;
          }
        } else {
          newsFlashMessage += `Ödenen ${selectedOption.cost?.toLocaleString('tr-TR')} ₺ bedel devlete (bankaya) aktarıldı. `;
        }
      } else {
        newsFlashMessage += `Kasasından ${selectedOption.cost?.toLocaleString('tr-TR')} ₺ ödeme yaptı. `;
      }
    } else if (selectedOption.cost < 0) {
      newsFlashMessage += `Kasasına anında ${(-selectedOption.cost)?.toLocaleString('tr-TR')} ₺ sıcak para girdi. `;
    }
  } else {
    if (!selectedOption.actionType || selectedOption.actionType === 'none') {
      newsFlashMessage += `Herhangi bir ek masrafa veya riske girilmedi. `;
    }
  }

  if (!room.gameState.chanceBuffs) room.gameState.chanceBuffs = {};
  if (!room.gameState.chanceBuffs[socketId]) room.gameState.chanceBuffs[socketId] = {};
  const myBuffs = room.gameState.chanceBuffs[socketId];

  // 11 Kartın Özel Action Tipi ve Backend Olasılıkları (Math.random())
  if (selectedOption.actionType === 'startup_invest') {
    if (Math.random() < 0.40) {
      playerState.balance += selectedOption.cost * 3;
      newsFlashMessage += `🚀 YATIRIM PATLAMA YAPTI! Girişim 3 katına satıldı ve kasaya +${(selectedOption.cost * 3)?.toLocaleString('tr-TR')} ₺ girdi!`;
    } else {
      newsFlashMessage += `📉 Girişim başarısız oldu ve yatırılan paralar eridi.`;
    }
  } else if (selectedOption.actionType === 'esports_invest') {
    if (Math.random() < 0.55) {
      playerState.balance += selectedOption.cost * 2;
      newsFlashMessage += `🎮 ŞAMPİYONLUK! Sponsor olunan takım turnuvayı kazandı (+${(selectedOption.cost * 2)?.toLocaleString('tr-TR')} ₺ getiri)!`;
    } else {
      newsFlashMessage += `🕹️ E-Spor takımı ilk turda elendi, sponsorluk bedeli boşa gitti.`;
    }
  } else if (selectedOption.actionType === 'state_tender') {
    const portOwnerId = room.gameState.propertyOwnership?.[5]?.ownerId;
    if (portOwnerId && portOwnerId !== socketId && room.gameState.playersState[portOwnerId]) {
      room.gameState.playersState[portOwnerId].balance += selectedOption.cost;
      newsFlashMessage += `İhale giriş bedeli doğrudan Liman işletmecisine aktarıldı. `;
    } else {
      if (!room.gameState.jailState?.pool) if (!room.gameState.jailState) room.gameState.jailState = { pool: 0 };
      room.gameState.jailState.pool = (room.gameState.jailState.pool || 0) + selectedOption.cost;
    }

    if (Math.random() < 0.60) {
      myBuffs.tenderIncome = 35000;
      myBuffs.tenderIncomeTurns = 3;
      newsFlashMessage += `🏗️ İHALE KAZANILDI! 3 tur boyunca her tur başında kasaya +35.000 ₺ düzenli nakit akışı sağlanacak!`;
    } else {
      newsFlashMessage += `❌ İhale kaybedildi, giriş bedeli devlete kaldı.`;
    }
  } else if (selectedOption.actionType === 'defy_slander') {
    myBuffs.earningsRatio = 0.50;
    myBuffs.earningsTurns = 3;
    newsFlashMessage += `⚠️ Rüşvet vermeyi reddetti ama hisseleri çakıldı! 3 tur boyunca tüm kazançları %50 kesintili olacak.`;
  } else if (selectedOption.actionType === 'qatar_partnership') {
    myBuffs.qatarPartner = true;
    newsFlashMessage += `🤝 KATAR ORTAKLIGI! Bundan sonra tüm işletme gelirlerinin %40'ı fona kesilecek.`;
  } else if (selectedOption.actionType === 'stock_adventure') {
    const invested = Math.round(playerState.balance * 0.50);
    playerState.balance -= invested;
    if (Math.random() < 0.55) {
      playerState.balance += invested * 2;
      newsFlashMessage += `📈 BORSADA RALLİ! Yatırdığı ${invested?.toLocaleString('tr-TR')} ₺ hisseyi ikiye katladı (+${(invested * 2)?.toLocaleString('tr-TR')} ₺)!`;
    } else {
      newsFlashMessage += `📉 BORSA ÇAKILDI! Borsaya yatırdığı ${invested?.toLocaleString('tr-TR')} ₺ nakit parası eridi!`;
    }
  } else if (selectedOption.actionType === 'tax_immunity') {
    myBuffs.taxImmunity = true;
    myBuffs.taxImmunityTurns = 2;
    newsFlashMessage += `🛡️ VERGİ MUAFİYETİ! 2 tur boyunca hiçbir hazine vergisi ve gümrük komisyonu ödemeyecek.`;
  } else if (selectedOption.actionType === 'housing_support') {
    myBuffs.housingSupport = { level2Turns: 2, level3Turns: 1 };
    newsFlashMessage += `🏡 DEVLET KONUT DESTEĞİ! 2 evli mülklerinin kirası 2 tur, 3 evli mülklerinin kirası 1 tur boyunca 2 katına çıktı!`;
  } else if (selectedOption.actionType === 'build_incentive') {
    myBuffs.buildDiscount = 0.45;
    myBuffs.buildDiscountTurns = 1;
    newsFlashMessage += `🏗️ İNŞAAT TEŞVİKİ! 1 tur boyunca tüm ev ve otel dikme maliyetleri %45 indirimli olacak.`;
  } else if (selectedOption.actionType === 'sabotage_port') {
    const portOwnerId = room.gameState.propertyOwnership?.[5]?.ownerId;
    if (!portOwnerId) {
      newsFlashMessage += `Liman sahipsiz olduğu için operasyon devlete karşı yapıldı ve kiralama açıldı.`;
    } else {
      const portOwner = room.players.find(p => p.id === portOwnerId);
      if (Math.random() < 0.10) {
        myBuffs.penaltyRatio = 0.30;
        myBuffs.penaltyRatioTurns = 5;
        newsFlashMessage += `🚨 SKANDAL İFŞA OLDU! ${portOwner?.name || 'Liman sahibine'} kurulan kumpas ortaya çıktı! Haberi yaptıran oyuncunun 5 tur boyunca tüm gelirleri %30 kesilecek!`;
      } else {
        delete room.gameState.propertyOwnership[5];
        newsFlashMessage += `⚓ LİMAN SÖZLEŞMESİ İPTAL EDİLDİ! Medyada çıkan belgeler sonrası ${portOwner?.name || 'Liman sahibinin'} sözleşmesi feshedildi ve mülk boşa düştü!`;
      }
    }
  } else if (selectedOption.actionType === 'scandal_penalty') {
    myBuffs.earningsRatio = 0.30;
    myBuffs.earningsTurns = 2;
    newsFlashMessage += `📸 FUHUŞ SKANDALI PATLADI! Rüşvet vermeyi reddetti! İtibar kaybından dolayı 2 tur boyunca tüm kazançları %70 düşecek!`;
  } else if (selectedOption.actionType === 'rent_boost') {
    myBuffs.rentMultiplier = selectedOption.rentMultiplier || 1.5;
    myBuffs.rentTurns = selectedOption.turnsLeft || 3;
    newsFlashMessage += `3 tur boyunca 7. Grup kiraları %50 zamlandı!`;
  } else if (selectedOption.actionType === 'go_bonus') {
    if (!room.gameState.goBonus) room.gameState.goBonus = {};
    room.gameState.goBonus[socketId] = (room.gameState.goBonus[socketId] || 0) + (selectedOption.bonusAmount || 150000);
    newsFlashMessage += `Bir sonraki Başlangıç (GO) geçişinde ek +150.000 ₺ prim tahsil edecek!`;
  } else if (selectedOption.actionType === 'PAY_POLICE_BRIBE') {
    newsFlashMessage += `🚨 RÜŞVETLE ÖRTBAS! Emniyet ve medyaya 80.000 TL ödeyerek oteldeki mafya hesaplaşmasını kapattı.`;
  } else if (selectedOption.actionType === 'HALT_HOTEL_INCOME') {
    myBuffs.haltedHotelTurns = 3;
    newsFlashMessage += `🏨 OTEL MÜHÜRLENDİ! Mafya hesaplaşması basına yansıdı! En lüks oteli 3 tur boyunca kira getirmeyecek!`;
  } else if (selectedOption.actionType === 'PAY_INSPECTOR_BRIBE') {
    newsFlashMessage += `🚧 RÜŞVETLE İNŞAAT DEVAM! Denetmenlere 40.000 TL ödeyerek deniz kumu kullanılan kentsel dönüşüm projesinin durmasını engelledi.`;
  } else if (selectedOption.actionType === 'DESTROY_TOP_BUILDINGS') {
    let topPropId = null;
    let maxVal = -1;
    Object.entries(room.gameState.propertyOwnership || {}).forEach(([id, info]) => {
      if (info.ownerId === socketId && (info.houses || 0) > 0) {
        const sq = BOARD_DATA.find(s => s.id === Number(id));
        if (sq) {
          const val = (sq.price || 0) + (info.houses || 0) * (sq.housePrice || 0);
          if (val > maxVal) {
            maxVal = val;
            topPropId = Number(id);
          }
        }
      }
    });
    if (topPropId !== null) {
      room.gameState.propertyOwnership[topPropId].houses = 0;
      calculatePlayerTotalAssetValue(room, socketId);
      const sq = BOARD_DATA.find(s => s.id === topPropId);
      newsFlashMessage += `🏚️ BİNALAR YIKILDI! Belediye denetimi sonucu en değerli mülkü #${topPropId} (${sq?.name || 'Mülk'}) üzerindeki tüm ev ve oteller anında yıkıldı!`;
    } else {
      newsFlashMessage += `🏚️ Yıkılacak binası olmadığı için ceza yara almadan atlatıldı.`;
    }
  } else if (selectedOption.actionType === 'PAY_HACKER_RANSOM') {
    newsFlashMessage += `💻 FİDYE ÖDENDİ! Siber korsanlara 50.000 TL ödeyerek holding sistemlerinin kilitlenmesini anında açtı.`;
  } else if (selectedOption.actionType === 'RESET_SYSTEMS_HALT') {
    myBuffs.haltedBusinessTurns = 2;
    newsFlashMessage += `⚠️ SİSTEMLER SIFIRLANDI! Siber saldırı nedeniyle tüm işletmeleri (Fabrika, Liman, AVM, Hammadde, Medya) 2 tur boyunca kapalı kalacak!`;
  } else if (selectedOption.actionType === 'GO_TO_JAIL_NO_SALARY') {
    playerState.position = 13;
    if (!room.gameState.jailState) room.gameState.jailState = {};
    room.gameState.jailState[socketId] = { inJail: true, turnsServed: 0, noSalaryThisTurn: true };
    newsFlashMessage += `🚨 TUTUKLANDI! İçeriden bilgi ticareti belgelendi ve doğrudan Hapse (Gözaltı karesine) gönderildi!`;
  } else if (selectedOption.actionType === 'PAY_UNION_DEATH_FINE') {
    myBuffs.haltedFactoryTurns = 2;
    newsFlashMessage += `🏭 ÜRETİM DURDU! Sendika liderinin ölümü sonrası 50.000 TL tazminat ödedi, Fabrika ve Hammadde tesisleri 2 tur boyunca kapalı kalacak!`;
  } else if (selectedOption.actionType === 'PAY_CUSTOMS_FINE') {
    newsFlashMessage += `🛃 DOSYA KAPANDI! Gümrükteki kaçak mal iddiaları için anında 100.000 TL ceza ödeyip dosyayı kapattı.`;
  } else if (selectedOption.actionType === 'LAWSUIT_CUSTOMS') {
    if (Math.random() < 0.50) {
      newsFlashMessage += `⚖️ DAVA KAZANILDI! Avukatlar gümrük davasını mahkemede kazandı ve hiçbir ceza ödenmedi!`;
    } else {
      playerState.balance -= 130000;
      newsFlashMessage += `⚖️ DAVA KAYBEDİLDİ! Mahkeme kaçak mallar için 130.000 TL ağır para cezası kesti (-130.000 ₺)!`;
    }
  } else if (selectedOption.actionType === 'RIG_IRRIGATION_TENDER') {
    const hasHammadde = Object.entries(room.gameState.propertyOwnership || {}).some(
      ([pId, info]) => info.ownerId === socketId && (pId === '12' || pId === '15' || BOARD_DATA.find(b => b.id === Number(pId))?.subType === 'RAW_MATERIAL')
    );
    if (hasHammadde) {
      myBuffs.irrigationTender = { turnsLeft: 5, multiplier: 2 };
      newsFlashMessage += `🤝 İHALEYE FESAT KARILDI! Komisyona 30.000 TL ödedi, Hammadde tesisinden 5 tur boyunca 2 kat üretim ve kira getirisi sağlayacak!`;
    } else {
      playerState.balance += 120000;
      newsFlashMessage += `🤝 İHALEYE FESAT KARILDI! Hammadde Tesisi (#12/#15) olmadığı için 2x Üretim yerine 120.000 ₺ Nakit Teşvik Ödülü aldı (+120.000 ₺)!`;
    }
  } else if (selectedOption.actionType === 'TRIGGER_PUBLIC_AUCTION') {
    newsFlashMessage += `⚡ AÇIK İHALE BAŞLIYOR! Sulama altyapısı ihalesi için tüm oyunculara açık olan 20 saniyelik ihale süreci tetiklendi!`;
  } else if (selectedOption.actionType === 'RENT_TO_MOVIE_SET') {
    myBuffs.movieSetHalt = 1;
    newsFlashMessage += `🎬 DİZİ SETİ KURULDU! Ünlü yönetmenin mafya dizisine mülkünü kiraladı (+70.000 ₺)! Ancak set kurulan mülkten 1 tur kira almayacak.`;
  } else if (selectedOption.actionType === 'SELL_CHEAPEST_PROPERTY_HIGH') {
    let cheapestPropId = null;
    let minVal = Infinity;
    Object.entries(room.gameState.propertyOwnership || {}).forEach(([id, info]) => {
      if (info.ownerId === socketId) {
        const sq = BOARD_DATA.find(s => s.id === Number(id));
        if (sq && sq.type === 'property') {
          const val = (sq.price || 0) + (info.houses || 0) * (sq.housePrice || 0);
          if (val < minVal) {
            minVal = val;
            cheapestPropId = Number(id);
          }
        }
      }
    });
    if (cheapestPropId !== null) {
      const sq = BOARD_DATA.find(s => s.id === cheapestPropId);
      delete room.gameState.propertyOwnership[cheapestPropId];
      calculatePlayerTotalAssetValue(room, socketId);
      newsFlashMessage += `🤝 KONSORSİYUM SATIN ALMASI! Sahip olduğu en ucuz arsa #${cheapestPropId} (${sq?.name || 'Mülk'}) yabancı fona devredildi (+150.000 ₺)!`;
    } else {
      newsFlashMessage += `🤝 Devredecek arsası olmadığı için sadece +150.000 ₺ hibe aldı.`;
    }
  } else if (selectedOption.actionType === 'SMUGGLE_GOODS_60_40') {
    if (Math.random() < 0.60) {
      playerState.balance += 120000;
      newsFlashMessage += `📦 KAÇAKÇILIK BAŞARILI! Sınır kapısındaki denetimleri atlatarak ülkeye soktuğu elektronik eşyalardan +120.000 ₺ temiz kazanç sağladı!`;
    } else {
      playerState.position = 13;
      if (!room.gameState.jailState) room.gameState.jailState = {};
      room.gameState.jailState[socketId] = { inJail: true, turnsServed: 0 };
      newsFlashMessage += `🚨 OPERASYON PATLADI! Sınır kapısında kaçak mallara el konuldu ve oyuncu doğrudan Hapse atıldı!`;
    }
  } else if (selectedOption.actionType === 'DO_NOTHING') {
    newsFlashMessage += `🛡️ Riske girmeden yasal rutin ticarete devam etti.`;
  }

  const hasHushOption = card.optionA?.actionType === 'bribe_media' || card.optionB?.actionType === 'bribe_media';
  const choseHushOption = selectedOption.actionType === 'bribe_media';
  const isCrisis = !choseHushOption && (hasHushOption || selectedOption.actionType === 'pay_compensation' || selectedOption.actionType === 'penalty' || card.isScandal === true);

  const isDouble = waiting.isDouble;
  delete room.gameState.waitingForChanceDecision;

  advanceToNextTurn(room, isDouble);
  const nextActivePlayerId = room.players[room.gameState.currentTurnIndex]?.id;

  return {
    success: true,
    room,
    playerId: socketId,
    playerName: player?.name,
    card,
    decision,
    selectedOption,
    newsFlash: {
      title: newsFlashTitle,
      message: newsFlashMessage,
      isCrisis,
      timestamp: Date.now()
    },
    newBalance: playerState.balance,
    currentTurnIndex: room.gameState.currentTurnIndex,
    activePlayerId: nextActivePlayerId
  };
}

export function getActiveRoomCount() {
  return rooms.size;
}

/**
 * FAZ 10 / Geri Dönüşler Faz 3: İşletme İsimlendirme (renameBusiness)
 */
export function renameBusiness(socketId, propertyId, customName) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.gameState) return { success: false, error: 'Oda bulunamadı' };

  const ownership = room.gameState.propertyOwnership[propertyId];
  if (!ownership || ownership.ownerId !== socketId) {
    return { success: false, error: 'Bu işletmenin sahibi değilsiniz.' };
  }

  let sanitizedName = (customName || '').trim();
  // Karakter limiti (Max 30 karakter) ve XSS koruması
  sanitizedName = sanitizedName.replace(/[<>]/g, '').substring(0, 30);
  if (!sanitizedName) {
    return { success: false, error: 'İşletme ismi boş bırakılamaz.' };
  }

  ownership.customName = sanitizedName;
  return { success: true, room };
}

/**
 * FAZ 10 / Geri Dönüşler Faz 3: Takas Teklifi Gönderme (sendSwapOffer)
 */
export function sendSwapOffer(socketId, toId, offeredProperties, offeredCash, requestedProperties, requestedCash) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil.' };
  }

  const sender = room.players.find(p => p.id === socketId);
  const target = room.players.find(p => p.id === toId);
  if (!sender || !target || socketId === toId) {
    return { success: false, error: 'Geçersiz alıcı oyuncu.' };
  }

  const senderState = room.gameState.playersState[socketId];
  const targetState = room.gameState.playersState[toId];

  if (senderState.balance < 0) {
    return { success: false, error: 'Borç Modundayken takas teklif edemezsiniz!' };
  }

  // Offered properties kontrolü
  for (const propId of offeredProperties) {
    const ownership = room.gameState.propertyOwnership[propId];
    if (!ownership || ownership.ownerId !== socketId) {
      return { success: false, error: `Teklif ettiğiniz #${propId} mülküne sahip değilsiniz.` };
    }
    if (ownership.isMortgaged) {
      return { success: false, error: `İpotekli mülkler (#${propId}) takas masasına yatırılamaz! Önce ipoteği kaldırın.` };
    }
  }

  // Requested properties kontrolü
  for (const propId of requestedProperties) {
    const ownership = room.gameState.propertyOwnership[propId];
    if (!ownership || ownership.ownerId !== toId) {
      return { success: false, error: `Karşı taraftan istediğiniz #${propId} mülkü alıcıya ait değil.` };
    }
    if (ownership.isMortgaged) {
      return { success: false, error: `Karşı tarafın ipotekli mülkü (#${propId}) takas masasına yatırılamaz.` };
    }
  }

  // Para kontrolleri ve sanitizasyonu
  const offCash = Number(offeredCash || 0);
  const reqCash = Number(requestedCash || 0);

  if (isNaN(offCash) || !Number.isInteger(offCash) || offCash < 0) {
    return { success: false, error: 'Teklif edilen nakit para miktarı geçersiz.' };
  }
  if (isNaN(reqCash) || !Number.isInteger(reqCash) || reqCash < 0) {
    return { success: false, error: 'Talep edilen nakit para miktarı geçersiz.' };
  }

  if (senderState.balance < offCash) {
    return { success: false, error: 'Teklif ettiğiniz nakit para bakiyenizden fazla!' };
  }
  if (targetState.balance < reqCash) {
    return { success: false, error: 'Karşı tarafın bakiyesi talep ettiğiniz nakit miktarına yetmiyor.' };
  }

  const offer = {
    id: 'swap_' + Date.now().toString(),
    fromId: socketId,
    fromName: sender.name,
    toId,
    toName: target.name,
    offeredProperties,
    offeredCash: offCash,
    requestedProperties,
    requestedCash: reqCash
  };

  room.gameState.activeSwapOffer = offer;
  return { success: true, room, offer };
}

/**
 * FAZ 10 / Geri Dönüşler Faz 3: Takas Teklifine Yanıt Verme (respondSwapOffer)
 */
export function respondSwapOffer(socketId, offerId, accepted) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.isStarted || !room.gameState) {
    return { success: false, error: 'Oyun aktif değil.' };
  }

  const offer = room.gameState.activeSwapOffer;
  if (!offer || offer.id !== offerId || offer.toId !== socketId) {
    return { success: false, error: 'Bekleyen geçerli bir takas teklifi bulunamadı.' };
  }

  room.gameState.activeSwapOffer = null;

  if (!accepted) {
    return { success: true, room, accepted: false, offer };
  }

  const senderId = offer.fromId;
  const receiverId = offer.toId;
  const senderState = room.gameState.playersState[senderId];
  const receiverState = room.gameState.playersState[receiverId];

  if (!senderState || !receiverState) {
    return { success: false, error: 'Oyuncu durumları bulunamadı.' };
  }

  // Son kontroller
  for (const propId of offer.offeredProperties) {
    const ownership = room.gameState.propertyOwnership[propId];
    if (!ownership || ownership.ownerId !== senderId || ownership.isMortgaged) {
      return { success: false, error: 'Teklif edilen mülklerin sahipliği veya ipotek durumu değişmiş.' };
    }
  }
  for (const propId of offer.requestedProperties) {
    const ownership = room.gameState.propertyOwnership[propId];
    if (!ownership || ownership.ownerId !== receiverId || ownership.isMortgaged) {
      return { success: false, error: 'Talep edilen mülklerin sahipliği veya ipotek durumu değişmiş.' };
    }
  }

  if (senderState.balance < offer.offeredCash) {
    return { success: false, error: 'Teklif sahibinin bakiyesi nakit transferine yetmiyor.' };
  }
  if (receiverState.balance < offer.requestedCash) {
    return { success: false, error: 'Bakiyeniz talep edilen nakit transferine yetmiyor.' };
  }

  // Atomik takas işlemi
  offer.offeredProperties.forEach(propId => {
    room.gameState.propertyOwnership[propId].ownerId = receiverId;
    room.gameState.propertyOwnership[propId].houses = 0; // Evleri sıfırla
  });

  offer.requestedProperties.forEach(propId => {
    room.gameState.propertyOwnership[propId].ownerId = senderId;
    room.gameState.propertyOwnership[propId].houses = 0; // Evleri sıfırla
  });

  senderState.balance -= offer.offeredCash;
  receiverState.balance += offer.offeredCash;

  receiverState.balance -= offer.requestedCash;
  senderState.balance += offer.requestedCash;

  calculatePlayerTotalAssetValue(room, senderId);
  calculatePlayerTotalAssetValue(room, receiverId);

  return { success: true, room, accepted: true, offer };
}

/**
 * FAZ 11 / Geri Dönüşler Faz 4: Borsaya Yatırım Yap (submitBorsaInvestment)
 */
export function submitBorsaInvestment(socketId, amount) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.gameState) return { success: false, error: 'Oda bulunamadı' };

  const waiting = room.gameState.waitingForBorsa;
  if (!waiting || waiting.playerId !== socketId) {
    return { success: false, error: 'Borsa yatırım sırası sizde değil.' };
  }

  const playerState = room.gameState.playersState[socketId];
  if (!playerState) return { success: false, error: 'Oyuncu durumu bulunamadı.' };

  const investAmount = Number(amount) || 0;
  if (isNaN(investAmount) || !Number.isInteger(investAmount) || investAmount < 0) {
    return { success: false, error: 'Geçersiz yatırım miktarı (pozitif bir tam sayı olmalı).' };
  }

  if (investAmount > playerState.balance) {
    return { success: false, error: 'Bakiyenizden fazla yatırım yapamazsınız.' };
  }

  if (investAmount > 0) {
    playerState.balance -= investAmount;
    room.gameState.borsaInvestments = room.gameState.borsaInvestments || [];
    room.gameState.borsaInvestments.push({
      playerId: socketId,
      amount: investAmount,
      turnsLeft: 2
    });
    
    room.gameState.gameLogs = room.gameState.gameLogs || [];
    room.gameState.gameLogs.push({
      id: Date.now().toString() + Math.random().toString(),
      text: `💰 BORSA YATIRIMI: ${room.players.find(p => p.id === socketId)?.name} Borsaya ${investAmount.toLocaleString('tr-TR')} ₺ nakit yatırdı! Sonuçlar 2 tur sonra belli olacak.`,
      type: 'info',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    });
  }

  const isDouble = waiting.isDouble;
  delete room.gameState.waitingForBorsa;

  advanceToNextTurn(room, isDouble);
  const nextActivePlayerId = room.players[room.gameState.currentTurnIndex]?.id;

  return { 
    success: true, 
    room, 
    newBalance: playerState.balance, 
    currentTurnIndex: room.gameState.currentTurnIndex, 
    activePlayerId: nextActivePlayerId 
  };
}

export function playCasinoAction(socketId, betAmount, result) {
  const room = getRoomBySocketId(socketId);
  if (!room || !room.gameState) return { success: false, error: 'Oyun bulunamadı.' };
  
  const playerState = room.gameState.playersState[socketId];
  if (!playerState) return { success: false, error: 'Oyuncu bulunamadı.' };
  
  let resultMessage = '';
  const playerName = room.players.find(p => p.id === socketId)?.name || 'Oyuncu';
  
  if (result === 'win') {
    playerState.balance += betAmount;
    resultMessage = `🎰 YERALTI KUMARHANESİ: ${playerName} KAZANDI ve ${betAmount.toLocaleString('tr-TR')} ₺ elde etti!`;
  } else if (result === 'lose') {
    playerState.balance -= betAmount;
    resultMessage = `🎰 YERALTI KUMARHANESİ: ${playerName} KAYBETTİ ve ${betAmount.toLocaleString('tr-TR')} ₺ masada kaldı!`;
  } else {
    // draw
    resultMessage = `🎰 YERALTI KUMARHANESİ: ${playerName} BERABERE!`;
  }
  
  if (room.ioInstance) {
    room.ioInstance.to(room.code).emit('server:logMessage', {
      message: resultMessage,
      type: result === 'win' ? 'success' : (result === 'lose' ? 'error' : 'info')
    });
  }
  
  let currentTurnIndex = room.gameState.currentTurnIndex;
  let activePlayerId = room.players[currentTurnIndex]?.id;

  const session = room.gameState.casinoSession;
  if (session) {
    if (!session.finishedPlayers.includes(socketId)) {
      session.finishedPlayers.push(socketId);
    }
    
    // Check if everyone finished
    if (session.finishedPlayers.length >= session.joinedPlayers.length) {
      const isDouble = session.isDouble;
      room.gameState.waitingForCasino = null;
      room.gameState.casinoSession = null;
      advanceToNextTurn(room, isDouble);
      
      currentTurnIndex = room.gameState.currentTurnIndex;
      activePlayerId = room.players[currentTurnIndex]?.id;
    }
  } else if (room.gameState.waitingForCasino && room.gameState.waitingForCasino.playerId === socketId) {
    // Fallback for single player if session missing
    const isDouble = room.gameState.waitingForCasino.isDouble;
    room.gameState.waitingForCasino = null;
    advanceToNextTurn(room, isDouble);
    
    currentTurnIndex = room.gameState.currentTurnIndex;
    activePlayerId = room.players[currentTurnIndex]?.id;
  }
  
  return {
    success: true,
    room,
    playerId: socketId,
    newBalance: playerState.balance,
    currentTurnIndex,
    activePlayerId
  };
}
