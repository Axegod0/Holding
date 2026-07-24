import React, { useState } from 'react';
import { UserCheck, ShieldCheck, User, Sparkles, Building2 } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import AuthModal from './AuthModal.jsx';

export default function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const currentUser = useGameStore(state => state.currentUser);

  return (
    <>
      <header className="w-full bg-neutral-950/90 border-b border-neutral-800 px-4 py-2 flex items-center justify-between z-30 shrink-0 font-sans text-white">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wider font-mono text-amber-400 leading-none">HOLDING</h1>
            <span className="text-[10px] text-neutral-500 font-mono">Borsa & Ticaret Simülasyonu</span>
          </div>
        </div>

        {/* User Profile Badge & Auth Trigger */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold font-mono text-amber-300">{currentUser.username}</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {currentUser.isGuest ? 'Misafir CEO' : (currentUser.stats?.rankTitle || 'Holding Patronu')}
                </span>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  currentUser.isGuest
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {currentUser.isGuest ? (
                  <>
                    <User className="w-3.5 h-3.5" />
                    <span>Hesabımı Kaydet</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Hesabım</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>GİRİŞ / KAYIT OYNA</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
