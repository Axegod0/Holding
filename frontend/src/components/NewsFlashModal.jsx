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

  // Dinamik Tasarım Değerleri (Klasik Gazete NYT Stili)
  const borderColor = 'bg-[#f4f4f0] dark:bg-[#0a0a0a] border-neutral-900 dark:border-neutral-300 text-neutral-900 dark:text-neutral-100';

  const topBarColor = 'from-neutral-900 via-neutral-600 to-neutral-900 dark:from-neutral-300 dark:via-neutral-500 dark:to-neutral-300';

  const iconBg = 'bg-white dark:bg-neutral-900 border-neutral-900 dark:border-neutral-300 text-neutral-900 dark:text-neutral-100';
  
  const badgeStyle = 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 text-white dark:text-neutral-900';
  const badgeText = isCrisis ? 'THE İSTANBUL TIMES • SON DAKİKA KRİZİ' : 'THE İSTANBUL TIMES • GÜNLÜK BÜLTEN';

  const panelBg = 'bg-white dark:bg-black border-y-4 border-neutral-900 dark:border-neutral-300 text-neutral-900 dark:text-neutral-100 font-serif';

  const buttonStyle = 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 border-2 border-neutral-900 dark:border-neutral-100';

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
 
        <h2 className="text-3xl sm:text-4xl font-serif font-black mt-1 mb-4 leading-tight tracking-tight uppercase border-b-2 border-neutral-900 dark:border-neutral-300 pb-4 w-full">
          {newsFlash.title}
        </h2>
 
        <div className={`py-6 px-4 w-full text-lg sm:text-xl font-medium leading-relaxed mb-8 ${panelBg}`}>
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
