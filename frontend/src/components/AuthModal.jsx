import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, Mail, Lock, User, Sparkles, X, LogIn, UserPlus } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('REGISTER'); // 'LOGIN' | 'REGISTER' | 'CONVERT'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentUser = useGameStore(state => state.currentUser);
  const setCurrentUser = useGameStore(state => state.setCurrentUser);

  useEffect(() => {
    if (currentUser?.isGuest) {
      setMode('CONVERT');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleGuestLogin = () => {
    setLoading(true);
    setError('');
    socket.emit('client:guestLogin', {}, (res) => {
      setLoading(false);
      if (res?.success) {
        setCurrentUser(res.profile);
        localStorage.setItem('holding_user_profile', JSON.stringify(res.profile));
        onClose();
      } else {
        setError('Misafir girişi başarısız.');
      }
    });
  };

  const handleRegister = (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    socket.emit('client:registerAccount', {
      email,
      password,
      username,
      guestId: currentUser?.isGuest ? currentUser.id : null
    }, (res) => {
      setLoading(false);
      if (res?.success) {
        setCurrentUser(res.profile);
        localStorage.setItem('holding_user_profile', JSON.stringify(res.profile));
        onClose();
      } else {
        setError(res?.error || 'Kayıt işlemi başarısız.');
      }
    });
  };

  const handleLogin = (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    socket.emit('client:loginAccount', { email, password }, (res) => {
      setLoading(false);
      if (res?.success) {
        setCurrentUser(res.profile);
        localStorage.setItem('holding_user_profile', JSON.stringify(res.profile));
        onClose();
      } else {
        setError(res?.error || 'Giriş yapılamadı.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col gap-5 relative bg-[#18181b] text-white">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              {currentUser?.isGuest ? 'MİSAFİR HESABI' : 'KULLANICI GİRİŞİ & KAYIT'}
            </span>
            <h3 className="text-xl font-bold mt-1 text-white leading-tight">
              {mode === 'CONVERT' ? 'Hesabımı Kaydet / Tescille' : mode === 'LOGIN' ? 'Hesabınıza Giriş Yapın' : 'Yeni Holding Hesabı Açın'}
            </h3>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Mode Selector Tabs */}
        {!currentUser && (
          <div className="flex items-center gap-2 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-mono">
            <button
              onClick={() => setMode('REGISTER')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'REGISTER' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Kayıt Ol
            </button>
            <button
              onClick={() => setMode('LOGIN')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                mode === 'LOGIN' ? 'bg-amber-500 text-black shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Giriş Yap
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={mode === 'LOGIN' ? handleLogin : handleRegister} className="flex flex-col gap-3">
          {(mode === 'REGISTER' || mode === 'CONVERT') && (
            <div>
              <label className="text-xs font-mono text-neutral-400 mb-1 block">Kullanıcı Adı / CEO Rumuz</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Holding Patronu Rumuzu"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-mono text-neutral-400 mb-1 block">E-Posta Adresi</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ceo@holding.com"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-neutral-400 mb-1 block">Şifre</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold font-mono text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{mode === 'CONVERT' ? 'HESABIMI TESCİLLE VE KAYDET' : mode === 'LOGIN' ? 'GİRİŞ YAP' : 'KAYIT OL'}</span>
          </button>
        </form>

        {/* Quick Guest Login Button (If Not Logged In) */}
        {!currentUser && (
          <div className="border-t border-neutral-800 pt-3 flex flex-col gap-2 text-center">
            <span className="text-xs font-mono text-neutral-500">veya kayıt olmadan hızlıca katlın:</span>
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold font-mono text-xs transition-all border border-neutral-700 cursor-pointer flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>HIZLI OYNA / MİSAFİR GİRİŞİ (Guest CEO)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
