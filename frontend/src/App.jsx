import React, { useEffect } from 'react';
import Toast from './components/Toast.jsx';
import Home from './components/Home.jsx';
import WaitingRoom from './components/WaitingRoom.jsx';
import Board from './components/Board.jsx';
import useGameStore from './store/gameStore.js';
import socket from './services/socket.js';

/**
 * Holding — Merkezi Ana Uygulama Bileşeni
 * Socket.io Bağlantısı: Yerel geliştirmede http://localhost:3000
 */
export default function App() {
  const currentScreen = useGameStore(state => state.currentScreen);
  const setupListeners = useGameStore(state => state.setupListeners);
  const socketConnected = useGameStore(state => state.socketConnected);
  const showToast = useGameStore(state => state.showToast);
  const theme = useGameStore(state => state.theme);

  // dark/light modu <html> elemanına uygula
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light-mode'); // Eski CSS değişkenleri desteğini kapatma (geçiş süreci için)
    } else {
      root.classList.remove('dark');
      root.classList.add('light-mode');
    }
  }, [theme]);

  useEffect(() => {
    setupListeners();

    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      console.log(`[Socket.io Bağlandı]: ${socket.id} -> ${socket.io.uri}`);
    };

    const handleConnectError = (error) => {
      console.error(`[Socket.io Bağlantı Hatası]: ${socket.io.uri}`, error);
      showToast(`Backend sunucusuna (${socket.io.uri}) bağlanılamıyor!`, 'error', 6000);
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [setupListeners, showToast]);

  const isLight = theme === 'light';

  return (
    <div className={`font-sans selection:bg-emerald-500 selection:text-gray-950 transition-colors duration-300 ${
      currentScreen === 'game'
        ? 'h-screen w-screen overflow-hidden'
        : 'min-h-screen flex flex-col justify-between'
    } bg-neutral-100 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100`}>

      {/* Üst Bilgi Barı — Lobi ve Bekleme ekranında görünür */}
      {currentScreen !== 'game' && (
        <header className="border-b sticky top-0 z-40 bg-neutral-100 dark:bg-[#0a0a0a] border-neutral-300 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🏢</span>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold tracking-wider flex items-center gap-2 font-mono-game text-neutral-900 dark:text-white">
                  HOLDİNG{' '}
                  <span className="font-normal text-emerald-600 dark:text-emerald-400">
                    // SİMÜLASYON
                  </span>
                </h1>
                <p className="text-[10px] font-mono-game text-neutral-500 dark:text-neutral-400">
                  Gerçek Zamanlı Makroekonomi & Ticaret Simülasyonu
                </p>
              </div>
            </div>

            {/* Bağlantı Göstergesi */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono-game bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                socketConnected
                  ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
              }`} />
              <span className={`font-bold ${
                socketConnected
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {socketConnected ? 'SUNUCUYA BAĞLI' : 'BAĞLANTI BEKLENİYOR...'}
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Ana İçerik */}
      <main className="relative w-full h-full flex-1 flex flex-col">
        {currentScreen === 'home' && <Home />}
        {currentScreen === 'waiting' && <WaitingRoom />}
        {currentScreen === 'game' && <Board />}
      </main>

      {/* Toast Bildirimleri */}
      <Toast />
    </div>
  );
}
