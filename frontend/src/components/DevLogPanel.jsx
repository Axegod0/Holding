import React, { useState, useEffect, useRef } from 'react';
import socket from '../services/socket.js';
import useGameStore from '../store/gameStore.js';

export default function DevLogPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  // Otomatik kaydırma
  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  // Kısayol: Cmd/Ctrl + Shift + J
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (cmdCtrl && e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hata yakalama mekanizmaları (Hijacking)
  useEffect(() => {
    const addLog = (type, message) => {
      setLogs(prev => [...prev, {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        type,
        message: typeof message === 'string' ? message : JSON.stringify(message, Object.getOwnPropertyNames(message))
      }]);
    };

    // Standart Console Yakalama
    const origError = console.error;
    const origWarn = console.warn;
    const origLog = console.log;
    
    console.error = (...args) => {
      addLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      origError.apply(console, args);
    };
    console.warn = (...args) => {
      addLog('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      origWarn.apply(console, args);
    };
    // Sadece oyunla ilgili kritik logları temizlemek isterseniz origLog.apply kullanabilirsiniz.
    // Şimdilik sadece Error ve Warn yakalanıyor.

    // Pencere (Window) Hataları
    const windowErrorHandler = (e) => {
      addLog('error', `WINDOW ERROR: ${e.message} at ${e.filename}:${e.lineno}`);
    };
    
    // Unhandled Promise Rejections (React state hataları dahil olabilir)
    const promiseRejectionHandler = (e) => {
      addLog('error', `UNHANDLED PROMISE REJECTION: ${e.reason}`);
    };

    window.addEventListener('error', windowErrorHandler);
    window.addEventListener('unhandledrejection', promiseRejectionHandler);

    // Socket.io İzlemesi
    const onConnectError = (err) => {
      // Polling hatalarını info olarak göster (çünkü websocket'e denemeye devam ediyor olabilir)
      if (err.message === 'xhr poll error') {
        addLog('warn', `Bağlantı deneniyor (xhr poll error)`);
      } else {
        addLog('error', `SOCKET ERROR (connect_error): Bağlantı kurulamadı - ${err.message}`);
      }
    };
    
    const onDisconnect = (reason) => {
      // Normal sayılabilen ve otomatik yenilenen kopmaları hata olarak gösterme
      if (reason === 'transport error' || reason === 'transport close' || reason === 'ping timeout') {
        addLog('warn', `Soket bağlantısı beklemeye alındı (Neden: ${reason}). Yeniden bağlanılıyor...`);
      } else {
        addLog('error', `SOCKET ERROR (disconnect): Sunucuyla bağlantı koptu - Neden: ${reason}`);
      }
    };
    
    const onConnect = () => {
       addLog('info', `✅ Sunucuyla bağlantı sağlandı! (Socket ID: ${socket.id})`);
    };

    const onSocketError = (err) => addLog('error', `SOCKET ERROR (error): Genel soket hatası - ${err}`);

    if (socket) {
      socket.on('connect', onConnect);
      socket.on('connect_error', onConnectError);
      socket.on('disconnect', onDisconnect);
      socket.on('error', onSocketError);
    }

    // State yapısını izleme: Hatalı GameState paketi gelirse uyar
    const unsubStore = useGameStore.subscribe((state) => {
      if (state.gameState && (!state.gameState.playersState || !state.gameState.boardData)) {
         addLog('error', `CRITICAL STATE ERROR: Sunucudan gelen gameState yapısı bozuk veya eksik!`);
      }
    });

    return () => {
      console.error = origError;
      console.warn = origWarn;
      window.removeEventListener('error', windowErrorHandler);
      window.removeEventListener('unhandledrejection', promiseRejectionHandler);
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('connect_error', onConnectError);
        socket.off('disconnect', onDisconnect);
        socket.off('error', onSocketError);
      }
      unsubStore();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 bg-black/50 backdrop-blur-sm pointer-events-auto">
      <div className="w-full max-w-5xl h-full max-h-[85vh] flex flex-col bg-black/95 rounded-xl border border-neutral-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] font-mono overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-700">
          <div className="flex items-center gap-3 text-white font-bold text-sm">
            <span>💻 Dev Log / Geliştirici Konsolu</span>
            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 animate-pulse">Acil Hata Yakalama Aktif</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLogs([])}
              className="text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-600 px-3 py-1.5 rounded transition-colors border border-neutral-600"
            >
              🧹 Logları Temizle
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* Log Area */}
        <div className="flex-1 overflow-y-auto p-4 text-[12px] sm:text-sm leading-relaxed">
          <div className="text-green-500/50 mb-4 pb-2 border-b border-green-900/30">
            === SİSTEM İZLENİYOR (CTRL+SHIFT+J İLE KAPATABİLİRSİNİZ) ===
          </div>
          
          {logs.length === 0 && (
            <div className="text-neutral-500 text-center mt-10 italic">
              Henüz yakalanan bir hata veya uyarı yok...
            </div>
          )}
          
          {logs.map(log => (
            <div key={log.id} className="mb-2 pb-2 border-b border-neutral-800/50 break-words hover:bg-white/5 p-1 rounded">
              <span className="text-neutral-500 mr-3 shrink-0">[{log.time}]</span>
              <span className={`
                ${log.type === 'error' ? 'text-red-500 font-bold' : ''}
                ${log.type === 'warn' ? 'text-yellow-400' : ''}
                ${log.type === 'info' ? 'text-green-400' : 'text-green-400'}
              `}>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
