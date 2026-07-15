import React from 'react';
import { Copy, Check, Users, Play, LogOut, Crown, Shield, Rocket, Radio, Palette } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';
import { PAWN_COLORS } from '../constants/colors.js';
import confetti from 'canvas-confetti';

export default function WaitingRoom() {
  const myId = useGameStore(state => state.myId);
  const roomCode = useGameStore(state => state.roomCode);
  const players = useGameStore(state => state.players);
  const isHost = useGameStore(state => state.isHost);
  const startGame = useGameStore(state => state.startGame);
  const leaveRoom = useGameStore(state => state.leaveRoom);
  const changeColor = useGameStore(state => state.changeColor);
  const showToast = useGameStore(state => state.showToast);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      showToast('Oda kodu kopyalandı! Diğer yatırımcılara iletebilirsiniz.', 'success');
    } catch (err) {
      showToast('Kopyalama başarısız, kodu elle seçebilirsiniz.', 'error');
    }
  };

  const handleStartGameClick = () => {
    if (players.length < 2) return;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#EAB308']
    });
    startGame();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 py-8">
      {/* Üst Bilgi Kartı - Oda Kodu ve Kopyala */}
      <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-1.5 font-bold">
              <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
              <span>CANLI LOBİ / BEKLEME ODASI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Yatırımcılar Bekleniyor...
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Odaya katılmaları için aşağıdaki 6 haneli kodu arkadaşlarınızla paylaşın.
            </p>
          </div>

          {/* Oda Kodu Kutusu */}
          <div className="flex items-center gap-2.5 bg-gray-950/80 border border-emerald-500/30 p-2.5 pl-5 rounded-xl shadow-inner">
            <div>
              <div className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">ODA KODU</div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 tracking-[0.25em]">
                {roomCode}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              title="Kodu Kopyala"
            >
              <Copy className="w-4 h-4" />
              <span>KOPYALA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Oyuncu Durumu ve Sayacı */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2 text-sm font-mono text-gray-300 font-semibold">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>KATILAN YATIRIMCILAR</span>
        </div>
        <div className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-emerald-400">
          [{players.length} / 6] KAPASİTE
        </div>
      </div>

      {/* Doluluk Barı */}
      <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden mb-6 border border-gray-800/80">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 transition-all duration-500"
          style={{ width: `${(players.length / 6) * 100}%` }}
        />
      </div>

      {/* Bekleme Odası İçi Hızlı Piyon Rengi Değiştirme */}
      <div className="mb-6 p-4 rounded-2xl bg-gray-950/70 border border-gray-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-300">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>PİYON RENGİNİZİ DEĞİŞTİRİN</span>
          </div>
          <span className="text-[11px] font-mono text-gray-500">
            Başka bir yatırımcının rengi seçilemez
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {PAWN_COLORS.map((color) => {
            const myPlayer = players.find(p => p.id === myId || p.id === socket?.id);
            const myCurrentId = myPlayer?.id || myId || socket?.id;
            const myColorId = myPlayer?.color?.id;
            const isMine = myColorId === color.id;
            const isUsedByOther = players.some(p => p.id !== myCurrentId && p.color?.id === color.id);
            const userWithColor = players.find(p => p.id !== myCurrentId && p.color?.id === color.id);

            return (
              <button
                key={color.id}
                type="button"
                disabled={isUsedByOther || isMine}
                onClick={() => changeColor(color.id)}
                className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                  isMine
                    ? 'bg-gray-800 border-white shadow-lg shadow-black/50 scale-105 ring-2 ring-white/30 cursor-default'
                    : isUsedByOther
                    ? 'bg-gray-900/30 border-gray-800/50 opacity-40 cursor-not-allowed'
                    : 'bg-gray-900/70 border-gray-800 hover:border-gray-500 hover:bg-gray-800/80 cursor-pointer hover:scale-[1.02]'
                }`}
              >
                <div 
                  className="w-5 h-5 rounded-full shrink-0 border border-black/40 shadow flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                >
                  {isMine && <Check className="w-3 h-3 text-white drop-shadow" />}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[11px] font-mono font-bold text-white truncate">
                    {color.name}
                  </span>
                  <span className="text-[9px] font-mono text-gray-400 truncate">
                    {isMine ? '✓ Renginiz' : isUsedByOther ? `(${userWithColor?.name || 'Alındı'})` : 'Seçmek İçin Tıkla'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Oyuncu Listesi (Grid / Kutular) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {players.map((player) => {
          const isMe = (player.id === myId || player.id === socket?.id);
          return (
            <div
              key={player.id}
              className={`p-4 sm:p-5 rounded-xl border backdrop-blur-md transition-all flex items-center justify-between gap-4 ${
                isMe
                  ? 'bg-gradient-to-r from-gray-900/90 via-emerald-950/40 to-gray-900/90 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/50'
                  : player.isHost
                  ? 'bg-gradient-to-r from-gray-900/90 via-amber-950/20 to-gray-900/90 border-amber-500/40'
                  : 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Piyon Rengi Göstergesi */}
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shrink-0 border border-white/20"
                  style={{ backgroundColor: player.color?.hex || '#10B981' }}
                  title={`Piyon Rengi: ${player.color?.name || 'Rastgele'}`}
                >
                  <Rocket className="w-6 h-6 text-gray-950 drop-shadow-sm" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-base truncate">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold shrink-0">
                        SİZ
                      </span>
                    )}
                    {player.isHost && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold shrink-0">
                        <Crown className="w-3 h-3" />
                        HOST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="text-xs font-mono font-medium px-2 py-0.5 rounded border"
                      style={{ 
                        color: player.color?.hex || '#10B981',
                        borderColor: `${player.color?.hex || '#10B981'}40`,
                        backgroundColor: `${player.color?.hex || '#10B981'}15`
                      }}
                    >
                      Piyon: {player.color?.name || 'Seçildi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Oyuncu Rol / Durum */}
              <div className="text-right shrink-0">
                <div className="text-xs font-mono text-gray-400">DURUM</div>
                <div className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  HAZIR
                </div>
              </div>
            </div>
          );
        })}

        {/* Boş Slotlar (Kalan Yerler İçin Yer Tutucu Kartlar) */}
        {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="p-4 sm:p-5 rounded-xl border border-dashed border-gray-800/80 bg-gray-950/30 flex items-center justify-center text-gray-600 font-mono text-xs sm:text-sm tracking-wide"
          >
            <span>+ BOŞ YATIRIMCI KÖŞESİ #{players.length + index + 1}</span>
          </div>
        ))}
      </div>

      {/* Alt Kontrol Paneli (Başlat & Ayrıl Butonları) */}
      <div className="glass-panel rounded-2xl p-5 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={leaveRoom}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 hover:bg-red-950/40 border border-gray-800 hover:border-red-500/40 text-gray-300 hover:text-red-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
          ODADAN AYRIL
        </button>

        {isHost ? (
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
            {players.length < 2 && (
              <span className="text-xs text-amber-400/90 font-mono text-center sm:text-right">
                * Başlatmak için en az 2 yatırımcı gereklidir
              </span>
            )}
            <button
              onClick={handleStartGameClick}
              disabled={players.length < 2}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-gray-950 font-mono font-black text-sm uppercase tracking-wider hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              OYUNU BAŞLAT
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-gray-400 font-mono text-xs">
            <Shield className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>Oda kurucusunun (Host) oyunu başlatması bekleniyor...</span>
          </div>
        )}
      </div>
    </div>
  );
}
