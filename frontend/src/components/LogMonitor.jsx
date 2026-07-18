import React, { useState, useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore.js';
import { Terminal, X, AlertTriangle } from 'lucide-react';

export default function LogMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [keysPressed, setKeysPressed] = useState({});
  const [errorLogs, setErrorLogs] = useState([]);
  const logsEndRef = useRef(null);
  
  const gameLogs = useGameStore(state => state.logs) || [];

  // Capture console.error
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      setErrorLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  // Keybind: Cmd/Ctrl + Shift + Q + W + E
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      setKeysPressed(prev => ({ ...prev, [key]: true }));

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmdCtrl && e.shiftKey && 
          keysPressed['q'] && keysPressed['w'] && key === 'e') {
        setIsOpen(prev => !prev);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      setKeysPressed(prev => ({ ...prev, [key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keysPressed]);

  useEffect(() => {
    if (isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, errorLogs, gameLogs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[80vh] flex flex-col bg-black border border-green-500/30 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.2)] overflow-hidden font-mono text-green-500">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-green-500/30 bg-green-950/20">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-400" />
            <span className="font-bold tracking-widest uppercase">System Debug Monitor</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          <div className="text-green-600/50">=== SYSTEM INITIALIZED ===</div>
          
          <div className="space-y-1">
            <h3 className="text-blue-400 font-bold mb-2">--- SOCKET & GAME LOGS ---</h3>
            {gameLogs.map((log, i) => (
              <div key={i} className={`opacity-90 ${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : log.type === 'success' ? 'text-emerald-400' : 'text-blue-300'}`}>
                &gt; {log.message}
              </div>
            ))}
          </div>

          <div className="space-y-1 mt-6">
            <h3 className="text-red-500 font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> --- CONSOLE ERRORS ---
            </h3>
            {errorLogs.length === 0 && <div className="text-neutral-500">No runtime errors captured.</div>}
            {errorLogs.map((err, i) => (
              <div key={i} className="text-red-400 break-words">
                <span className="text-neutral-500">[{err.time}]</span> {err.message}
              </div>
            ))}
          </div>

          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
