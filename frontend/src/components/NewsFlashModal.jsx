import React from 'react';
import { AlertTriangle, Newspaper, X } from 'lucide-react';
import useGameStore from '../store/gameStore.js';

export default function NewsFlashModal() {
  const newsFlash = useGameStore(state => state.newsFlash);
  const closeNewsFlash = useGameStore(state => state.closeNewsFlash);
  const theme = useGameStore(state => state.theme);

  // Haber manşeti modalı tüm sonuçlarda gösterilmelidir
  if (!newsFlash) return null;

  const isCrisis = !!newsFlash.isCrisis;

  // Dinamik Tasarım Değerleri
  const borderColor = isCrisis 
    ? 'bg-white dark:bg-[#1c1c1e] border-red-500 shadow-red-500/20 text-neutral-900 dark:text-white'
    : 'bg-white dark:bg-[#1c1c1e] border-emerald-500 shadow-emerald-500/20 text-neutral-900 dark:text-white';

  const topBarColor = isCrisis 
    ? 'from-red-600 via-amber-500 to-red-600'
    : 'from-emerald-600 via-teal-400 to-emerald-600';

  const iconBg = isCrisis 
    ? 'bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-500' 
    : 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-500';
  
  const badgeStyle = isCrisis 
    ? 'bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400' 
    : 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400';
  const badgeText = isCrisis ? 'BORSA İSTANBUL • SON DAKİKA KRİZ MANŞETİ' : 'BORSA İSTANBUL • HABER GAZETE MANŞETİ';

  const panelBg = isCrisis
    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/30 text-red-950 dark:text-red-200'
    : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-emerald-200';

  const buttonStyle = isCrisis
    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
      <div className={`max-w-2xl w-full p-8 sm:p-10 rounded-3xl border-4 shadow-2xl flex flex-col items-center text-center relative overflow-hidden ${borderColor}`}>
        
        {/* Dekoratif Parlama Şeridi */}
        <div className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${topBarColor} animate-pulse`} />
 
        {/* Alarm/Haber İkonu */}
        <div className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center mb-5 shadow-inner animate-bounce ${iconBg}`}>
          {isCrisis ? <AlertTriangle className="w-10 h-10" /> : <Newspaper className="w-10 h-10" />}
        </div>
 
        <div className={`px-3.5 py-1 rounded-full border font-mono font-extrabold text-xs tracking-widest uppercase mb-3 flex items-center gap-2 ${badgeStyle}`}>
          <Newspaper className="w-4 h-4" />
          <span>{badgeText}</span>
        </div>
 
        <h2 className="text-2xl sm:text-3xl font-black mt-1 mb-4 leading-tight tracking-wide">
          {newsFlash.title}
        </h2>
 
        <div className={`p-6 rounded-2xl border w-full text-base sm:text-lg font-medium leading-relaxed mb-8 font-sans shadow-inner ${panelBg}`}>
          {newsFlash.message}
        </div>
 
        <button
          onClick={closeNewsFlash}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-mono font-bold text-sm tracking-wider shadow-lg transition-all cursor-pointer transform active:scale-95 flex items-center justify-center gap-2 ${buttonStyle}`}
        >
          <X className="w-5 h-5" />
          <span>HABERİ KAPAT VE SIMÜLASYONA DÖN</span>
        </button>
 
      </div>
    </div>
  );
}
