import { create } from 'zustand';
import socket from '../services/socket.js';
import { BOARD_DATA } from '../constants/boardData.js';

/**
 * Holding Simülasyonu (Faz 1, 2, 3 & 4) - Merkezi Zustand State Yönetimi
 */
export const useGameStore = create((set, get) => ({
  // Temel Durumlar (States)
  socketConnected: socket.connected,
  myId: socket.id || null,
  playerName: localStorage.getItem('holding_nickname') || '',
  roomCode: '',
  isHost: false,
  players: [],
  gameStarted: false,
  currentScreen: 'home', // 'home' | 'waiting' | 'game'
  loading: false,
  toast: { show: false, type: 'info', message: '' },
  error: null,

  // Çekirdek Oyun & Ekonomi Motoru Durumları
  gameState: null,
  lastDiceRoll: null,
  gameLogs: [],
  pendingLogs: [],
  offeredProperty: null, // Sahipsiz şehre / ticaret mülküne ulaşıldığında satın alma modalı için
  activeTradeOffer: null, // FAZ 4: İşletme sahibinden gelen hammadde/ürün pazarlık teklifi
  activeSwapOffer: null, // FAZ 10: Gelişmiş bilateral takas teklifi
  activeBusinessNaming: null, // FAZ 10: İşletme isimlendirme modalı
  activeAuction: null, // FAZ 5: Canlı devam eden ihale
  auctionCountdown: null, // Özel ihale geri sayım
  isPropertyModalMinimized: false, // Yeni: YouTube PIP stili küçültme durumları
  isAuctionModalMinimized: false,
  activeBankModal: false,
  activeJailModal: false,
  activeChanceCard: null,
  newsFlash: null,
  theme: 'dark', // 'dark' | 'light'
  activeDiceAnimation: null,
  isTokenMoving: false,
  movingTokenTarget: null,
  activeJailAlert: null,
  activePortLeaseAuction: null, // Liman (#5) kiralama ihalesi bildirimi
  activeTab: 'turn',
  isSpectator: false,
  spectators: [],

  // Bildirim / Toast Gösterme İşlevi
  showToast: (message, type = 'info', duration = 3500) => {
    set({ toast: { show: true, type, message } });
    setTimeout(() => {
      set(state => (state.toast.message === message ? { toast: { show: false, type: 'info', message: '' } } : {}));
    }, duration);
  },

  // Simülasyon Kütüğüne (Activity Log) Kayıt Ekleme
  addLog: (text, type = 'info') => {
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text,
      type
    };

    set(state => {
      // Eğer zar dönüyorsa veya piyon hareket ediyorsa logları ekrana basma, kuyruğa al.
      const isAnimating = state.isTokenMoving || (state.activeDiceAnimation && state.activeDiceAnimation.rolling);
      
      if (isAnimating) {
        return { pendingLogs: [...state.pendingLogs, newLog] };
      }

      return { gameLogs: [newLog, ...state.gameLogs].slice(0, 50) };
    });
  },

  flushPendingLogs: () => {
    set(state => {
      if (state.pendingLogs.length === 0) return {};
      // Kuyruktaki logları al ve gameLogs'un en başına ekle (Ters çevirerek sırayı koruyalım)
      const logsToAdd = [...state.pendingLogs].reverse();
      return {
        gameLogs: [...logsToAdd, ...state.gameLogs].slice(0, 50),
        pendingLogs: []
      };
    });
  },

  setPlayerName: (name) => {
    localStorage.setItem('holding_nickname', name);
    set({ playerName: name });
  },

  /**
   * Socket event dinleyicilerini başlatır
   */
  setupListeners: () => {
    socket.off('connect');
    socket.off('disconnect');
    socket.off('server:roomUpdate');
    socket.off('server:gameStarted');
    socket.off('server:error');
    socket.off('server:diceRolled');
    socket.off('server:balanceUpdated');
    socket.off('server:turnUpdated');
    socket.off('server:gameStateUpdate');
    socket.off('server:offerProperty');
    socket.off('server:propertyBought');
    socket.off('server:propertyDeclined');
    socket.off('server:rentPaid');
    socket.off('server:houseBuilt');
    socket.off('server:receiveTradeOffer');
    socket.off('server:tradeOfferResolved');
    socket.off('server:receiveSwapOffer');
    socket.off('server:swapOfferResolved');
    socket.off('server:stateTradeCompleted');
    socket.off('server:materialProcessed');
    socket.off('server:mallStocked');
    socket.off('server:showChanceCard');
    socket.off('server:newsFlash');
    socket.off('server:playerJailed');
    socket.off('server:borsaOpportunity');
    socket.off('server:casinoOpportunity');
    socket.off('server:portLeaseOpportunity');
    socket.off('server:portLeaseWon');
    socket.off('server:borsaOpportunity');
    socket.off('server:logMessage');

    set({ myId: socket.id || null });

    socket.on('connect', () => {
      set({ socketConnected: true, myId: socket.id });
    });

    socket.on('disconnect', () => {
      set({ socketConnected: false });
      get().showToast('Sunucu bağlantısı koptu. Yeniden bağlanılmaya çalışılıyor...', 'error', 5000);
    });

    socket.on('server:roomUpdate', (data) => {
      const { roomCode, players, spectators, isStarted, leftPlayerId, newHostId, gameState } = data;
      
      const myInfo = players.find(p => p.id === socket.id);
      const myInfoInSpecs = spectators?.find(s => s.id === socket.id);
      const amIHost = myInfo ? myInfo.isHost : false;

      set({
        roomCode,
        players,
        spectators: spectators || [],
        isSpectator: !!myInfoInSpecs,
        isHost: amIHost,
        gameStarted: isStarted
      });

      if (gameState) {
        set({ gameState });
      }

      if (isStarted && get().currentScreen === 'waiting') {
        set({ currentScreen: 'game' });
      }

      if (leftPlayerId && newHostId === socket.id) {
        get().showToast('Kurucu odadan ayrıldı. Odanın yeni kurucusu (Host) sizsiniz!', 'success', 5000);
      } else if (leftPlayerId) {
        get().showToast('Bir oyuncu odadan ayrıldı.', 'info', 2500);
      }
    });

    socket.on('server:gameStarted', (data) => {
      set({
        gameStarted: true,
        currentScreen: 'game',
        gameState: data.gameState || {
          boardData: BOARD_DATA,
          currentTurnIndex: 0,
          playersState: {},
          propertyOwnership: {},
          tradeState: { 15: { stock: 0 }, 24: { rawMaterialStock: 0, productStock: 0 }, 35: { productStock: 0, activeStockTurns: 0 } }
        },
        lastDiceRoll: null,
        offeredProperty: null,
        activeTradeOffer: null,
        activeChanceCard: null,
        newsFlash: null,
        gameLogs: []
      });
      get().showToast('Simülasyon tahtası açıldı! Tur, zar ve ticaret zinciri motoru aktif.', 'success', 4000);
      get().addLog('Holding Monopoly Simülasyonu (Faz 4 Ticaret Zinciri) başlatıldı. Başlangıç parası: 150.000 ₺', 'success');
    });

    socket.on('server:diceRolled', (data) => {
      const { playerId, playerName, dice, diceTotal, oldPosition, newPosition, isDouble } = data;
      const willMove = oldPosition !== undefined && newPosition !== undefined && oldPosition !== newPosition;
      
      set({ 
        activeDiceAnimation: { rolling: true, playerId, dice, diceTotal, playerName, isDouble, oldPosition, newPosition },
        isTokenMoving: willMove,
        movingTokenTarget: willMove ? { playerId, targetPosition: newPosition } : null
      });

      // Zar animasyonu 600ms'de bittiğinde piyonun hemen hareket etmesi için settled bayrağını ekle
      setTimeout(() => {
        set(state => {
          if (state.activeDiceAnimation && state.activeDiceAnimation.playerId === playerId) {
            return { activeDiceAnimation: { ...state.activeDiceAnimation, settled: true } };
          }
          return {};
        });
      }, 600);

      const targetSquare = BOARD_DATA.find(s => s.id === newPosition)?.name || `#${newPosition}`;
      get().addLog(
        `${playerName} zar attı: [🎲 ${dice[0]} + ${dice[1]}] = ${diceTotal}. Yeni Konum: ${targetSquare} (#${newPosition})${isDouble ? ' (ÇİFT ZAR!)' : ''}`,
        isDouble ? 'success' : 'info'
      );

      setTimeout(() => {
        set(state => {
          if (!state.gameState || !state.gameState.playersState[playerId]) {
            return { activeDiceAnimation: null, lastDiceRoll: data, isTokenMoving: false, movingTokenTarget: null };
          }
          return {
            activeDiceAnimation: null,
            lastDiceRoll: data,
            isTokenMoving: willMove,
            movingTokenTarget: willMove ? { playerId, targetPosition: newPosition } : null,
            gameState: {
              ...state.gameState,
              playersState: {
                ...state.gameState.playersState,
                [playerId]: {
                  ...state.gameState.playersState[playerId],
                  position: newPosition
                }
              }
            }
          };
        });

        // Eğer piyon hareket etmeyecekse (örneğin hapiste kalma durumu) zar animasyonu biter bitmez logları bas
        if (!willMove) {
          useGameStore.getState().flushPendingLogs();
        }
      }, 1100);

      if (willMove) {
        setTimeout(() => {
          set(state => state.isTokenMoving ? { isTokenMoving: false, movingTokenTarget: null } : {});
        }, 6500);
      }
    });

    socket.on('server:playerJailed', ({ playerId, playerName, reason }) => {
      set(state => {
        const updatedJailState = {
          ...(state.gameState?.jailState || {}),
          [playerId]: { inJail: true, turnsServed: 0 }
        };
        const updatedPlayersState = state.gameState?.playersState ? {
          ...state.gameState.playersState,
          [playerId]: {
            ...(state.gameState.playersState[playerId] || {}),
            position: 13
          }
        } : state.gameState?.playersState;

        return {
          activeJailAlert: {
            playerId,
            playerName,
            reason,
            timestamp: Date.now()
          },
          gameState: state.gameState ? {
            ...state.gameState,
            jailState: updatedJailState,
            playersState: updatedPlayersState || state.gameState.playersState
          } : state.gameState
        };
      });
      if (playerId === socket.id) {
        get().showToast('🚨 HAPSE GİRDİNİZ! ' + (reason || 'Gözaltına alındınız.'), 'error', 6000);
      } else {
        get().showToast(`🚨 ${playerName} Hapse Atıldı!`, 'warning', 5000);
      }
    });

    socket.on('server:jailUpdate', ({ jailState, newBalance, playerId, action, result, message }) => {
      set(state => {
        const updatedPlayersState = state.gameState?.playersState && playerId && newBalance !== undefined ? {
          ...state.gameState.playersState,
          [playerId]: {
            ...(state.gameState.playersState[playerId] || {}),
            balance: newBalance
          }
        } : state.gameState?.playersState;

        return {
          gameState: state.gameState ? {
            ...state.gameState,
            jailState: jailState || state.gameState.jailState,
            playersState: updatedPlayersState || state.gameState.playersState
          } : state.gameState
        };
      });
      if (playerId === socket.id && message) {
        get().showToast(message, result === 'fail' ? 'error' : 'success', 5000);
      }
    });

    socket.on('server:balanceUpdated', (data) => {
      const { playerId, newBalance, salaryAmount, reason } = data;
      
      set(state => {
        if (!state.gameState || !state.gameState.playersState[playerId]) return {};
        return {
          gameState: {
            ...state.gameState,
            playersState: {
              ...state.gameState.playersState,
              [playerId]: {
                ...state.gameState.playersState[playerId],
                balance: newBalance
              }
            }
          }
        };
      });

      const targetPlayer = get().players.find(p => p.id === playerId)?.name || 'Oyuncu';
      get().addLog(
        `${targetPlayer} ${reason}: +${salaryAmount?.toLocaleString('tr-TR')} ₺ kazandı! (Yeni Bakiye: ${newBalance?.toLocaleString('tr-TR')} ₺)`,
        'success'
      );
      if (playerId === socket.id) {
        get().showToast(`${reason}: +${salaryAmount?.toLocaleString('tr-TR')} ₺ eklendi!`, 'success', 4500);
      }
    });

    socket.on('server:turnUpdated', (data) => {
      const { currentTurnIndex, activePlayerId, isDouble, previousPlayerName } = data;
      
      set(state => {
        if (!state.gameState) return {};
        return {
          gameState: {
            ...state.gameState,
            currentTurnIndex
          }
        };
      });

      if (isDouble && previousPlayerName) {
        get().addLog(`${previousPlayerName} çift zar attığı için sıra tekrar kendisinde kaldı.`, 'warning');
      }

      if (activePlayerId === socket.id) {
        get().showToast(isDouble ? 'Çift zar attınız! Tekrar zar atabilirsiniz.' : 'Sıra size geldi! Zar atabilirsiniz.', 'success', 3500);
      }
    });

    socket.on('server:gameStateUpdate', (data) => {
      if (data && data.gameState) {
        set({ gameState: data.gameState });
      }
    });

    // --- FAZ 3 & FAZ 4: MÜLKİYET, KİRA, İNŞAAT VE TİCARET DİNLEYİCİLERİ ---

    socket.on('server:offerProperty', ({ playerId, playerName, property }) => {
      if (playerId === socket.id) {
        set({ offeredProperty: property, isPropertyModalMinimized: false });
        get().showToast(`${property.name} mülküne geldiniz! Satın almak istiyor musunuz?`, 'info', 5000);
      }
      get().addLog(`${playerName}, sahipsiz ${property.name} (#${property.id}) karesine ulaştı. Satın alma kararı bekleniyor...`, 'info');
    });

    socket.on('server:propertyBought', ({ playerId, playerName, propertyId, propertyName, price, useLoan }) => {
      const myId = get().myId;
      if (playerId === myId) {
        set({ offeredProperty: null, isPropertyModalMinimized: false });
        const loanMsg = useLoan ? ' (KREDİLİ / %30 Peşinat - İpotekli)' : '';
        get().showToast(`${propertyName} tapusunu ${price.toLocaleString('tr-TR')} ₺ bedelle${loanMsg} satın aldınız!`, 'success');
        if (propertyId === 5 || propertyId === 15 || propertyId === 24 || propertyId === 29 || propertyId === 35) {
          set({ activeBusinessNaming: { propertyId, propertyName } });
        }
      }
      get().addLog(`${playerName}, ${propertyName} mülkünü ${price.toLocaleString('tr-TR')} ₺ bedelle${useLoan ? ' banka kredisi (%30 peşinat/ipotekli) ile ' : ' '}satın aldı!`, 'success');
    });

    socket.on('server:propertyDeclined', ({ playerId, playerName, propertyName }) => {
      if (playerId === socket.id) {
        set({ offeredProperty: null, isPropertyModalMinimized: false });
        get().showToast(`${propertyName} satın almasını reddettiniz.`, 'info');
      }
      get().addLog(`${playerName}, ${propertyName} satın almasını reddetti.`, 'info');
    });

    socket.on('server:rentPaid', ({ payerId, payerName, receiverId, receiverName, amount, propertyName, houses, isMonopolyDouble, isMallRent, activeTurns }) => {
      if (isMallRent) {
        if (activeTurns > 0) {
          get().addLog(
            `⚡🏢 [AYAKBASTI KİRASI] ${payerName}, ${receiverName} oyuncusuna ait DOLU AVM'ye basarak ${amount.toLocaleString('tr-TR')} ₺ AĞIR LÜKS KİRA ödedi!`,
            'error'
          );
        } else {
          get().addLog(
            `🏢 ${payerName}, ${receiverName} oyuncusunun boş AVM'sine basarak ${amount.toLocaleString('tr-TR')} ₺ giriş ücreti ödedi.`,
            'info'
          );
        }
      } else {
        get().addLog(
          `${payerName}, ${receiverName} oyuncusuna ait ${propertyName} ${houses > 0 ? `(${houses}. Ev/Otel)` : ''} için ${amount.toLocaleString('tr-TR')} ₺ ${isMonopolyDouble ? '(Tekel 2X) ' : ''}kira ödedi.`,
          'warning'
        );
      }

      if (payerId === socket.id) {
        get().showToast(`${receiverName} oyuncusuna ${amount.toLocaleString('tr-TR')} ₺ kira ödediniz!`, 'error', 4500);
      } else if (receiverId === socket.id) {
        get().showToast(`${payerName} oyuncusundan ${amount.toLocaleString('tr-TR')} ₺ kira tahsil ettiniz!`, 'success', 4500);
      }
    });

    socket.on('server:houseBuilt', ({ playerId, playerName, propertyName, houseCount, housePrice }) => {
      get().addLog(
        `${playerName}, ${propertyName} üzerine ${houseCount === 5 ? 'OTEL ⭐️' : `${houseCount}. Ev 🏠`} dikti! (Maliyet: ${housePrice.toLocaleString('tr-TR')} ₺)`,
        'success'
      );
      if (playerId === socket.id) {
        get().showToast(`${propertyName} üzerine inşaat tamamlandı!`, 'success');
      }
    });

    // --- FAZ 4: TİCARET VE ÜRETİM ZİNCİRİ DİNLEYİCİLERİ ---

    socket.on('server:receiveTradeOffer', (offer) => {
      const myId = get().myId;
      if (offer.toId === myId) {
        set({ activeTradeOffer: offer });
        get().showToast(`${offer.fromName} size ${offer.itemType === 'rawMaterial' ? 'Hammadde' : 'Bitmiş Ürün'} teklifi gönderdi (${offer.price.toLocaleString('tr-TR')} ₺)!`, 'info', 8000);
      }
      get().addLog(
        `🤝 ${offer.fromName}, ${offer.toName} oyuncusuna ${offer.price.toLocaleString('tr-TR')} ₺ bedelle 1 birim ${offer.itemType === 'rawMaterial' ? 'Hammadde' : 'Bitmiş Ürün'} teklif etti.`,
        'info'
      );
    });

    socket.on('server:tradeOfferResolved', ({ accepted, offer }) => {
      const myId = get().myId;
      if (offer.toId === myId || offer.fromId === myId) {
        set({ activeTradeOffer: null });
      }
      if (accepted) {
        get().addLog(
          `✅ ${offer.toName}, ${offer.fromName} oyuncusunun ${offer.price.toLocaleString('tr-TR')} ₺ tutarındaki ${offer.itemType === 'rawMaterial' ? 'Hammadde' : 'Bitmiş Ürün'} teklifini KABUL ETTİ!`,
          'success'
        );
        if (offer.fromId === myId) get().showToast(`Teklifiniz kabul edildi! +${offer.price.toLocaleString('tr-TR')} ₺ tahsil edildi.`, 'success');
        if (offer.toId === myId) get().showToast(`${offer.itemType === 'rawMaterial' ? 'Hammadde' : 'Bitmiş Ürün'} stoğunuza eklendi!`, 'success');
      } else {
        get().addLog(
          `❌ ${offer.toName}, ${offer.fromName} oyuncusunun ticaret teklifini REDDETTİ.`,
          'warning'
        );
        if (offer.fromId === myId) get().showToast(`${offer.toName} teklifinizi reddetti.`, 'error');
      }
    });

    socket.on('server:receiveSwapOffer', (offer) => {
      const myId = get().myId;
      if (offer.toId === myId) {
        set({ activeSwapOffer: offer });
        get().showToast(`${offer.fromName} size takas masası teklifi gönderdi!`, 'info', 10000);
      }
      get().addLog(`🔄 ${offer.fromName}, ${offer.toName} oyuncusuna takas masasında bir anlaşma sundu.`, 'info');
    });

    socket.on('server:swapOfferResolved', ({ accepted, offer }) => {
      const myId = get().myId;
      if (offer.toId === myId || offer.fromId === myId) {
        set({ activeSwapOffer: null });
      }
    });

    socket.on('server:stateTradeCompleted', ({ playerId, playerName, action }) => {
      if (action === 'sell_raw_to_state') {
        get().addLog(`📦 ${playerName}, devlete 1 birim hammadde ihraç edip +20.000 ₺ kazandı.`, 'success');
      } else if (action === 'buy_raw_from_state') {
        get().addLog(`🚢 ${playerName}, devletten 10.000 ₺ bedelle 1 birim hammadde ithal etti.`, 'info');
      } else if (action === 'sell_product_to_state') {
        get().addLog(`📦 ${playerName}, devlete 1 birim bitmiş ürün ihraç edip +20.000 ₺ kazandı.`, 'success');
      } else if (action === 'buy_product_from_state') {
        get().addLog(`🏬 ${playerName}, devletten acil 120.000 ₺ bedelle 1 birim bitmiş ürün çekti.`, 'info');
      }
    });

    socket.on('server:materialProcessed', ({ playerName }) => {
      get().addLog(`🏭 ${playerName}, fabrikada 1 hammadde işleyerek 1 adet bitmiş ürüne dönüştürdü!`, 'success');
    });

    socket.on('server:mallStocked', ({ playerName }) => {
      get().addLog(`🏢 ${playerName}, Mega AVM vitrine ürün dizdi! (AVM Doluluk Süresi: +3 Tur ⚡)`, 'success');
    });

    // --- FAZ 5: FİNANSAL KURUMLAR, İFLAS/BORÇ VE İHALE DİNLEYİCİLERİ ---
    socket.on('server:bankUpdate', ({ action, newBalance }) => {
      get().addLog(`🏦 Merkez Bankası işlemi gerçekleştirildi (${action}). Yeni Bakiye: ${newBalance?.toLocaleString('tr-TR')} ₺`, 'success');
    });

    socket.on('server:directTradeResolved', ({ status, fromPlayerName, toPlayerName }) => {
      if (status === 'accepted') {
        get().showToast(`🤝 İkili Ticaret Anlaşması Kabul Edildi! (${fromPlayerName} & ${toPlayerName})`, 'success');
        get().addLog(`🤝 İkili Ticaret Tamamlandı: ${fromPlayerName} ve ${toPlayerName} arasında gayrimenkul/nakit devri gerçekleşti.`, 'success');
      } else {
        get().showToast(`❌ İkili Ticaret Teklifi Reddedildi.`, 'error');
        get().addLog(`❌ İkili Ticaret Reddedildi: ${toPlayerName}, ${fromPlayerName} tarafından iletilen teklifi kabul etmedi.`, 'warning');
      }
    });

    socket.on('server:tradeCompleted', ({ buyerName, ownerName, subType, price }) => {
      const typeLabel = subType === 'RAW_MATERIAL' ? 'Hammadde Seviyesi' : 'Fabrika Ürünü Seviyesi';
      get().addLog(`🔄 B2B Zincir Ticareti: ${buyerName}, ${ownerName} tesisinden ${typeLabel} tedarik etti (${price.toLocaleString('tr-TR')} ₺ bedelle).`, 'info');
    });

    // --- FAZ 5: İHALE, DEVLET ALIM VE ACİL FON DİNLEYİCİLERİ ---
    socket.on('server:propertySoldToState', ({ emergencyCash, propertyId }) => {
      get().addLog(`🚨 Acil Borç Tasfiyesi: #${propertyId} mülkü -%30 zararla devlete acil satıldı (+${emergencyCash?.toLocaleString('tr-TR')} ₺ nakit girişi).`, 'warning');
    });

    socket.on('server:auctionCountdown', (data) => {
      set({ auctionCountdown: data });
      get().addLog(`⚡ ÖZEL İHALE SÜRECİ: ${data.title} (${data.seconds || 10} saniye içinde başlıyor!)`, 'warning');
      get().showToast(`DİKKAT: 10 Saniye İçinde İhale Başlıyor!`, 'warning', 5000);
    });

    socket.on('server:startSpecialAuction', ({ auction }) => {
      set({ auctionCountdown: null, activeAuction: auction, isAuctionModalMinimized: false });
      get().addLog(`🔨 CANLI İHALE BAŞLADI: ${auction.propertyName} (${auction.startingPrice?.toLocaleString('tr-TR')} ₺ başlangıç bedeliyle 20s sayım başladı!)`, 'warning');
      get().showToast(`İhale Başladı: ${auction.propertyName}! Teklif verebilirsiniz.`, 'info', 4000);
    });

    socket.on('server:autoAuctionNotice', ({ message }) => {
      get().showToast(message || '10. Tur Özelleştirmeleri Başladı! Sahipsiz özel işletmeler sırayla açık ihaleye çıkacak.', 'warning', 6000);
      get().addLog(`⚡ ${message || '10. Tur Özelleştirmeleri Başladı!'}`, 'warning');
    });

    socket.on('server:auctionStarted', ({ auction }) => {
      set({ activeAuction: auction, auctionCountdown: null, isAuctionModalMinimized: false });
      get().addLog(`🔨 CANLI İHALE BAŞLADI: #${auction.propertyId} - ${auction.propertyName} (${auction.startingPrice?.toLocaleString('tr-TR')} ₺ başlangıç bedeliyle 30s sayım tetiklendi!)`, 'warning');
      get().showToast(`İhale Başladı: ${auction.propertyName}! Teklif verebilirsiniz.`, 'info', 4000);
    });

    socket.on('server:auctionTick', (auctionData) => {
      set(state => ({
        activeAuction: state.activeAuction ? { ...state.activeAuction, ...auctionData } : auctionData
      }));
    });

    socket.on('server:auctionConcluded', ({ propertyName, winnerName, finalPrice, winnerId }) => {
      set({ activeAuction: null, auctionCountdown: null, isAuctionModalMinimized: false });
      get().addLog(`🏆 İhale Tamamlandı: ${propertyName} - Kazanan: ${winnerName || 'Devlet'} (${finalPrice?.toLocaleString('tr-TR')} ₺)`, 'success');
      if (winnerId === socket.id) {
        get().showToast(`Tebrikler! ${propertyName} ihalesini kazandınız!`, 'success', 4500);
      }
    });

    socket.on('server:portLeaseWon', ({ winnerId, winnerName, bid, leaseTurns }) => {
      set({ activeAuction: null, auctionCountdown: null, isAuctionModalMinimized: false });
    });

    socket.on('server:fundLeaseWon', ({ winnerId, winnerName, bid, leaseTurns, poolAmount }) => {
      set({ activeAuction: null, auctionCountdown: null, isAuctionModalMinimized: false });
    });

    // --- FAZ 6: ŞANS KARTLARI VE GAZETE MANŞETİ DİNLEYİCİLERİ ---
    socket.on('server:showChanceCard', ({ playerId, playerName, card }) => {
      const myId = get().myId;
      if (playerId === myId) {
        set({ activeChanceCard: { ...card, drawerId: playerId, drawerName: playerName } });
        get().addLog(`🃏 Şans karesine geldiniz ve kart çektiniz: "${card.title}"`, 'warning');
        get().showToast(`🎰 Şans Kartı çektiniz: ${card.title}`, 'info', 5000);
      } else {
        get().addLog(`🃏 ${playerName} gizemli bir Şans Kartı çekti! Acaba ne çıkacak?`, 'warning');
        get().showToast(`🎰 ${playerName} Şans Kartı çekti!`, 'info', 5000);
      }
    });

    socket.on('server:newsFlash', (news) => {
      set({ activeChanceCard: null, newsFlash: news });
      get().showToast(`📰 SON DAKİKA HABERİ: ${news.title}`, 'warning', 7000);
      get().addLog(`📰 BORSA GAZETESİ: ${news.title} - ${news.summary}`, 'warning');
    });




    socket.on('server:log', ({ message, type = 'info' }) => {
      get().addLog(message, type);
    });

    socket.on('server:error', ({ message }) => {
      get().showToast(message, 'error');
    });

    socket.on('server:playerBankrupt', ({ playerId, playerName }) => {
      get().showToast(`🚨 ${playerName} iflas etti ve holdingi tasfiye edildi!`, 'error', 6000);
      get().addLog(`💥 İFLAS BİLDİRİMİ: ${playerName} tüm varlıklarını kaybetti ve simülasyondan elendi.`, 'error');
    });

    socket.on('server:playerLeft', ({ playerId, playerName }) => {
      get().showToast(`${playerName || 'Bir oyuncu'} lobiden ayrıldı.`, 'warning');
      get().addLog(`🚪 ${playerName || 'Oyuncu'} odadan ayrıldı.`, 'warning');
    });

    // Liman (#5) kiralama ihalesi fırsatı (sahipsizken üzerine basılınca)
    socket.on('server:portLeaseOpportunity', ({ playerId, playerName }) => {
      if (playerId === socket.id) {
        set({ activePortLeaseAuction: { triggered: true } });
        get().showToast('⚓ Uluslararası Liman sahipsiz! 5 turluk kiralama ihalesi başlatabilirsiniz.', 'info', 6000);
      }
      get().addLog(`⚓ ${playerName} sahipsiz Uluslararası Liman karesine geldi. Kiralama ihalesi fırsatı!`, 'info');
    });

    // Liman kiralama ihalesi kazanıldı
    socket.on('server:portLeaseWon', ({ winnerId, winnerName, bid, leaseTurns }) => {
      set({ activePortLeaseAuction: null, activeAuction: null, isAuctionModalMinimized: false });
      if (winnerId) {
        get().addLog(`⚓ LİMAN KİRALAMA KAZANDI: ${winnerName} Limanı ${bid.toLocaleString('tr-TR')} ₺ ile ${leaseTurns} tur kiraladı!`, 'success');
        if (winnerId === socket.id) {
          get().showToast(`Tebrikler! Limanı ${bid.toLocaleString('tr-TR')} ₺ ile ${leaseTurns} tur kiraladınız!`, 'success');
        }
      } else {
        get().addLog('⚓ Liman kiralama ihalesi teklif gelmeden sona erdi.', 'warning');
      }
    });

    // Borsa fırsatı (#19)
    socket.on('server:borsaOpportunity', ({ playerId, playerName }) => {
      if (playerId === socket.id) {
        get().showToast('📈 Borsa/Halka Arz karesine geldiniz! Yatırım yapmak ister misiniz?', 'info', 6000);
      }
      get().addLog(`📈 ${playerName} Borsa/Halka Arz (#19) karesine geldi. Yatırım kararı bekleniyor...`, 'info');
    });

    // Yeraltı Kumarhanesi fırsatı (#33)
    socket.on('server:casinoOpportunity', ({ playerId, playerName }) => {
      if (playerId === socket.id) {
        get().showToast('🎰 Yeraltı Kumarhanesi karesine geldiniz! Blackjack oynamak ister misiniz?', 'info', 6000);
      }
      get().addLog(`🎰 ${playerName} Yeraltı Kumarhanesi (#33) karesine geldi. Blackjack kararı bekleniyor...`, 'info');
    });

    // Sunucu logları
    socket.on('server:logMessage', ({ message, type = 'info' }) => {
      get().addLog(message, type);
    });
  },

  createRoom: (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      get().showToast('Lütfen geçerli bir oyuncu ismi giriniz.', 'error');
      return;
    }

    set({ loading: true, playerName: trimmedName });
    localStorage.setItem('holding_nickname', trimmedName);

    socket.emit('client:createRoom', { name: trimmedName, colorId: null }, (res) => {
      set({ loading: false });
      if (res && res.success) {
        set({
          roomCode: res.room.code,
          isHost: true,
          players: res.room.players,
          currentScreen: 'waiting'
        });
        get().showToast(`Oda başarıyla oluşturuldu! Kod: ${res.room.code}`, 'success');
      } else if (res && res.error) {
        get().showToast(res.error, 'error');
      }
    });
  },

  joinRoom: (code, name, isSpectator = false) => {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedCode || trimmedCode.length !== 6) {
      get().showToast('Oda kodu 6 haneli alfasayısal bir kod olmalıdır.', 'error');
      return;
    }
    if (!trimmedName) {
      get().showToast('Lütfen geçerli bir oyuncu ismi giriniz.', 'error');
      return;
    }

    set({ loading: true, playerName: trimmedName });
    localStorage.setItem('holding_nickname', trimmedName);

    socket.emit('client:joinRoom', { code: trimmedCode, name: trimmedName, colorId: null, isSpectator }, (res) => {
      set({ loading: false });
      if (res && res.success) {
        const myInfoInPlayers = res.room.players.find(p => p.id === socket.id);
        const myInfoInSpecs = res.room.spectators?.find(s => s.id === socket.id);
        set({
          roomCode: res.room.code,
          isHost: myInfoInPlayers ? myInfoInPlayers.isHost : false,
          players: res.room.players,
          spectators: res.room.spectators || [],
          isSpectator: !!myInfoInSpecs,
          currentScreen: res.room.isStarted ? 'game' : 'waiting'
        });
        get().showToast(`Odaya katılma başarılı!`, 'success');
      } else if (res && res.error) {
        get().showToast(res.error, 'error');
      }
    });
  },

  changeColor: (colorId) => {
    socket.emit('client:changeColor', { colorId }, (res) => {
      if (res && res.success) {
        get().showToast('Piyon renginiz güncellendi!', 'success');
      } else if (res && res.error) {
        get().showToast(res.error, 'error');
      }
    });
  },

  startGame: () => {
    const { players, isHost } = get();
    if (!isHost) {
      get().showToast('Oyunu sadece oda kurucusu başlatabilir.', 'error');
      return;
    }
    if (players.length < 2) {
      get().showToast('Oyunu başlatmak için odada en az 2 oyuncu olmalıdır!', 'error');
      return;
    }

    socket.emit('client:startGame', (res) => {
      if (res && !res.success) {
        get().showToast(res.error || 'Oyun başlatılamadı.', 'error');
      }
    });
  },

  rollDice: () => {
    const { gameState, players } = get();
    if (!gameState) {
      get().showToast('Oyun durumu bulunamadı.', 'error');
      return;
    }

    const activePlayer = players[gameState.currentTurnIndex];
    if (!activePlayer || activePlayer.id !== socket.id) {
      get().showToast('Sıra sizde değil, zarı sadece aktif yatırımcı atabilir!', 'error');
      return;
    }

    set({ loading: true });
    socket.emit('client:rollDice', (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'Zar atışında hata oluştu.', 'error');
      }
    });
  },

  buyProperty: (propertyId, useLoan = false) => {
    set({ loading: true });
    socket.emit('client:buyProperty', { propertyId, useLoan }, (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'Satın alma işlemi başarısız oldu.', 'error');
      }
    });
  },

  declineProperty: (propertyId) => {
    set({ loading: true });
    socket.emit('client:declineProperty', { propertyId }, (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'İşlem sırasında hata oluştu.', 'error');
      }
    });
  },

  buildHouse: (propertyId) => {
    set({ loading: true });
    socket.emit('client:buildHouse', { propertyId }, (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'İnşaat yapılamadı.', 'error');
      }
    });
  },

  // --- FAZ 4 ACTION METOTLARI ---

  useSelfResource: (itemType) => {
    set({ loading: true });
    socket.emit('client:useSelfResource', { itemType }, (res) => {
      set({ loading: false });
      if (res && res.success) {
        get().showToast(itemType === 'rawMaterial' ? 'Öz Kaynak: Hammadde fabrikanıza eklendi!' : 'Öz Kaynak: Ürün AVM vitrinine dizildi!', 'success');
      } else if (res && !res.success) {
        get().showToast(res.error || 'Öz kaynak kullanılamadı.', 'error');
      }
    });
  },

  sendTradeOffer: (toId, itemType, price) => {
    set({ loading: true });
    socket.emit('client:sendTradeOffer', { toId, itemType, price }, (res) => {
      set({ loading: false });
      if (res && res.success) {
        get().showToast('Ticaret teklifiniz karşı tarafa iletildi. Yanıt bekleniyor...', 'info', 4000);
      } else if (res && !res.success) {
        get().showToast(res.error || 'Teklif gönderilemedi.', 'error');
      }
    });
  },

  respondTradeOffer: (offerId, accepted) => {
    set({ loading: true });
    socket.emit('client:respondTradeOffer', { offerId, accepted }, (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'Teklif yanıtlanırken hata oluştu.', 'error');
      }
    });
  },

  tradeWithState: (action) => {
    set({ loading: true });
    socket.emit('client:tradeWithState', { action }, (res) => {
      set({ loading: false });
      if (res && res.success) {
        get().showToast('Devletle ticaret başarıyla gerçekleştirildi!', 'success');
      } else if (res && !res.success) {
        get().showToast(res.error || 'Devlet ticareti yapılamadı.', 'error');
      }
    });
  },

  processMaterial: () => {
    set({ loading: true });
    socket.emit('client:processMaterial', (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'Üretim yapılamadı.', 'error');
      }
    });
  },

  stockMall: () => {
    set({ loading: true });
    socket.emit('client:stockMall', (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'AVM vitrine ürün eklenemedi.', 'error');
      }
    });
  },

  renameBusiness: (propertyId, customName) => {
    set({ loading: true });
    socket.emit('client:renameBusiness', { propertyId, customName }, (res) => {
      set({ loading: false, activeBusinessNaming: null });
      if (res && res.success) {
        get().showToast('İşletme ismi başarıyla güncellendi!', 'success');
      } else {
        get().showToast(res?.error || 'İsim güncellenirken hata oluştu.', 'error');
      }
    });
  },

  sendSwapOffer: (toId, offeredProperties, offeredCash, requestedProperties, requestedCash) => {
    set({ loading: true });
    socket.emit('client:sendSwapOffer', { toId, offeredProperties, offeredCash, requestedProperties, requestedCash }, (res) => {
      set({ loading: false });
      if (res && res.success) {
        get().showToast('Takas teklifiniz iletildi!', 'success');
      } else {
        get().showToast(res?.error || 'Takas teklifi gönderilemedi.', 'error');
      }
    });
  },

  respondSwapOffer: (offerId, accepted) => {
    set({ loading: true });
    socket.emit('client:respondSwapOffer', { offerId, accepted }, (res) => {
      set({ loading: false, activeSwapOffer: null });
      if (res && res.success) {
        if (accepted) {
          get().showToast('Takas anlaşması başarıyla gerçekleştirildi!', 'success');
        } else {
          get().showToast('Takas teklifini reddettiniz.', 'info');
        }
      } else {
        get().showToast(res?.error || 'İşlem gerçekleştirilemedi.', 'error');
      }
    });
  },

  // --- FAZ 5 AKSİYON FONKSİYONLARI ---
  bankAction: (action, data) => {
    set({ loading: true });
    socket.emit('client:bankAction', { action, data }, (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'Banka işlemi başarısız.', 'error');
      }
    });
  },

  jailAction: (action) => {
    set({ loading: true });
    socket.emit('client:jailAction', { action }, (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'Hapis işlemi başarısız.', 'error');
      }
    });
  },

  sellPropertyToState: (propertyId) => {
    set({ loading: true });
    socket.emit('client:sellPropertyToState', { propertyId }, (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'Mülk devlete satılamadı.', 'error');
      }
    });
  },

  startAuction: (propertyId) => {
    set({ loading: true });
    socket.emit('client:startAuction', { propertyId }, (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'İhale başlatılamadı.', 'error');
      }
    });
  },

  placeBid: (bidAmount) => {
    socket.emit('client:placeBid', { bidAmount }, (res) => {
      if (res && !res.success) {
        get().showToast(res.error || 'Teklif verilemedi.', 'error');
      }
    });
  },

  finishAuctionEarly: () => {
    socket.emit('client:finishAuctionEarly', (res) => {
      if (res && !res.success) {
        get().showToast(res.error || 'İhale sonlandırılamadı.', 'error');
      } else {
        get().showToast('İhale en yüksek teklifle başarıyla sonlandırıldı!', 'success');
      }
    });
  },

  startPortLeaseAuction: () => {
    socket.emit('client:startPortLeaseAuction', (res) => {
      if (res && !res.success) {
        get().showToast(res?.error || 'Liman ihalesi başlatılamadı.', 'error');
      } else {
        get().showToast('⚓ Liman kiralama ihalesi başlatıldı! 30 saniye içinde teklif verin.', 'info');
        set({ activePortLeaseAuction: null });
      }
    });
  },

  setActiveBankModal: (val) => set({ activeBankModal: val }),
  setPropertyModalMinimized: (val) => set({ isPropertyModalMinimized: val }),
  setAuctionModalMinimized: (val) => set({ isAuctionModalMinimized: val }),
  setActiveJailModal: (val) => set({ activeJailModal: val }),
  setActiveJailAlert: (val) => set({ activeJailAlert: val }),
  activePropertyManagement: null,
  setActivePropertyManagement: (prop) => set({ activePropertyManagement: prop }),
  setActiveChanceCard: (val) => set({ activeChanceCard: val }),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  closeNewsFlash: () => set({ newsFlash: null }),
  setActiveTab: (val) => set({ activeTab: val }),

  makeChanceDecision: (cardId, decision) => {
    set({ loading: true });
    socket.emit('client:chanceCardDecision', { cardId, decision }, (res) => {
      set({ loading: false, activeChanceCard: null });
      if (res && res.success) {
        get().showToast(`Kararınız [Seçenek ${decision}] işlendi!`, 'success');
      } else if (res && res.error) {
        get().showToast(res.error, 'error');
      }
    });
  },

  submitBorsaInvestment: (amount) => {
    set({ loading: true });
    socket.emit('client:submitBorsaInvestment', { amount }, (res) => {
      set({ loading: false });
      if (res && !res.success) {
        get().showToast(res.error || 'Yatırım işlemi gerçekleştirilemedi.', 'error');
      } else {
        get().showToast('Borsa yatırım talebiniz alındı!', 'success');
      }
    });
  },

  leaveRoom: () => {
    socket.emit('client:leaveRoom');
    set({
      roomCode: '',
      isHost: false,
      players: [],
      gameStarted: false,
      currentScreen: 'home',
      gameState: null,
      lastDiceRoll: null,
      offeredProperty: null,
      activeTradeOffer: null,
      activeAuction: null,
      activeBankModal: false,
      activeJailModal: false,
      activeTab: 'turn',
      isSpectator: false,
      spectators: [],
      gameLogs: []
    });
    get().showToast('Odadan ayrıldınız.', 'info');
  }
}));

export default useGameStore;
