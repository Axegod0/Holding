import React from 'react';
import { Anchor, Clock, TrendingUp, ChevronRight, X } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

/**
 * Liman (#5) Kiralama İhalesi Modalı
 * Oyuncu sahipsiz limana bastığında çıkar — 30s açık artırmayı başlatma fırsatı sunar.
 * Kazanan oyuncu 5 tur boyunca limandan geçenleri vergilendirir (30.000+ ₺ ihale teklifi).
 */
export default function PortLeaseModal() {
  const activePortLeaseAuction = useGameStore(state => state.activePortLeaseAuction);
  const startPortLeaseAuction = useGameStore(state => state.startPortLeaseAuction);
  const gameState = useGameStore(state => state.gameState);
  const players = useGameStore(state => state.players);
  const theme = useGameStore(state => state.theme);
  const myId = useGameStore(state => state.myId) || socket?.id;

  const isLight = theme === 'light';

  // Sadece sahipsiz limana basan oyuncunun sırası geldiğinde göster
  if (!activePortLeaseAuction?.triggered) return null;

  // Mevcut liman bilgisi
  const portOwnership = gameState?.propertyOwnership?.[5];
  if (portOwnership) return null; // Zaten sahibi varsa gösterme

  // Aktif oyuncu kimliğini bul
  const currentTurnIndex = gameState?.currentTurnIndex ?? 0;
  const activePlayer = players[currentTurnIndex];
  const isMyTurn = activePlayer?.id === myId;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md modal-enter">
      <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
        isLight
          ? 'bg-white border-blue-300 text-slate-900'
          : 'bg-[#0D1B2A] border-blue-500/60 text-white'
      }`}>

        {/* Üst renk şeridi */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600" />

        {/* Header */}
        <div className={`flex items-center gap-3 px-5 pt-5 pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-blue-900/60'
        }`}>
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
            <Anchor className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="font-display font-black text-lg leading-tight">
              Uluslararası Liman
            </h2>
            <p className={`text-xs font-mono-game ${isLight ? 'text-slate-500' : 'text-blue-300'}`}>
              #5 — SAHİPSİZ KİRALAMA İHALESİ
            </p>
          </div>
        </div>

        {/* Açıklama */}
        <div className="px-5 pt-4 pb-3 space-y-4">
          <div className={`p-4 rounded-xl border text-sm font-mono-game leading-relaxed ${
            isLight ? 'bg-blue-50 border-blue-200 text-slate-700' : 'bg-blue-950/40 border-blue-800/50 text-blue-200'
          }`}>
            <p>
              <span className="font-bold text-blue-400">⚓ Liman sahipsiz!</span> Yatırımcılar bu limana
              5 turluk işletme kiralama hakkı için açık artırmaya katılabilir.
            </p>
          </div>

          {/* İhale Koşulları */}
          <div className={`rounded-xl border divide-y text-xs font-mono-game ${
            isLight ? 'border-slate-200 divide-slate-200' : 'border-slate-700 divide-slate-700'
          }`}>
            <div className="flex items-center gap-3 px-4 py-3">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Süre</span>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>30 saniye canlı açık artırma</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Kazanç</span>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>5 tur boyunca limandan geçenlerden kira tahsili</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Anchor className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className={`font-bold block ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Başlangıç Teklifi</span>
                <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Minimum 30.000 ₺ — artış serbest</span>
              </div>
            </div>
          </div>

          {/* Not: Kiralama ≠ Kalıcı Sahiplik */}
          <p className={`text-[10px] font-mono-game leading-relaxed ${
            isLight ? 'text-slate-400' : 'text-slate-500'
          }`}>
            ⚠️ Bu bir kiralama ihalesidir. 5 tur sonra Liman tekrar sahipsiz kalır ve yeni kiralama açılır.
            Sahipliği kalıcı hale getirmek için limana ilk ulaşıldığında direkt satın alma seçeneği sunulmaz.
          </p>
        </div>

        {/* Aksiyon Butonları */}
        <div className={`px-5 pb-5 flex gap-3 border-t pt-4 ${
          isLight ? 'border-slate-200' : 'border-blue-900/60'
        }`}>
          {isMyTurn ? (
            <>
              <button
                onClick={() => startPortLeaseAuction()}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all btn-glow-blue cursor-pointer"
              >
                <Anchor className="w-4 h-4" />
                <span>30s İHALEYİ BAŞLAT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => useGameStore.setState({ activePortLeaseAuction: null })}
                className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className={`w-full py-3 px-4 rounded-xl border text-center text-sm font-mono-game ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              Sıranız değil — {activePlayer?.name || 'Aktif oyuncu'} ihaleyi başlatabilir
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
