import React, { useEffect } from 'react';
import { AlertTriangle, ShieldAlert, X, DollarSign, Lock, CheckCircle2 } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function JailAlertModal() {
  const activeJailAlert = useGameStore(state => state.activeJailAlert);
  const setActiveJailAlert = useGameStore(state => state.setActiveJailAlert);
  const setActiveJailModal = useGameStore(state => state.setActiveJailModal);
  const players = useGameStore(state => state.players);
  const theme = useGameStore(state => state.theme);
  const myId = useGameStore(state => state.myId) || socket?.id;
  const activeDiceAnimation = useGameStore(state => state.activeDiceAnimation);
  const isTokenMoving = useGameStore(state => state.isTokenMoving);
  useEffect(() => {
    if (!activeJailAlert || activeDiceAnimation || isTokenMoving) return;

    // Web Audio API ile Gerçekçi Polis Sireni Efekti (Siren Effect)
    let audioCtx;
    let oscillator;
    let gainNode;
    let intervalId;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(650, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); // Rahatsız etmeyecek ses seviyesi

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();

        // Siren Pitch (Frekans) Dalgalanması (650Hz ile 950Hz arasında gidip gelme)
        let isHigh = false;
        intervalId = setInterval(() => {
          if (!audioCtx || audioCtx.state === 'closed') return;
          const targetFreq = isHigh ? 650 : 950;
          oscillator.frequency.linearRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.28);
          isHigh = !isHigh;
        }, 300);

        // 2.6 saniye sonra otomatik durdur
        setTimeout(() => {
          if (intervalId) clearInterval(intervalId);
          if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
          }
          if (audioCtx && audioCtx.state !== 'closed') {
            audioCtx.close();
          }
        }, 2600);
      }
    } catch (err) {
      console.warn('AudioContext siren sesi çalınamadı veya tarayıcı engelledi:', err);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      try {
        if (oscillator) oscillator.stop();
        if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
      } catch (e) {
        // Sessiz geç
      }
    };
  }, [activeJailAlert]);

  if (!activeJailAlert || activeDiceAnimation || isTokenMoving) return null;


  const isMe = activeJailAlert.playerId === myId || activeJailAlert.playerId === socket?.id;
  const jailedPlayer = players.find(p => p.id === activeJailAlert.playerId) || {
    name: activeJailAlert.playerName || 'Oyuncu',
    color: { hex: '#F59E0B', name: 'Sarı' }
  };

  const handleOpenJailModal = () => {
    setActiveJailAlert(null);
    setActiveJailModal(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-hidden">
      
      {/* Kırmızı & Mavi Polis Çakar Işıkları (Police Siren Lights Backdrop) */}
      <div className="absolute inset-0 pointer-events-none opacity-30 sm:opacity-40 flex">
        <div className="w-1/2 h-full bg-red-600 animate-pulse duration-500 blur-3xl transform -translate-x-1/4" />
        <div className="w-1/2 h-full bg-blue-600 animate-pulse duration-700 blur-3xl transform translate-x-1/4" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border-4 p-6 shadow-[0_0_60px_rgba(239,68,68,0.5)] transform animate-scale-up text-center overflow-hidden bg-white dark:bg-[#1c1c1e] border-red-500 dark:border-red-500/80 text-neutral-900 dark:text-white">
        
        {/* Üst Kırmızı-Mavi Şerit */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-white to-blue-600 animate-pulse" />

        {/* Siren İkonu */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-4 shadow-lg shadow-red-500/30 animate-bounce">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Başlık */}
        <div className="inline-block px-3 py-1 rounded-full bg-red-500 text-white font-mono font-black text-xs uppercase tracking-widest mb-2 shadow-sm animate-pulse">
          🚨 SAYIŞTAY VE GÖZALTI SİRENİ 🚨
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-red-500 mb-2">
          {isMe ? 'HAPSE GİRDİNİZ!' : `${jailedPlayer.name} HAPSE ATILDI!`}
        </h2>

        {/* Oyuncu Rozeti */}
        <div className="flex items-center justify-center gap-2 my-3 py-1.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/50 w-fit mx-auto">
          <span 
            className="w-4 h-4 rounded-full shadow-sm border border-white"
            style={{ backgroundColor: jailedPlayer.color?.hex || '#F59E0B' }}
          />
          <span className="font-mono font-bold text-sm text-neutral-800 dark:text-neutral-200">
            {jailedPlayer.name}
          </span>
        </div>

        {/* Gerekçe / Açıklama */}
        <p className="text-xs sm:text-sm font-mono leading-relaxed px-2 mb-6 text-neutral-600 dark:text-neutral-300">
          <strong>{activeJailAlert.reason || 'Usulsüzlük ve Sayıştay Denetimi'}</strong>
          <br />
          {isMe ? (
            <span>
              Sayıştay soruşturması, gümrük ihlali veya şans kartı kararı nedeniyle doğrudan <strong>#13 Hapis / Gözaltı</strong> karesine kilitlendiniz.
            </span>
          ) : (
            <span>
              Oyuncu Sayıştay soruşturması veya gümrük ihlali nedeniyle anında <strong>#13 Hapis / Gözaltı</strong> karesine sevk edildi ve kilitlendi.
            </span>
          )}
        </p>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {isMe ? (
            <>
              <button
                onClick={handleOpenJailModal}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all cursor-pointer transform active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>KEFALET & HAPİS PANELİ</span>
              </button>
              <button
                onClick={() => setActiveJailAlert(null)}
                className="py-3.5 px-4 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
              >
                ANLADIM
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveJailAlert(null)}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-neutral-700 to-neutral-800 hover:from-neutral-600 hover:to-neutral-700 text-white font-mono font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>DEVAM ET</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
