import React, { useState, useEffect } from 'react';
import { Dices, Sparkles } from 'lucide-react';
import useGameStore from '../store/gameStore.js';

export default function DiceRollerAnimation() {
  const activeDiceAnimation = useGameStore(state => state.activeDiceAnimation);
  const theme = useGameStore(state => state.theme);

  const [displayDice1, setDisplayDice1] = useState(1);
  const [displayDice2, setDisplayDice2] = useState(1);
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    if (!activeDiceAnimation || !activeDiceAnimation.rolling) {
      setIsSettled(false);
      return;
    }

    setIsSettled(false);
    const interval = setInterval(() => {
      setDisplayDice1(Math.floor(Math.random() * 6) + 1);
      setDisplayDice2(Math.floor(Math.random() * 6) + 1);
    }, 80);

    // 1200ms sonra zarlar sabitlensin ve gerçek sonuca otursun
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsSettled(true);
      if (activeDiceAnimation.dice) {
        setDisplayDice1(activeDiceAnimation.dice[0]);
        setDisplayDice2(activeDiceAnimation.dice[1]);
      }
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [activeDiceAnimation]);

  if (!activeDiceAnimation || !activeDiceAnimation.rolling) return null;

  const { dice = [1, 1], diceTotal, playerName, isDouble } = activeDiceAnimation;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 pointer-events-none">
      <div className={`p-8 rounded-3xl border-2 max-w-md w-full shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden pointer-events-auto transition-all duration-300 ${
        isLight ? 'bg-white border-emerald-500 text-slate-900 shadow-emerald-500/20' : 'bg-slate-900 border-emerald-500/80 text-white shadow-emerald-500/30'
      }`}>
        
        {/* Üst Vurgu Çizgisi */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 animate-pulse" />

        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>{isSettled ? '⚡ ZARLAR DURDU!' : '🎲 ZARLAR YUVARLANIYOR...'}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black mb-6 tracking-wide">
          <span className="text-emerald-400 font-extrabold">{playerName}</span> Zar Atıyor...
        </h3>

        {/* 3D Görünümlü Zar Kutusu / Küpleri (Takla Atma Animasyonu) */}
        <div className="flex items-center justify-center gap-6 my-5">
          
          {/* Zar 1 */}
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 shadow-2xl flex items-center justify-center text-gray-950 font-black text-4xl sm:text-5xl font-mono transition-all duration-200 ${
            !isSettled
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-200 animate-bounce -rotate-12 scale-110'
              : 'bg-gradient-to-br from-emerald-400 to-teal-600 border-emerald-200 rotate-0 scale-100 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
          }`}>
            🎲 {displayDice1}
          </div>

          <span className="text-2xl font-black text-gray-400 animate-pulse">+</span>

          {/* Zar 2 */}
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 shadow-2xl flex items-center justify-center text-gray-950 font-black text-4xl sm:text-5xl font-mono transition-all duration-200 ${
            !isSettled
              ? 'bg-gradient-to-br from-orange-400 to-amber-600 border-orange-200 animate-bounce rotate-12 scale-110'
              : 'bg-gradient-to-br from-teal-400 to-emerald-600 border-teal-200 rotate-0 scale-100 shadow-[0_0_30px_rgba(20,184,166,0.5)]'
          }`}>
            🎲 {displayDice2}
          </div>

        </div>

        {/* Sonuç Özeti */}
        <div className="mt-6 pt-4 border-t border-gray-800/60 w-full flex flex-col items-center min-h-[70px] justify-center">
          {isSettled ? (
            <div className="animate-in zoom-in-90 duration-300">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 tracking-tight">
                TOPLAM: {diceTotal}
              </div>
              {isDouble && (
                <div className="mt-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs uppercase tracking-widest animate-pulse">
                  ⚡ ÇİFT ZAR! TEKRAR OYNAMA HAKKI ⚡
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm font-mono font-bold text-gray-400 animate-pulse">
              Zarlar yuvarlanıyor, sonuç bekleniyor...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
