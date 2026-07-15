import React from 'react';
import { Handshake, DollarSign, Package, AlertCircle, X, Check, ArrowRight } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function TradeOfferModal() {
  const activeTradeOffer = useGameStore(state => state.activeTradeOffer);
  const respondTradeOffer = useGameStore(state => state.respondTradeOffer);
  const gameState = useGameStore(state => state.gameState);
  const loading = useGameStore(state => state.loading);

  const myId = useGameStore(state => state.myId) || socket?.id;

  if (!activeTradeOffer || activeTradeOffer.toId !== myId) return null;

  const myState = gameState?.playersState[myId] || { balance: 0 };
  const canAfford = myState.balance >= activeTradeOffer.price;

  const isRaw = activeTradeOffer.itemType === 'rawMaterial';
  const itemName = isRaw ? '1 Birim Hammadde' : '1 Adet Bitmiş Ürün';
  const itemIcon = isRaw ? '📦' : '🏬';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border border-amber-500/50 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col relative">
        
        {/* Üst Renk Vurgu Şeridi */}
        <div className="h-3.5 w-full shrink-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Başlık ve İkon */}
        <div className="p-6 pb-4 border-b border-gray-800/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shadow-lg shrink-0">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 block mb-0.5">
              PAZARLIK & TEDARİK TEKLİFİ
            </span>
            <h3 className="text-xl font-extrabold text-white leading-tight">
              Gelen Ticaret Sözleşmesi
            </h3>
          </div>
        </div>

        {/* Teklif Detay Kartı */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-gray-950/90 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-gray-800">
              <span className="text-gray-400">TEKLİF SAHİBİ (SATICI)</span>
              <span className="text-white font-bold text-sm">👑 {activeTradeOffer.fromName}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-xs font-mono text-gray-400">TEDARİK EDİLECEK ÜRÜN</div>
                <div className="text-base font-bold text-amber-300 mt-0.5 flex items-center gap-1.5">
                  <span>{itemIcon}</span>
                  <span>{itemName}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-gray-400">İSTENEN BİRİM FİYAT</div>
                <div className="text-2xl font-mono font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                  <DollarSign className="w-5 h-5 -mr-1" />
                  {activeTradeOffer.price?.toLocaleString('tr-TR')} ₺
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-gray-400">GÜNCEL BAKİYENİZ</div>
                <div className={`text-base font-mono font-bold mt-0.5 ${canAfford ? 'text-white' : 'text-red-400'}`}>
                  {myState.balance?.toLocaleString('tr-TR')} ₺
                </div>
              </div>
            </div>
          </div>

          {!canAfford && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Bakiyeniz bu teklifi kabul etmeye yetmiyor. Reddetmelisiniz.</span>
            </div>
          )}
        </div>

        {/* Alt Aksiyon Butonları */}
        <div className="p-6 pt-2 flex items-center gap-3">
          <button
            onClick={() => respondTradeOffer(activeTradeOffer.id, false)}
            disabled={loading}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gray-800 hover:bg-red-950/50 text-gray-300 hover:text-red-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-gray-700 hover:border-red-500/40"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>REDDET ❌</span>
          </button>

          <button
            onClick={() => respondTradeOffer(activeTradeOffer.id, true)}
            disabled={!canAfford || loading}
            className={`flex-1 py-3.5 px-4 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg ${
              canAfford
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-gray-950 hover:from-amber-400 hover:to-yellow-300 cursor-pointer active:scale-98 shadow-amber-500/20'
                : 'bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed border border-gray-700'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>KABUL ET VE ÖDE</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
