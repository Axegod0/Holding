import React from 'react';
import { Handshake, ArrowRight, DollarSign, Check, X, AlertCircle } from 'lucide-react';
import useGameStore from '../store/gameStore.js';

export default function SwapOfferModal() {
  const activeSwapOffer = useGameStore(state => state.activeSwapOffer);
  const respondSwapOffer = useGameStore(state => state.respondSwapOffer);
  const gameState = useGameStore(state => state.gameState);
  const loading = useGameStore(state => state.loading);
  const theme = useGameStore(state => state.theme);

  if (!activeSwapOffer) return null;

  const myState = gameState?.playersState[activeSwapOffer.toId] || { balance: 0 };
  const canAfford = myState.balance >= activeSwapOffer.requestedCash;

  // Helper to translate property IDs to Names
  const getPropNames = (ids) => {
    if (!ids || ids.length === 0) return 'Yok';
    return ids.map(id => {
      const sq = gameState?.boardData?.find(s => s.id === Number(id));
      return sq ? `${sq.name} (#${id})` : `#${id}`;
    }).join(', ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 dark:bg-neutral-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#1c1c1e] border border-amber-400/50 dark:border-amber-500/50 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col relative">
        
        {/* Üst Vurgu Şeridi */}
        <div className="h-3.5 w-full shrink-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Başlık */}
        <div className="p-6 pb-4 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black shadow-lg shrink-0">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 block mb-0.5">
              TAKAS MASASI / SWAP PROPOSAL
            </span>
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white leading-tight">
              Gelen Takas & Anlaşma Teklifi
            </h3>
          </div>
        </div>

        {/* İçerik */}
        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          <p className="text-xs font-mono text-neutral-600 dark:text-neutral-300">
            <strong className="text-amber-600 dark:text-amber-400">👑 {activeSwapOffer.fromName}</strong> size çift taraflı bir takas teklif etti.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* ALACAKLARINIZ (Sender's Offer) */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-3">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">
                ➕ SİZE VERİLECEK (ALACAKLARINIZ)
              </span>
              
              <div className="space-y-2">
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 block">Nakit Para:</span>
                  <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
                    +{activeSwapOffer.offeredCash?.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 block">Mülk(ler):</span>
                  <span className="text-xs font-mono text-neutral-900 dark:text-white font-bold leading-relaxed">
                    {getPropNames(activeSwapOffer.offeredProperties)}
                  </span>
                </div>
              </div>
            </div>

            {/* VERECEKLERİNİZ (Requested from You) */}
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 space-y-3">
              <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 block tracking-wider">
                ➖ SİZDEN İSTENEN (VERECEKLERİNİZ)
              </span>
              
              <div className="space-y-2">
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 block">Nakit Para:</span>
                  <span className="text-lg font-mono font-black text-red-600 dark:text-red-400">
                    -{activeSwapOffer.requestedCash?.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 block">Mülk(ler):</span>
                  <span className="text-xs font-mono text-neutral-900 dark:text-white font-bold leading-relaxed">
                    {getPropNames(activeSwapOffer.requestedProperties)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {!canAfford && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>İstenen nakit miktarı bakiyenizden fazla! Bu teklifi kabul edemezsiniz.</span>
            </div>
          )}
        </div>

        {/* Alt Butonlar */}
        <div className="p-6 pt-2 border-t border-neutral-200 dark:border-neutral-800/60 flex items-center gap-3">
          <button
            onClick={() => respondSwapOffer(activeSwapOffer.id, false)}
            disabled={loading}
            className="flex-1 py-3.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-500/40 disabled:opacity-50"
          >
            <X className="w-4 h-4 text-red-500 dark:text-red-400" />
            <span>Reddet ❌</span>
          </button>

          <button
            onClick={() => respondSwapOffer(activeSwapOffer.id, true)}
            disabled={!canAfford || loading}
            className={`flex-1 py-3.5 px-4 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg ${
              !canAfford
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:shadow-emerald-500/20 cursor-pointer border border-emerald-500/30'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Kabul Et ✅</span>
          </button>
        </div>
      </div>
    </div>
  );
}
