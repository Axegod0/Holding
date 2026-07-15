import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import useGameStore from '../store/gameStore.js';

export default function Toast() {
  const toast = useGameStore(state => state.toast);
  const showToast = useGameStore(state => state.showToast);

  if (!toast.show) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      glow: 'shadow-[0_4px_25px_rgba(16,185,129,0.2)]'
    },
    error: {
      bg: 'bg-red-950/90 border-red-500/40 text-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
      glow: 'shadow-[0_4px_25px_rgba(239,68,68,0.2)]'
    },
    info: {
      bg: 'bg-blue-950/90 border-blue-500/40 text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
      glow: 'shadow-[0_4px_25px_rgba(59,130,246,0.2)]'
    }
  };

  const currentStyle = styles[toast.type] || styles.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm w-full sm:w-auto">
      <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg ${currentStyle.bg} ${currentStyle.glow}`}>
        <div className="flex items-center gap-3">
          {currentStyle.icon}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
        <button 
          onClick={() => showToast('', 'info', 0)}
          className="text-gray-400 hover:text-white transition-colors ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
