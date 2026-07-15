import React from 'react';
import { Building2, DollarSign, ShieldCheck, AlertCircle, X, Check, ArrowRight } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function PropertyModal() {
  const offeredProperty = useGameStore(state => state.offeredProperty);
  const buyProperty = useGameStore(state => state.buyProperty);
  const declineProperty = useGameStore(state => state.declineProperty);
  const gameState = useGameStore(state => state.gameState);
  const loading = useGameStore(state => state.loading);
  const activeDiceAnimation = useGameStore(state => state.activeDiceAnimation);
  const isTokenMoving = useGameStore(state => state.isTokenMoving);
  const theme = useGameStore(state => state.theme);
  const myId = useGameStore(state => state.myId) || socket?.id;

  if (!offeredProperty || activeDiceAnimation || isTokenMoving) return null;

  const isLight = theme === 'light';
  const myState = gameState?.playersState[myId] || { balance: 0 };
  const canAfford = myState.balance >= offeredProperty.price;
  const loanAmount = Math.round(offeredProperty.price * 0.70);
  const downPayment = offeredProperty.price - loanAmount;
  const canAffordLoan = myState.balance >= downPayment;

  const getGroupName = (group) => {
    switch (group) {
      case 'group1': case 'brown': return 'Kahverengi Bölge';
      case 'group2': case 'light_blue': return 'Açık Mavi Bölge';
      case 'group3': case 'pink': return 'Pembe Bölge';
      case 'group4': case 'orange': return 'Turuncu Bölge';
      case 'group5': case 'red': return 'Kırmızı Bölge';
      case 'group6': case 'yellow': return 'Sarı Bölge';
      case 'group7': case 'green': return 'Yeşil Bölge';
      case 'group8': case 'dark_blue': return 'Lacivert Bölge';
      default: return 'Şehir Mülkü';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto border rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col relative ${
        isLight ? 'bg-white border-slate-300 text-slate-900 shadow-xl' : 'bg-gray-900 border-gray-800 text-white'
      }`}>
        
        {/* Üst Renk Vurgu Şeridi */}
        <div 
          className="h-3.5 w-full shrink-0" 
          style={{ backgroundColor: offeredProperty.color || '#3B82F6' }}
        />

        {/* Başlık ve Rozet */}
        <div className={`p-6 pb-4 border-b flex items-start justify-between gap-3 ${isLight ? 'border-slate-200' : 'border-gray-800/80'}`}>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-950 font-black shadow-lg shrink-0"
              style={{ backgroundColor: offeredProperty.color || '#3B82F6' }}
            >
              <Building2 className="w-6 h-6 text-gray-950" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-gray-400 block mb-0.5">
                {getGroupName(offeredProperty.group)} • #{offeredProperty.id}
              </span>
              <h3 className={`text-xl font-extrabold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {offeredProperty.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Fiyat Kartı ve Bakiye Kontrolü */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-gray-400">TAPU YATIRIM BEDELİ</div>
              <div className="text-2xl font-mono font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                <DollarSign className="w-5 h-5 -mr-1" />
                {offeredProperty.price?.toLocaleString('tr-TR')} ₺
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-gray-400">GÜNCEL BAKİYENİZ</div>
              <div className={`text-base font-mono font-bold mt-0.5 ${canAfford ? (isLight ? 'text-emerald-800' : 'text-white') : 'text-red-400'}`}>
                {myState.balance?.toLocaleString('tr-TR')} ₺
              </div>
            </div>
          </div>

          {/* Kira Getiri Tablosu (Özet) */}
          <div className="p-4 rounded-2xl bg-gray-950/40 border border-gray-800/60 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-gray-300 pb-1 border-b border-gray-800/60 font-semibold">
              <span>MÜLK GELİR TARİFESİ</span>
              <span>KİRA BEDELİ</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Taban Kira (Evsiz)</span>
              <span className="text-white font-bold">{offeredProperty.rent?.[0]?.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex items-center justify-between text-amber-400 font-semibold">
              <span>⚡ Tekel (Monopoly) Kirası</span>
              <span>{(offeredProperty.rent?.[0] * 2)?.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>🏠 1. Ev / 4. Ev Kirası</span>
              <span className="text-white">{offeredProperty.rent?.[1]?.toLocaleString('tr-TR')} ₺ / {offeredProperty.rent?.[4]?.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-gray-800/60">
              <span>⭐️ Otel (Maksimum) Kirası</span>
              <span>{offeredProperty.rent?.[5]?.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ev/Otel İnşaat Maliyeti: <strong className="text-emerald-400">{offeredProperty.housePrice?.toLocaleString('tr-TR')} ₺</strong> (Tekel kurunca)</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Kredili Satın Alma: En az %30 peşinat olan <strong className="text-amber-400">{downPayment.toLocaleString('tr-TR')} ₺</strong> ile mülkü doğrudan ipotekli ve borçlu olarak alabilirsiniz.</span>
          </div>

          {!canAfford && !canAffordLoan && (
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Bakiyeniz peşinatı da karşılamıyor. Bu mülkü satın alamazsınız.</span>
            </div>
          )}
        </div>

        {/* Alt Aksiyon Butonları */}
        <div className="p-6 pt-2 flex flex-col gap-2.5">
          <div className="flex gap-2">
            <button
              onClick={() => buyProperty(offeredProperty.id, false)}
              disabled={!canAfford || loading}
              className={`flex-1 py-3 px-2 rounded-xl font-mono font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-lg ${
                canAfford
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-gray-950 hover:from-emerald-400 hover:to-teal-300 cursor-pointer active:scale-98 shadow-emerald-500/20'
                  : 'bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed border border-gray-700'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-950/20 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>PEŞİN AL</span>
                </>
              )}
            </button>

            <button
              onClick={() => buyProperty(offeredProperty.id, true)}
              disabled={!canAffordLoan || loading}
              className={`flex-1 py-3 px-2 rounded-xl font-mono font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-lg ${
                canAffordLoan
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-gray-950 hover:from-amber-400 hover:to-amber-300 cursor-pointer active:scale-98 shadow-amber-500/20'
                  : 'bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed border border-gray-700'
              }`}
              title={`%30 Peşinat: ${downPayment.toLocaleString('tr-TR')} ₺ + %70 Banka Borcu: ${loanAmount.toLocaleString('tr-TR')} ₺`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-950/20 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>KREDİYLE AL</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => declineProperty(offeredProperty.id)}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-gray-700"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>PAS GEÇ (TURU GEÇ)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
