import React from 'react';
import { Skull, ShieldAlert, CheckCircle2, TrendingUp, X } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function IllegalJobModal() {
  const gameState = useGameStore(state => state.gameState);
  const myId = useGameStore(state => state.myId) || socket?.id;

  const pendingJob = gameState?.pendingIllegalJob;

  if (!pendingJob || pendingJob.playerId !== myId) return null;

  const { title, description, reward, penalty } = pendingJob.quest;

  const handleAccept = () => {
    socket.emit('client:respondIllegalJob', { action: 'ACCEPT' }, (res) => {
      // handled by game state update
    });
  };

  const handleDecline = () => {
    socket.emit('client:respondIllegalJob', { action: 'DECLINE' }, (res) => {
      // handled by game state update
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="border border-red-500/50 rounded-2xl max-w-md w-full p-6 shadow-[0_0_60px_rgba(239,68,68,0.25)] flex flex-col gap-5 relative bg-[#18181b] text-white">

        {/* Top Pulsing Red Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse" />

        {/* Header */}
        <div className="flex items-start gap-3 border-b border-neutral-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0 shadow-inner">
            <Skull className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
              YÜKSEK RİSK & İLLEGAL GÖREV
            </span>
            <h3 className="text-xl font-bold mt-1 text-white leading-tight">{title}</h3>
          </div>
        </div>

        {/* Description Box */}
        <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/60 text-sm leading-relaxed font-sans text-neutral-300">
          {description}
        </div>

        {/* Reward & Penalty Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {/* Reward Box */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
              <TrendingUp className="w-4 h-4" /> ÖDÜL (BAŞARI)
            </div>
            <p className="text-sm font-bold text-white font-mono mt-1">
              {reward?.cash ? `+${reward.cash.toLocaleString('tr-TR')} ₺` : reward?.cashBonus ? `+${reward.cashBonus.toLocaleString('tr-TR')} ₺ Bonus` : reward?.stealCashPercentFromRichest ? `Liderden %${reward.stealCashPercentFromRichest * 100} Çal` : reward?.acquireUnownedPropertyFree ? 'Bedava Sahipsiz Mülk' : 'Yüksek Kâr'}
            </p>
          </div>

          {/* Penalty Box */}
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400">
              <ShieldAlert className="w-4 h-4" /> CEZA (BAŞARISIZLIK)
            </div>
            <p className="text-xs font-bold text-red-200 mt-1">
              {penalty?.action === 'AUCTION_MOST_VALUABLE_PROPERTY' ? 'En Değerli Mülk İhaleye Çıkar' : penalty?.bankOperationsBlockedLaps ? `${penalty.bankOperationsBlockedLaps} Tur Banka Kilidi` : penalty?.action === 'GO_TO_JAIL' ? `${penalty.durationLaps || 1} Tur Hapis Cezası` : penalty?.cashPercent ? `-%${penalty.cashPercent * 100} Nakit Cezası` : penalty?.cash ? `-${penalty.cash.toLocaleString('tr-TR')} ₺ Ceza` : 'Ağır Yaptırım'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleDecline}
            className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold font-mono text-sm transition-all duration-200 shadow flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            <span>REDDET (PAS GEÇ)</span>
          </button>
          
          <button
            onClick={handleAccept}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold font-mono text-sm transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>GÖREVİ KABUL ET</span>
          </button>
        </div>

      </div>
    </div>
  );
}
