import React, { useState } from 'react';
import { TrendingUp, Landmark, Sparkles, DollarSign, ArrowUpRight, Ban } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function BorsaInvestmentModal() {
  const gameState = useGameStore(state => state.gameState);
  const submitBorsaInvestment = useGameStore(state => state.submitBorsaInvestment);
  const loading = useGameStore(state => state.loading);
  const activeDiceAnimation = useGameStore(state => state.activeDiceAnimation);
  const isTokenMoving = useGameStore(state => state.isTokenMoving);
  const theme = useGameStore(state => state.theme);

  const myId = useGameStore(state => state.myId) || socket?.id;

  const [customAmount, setCustomAmount] = useState('50000');

  if (!gameState || !gameState.waitingForBorsa || activeDiceAnimation || isTokenMoving) return null;

  const waiting = gameState.waitingForBorsa;
  if (waiting.playerId !== myId) return null;

  const myState = gameState.playersState[myId] || { balance: 0 };

  const handleInvest = (amountVal) => {
    const val = Number(amountVal) || 0;
    if (val > myState.balance) {
      alert('Yetersiz bakiye!');
      return;
    }
    submitBorsaInvestment(val);
  };

  const handleSkip = () => {
    submitBorsaInvestment(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 dark:bg-neutral-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1c1c1e] border border-emerald-400/50 dark:border-emerald-500/50 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col relative">
        
        {/* Üst Vurgu Şeridi */}
        <div className="h-3.5 w-full shrink-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse" />

        {/* Başlık */}
        <div className="p-6 pb-4 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shrink-0">
            <TrendingUp className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 block mb-0.5">
              BORSA İSTANBUL & HALKA ARZ
            </span>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white leading-tight">
              Borsaya Yatırım Yapın
            </h3>
          </div>
        </div>

        {/* Detaylar */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/90 border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs font-mono">
            <p className="text-neutral-600 dark:text-neutral-300">
              Halka Arz Terminali veya Borsa Karesine ulaştınız. Nakit birikiminizi değerlendirme fırsatı:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/25">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-0.5">📈 %55 İhtimal</span>
                Yatırdığınız para <strong className="text-neutral-900 dark:text-white">2 KATINA</strong> katlanır.
              </div>
              <div className="p-2.5 rounded-xl bg-red-100/50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/25">
                <span className="text-red-600 dark:text-red-400 font-bold block mb-0.5">📉 %45 İhtimal</span>
                Yatırımınızın <strong className="text-neutral-900 dark:text-white">%50'si</strong> erir.
              </div>
            </div>
            <div className="pt-2.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span>Güncel Nakitiniz:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{myState.balance?.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>

          {/* Hızlı Seçim Butonları */}
          <div className="grid grid-cols-3 gap-2">
            {[10000, 50000, 100000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => handleInvest(amt)}
                disabled={loading || amt > myState.balance}
                className="py-2.5 px-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-200 dark:hover:border-emerald-500/40 font-mono text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {amt?.toLocaleString('tr-TR')} ₺
              </button>
            ))}
          </div>

          {/* Özel Tutar Girişi */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-neutral-500 uppercase block tracking-wider">Veya Özel Miktar Girin (₺):</span>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={myState.balance}
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-400 dark:hover:border-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl p-3 pl-7 text-xs text-neutral-900 dark:text-white font-mono placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">₺</span>
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="p-6 pt-2 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center gap-3">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex-1 py-3.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-200 dark:border-neutral-700 disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            <span>Yatırım Yapma (Pas Geç)</span>
          </button>

          <button
            onClick={() => handleInvest(customAmount)}
            disabled={loading || !customAmount || Number(customAmount) <= 0 || Number(customAmount) > myState.balance}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer border border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpRight className="w-4 h-4 animate-bounce" />
            <span>Yatırımı Onayla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
