import React, { useState } from 'react';
import { Hammer, Clock, DollarSign, User, AlertTriangle, TrendingUp, ShieldAlert, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function AuctionModal() {
  const activeAuction = useGameStore(state => state.activeAuction);
  const placeBid = useGameStore(state => state.placeBid);
  const gameState = useGameStore(state => state.gameState);
  const finishAuctionEarly = useGameStore(state => state.finishAuctionEarly);
  const myId = useGameStore(state => state.myId) || socket?.id;
  const isAuctionModalMinimized = useGameStore(state => state.isAuctionModalMinimized);
  const setAuctionModalMinimized = useGameStore(state => state.setAuctionModalMinimized);
  const [customBid, setCustomBid] = useState('');

  if (!activeAuction) return null;

  const myState = gameState?.playersState[myId] || { balance: 0 };
  const isSeller = activeAuction.sellerId === myId || activeAuction.sellerId === socket?.id;
  const isHighestBidder = activeAuction.highestBidderId === myId || activeAuction.highestBidderId === socket?.id;
  const currentBid = activeAuction.currentBid || 0;
  const timeLeft = activeAuction.timeLeft || 0;

  if (isAuctionModalMinimized) {
    return (
      <div 
        onClick={() => setAuctionModalMinimized(false)}
        className="fixed bottom-4 right-4 z-40 bg-white dark:bg-neutral-900 border border-amber-400/50 dark:border-amber-500 rounded-2xl p-4 shadow-xl dark:shadow-[0_10px_30px_rgba(245,158,11,0.25)] cursor-pointer hover:border-amber-500 hover:scale-105 transition-all w-72 flex flex-col gap-2 text-neutral-900 dark:text-white select-none animate-slide-in"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
          <div className="flex items-center gap-2">
            <Hammer className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-bounce" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400">AKTİF İHALE (PİP)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded font-mono text-[10px] ${
              timeLeft <= 10 ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 animate-pulse' : 'bg-amber-50 dark:bg-neutral-800 text-amber-600 dark:text-amber-300'
            }`}>
              {timeLeft} sn
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setAuctionModalMinimized(false);
              }}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="font-extrabold text-sm truncate max-w-[160px] text-neutral-900 dark:text-white">{activeAuction.propertyName}</div>
          <div className="text-neutral-900 dark:text-white font-bold text-xs font-mono">{currentBid.toLocaleString('tr-TR')} ₺</div>
        </div>
        <div className="text-[9px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center justify-between mt-1">
          <span>Lider: {activeAuction.highestBidderName || 'Yok'}</span>
          <span className="text-amber-500 dark:text-amber-400 font-semibold underline">Büyüt & Teklif Ver</span>
        </div>
      </div>
    );
  }

  const handleQuickBid = (increment) => {
    const nextBid = currentBid + increment;
    if (myState.balance < nextBid) return;
    placeBid(nextBid);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = Number(customBid);
    if (!val || isNaN(val) || val <= currentBid) return;
    if (myState.balance < val) return;
    placeBid(val);
    setCustomBid('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 dark:bg-neutral-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 border border-amber-400/50 dark:border-amber-500/60 shadow-xl dark:shadow-[0_0_50px_rgba(245,158,11,0.35)] relative space-y-6">
        
        {/* Üst Dekorasyon Bantı */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 animate-pulse" />

        {/* Küçültme (Minimize) Butonu */}
        <button
          onClick={() => setAuctionModalMinimized(true)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-950/80 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer z-10"
          title="Müzayedeyi Küçült (Banka/İpotek işlemleri için)"
        >
          <Minimize2 className="w-4 h-4" />
        </button>

        {/* Başlık ve Kalan Süre */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/50 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-sm dark:shadow-lg">
              <Hammer className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                CANLI MÜZAYEDE & İHALE MASASI
              </div>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                {activeAuction.propertyName} {activeAuction.propertyId !== null && activeAuction.propertyId !== undefined ? `(#${activeAuction.propertyId})` : ''}
              </h3>
            </div>
          </div>

          <div className={`flex flex-col items-end px-3.5 py-2 rounded-xl border font-mono ${
            timeLeft <= 10 
              ? 'bg-red-50 dark:bg-red-950/80 border-red-300 dark:border-red-500 text-red-600 dark:text-red-400 animate-pulse dark:shadow-[0_0_15px_rgba(239,68,68,0.4)]'
              : 'bg-amber-50 dark:bg-neutral-900 border-amber-200 dark:border-neutral-700 text-amber-600 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-1 text-[11px] uppercase font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>SÜRE</span>
            </div>
            <div className="text-2xl font-black tracking-tight">
              {timeLeft} sn
            </div>
          </div>
        </div>

        {/* Satıcı ve Açılış Bedeli */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs font-mono">
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase">
              {activeAuction.isSpecialAuction ? 'İHALE SAHİBİ:' : 'SATICI YATIRIMCI:'}
            </span>
            <span className="text-neutral-900 dark:text-white font-bold block mt-0.5">{activeAuction.sellerName || 'Devlet / Tarım Bakanlığı'} {isSeller && '(SİZ)'}</span>
          </div>
          <div className="text-right">
            <span className="text-neutral-500 block text-[10px] uppercase">
              {activeAuction.isSpecialAuction ? 'AÇILIŞ BEDELİ:' : 'AÇILIŞ BEDELİ (%65):'}
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold block mt-0.5">{activeAuction.startingPrice?.toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>

        {/* Güncel En Yüksek Teklif Kutusu */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 dark:from-amber-950/40 via-neutral-100 dark:via-neutral-900 to-neutral-50 dark:to-neutral-900 border border-amber-300 dark:border-amber-500/40 text-center relative overflow-hidden shadow-inner">
          <div className="text-xs font-mono text-amber-600 dark:text-amber-400/90 font-bold uppercase tracking-wider mb-1">
            GÜNCEL EN YÜKSEK TEKLİF
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-black text-neutral-900 dark:text-white tracking-tight py-1">
            {currentBid.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-1.5 mt-2">
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>En Yüksek Teklif Sahibi:</span>
            <span className={`font-bold ${isHighestBidder ? 'text-emerald-600 dark:text-emerald-400 underline' : 'text-amber-600 dark:text-amber-300'}`}>
              {activeAuction.highestBidderName || 'Henüz Teklif Verilmedi'} {isHighestBidder && '(SİZ)'}
            </span>
          </div>
        </div>

        {/* Son 10 Saniye Kural Bildirimi */}
        {timeLeft <= 10 && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-[11px] font-mono font-bold flex items-center justify-center gap-2 text-center animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>DİKKAT! Son 10 saniyede teklif gelirse süre otomatik olarak 10 saniyeye uzar!</span>
          </div>
        )}

        {/* Teklif Verme Alanı */}
        {isSeller ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center text-neutral-500 dark:text-neutral-400 text-xs font-mono italic">
              Bu mülkü siz ihaleye çıkardınız. Kendi mülkünüze teklif veremezsiniz. Diğer yatırımcıların teklifleri bekleniyor...
            </div>
            <button
              onClick={() => finishAuctionEarly()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer transform active:scale-95 shadow-red-500/20"
            >
              <Hammer className="w-4 h-4 text-white" />
              <span>İHALEYİ BİTİR (EN YÜKSEK TEKLİFE SAT)</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500 dark:text-neutral-400">Nakit Bakiyeniz:</span>
              <span className={`font-bold ${myState.balance > currentBid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {myState.balance?.toLocaleString('tr-TR')} ₺
              </span>
            </div>

            {/* Hızlı Artırım Butonları */}
            <div className="grid grid-cols-4 gap-2 font-mono text-xs font-bold">
              {[5000, 25000, 100000, 250000].map(inc => {
                const canAfford = myState.balance >= currentBid + inc;
                return (
                  <button
                    key={inc}
                    onClick={() => handleQuickBid(inc)}
                    disabled={!canAfford || isHighestBidder}
                    className={`py-2.5 px-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      canAfford && !isHighestBidder
                        ? 'bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100 dark:hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-gray-950 border-amber-300 dark:border-amber-500/40 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-900/60 text-neutral-400 dark:text-neutral-600 border-neutral-200 dark:border-neutral-800 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>+{inc >= 1000 ? `${inc/1000}K` : inc} ₺</span>
                    <span className="text-[9px] font-normal opacity-80">{(currentBid + inc).toLocaleString('tr-TR')} ₺</span>
                  </button>
                );
              })}
            </div>

            {/* Manuel Teklif Kutusu */}
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={customBid}
                  onChange={(e) => setCustomBid(e.target.value)}
                  placeholder={`Min: ${(currentBid + 5000).toLocaleString('tr-TR')} ₺`}
                  disabled={isHighestBidder}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm font-mono text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400 dark:text-neutral-500">₺</span>
              </div>
              <button
                type="submit"
                disabled={!customBid || Number(customBid) <= currentBid || myState.balance < Number(customBid) || isHighestBidder}
                className="py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 font-mono font-black text-xs uppercase tracking-wider hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 shrink-0"
              >
                TEKLİF VER
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
