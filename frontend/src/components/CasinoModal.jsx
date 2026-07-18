import React, { useState, useEffect, useRef } from 'react';
import { PlaySquare, DollarSign, XCircle, Hand, AlertTriangle } from 'lucide-react';
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
  
  const waitingForCasino = gameState?.waitingForCasino;
  const isMyTurn = waitingForCasino?.playerId === myId;
  const myBalance = gameState?.playersState?.[myId]?.balance || 0;

  const [phase, setPhase] = useState('bet'); // bet, play, result
  const [bet, setBet] = useState(10000);
  
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [gameResult, setGameResult] = useState(null); // win, lose, draw

  // Modal sadece #33 karesine gelen kişi tarafından ve sıra onda iken görülür. (Diğerleri görebilir mi? Hayır, sadece oyuncuya özel açalım ya da izleyici modu ekleyelim. Şimdilik sadece aktif oyuncuya açalım)
  if (!waitingForCasino || !isMyTurn) return null;

  const isLight = theme === 'light';

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

  const pScore = calculateScore(playerCards);
  const dScore = calculateScore(dealerCards);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className={`max-w-xl w-full p-6 sm:p-8 rounded-3xl border-4 shadow-2xl relative overflow-hidden font-mono ${
        isLight ? 'bg-neutral-100 border-neutral-300' : 'bg-[#0a0a0a] border-neutral-800'
      }`}>
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black text-emerald-500 mb-1 tracking-widest uppercase">YERALTI KUMARHANESİ</h2>
          <p className="text-neutral-500 font-bold text-sm tracking-wider">BLACKJACK MASASI</p>
        </div>

        {phase === 'bet' && (
          <div className="flex flex-col items-center gap-6">
            <p className={`text-lg font-bold text-center ${isLight ? 'text-neutral-800' : 'text-neutral-200'}`}>
              Ne kadar riske etmek istersin?
            </p>
            <div className="flex items-center gap-4 text-3xl font-black text-emerald-400">
              <DollarSign className="w-8 h-8" />
              <span>{bet.toLocaleString('tr-TR')} ₺</span>
            </div>
            <input 
              type="range" 
              min="10000" 
              max={Math.max(10000, Math.min(500000, myBalance))} 
              step="10000" 
              value={bet}
              onChange={(e) => setBet(Number(e.target.value))}
              className="w-full accent-emerald-500 h-3 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex gap-4 w-full mt-4">
              <button 
                onClick={startGame}
                disabled={bet > myBalance || bet <= 0}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                OYUNA BAŞLA
              </button>
              <button 
                onClick={() => socket.emit('client:playCasino', { betAmount: 0, result: 'draw' })}
                className="py-4 px-6 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-lg rounded-2xl transition-all"
              >
                MASADAN KALK
              </button>
            </div>
            {bet > myBalance && (
              <p className="text-red-500 font-bold text-sm">Yetersiz bakiye!</p>
            )}
          </div>
        )}

        {phase === 'play' && (
          <div className="flex flex-col gap-8">
            <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-700">
              <h3 className="text-neutral-400 font-bold mb-3 text-center">KRUPİYE (Puan: {dScore})</h3>
              <div className="flex justify-center gap-3">
                {dealerCards.map((c, i) => (
                  <div key={i} className={`w-16 h-24 bg-white rounded-xl border-2 border-neutral-300 flex flex-col items-center justify-center shadow-lg ${c.color}`}>
                    <span className="text-xl font-black">{c.rank}</span>
                    <span className="text-2xl">{c.suit}</span>
                  </div>
                ))}
                <div className="w-16 h-24 bg-neutral-800 rounded-xl border-2 border-neutral-700 flex items-center justify-center opacity-50">
                  <span className="text-neutral-600 text-2xl">?</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 p-4 rounded-2xl border border-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <h3 className="text-emerald-400 font-bold mb-3 text-center">SEN (Puan: {pScore})</h3>
              <div className="flex justify-center gap-3 flex-wrap">
                {playerCards.map((c, i) => (
                  <div key={i} className={`w-16 h-24 bg-white rounded-xl border-2 border-neutral-300 flex flex-col items-center justify-center shadow-lg animate-in slide-in-from-bottom-5 ${c.color}`}>
                    <span className="text-xl font-black">{c.rank}</span>
                    <span className="text-2xl">{c.suit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <button 
                onClick={hit}
                className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Hand className="w-6 h-6" /> KART ÇEK (HIT)
              </button>
              <button 
                onClick={stand}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <PlaySquare className="w-6 h-6" /> BEKLE (STAND)
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-95">
            <div className={`p-6 rounded-3xl border-4 w-full text-center shadow-2xl ${
              gameResult === 'win' ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' :
              gameResult === 'lose' ? 'bg-red-900/40 border-red-500 text-red-400' :
              'bg-amber-900/40 border-amber-500 text-amber-400'
            }`}>
              <h3 className="text-4xl font-black mb-2 uppercase">
                {gameResult === 'win' ? 'KAZANDIN!' : gameResult === 'lose' ? 'KAYBETTİN!' : 'BERABERE!'}
              </h3>
              <p className="text-xl font-bold opacity-80">
                {gameResult === 'win' ? `+${bet.toLocaleString('tr-TR')} ₺` : gameResult === 'lose' ? `-${bet.toLocaleString('tr-TR')} ₺` : 'Paranı Geri Aldın'}
              </p>
            </div>

            <div className="flex w-full gap-4 opacity-80">
              <div className="flex-1 bg-neutral-900 p-4 rounded-2xl border border-neutral-700 text-center">
                <p className="text-neutral-500 text-sm mb-1">Krupiye</p>
                <p className="text-2xl font-black text-white">{dScore}</p>
              </div>
              <div className="flex-1 bg-neutral-900 p-4 rounded-2xl border border-neutral-700 text-center">
                <p className="text-neutral-500 text-sm mb-1">Sen</p>
                <p className="text-2xl font-black text-white">{pScore}</p>
              </div>
            </div>

            <p className="text-neutral-500 font-bold animate-pulse mt-4">Simülasyona dönülüyor...</p>
          </div>
        )}

      </div>
    </div>
  );
}
