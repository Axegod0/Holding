import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, Users, ArrowLeft, TrendingUp, 
  DollarSign, Dices, Play, Crown, Sparkles, AlertTriangle, CheckCircle2,
  Building2, Landmark, Zap, Train, AlertCircle, Rocket, Home, Star, Briefcase, Scale,
  Sun, Moon, EyeOff, Handshake
} from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';
import { getSquareImage } from '../constants/boardImages.js';
import PropertyModal from './PropertyModal.jsx';
import PortfolioPanel from './PortfolioPanel.jsx';
import TradeOfferModal from './TradeOfferModal.jsx';
import TradeHubPanel from './TradeHubPanel.jsx';
import AuctionModal from './AuctionModal.jsx';
import AuctionCountdownModal from './AuctionCountdownModal.jsx';
import BusinessNamingModal from './BusinessNamingModal.jsx';
import SwapOfferModal from './SwapOfferModal.jsx';
import SwapPanel from './SwapPanel.jsx';
import FinancialModal from './FinancialModal.jsx';
import ChanceCardModal from './ChanceCardModal.jsx';
import CourtroomModal from './CourtroomModal.jsx';
import ChatAndLogPanel from './ChatAndLogPanel.jsx';
import IllegalJobModal from './IllegalJobModal.jsx';
import BorsaInvestmentModal from './BorsaInvestmentModal.jsx';
import DiceRollerAnimation from './DiceRollerAnimation.jsx';
import NewsFlashModal from './NewsFlashModal.jsx';
import JailAlertModal from './JailAlertModal.jsx';
import PropertyManagementModal from './PropertyManagementModal.jsx';
import PortLeaseModal from './PortLeaseModal.jsx';
import PropertyDetailModal from './PropertyDetailModal.jsx';
import CasinoModal from './CasinoModal.jsx';
import AdminPanel from './AdminPanel.jsx';
import LogMonitor from './LogMonitor.jsx';
import DevLogPanel from './DevLogPanel.jsx';

export default function GameBoard() {
  const myId = useGameStore(state => state.myId || socket?.id);
  const roomCode = useGameStore(state => state.roomCode);
  const players = useGameStore(state => state.players);
  const leaveRoom = useGameStore(state => state.leaveRoom);
  const gameState = useGameStore(state => state.gameState);
  const rollDice = useGameStore(state => state.rollDice);
  const loading = useGameStore(state => state.loading);
  const lastDiceRoll = useGameStore(state => state.lastDiceRoll);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const theme = useGameStore(state => state.theme);
  const toggleTheme = useGameStore(state => state.toggleTheme);

  const activeTab = useGameStore(state => state.activeTab || 'turn');
  const setActiveTab = useGameStore(state => state.setActiveTab);
  const isSpectator = useGameStore(state => state.isSpectator);
  const [displayPositions, setDisplayPositions] = useState({});

  useEffect(() => {
    if (!gameState || !players.length) return;

    const timer = setInterval(() => {
      const { activeDiceAnimation, isTokenMoving, movingTokenTarget } = useGameStore.getState();

      setDisplayPositions(prev => {
        let updated = { ...prev };
        let hasChanges = false;
        let activePlayerFinished = false;

        players.forEach(p => {
          let targetPos = gameState.playersState[p.id]?.position ?? 0;
          
          // Eğer o oyuncu için zar animasyonu aktifse ve henüz zarlar sabitlenmediyse, henüz piyon hareket etmesin (eski konumda dursun)
          if (activeDiceAnimation && activeDiceAnimation.rolling && !activeDiceAnimation.settled && activeDiceAnimation.playerId === p.id && activeDiceAnimation.oldPosition !== undefined) {
            targetPos = activeDiceAnimation.oldPosition;
          }

          const currentPos = prev[p.id];

          if (currentPos === undefined) {
            updated[p.id] = targetPos;
            hasChanges = true;
          } else if (currentPos !== targetPos) {
            // Adım adım kayma (Step-by-step transition) - 40 karelik çevrede +1 adımlama
            updated[p.id] = (currentPos + 1) % 40;
            hasChanges = true;
            if (movingTokenTarget && p.id === movingTokenTarget.playerId && updated[p.id] === movingTokenTarget.targetPosition && !activeDiceAnimation) {
              activePlayerFinished = true;
            }
          } else if (!activeDiceAnimation && isTokenMoving && movingTokenTarget && p.id === movingTokenTarget.playerId && currentPos === movingTokenTarget.targetPosition) {
            // Eğer hareket eden oyuncu zaten hedefteyse (veya hedefe ulaştıysa) ve animasyon bittiyse
            activePlayerFinished = true;
          }
        });

        if (activePlayerFinished && isTokenMoving) {
          useGameStore.setState({ isTokenMoving: false, movingTokenTarget: null });
          useGameStore.getState().flushPendingLogs();
        }

        return hasChanges ? updated : prev;
      });
    }, 140);

    return () => clearInterval(timer);
  }, [gameState, players]);

  const setActiveBankModal = useGameStore(state => state.setActiveBankModal);
  const setActiveJailModal = useGameStore(state => state.setActiveJailModal);

  const currentTurnIndex = gameState?.currentTurnIndex || 0;
  const activePlayer = players[currentTurnIndex] || null;
  const isMyTurn = (activePlayer?.id === myId || activePlayer?.id === socket?.id);
  const boardData = gameState?.boardData || [];
  const propertyOwnership = gameState?.propertyOwnership || {};
  const myState = gameState?.playersState[myId] || gameState?.playersState[socket?.id] || { balance: 0, totalAssetValue: 0 };

  const handleRollClick = () => {
    if (!isMyTurn || loading) return;
    const jailInfo = gameState?.jailState?.[myId] || gameState?.jailState?.[socket?.id] || {};
    if (myState?.position === 13 && jailInfo.inJail) {
      setActiveJailModal(true);
      return;
    }
    rollDice();
  };

  // Space tuşu ile zar atma dinleyicisi
  useEffect(() => {
    const handleSpacePress = (e) => {
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (isMyTurn && !loading) {
          handleRollClick();
        }
      }
    };

    window.addEventListener('keydown', handleSpacePress);
    return () => {
      window.removeEventListener('keydown', handleSpacePress);
    };
  }, [isMyTurn, loading, gameState, myState, myId]);

  // Kare Tipine Göre İkon Seçici
  const getSquareIcon = (type) => {
    switch (type) {
      case 'start': return <Landmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'bank': return <Landmark className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'property': return <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'tax': return <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      case 'station': return <Train className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      case 'utility': return <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />;
      case 'jail':
      case 'gotojail': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'chance':
      case 'chest': return <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      default: return <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  // 14x8 Çevre Halka Izgara (Ring Grid) Konum Hesaplayıcı (40 Kare Toplam)
  const getRingGridCoords = (id) => {
    if (id >= 20 && id <= 33) return { gridColumnStart: id - 20 + 1, gridRowStart: 1 };
    if (id >= 34 && id <= 39) return { gridColumnStart: 14, gridRowStart: id - 34 + 2 };
    if (id >= 0 && id <= 13) return { gridColumnStart: 14 - id, gridRowStart: 8 };
    if (id >= 14 && id <= 19) return { gridColumnStart: 1, gridRowStart: 8 - (id - 14) - 1 };
    return { gridColumnStart: 1, gridRowStart: 1 };
  };

  const isLight = theme === 'light';

  return (
    <div className={`w-screen h-screen overflow-auto lg:overflow-hidden p-1.5 sm:p-2 transition-colors duration-300 flex items-start justify-start lg:items-center lg:justify-center ${
      isLight ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-950 text-neutral-100'
    }`}>
      
      {/* Modallar ve Tam Ekran Aksiyon Ekranları */}
      <PropertyModal />
      <TradeOfferModal />
      <AuctionModal />
      <AuctionCountdownModal />
      <FinancialModal />
      <ChanceCardModal />
      <CourtroomModal />
      <IllegalJobModal />
      <ChatAndLogPanel />
      <BorsaInvestmentModal />
      <DiceRollerAnimation />
      <NewsFlashModal />
      <JailAlertModal />
      <PropertyManagementModal />
      <BusinessNamingModal />
      <SwapOfferModal />
      <PortLeaseModal />
      <CasinoModal />
      <AdminPanel />
      <LogMonitor />
      <DevLogPanel />

      {/* Property Detail Modal */}
      {selectedPropertyId !== null && (
        <PropertyDetailModal 
          propertyId={selectedPropertyId} 
          onClose={() => setSelectedPropertyId(null)} 
        />
      )}

      {/* 14x8 DİKDÖRTGEN TAHTA (Ekranın Tamamına Fit Olur, Mobil/Küçük Ekranlarda Kaydırılabilir Kesintisiz Oyun Deneyimi Sunar) */}
      <div 
        className="min-w-[1020px] min-h-[620px] lg:min-w-0 lg:min-h-0 w-full h-full rounded-3xl border border-neutral-300 dark:border-neutral-800 p-1.5 sm:p-2 transition-all relative bg-neutral-100 dark:bg-[#0a0a0a]"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(14, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
          gap: '5px'
        }}
      >
        {/* 40 KARE ÇEVRE HALKASI (OUTER RING SQUARES) */}
        {boardData.map((square) => {
          const coords = getRingGridCoords(square.id);
          const playersOnSquare = players.filter(p => {
            const pos = displayPositions[p.id] !== undefined ? displayPositions[p.id] : (gameState?.playersState[p.id]?.position || 0);
            return pos === square.id;
          });
          const ownership = propertyOwnership[square.id];
          const ownerPlayer = ownership ? players.find(p => p.id === ownership.ownerId) : null;
          const houseCount = ownership?.houses || 0;
          const isCorner = square.id === 0 || square.id === 13 || square.id === 20 || square.id === 33;

          return (
            <div
              key={square.id}
              onClick={() => {
                if (square.id === 20 || square.type === 'bank') setActiveBankModal(true);
                else if (square.id === 13 || square.type === 'jail') setActiveJailModal(true);
                else setSelectedPropertyId(square.id);
              }}
              style={{
                gridColumnStart: coords.gridColumnStart,
                gridRowStart: coords.gridRowStart
              }}
              className={`relative flex flex-col overflow-hidden rounded-2xl bg-black border border-white/10 transition-transform duration-300 cursor-pointer ${
                playersOnSquare.length > 0 ? 'z-20 scale-105' : 'hover:scale-105 hover:z-10'
              }`}
            >
              {/* Sahiplik Çerçevesi (Opsiyonel Parlama) */}
              {ownerPlayer && !ownership.isMortgaged && (
                <div 
                  className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
                  style={{
                    boxShadow: `inset 0 0 12px ${ownerPlayer.color?.hex}40`,
                    border: `1.5px solid ${ownerPlayer.color?.hex}80`
                  }}
                />
              )}

              {/* Üst Kısım: Şehir Görseli ve Maskeleme */}
              <div 
                className="h-[65%] w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url('${getSquareImage(square.id)}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0"></div>
                
                {/* Modern Rozet (Renk Grubu) */}
                {square.color && (
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-1.5 py-0.5 z-20 border border-white/10">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: square.color, boxShadow: `0 0 4px ${square.color}` }}></div>
                    <span className="text-[7px] sm:text-[8px] font-bold text-white/90">#{square.id}</span>
                  </div>
                )}

                {/* İpotek Rozeti */}
                {ownerPlayer && ownership.isMortgaged && (
                  <div className="absolute top-1.5 right-1.5 flex items-center rounded-full bg-red-500/80 backdrop-blur-md px-1.5 py-0.5 z-20">
                    <span className="text-[7px] sm:text-[8px] font-bold text-white uppercase">İpotekli</span>
                  </div>
                )}
              </div>

              {/* Alt Kısım: İsim ve Fiyat */}
              <div className="h-[35%] w-full flex flex-col items-center justify-center bg-black pb-1.5 px-1 z-10">
                <div className="text-white font-bold text-[8px] sm:text-[10px] md:text-[11px] text-center leading-tight line-clamp-1 uppercase">
                  {(square.type === 'TRADE' && ownership?.customName) ? ownership.customName : square.name}
                </div>
                {(square.price || square.subtitle) && (
                  <div className="text-neutral-400 text-[7px] sm:text-[8px] md:text-[9px] mt-0.5 text-center truncate w-full">
                    {square.price ? `${square.price?.toLocaleString('tr-TR')} ₺` : square.subtitle}
                  </div>
                )}
              </div>

              {/* Bu Karedeki Piyonlar (Tam Merkeze Yerleştirme) */}
              {playersOnSquare.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                  <div className={`flex items-center justify-center ${
                    playersOnSquare.length > 1 ? '-space-x-1 sm:-space-x-2' : ''
                  }`}>
                    {playersOnSquare.map((p, pIdx) => {
                      const isMoving = displayPositions[p.id] !== undefined && displayPositions[p.id] !== (gameState?.playersState[p.id]?.position || 0);
                      const verticalOffset = playersOnSquare.length > 1 ? (pIdx % 2 === 0 ? '-translate-y-1' : 'translate-y-1') : '';

                      return (
                        <div
                          key={p.id}
                          className={`group relative flex items-center justify-center w-5 sm:w-7 h-5 sm:h-7 rounded-full border border-white/80 shadow-[0_3px_10px_rgba(0,0,0,0.8)] font-mono font-black text-[9px] sm:text-[10px] text-gray-950 transition-all duration-300 pointer-events-auto ${verticalOffset} ${isMoving ? 'animate-bounce ring-2 ring-amber-400' : ''}`}
                          style={{ 
                            backgroundColor: p.color?.hex || '#34D399',
                            zIndex: 30 + pIdx
                          }}
                        >
                          <Rocket className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-gray-950 drop-shadow-sm" />
                          
                          {/* İsim Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-md bg-gray-950/90 backdrop-blur-sm text-white font-mono text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60] shadow-xl border border-gray-700">
                            {p.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* TAHTA ORTA MERKEZİ (CENTER HUB: 12x6 İÇ ALAN - col 2..13, row 2..7) */}
        <div 
          className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1c1c1e] p-3 sm:p-4 flex flex-col justify-between overflow-hidden transition-all shadow-sm dark:shadow-lg dark:shadow-black/50"
          style={{
            gridColumnStart: 2,
            gridColumnEnd: 14,
            gridRowStart: 2,
            gridRowEnd: 8
          }}
        >
          {/* 1. ÜST BÖLÜM: MİNİ HEADER + YATIRIMCI DURUMLARI (Tahta İçi) */}
          <div className={`pb-2.5 mb-2 border-b flex flex-col gap-2 ${isLight ? 'border-neutral-200' : 'border-neutral-800'}`}>
            
            {/* Üst Bar (Oda Kodu + Gece/Gündüz + Ayrıl - Tahta İçine Taşındı) */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-extrabold flex items-center gap-1.5">
                  <span>🏢 ODA:</span>
                  <strong className="tracking-wider">{roomCode}</strong>
                </div>
                <span className={`text-[11px] font-mono font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  • {players.length} Yatırımcı Masada
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Gece / Gündüz Anahtarı */}
                <button
                  onClick={toggleTheme}
                  className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                    isLight 
                      ? 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800' 
                      : 'bg-[#0a0a0a] border-neutral-800 hover:border-neutral-600 text-neutral-300'
                  }`}
                  title="Gece / Gündüz Temasını Değiştir"
                >
                  {isLight ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-blue-600" />
                      <span>GECE MODU (SOFT)</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                      <span>GÜNDÜZ MODU</span>
                    </>
                  )}
                </button>

                <button
                  onClick={leaveRoom}
                  className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isLight
                      ? 'bg-red-50 hover:bg-red-100 border-red-300 text-red-600'
                      : 'bg-[#0a0a0a] hover:bg-red-950/20 border-neutral-800 hover:border-red-500/30 text-neutral-400 hover:text-red-400'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>AYRIL</span>
                </button>
              </div>
            </div>

            {/* Yatırımcı Kartları Grid (Ekonomik Sis) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {players.map((p, idx) => {
                const pState = gameState?.playersState[p.id] || { balance: 250000, position: 0, totalAssetValue: 0 };
                const currentPosSquare = boardData.find(s => s.id === pState.position)?.name || `#${pState.position}`;
                const isCurrentTurn = currentTurnIndex === idx;
                const isMe = (p.id === myId || p.id === socket?.id);

                return (
                  <div
                    key={p.id}
                    className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                      isCurrentTurn
                        ? (isLight ? 'bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-100 border-emerald-500 shadow-md text-slate-900' : 'bg-gradient-to-r from-neutral-900 via-emerald-500/20 to-neutral-900 border-emerald-400 shadow-md text-white')
                        : (isLight ? 'bg-neutral-50 border-neutral-200 text-neutral-800' : 'bg-neutral-900 border-neutral-800 text-neutral-300')
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: p.color?.hex || '#34D399' }}
                        />
                        <span className="font-bold text-xs truncate">{p.name}</span>
                        {p.isHost && (
                          <span className="text-[8px] font-mono font-bold px-1 py-0.1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            HOST
                          </span>
                        )}
                      </div>
                      {isCurrentTurn && (
                        <span className={`text-[8px] font-mono font-black px-1 py-0.2 rounded border shrink-0 ${
                          isLight ? 'text-emerald-800 bg-emerald-200 border-emerald-500' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        }`}>
                          SIRA ONDA
                        </span>
                      )}
                    </div>

                    {/* Ekonomik Sis ve Tapu Değeri */}
                    <div className={`flex items-center justify-between text-[11px] font-mono mt-1 pt-0.5 border-t ${isLight ? 'border-neutral-200' : 'border-neutral-800/60'}`}>
                      <span className={`${isLight ? 'text-emerald-800' : 'text-emerald-400'} font-bold flex items-center`} title="Güncel Nakit Bakiye">
                        <DollarSign className="w-3 h-3 -mr-0.5" />
                        {isMe ? `${pState.balance?.toLocaleString('tr-TR')} ₺` : '???,??? ₺'}
                      </span>
                      <span className={`${isLight ? 'text-cyan-800' : 'text-cyan-400'} font-bold text-[10px]`} title="Açık Tapu Değeri">
                        Tapu: {pState.totalAssetValue?.toLocaleString('tr-TR') || 0} ₺
                      </span>
                    </div>

                    <div className={`text-[9px] font-mono mt-0.5 truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`} title={currentPosSquare}>
                      📍 #{pState.position} - {currentPosSquare}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* 2. ORTA BÖLÜM: OPERASYON MASASI & SEKME KONTROLLERİ */}
          <div className="flex flex-col flex-1 justify-between min-h-0">
            
            {/* Sekme Seçici (Tab Switcher) */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 pb-2 border-b ${isLight ? 'border-neutral-200' : 'border-neutral-800/60'}`}>
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className={`text-xs sm:text-sm font-bold font-mono uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Merkez Operasyon ve Zar Masası</h3>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Zar Atışı, Portföy ve Ticaret Zinciri Yönetimi</p>
                </div>
              </div>

              <div className={`grid grid-cols-4 p-0.5 rounded-xl border font-mono text-[10px] sm:text-[11px] font-bold w-full sm:w-auto ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <button
                  onClick={() => setActiveTab('turn')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'turn'
                      ? 'bg-emerald-500 text-gray-950 shadow-md font-extrabold'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>ZAR/TUR</span>
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'portfolio'
                      ? 'bg-emerald-500 text-gray-950 shadow-md font-extrabold'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>PORTFÖY</span>
                </button>
                <button
                  onClick={() => setActiveTab('trade')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'trade'
                      ? 'bg-amber-500 text-gray-950 shadow-md font-extrabold'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  <Scale className="w-3 h-3" />
                  <span>TİCARET</span>
                </button>
                <button
                  onClick={() => setActiveTab('swap')}
                  className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'swap'
                      ? 'bg-amber-500 text-gray-950 shadow-md font-extrabold'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  <Handshake className="w-3 h-3" />
                  <span>TAKAS 🤝</span>
                </button>
              </div>
            </div>

            {/* Sekme İçerikleri */}
            <div className="my-auto py-1 overflow-y-auto flex-1">
              {activeTab === 'turn' ? (
                <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto py-2">
                  
                  {/* Sıra Sahibi Paneli */}
                  <div className={`w-full rounded-2xl p-4 sm:p-5 border mb-3 sm:mb-4 shadow-inner relative overflow-hidden ${
                    isLight ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/60 border-neutral-800'
                  }`}>
                    <div className="flex items-center justify-center gap-2.5 mb-2">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shadow-sm animate-pulse"
                        style={{ backgroundColor: activePlayer?.color?.hex || '#34D399' }}
                      />
                      <h4 className={`text-lg sm:text-xl font-black tracking-wide ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                        {activePlayer ? activePlayer.name : 'Bekleniyor...'}
                      </h4>
                      {activePlayer?.isHost && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          HOST
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono font-semibold uppercase tracking-wider">
                      {isMyTurn ? (
                        <span className="text-emerald-500 font-extrabold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
                          ⚡ SIRA SİZDE! ZAR ATMA VEYA İŞLEM YAPMA HAKKI SİZİN!
                        </span>
                      ) : (
                        <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Oyuncunun hamlesi ve zar atışı bekleniyor...</span>
                      )}
                    </div>

                    {/* Son Zar Sonucu Display */}
                    {lastDiceRoll && lastDiceRoll.dice && (
                      <div className={`mt-2.5 pt-2.5 border-t flex items-center justify-center gap-3 text-[11px] font-mono ${
                        isLight ? 'border-neutral-200 text-neutral-700' : 'border-neutral-800 text-neutral-300'
                      }`}>
                        <span>Son Atılan Zar:</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-lg font-bold text-xs border ${
                            isLight ? 'bg-white border-emerald-400 text-emerald-600 shadow-sm' : 'bg-neutral-900 border-emerald-500/40 text-emerald-400'
                          }`}>
                            🎲 {lastDiceRoll.dice[0]} + {lastDiceRoll.dice[1]} = {lastDiceRoll.diceTotal || (lastDiceRoll.dice[0] + lastDiceRoll.dice[1])}
                          </span>
                          {lastDiceRoll.isDouble && (
                            <span className="text-amber-400 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                              ÇİFT ZAR! TEKRAR HAKKI!
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Zar At Butonu (Gündüz/Gece net okunur & tam uyumlu) */}
                  {isSpectator ? (
                    <div className={`px-5 py-2.5 rounded-xl border text-[11px] font-mono text-center w-full flex items-center justify-center gap-2 ${
                      isLight ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-blue-950/20 border-blue-900/50 text-blue-400 font-bold'
                    }`}>
                      <Activity className="w-4 h-4 text-blue-500 animate-pulse shrink-0" />
                      <span>👁️ SEYİRCİ MODU: Sıradaki oyuncuyu ({activePlayer?.name || 'Yatırımcı'}) izliyorsunuz.</span>
                    </div>
                  ) : isMyTurn ? (
                    <button
                      onClick={handleRollClick}
                      disabled={loading}
                      className={`w-full sm:w-72 py-3.5 rounded-2xl font-black text-base sm:text-lg font-mono flex items-center justify-center gap-2.5 transition-all cursor-pointer transform active:scale-95 disabled:opacity-50 ${
                        isLight 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-gray-950 shadow-[0_0_30px_rgba(52,211,153,0.4)]'
                      }`}
                    >
                      <Dices className="w-6 h-6 animate-spin-slow" />
                      <span>{loading ? 'ZAR ATILIYOR...' : 'ZAR AT & HAREKET ET'}</span>
                    </button>
                  ) : (
                    <div className={`px-5 py-2.5 rounded-xl border text-[11px] font-mono ${
                      isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}>
                      Hamle sırası {activePlayer?.name}'da. Sizin sıranız geldiğinde zar butonu aktifleşecek.
                    </div>
                  )}

                </div>
              ) : activeTab === 'portfolio' ? (
                <div className="animate-fade-in max-h-[350px] overflow-y-auto pr-1">
                  <PortfolioPanel />
                </div>
              ) : activeTab === 'trade' ? (
                <div className="animate-fade-in max-h-[350px] overflow-y-auto pr-1">
                  <TradeHubPanel />
                </div>
              ) : (
                <div className="animate-fade-in max-h-[350px] overflow-y-auto pr-1">
                  <SwapPanel />
                </div>
              )}
            </div>

            {/* 3. ALT BÖLÜM: KASA BİLGİSİ VE MERKEZ BANKASI */}
            <div className={`pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono ${
              isLight ? 'border-neutral-200 text-neutral-700 font-bold' : 'border-neutral-800 text-neutral-400'
            }`}>
              {isSpectator ? (
                <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-wider">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span>Canlı Simülasyonu İzliyorsunuz (Seyirci)</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 ${isLight ? 'text-emerald-800' : 'text-emerald-400'} font-extrabold`}>
                      <DollarSign className="w-3.5 h-3.5 -mr-1" />
                      Kasamız: {myState.balance?.toLocaleString('tr-TR')} ₺
                    </span>
                    <span className={`${isLight ? 'text-cyan-800' : 'text-cyan-400'} font-extrabold`}>
                      Tapu Varlığımız: {myState.totalAssetValue?.toLocaleString('tr-TR') || 0} ₺
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => setActiveBankModal(true)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 text-[11px] ${
                        isLight 
                          ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 shadow-sm' 
                          : 'bg-neutral-900 hover:bg-neutral-800 border border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      <Landmark className="w-3.5 h-3.5" />
                      <span>Merkez Bankası (#20)</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
