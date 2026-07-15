import React, { useState } from 'react';
import { PlusCircle, LogIn, User, KeyRound, TrendingUp, BarChart3, ShieldAlert } from 'lucide-react';
import useGameStore from '../store/gameStore.js';

export default function Home() {
  const playerName = useGameStore(state => state.playerName);
  const setPlayerName = useGameStore(state => state.setPlayerName);
  const createRoom = useGameStore(state => state.createRoom);
  const joinRoom = useGameStore(state => state.joinRoom);
  const loading = useGameStore(state => state.loading);
  const socketConnected = useGameStore(state => state.socketConnected);

  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [roomCodeInput, setRoomCodeInput] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!socketConnected) return;
    createRoom(playerName);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!socketConnected) return;
    joinRoom(roomCodeInput, playerName);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Arka Plan Dekoratif Glow Efektleri */}
      <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Ana Konteyner */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Üst Vurgu Çizgisi */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

        {/* Başlık & İkon */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            Finansal Ticaret Terminali
          </h2>
          <p className="text-sm text-gray-400 font-mono">
            Çok Oyunculu Ekonomi Simülasyonu - Ağ Girişi
          </p>
        </div>

        {!socketConnected && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs sm:text-sm font-mono">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>Backend sunucusuna (Port 3000) bağlanılamıyor. Lütfen terminalden sunucunun çalıştığını doğrulayın.</span>
          </div>
        )}

        {/* Oyuncu Adı Input */}
        <div className="mb-6">
          <label className="block text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider mb-2">
            OYUNCU İSMİ (NICKNAME)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Örn: Yatırımcı Ali"
              maxLength={20}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700 text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Sekme Butonları (Oda Oluştur vs Odaya Katıl) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-gray-900/80 border border-gray-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs font-semibold tracking-wider transition-all ${
              activeTab === 'create'
                ? 'bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            ODA OLUŞTUR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs font-semibold tracking-wider transition-all ${
              activeTab === 'join'
                ? 'bg-blue-500 text-gray-950 shadow-lg shadow-blue-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            ODAYA KATIL
          </button>
        </div>

        {/* Tab 1: Oda Oluşturma Formu */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/80 text-xs text-gray-400 leading-relaxed font-mono">
              <span className="text-emerald-400 font-bold block mb-1">HOST YETKİSİ ALACAKSINIZ</span>
              Yeni bir lobi oluşturarak oda kurucusu olur ve 6 haneli davet kodunu diğer yatırımcılarla paylaşabilirsiniz (2-6 Oyuncu).
            </div>

            <button
              type="submit"
              disabled={loading || !socketConnected || !playerName.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 font-mono font-bold text-sm hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  YENİ ODA VE LOBİ KUR
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: Odaya Katılma Formu */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider mb-2">
                6 HANELİ ODA KODU
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="w-4 h-4 text-blue-400" />
                </div>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="Örn: A7B9X2"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700 text-white font-mono text-base font-bold tracking-widest placeholder-gray-600 uppercase focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !socketConnected || !playerName.trim() || roomCodeInput.length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-mono font-bold text-sm hover:from-blue-400 hover:to-indigo-400 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  SIMÜLASYON ODASINA KATIL
                </>
              )}
            </button>
          </form>
        )}

        {/* Alt Bilgi */}
        <div className="mt-8 pt-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500 font-mono">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Kapasite: 2 - 6 Oyuncu
          </span>
          <span>Gerçek Zamanlı Socket.io</span>
        </div>
      </div>
    </div>
  );
}
