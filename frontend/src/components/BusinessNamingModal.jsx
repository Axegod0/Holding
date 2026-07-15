import React, { useState } from 'react';
import { Building2, Sparkles, Check } from 'lucide-react';
import useGameStore from '../store/gameStore.js';

export default function BusinessNamingModal() {
  const activeBusinessNaming = useGameStore(state => state.activeBusinessNaming);
  const renameBusiness = useGameStore(state => state.renameBusiness);
  const loading = useGameStore(state => state.loading);
  const theme = useGameStore(state => state.theme);
  const isLight = theme === 'light';

  const [inputName, setInputName] = useState('');

  if (!activeBusinessNaming) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = inputName.trim() || `${activeBusinessNaming.propertyName} Holding`;
    renameBusiness(activeBusinessNaming.propertyId, finalName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border border-emerald-500/50 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col relative">
        
        {/* Üst Renk Vurgu Şeridi */}
        <div className="h-3.5 w-full shrink-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Başlık */}
        <div className="p-6 pb-4 border-b border-gray-800/80 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shrink-0">
            <Building2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400 block mb-0.5">
              YENİ SATIN ALIM LİSANSI
            </span>
            <h3 className="text-xl font-extrabold text-white leading-tight">
              İşletmenizi İsimlendirin
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-mono text-gray-400">
              Tebrikler! <strong className="text-white">#{activeBusinessNaming.propertyId} - {activeBusinessNaming.propertyName}</strong> mülkünü portföyünüze eklediniz. İşletmenizin holding tabelasını asın:
            </p>
            
            <div className="relative">
              <input
                type="text"
                autoFocus
                required
                maxLength={32}
                value={inputName}
                onChange={e => setInputName(e.target.value)}
                placeholder="Örn: XYZ Holding A.Ş."
                className="w-full bg-gray-950 border border-gray-700 hover:border-emerald-500 focus:border-emerald-400 rounded-xl p-3.5 pl-4 pr-10 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'KAYDEDİLİYOR...' : 'Holding İsmini Onayla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
