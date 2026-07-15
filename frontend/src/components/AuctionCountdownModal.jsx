import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, Sparkles, ShieldAlert } from 'lucide-react';
import useGameStore from '../store/gameStore.js';

export default function AuctionCountdownModal() {
  const auctionCountdown = useGameStore(state => state.auctionCountdown);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (!auctionCountdown) return;
    setSecondsLeft(auctionCountdown.seconds || 10);

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionCountdown]);

  if (!auctionCountdown) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel-glow w-full max-w-md rounded-2xl p-6 border border-amber-500/60 shadow-[0_0_60px_rgba(245,158,11,0.4)] relative overflow-hidden text-center space-y-5 animate-scale-up">
        
        {/* Üst Dekorasyon Bantı */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 animate-pulse" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
          <Clock className="w-9 h-9 animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        <div>
          <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            ÖZEL AÇIK İHALE DUYURUSU
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            {auctionCountdown.title || 'Akıllı Sulama Sistemleri İhalesi'}
          </h3>
        </div>

        <p className="text-xs font-mono text-gray-300 leading-relaxed bg-gray-900/80 p-3.5 rounded-xl border border-gray-800">
          {auctionCountdown.description || 'Tüm yatırımcılara açık 20 saniyelik altyapı ihalesi. Kazanan oyuncu Hammadde Tesisinden 5 tur boyunca 2 KAT ÜRETİM / KİRA GETİRİSİ sağlayacak!'}
        </p>

        <div className="pt-2">
          <div className="inline-flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-b from-red-950/80 to-gray-900 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">İHALENİN BAŞLAMASINA KALAN SÜRE</span>
            <span className="text-4xl font-mono font-black text-white tracking-tighter mt-0.5">
              {secondsLeft} <span className="text-sm text-red-400 font-normal">sn</span>
            </span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-gray-400 pt-1 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Lütfen nakit bakiyelerinizi ve stratejinizi hazırlayınız!</span>
        </div>

      </div>
    </div>
  );
}
