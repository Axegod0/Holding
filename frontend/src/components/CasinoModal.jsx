import React, { useState, useEffect } from 'react';
import { PlaySquare, DollarSign, XCircle, Hand, AlertTriangle, Users } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

const DECK = [
  { rank: '2', value: 2 }, { rank: '3', value: 3 }, { rank: '4', value: 4 }, { rank: '5', value: 5 },
  { rank: '6', value: 6 }, { rank: '7', value: 7 }, { rank: '8', value: 8 }, { rank: '9', value: 9 },
  { rank: '10', value: 10 }, { rank: 'J', value: 10 }, { rank: 'Q', value: 10 }, { rank: 'K', value: 10 },
  { rank: 'A', value: 11 }
];

const SUITS = ['♠', '♥', '♦', '♣'];

function drawCard() {
  const card = DECK[Math.floor(Math.random() * DECK.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { ...card, suit, color: (suit === '♥' || suit === '♦') ? 'text-red-500' : 'text-neutral-900 dark:text-white' };
}

function calculateScore(cards) {
  let score = 0;
  let aces = 0;
  cards.forEach(c => {
    score += c.value;
    if (c.rank === 'A') aces += 1;
  });
  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }
  return score;
}

export default function CasinoModal() {
  const gameState = useGameStore(state => state.gameState);
  const myId = useGameStore(state => state.myId || socket?.id);
  const theme = useGameStore(state => state.theme);
  const players = useGameStore(state => state.players) || [];
  
  const waitingForCasino = gameState?.waitingForCasino;
  const casinoSession = gameState?.casinoSession;
  const myBalance = gameState?.playersState?.[myId]?.balance || 0;

  const isHost = waitingForCasino?.playerId === myId || casinoSession?.hostId === myId;
  const isJoined = casinoSession?.joinedPlayers?.includes(myId);
  const hasFinished = casinoSession?.finishedPlayers?.includes(myId);

  const [phase, setPhase] = useState('bet'); // bet, play, result
  const [bet, setBet] = useState(10000);
  
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [gameResult, setGameResult] = useState(null);

  // Reset internal state when session ends or starts
  useEffect(() => {
    if (!casinoSession && !waitingForCasino) {
      setPhase('bet');
      setPlayerCards([]);
      setDealerCards([]);
      setGameResult(null);
    }
  }, [casinoSession, waitingForCasino]);

  if (!waitingForCasino && !casinoSession) return null;

  const isLight = theme === 'light';
  
  // -- HOST LOBBY --
  if (!casinoSession && isHost && waitingForCasino) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-black/90 p-6 rounded-2xl border border-green-500/30 max-w-sm w-full text-center shadow-[0_0_40px_rgba(34,197,94,0.15)]">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-yellow-500 mb-2">YERALTI KUMARHANESİ</h2>
          <p className="text-neutral-300 text-sm mb-6">Şansını denemeden önce odaya davet gönderebilirsin. Sadece daveti kabul edenler oynayabilir.</p>
          <div className="space-y-3">
            <button 
              onClick={() => socket.emit('client:sendCasinoInvite')}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" /> Herkese Davet Gönder
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -- EVERYONE ELSE: INVITE POPUP --
  if (casinoSession && casinoSession.status === 'lobby' && !isJoined) {
    const hostName = players.find(p=>p.id === casinoSession.hostId)?.name || 'Kasa';
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-black/90 p-6 rounded-2xl border border-green-500/30 max-w-sm w-full text-center shadow-[0_0_40px_rgba(34,197,94,0.15)]">
          <h2 className="text-xl font-bold text-yellow-500 mb-2">KUMARHANE DAVETİ</h2>
          <p className="text-white mb-6 font-medium"><strong>{hostName}</strong> seni yeraltı kumarhanesinde Blackjack oynamaya davet ediyor!</p>
          <div className="flex gap-4">
            <button onClick={() => socket.emit('client:acceptCasinoInvite')} className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg">Katıl</button>
            <button onClick={() => {}} className="flex-1 py-3 bg-red-500/20 text-red-500 font-bold rounded-lg opacity-50 cursor-not-allowed text-sm">Reddet (İzleyici)</button>
          </div>
        </div>
      </div>
    );
  }

  // -- HOST WAITING IN LOBBY FOR OTHERS --
  if (casinoSession && casinoSession.status === 'lobby' && isJoined) {
    if (isHost) {
      return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-black/90 p-6 rounded-2xl border border-green-500/30 max-w-sm w-full text-center shadow-[0_0_40px_rgba(34,197,94,0.15)]">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 animate-pulse">LOBİ BEKLENİYOR...</h2>
            <div className="text-left text-sm text-neutral-300 mb-6 space-y-2 border border-white/10 rounded-xl p-4 bg-white/5">
              <p className="text-neutral-500 font-mono mb-2 uppercase tracking-widest text-xs">Şu ana kadar katılanlar ({casinoSession.joinedPlayers.length}):</p>
              {casinoSession.joinedPlayers.map(id => (
                <div key={id} className="text-green-400 font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                  {players.find(p=>p.id===id)?.name}
                </div>
              ))}
            </div>
            <button 
              onClick={() => socket.emit('client:startCasinoGame')}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-lg shadow-lg uppercase tracking-wider"
            >
              Oyunu Başlat ({casinoSession.joinedPlayers.length} Oyuncu)
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-black/90 p-6 rounded-2xl border border-green-500/30 max-w-sm w-full text-center shadow-[0_0_40px_rgba(34,197,94,0.15)]">
            <h2 className="text-xl font-bold text-yellow-500 mb-2 animate-pulse">LOBİ BEKLENİYOR...</h2>
            <p className="text-neutral-300">Ev sahibi oyunu başlattığında Blackjack masasına alınacaksın.</p>
          </div>
        </div>
      );
    }
  }

  // If session is playing but user is not joined (e.g. they declined)
  if (casinoSession && casinoSession.status === 'playing' && !isJoined) {
    return null; // Don't show anything to people who didn't join
  }

  // -- GAME LOGIC BELOW (ONLY FOR JOINED PLAYERS) --
  // Note: hasFinished means they submitted their result and are waiting for others.
  if (hasFinished) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-black/90 p-6 rounded-2xl border border-green-500/30 max-w-sm w-full text-center shadow-[0_0_40px_rgba(34,197,94,0.15)]">
          <h2 className="text-xl font-bold text-yellow-500 mb-2 animate-pulse">SONUÇ BEKLENİYOR</h2>
          <p className="text-neutral-300">Sen elini tamamladın. Diğer oyuncuların da bitirmesi bekleniyor...</p>
        </div>
      </div>
    );
  }

  const startGame = () => {
    if (bet > myBalance) return;
    setPhase('play');
    setPlayerCards([drawCard(), drawCard()]);
    setDealerCards([drawCard()]); // Dealer shows 1 card
  };

  const hit = () => {
    const newCards = [...playerCards, drawCard()];
    setPlayerCards(newCards);
    if (calculateScore(newCards) > 21) {
      endGame(newCards, dealerCards, 'lose');
    }
  };

  const stand = () => {
    let currentDealerCards = [...dealerCards];
    while (calculateScore(currentDealerCards) < 17) {
      currentDealerCards.push(drawCard());
    }
    setDealerCards(currentDealerCards);
    
    const pScore = calculateScore(playerCards);
    const dScore = calculateScore(currentDealerCards);
    
    if (dScore > 21 || pScore > dScore) {
      endGame(playerCards, currentDealerCards, 'win');
    } else if (pScore < dScore) {
      endGame(playerCards, currentDealerCards, 'lose');
    } else {
      endGame(playerCards, currentDealerCards, 'draw');
    }
  };

  const endGame = (pCards, dCards, result) => {
    setPlayerCards(pCards);
    setDealerCards(dCards);
    setGameResult(result);
    setPhase('result');
    
    setTimeout(() => {
      socket.emit('client:playCasino', { betAmount: bet, result });
    }, 3000);
  };

  // REUSE THE SAME RENDER FROM PREVIOUS UI FOR BET/PLAY/RESULT
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-[#0a0a0a] border border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.15)] flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full bg-green-950/40 p-4 border-b border-green-500/30 flex items-center justify-center gap-3">
          <PlaySquare className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-black text-green-500 tracking-widest uppercase">Yeraltı Blackjack</h2>
        </div>

        <div className="w-full p-6 sm:p-8 flex flex-col items-center min-h-[400px]">
          {phase === 'bet' && (
            <div className="w-full max-w-xs flex flex-col items-center animate-in slide-in-from-bottom-4">
              <div className="mb-8 text-center">
                <p className="text-neutral-400 font-mono mb-2 uppercase text-sm tracking-wider">Kasa Bakiyen</p>
                <div className="text-3xl font-black text-emerald-400 font-mono bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 shadow-inner">
                  {myBalance.toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <div className="w-full space-y-4">
                <p className="text-center text-sm text-neutral-500 font-bold uppercase tracking-widest">Bahis Miktarı Seç</p>
                
                {[10000, 25000, 50000, 100000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBet(amount)}
                    className={`w-full py-3 rounded-xl font-bold font-mono text-lg transition-all border ${
                      bet === amount 
                        ? 'bg-green-500 text-black border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105' 
                        : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {amount.toLocaleString('tr-TR')} ₺
                  </button>
                ))}
              </div>

              <button
                onClick={startGame}
                disabled={myBalance < bet}
                className="mt-8 w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-2xl shadow-lg disabled:opacity-50 disabled:grayscale transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-lg"
              >
                Oyunu Başlat
              </button>
            </div>
          )}

          {(phase === 'play' || phase === 'result') && (
            <div className="w-full flex flex-col items-center justify-between flex-1 animate-in zoom-in-95 duration-500">
              
              {/* DEALER AREA */}
              <div className="w-full flex flex-col items-center mb-8">
                <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest mb-3 font-bold">Kruvazör / Kasa</p>
                <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                  {dealerCards.map((c, i) => (
                    <div key={i} className={`w-16 sm:w-20 h-24 sm:h-28 bg-white rounded-xl shadow-xl border border-neutral-200 flex flex-col items-center justify-center ${c.color} animate-in slide-in-from-top-4`}>
                      <span className="text-xl sm:text-2xl font-bold">{c.rank}</span>
                      <span className="text-2xl sm:text-3xl">{c.suit}</span>
                    </div>
                  ))}
                  {phase === 'play' && (
                    <div className="w-16 sm:w-20 h-24 sm:h-28 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] rounded-xl border border-neutral-800 opacity-20" />
                  )}
                </div>
                {phase === 'result' && (
                  <div className="mt-3 bg-black/50 px-3 py-1 rounded font-mono text-white text-sm font-bold border border-white/10">
                    Skor: {calculateScore(dealerCards)}
                  </div>
                )}
              </div>

              {/* RESULT OVERLAY */}
              {phase === 'result' && (
                <div className="my-4 animate-in zoom-in duration-500 drop-shadow-2xl z-10">
                  {gameResult === 'win' && <div className="text-5xl font-black text-emerald-400 uppercase tracking-widest rotate-[-5deg]">KAZANDIN!</div>}
                  {gameResult === 'lose' && <div className="text-5xl font-black text-red-500 uppercase tracking-widest rotate-[5deg]">KAYBETTİN</div>}
                  {gameResult === 'draw' && <div className="text-4xl font-black text-yellow-500 uppercase tracking-widest">BERABERE</div>}
                </div>
              )}

              {/* PLAYER AREA */}
              <div className="w-full flex flex-col items-center mt-auto">
                <div className="flex justify-center gap-2 sm:gap-4 flex-wrap mb-3">
                  {playerCards.map((c, i) => (
                    <div key={i} className={`w-16 sm:w-20 h-24 sm:h-28 bg-white rounded-xl shadow-xl border border-neutral-200 flex flex-col items-center justify-center ${c.color} animate-in slide-in-from-bottom-4`}>
                      <span className="text-xl sm:text-2xl font-bold">{c.rank}</span>
                      <span className="text-2xl sm:text-3xl">{c.suit}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-black/50 px-3 py-1 rounded font-mono text-white text-sm font-bold border border-white/10 mb-6">
                  Senin Skorun: <span className={calculateScore(playerCards) > 21 ? 'text-red-500' : 'text-emerald-400'}>{calculateScore(playerCards)}</span>
                </div>

                {phase === 'play' && (
                  <div className="flex gap-4 w-full max-w-xs">
                    <button 
                      onClick={hit}
                      className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <Hand className="w-5 h-5" /> KART ÇEK
                    </button>
                    <button 
                      onClick={stand}
                      className="flex-1 py-4 bg-red-500 hover:bg-red-400 text-black font-black rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <XCircle className="w-5 h-5" /> DUR
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
