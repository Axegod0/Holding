import React, { useEffect, useState } from 'react';
import { Radio, Flame, ShieldAlert, ArrowRight, X, Activity, TrendingDown, Volume2 } from 'lucide-react';
import useGameStore from '../store/gameStore.js';

export default function NewsFlashModal() {
  const newsFlash = useGameStore(state => state.newsFlash);
  const closeNewsFlash = useGameStore(state => state.closeNewsFlash);

  const [timeLeft, setTimeLeft] = useState(12);

  useEffect(() => {
    if (!newsFlash || !newsFlash.isCrisis) return;

    setTimeLeft(12);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          closeNewsFlash();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [newsFlash, closeNewsFlash]);

  // Yalnızca kriz durumlarında haber pop-up'ı gösterilir
  if (!newsFlash || !newsFlash.isCrisis) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-in zoom-in-95 duration-300">
      <div className="max-w-2xl w-full rounded-3xl border-2 border-red-500/60 bg-[#121214]/95 p-6 sm:p-8 shadow-[0_0_90px_rgba(239,68,68,0.35)] flex flex-col gap-6 relative overflow-hidden text-white font-sans">

        {/* Top Animated Pulse Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />

        {/* Live Broadcast Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-mono font-extrabold tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" /> CANLI • BREAKING NEWS
            </span>
            <span className="text-xs font-mono text-neutral-400 uppercase hidden sm:inline-block">
              İSTANBUL BORSASI HABER MERKEZİ
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Activity className="w-4 h-4 text-red-500 animate-spin-slow" />
            <span>Otomatik Kapanış: <strong className="text-amber-400">{timeLeft}s</strong></span>
          </div>
        </div>

        {/* Title / Headline Box */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold tracking-widest uppercase">
            <Flame className="w-4 h-4 text-orange-500" /> PIYASA ŞOKU VE KRİZ RAPORU
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white leading-tight tracking-tight uppercase">
            {newsFlash.title}
          </h2>
        </div>

        {/* Broadcast Message Box */}
        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-red-500/30 text-base sm:text-lg leading-relaxed text-neutral-200 font-sans shadow-inner flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1 font-medium">
            {newsFlash.message}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={closeNewsFlash}
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-mono font-bold text-sm tracking-wider shadow-lg shadow-red-600/30 transition-all cursor-pointer transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>PİYASA BÜLTENİNİ KAPAT VE SİMÜLASYONA DÖN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
