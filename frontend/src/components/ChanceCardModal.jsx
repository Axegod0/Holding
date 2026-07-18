import React from 'react';
import { Sparkles, ShieldAlert, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function ChanceCardModal() {
  const activeChanceCard = useGameStore(state => state.activeChanceCard);
  const makeChanceDecision = useGameStore(state => state.makeChanceDecision);
  const loading = useGameStore(state => state.loading);
  const activeDiceAnimation = useGameStore(state => state.activeDiceAnimation);
  const isTokenMoving = useGameStore(state => state.isTokenMoving);
  const theme = useGameStore(state => state.theme);
  const myId = useGameStore(state => state.myId) || socket?.id;

  if (!activeChanceCard || activeDiceAnimation || isTokenMoving) return null;

  const isDrawer = activeChanceCard?.drawerId === myId || !activeChanceCard?.drawerId; // Fallback to true if drawerId not set
  const { id, title, description, optionA, optionB } = activeChanceCard || {};

  const buttonsDisabled = loading || !isDrawer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 dark:bg-neutral-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="border rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto w-full p-6 shadow-2xl flex flex-col gap-5 relative bg-white dark:bg-[#1c1c1e] border-amber-400 dark:border-amber-500/50 shadow-amber-400/20 dark:shadow-[0_0_50px_rgba(245,158,11,0.15)] text-neutral-900 dark:text-white">
        
        {/* Üst Dekoratif Parlama */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 animate-pulse" />

        {/* Başlık ve İkon */}
        <div className="flex items-start gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
              Şans Kartı #{id} • {activeChanceCard?.isNoOption ? 'DOĞRUDAN UYGULAMA' : 'A/B KARAR PANELİ'}
            </span>
            <h3 className="text-xl font-bold mt-1 leading-tight text-neutral-900 dark:text-white">{title}</h3>
          </div>
        </div>

        {/* Açıklama */}
        <div className="p-3.5 rounded-xl border text-sm leading-relaxed font-sans bg-amber-50/60 dark:bg-neutral-950/60 border-amber-200 dark:border-neutral-800/80 text-neutral-700 dark:text-neutral-300">
          {description}
        </div>

        {/* Seçenekler (Option A vs Option B ya da Tekli Tamam Butonu) */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {activeChanceCard?.isNoOption ? 'Sistemsel Avantaj / Teşvik (Sıranız Bekletiliyor):' : 'Lütfen Kararınızı Verin (Sıranız Bekletiliyor):'}
          </div>

          {activeChanceCard?.isNoOption || !optionB ? (
            /* Seçeneksiz (Tekli) Kart Butonu */
            <button
              onClick={() => makeChanceDecision(id, 'A')}
              disabled={buttonsDisabled}
              className="group relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 text-base font-mono">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>{optionA?.label || 'Tamam • Doğrudan Uygula'}</span>
              </div>
              {optionA?.description && (
                <p className="text-xs text-emerald-100/90 font-normal mt-0.5 text-center">
                  {optionA.description}
                </p>
              )}
            </button>
          ) : (
            <>
              {/* Seçenek A */}
              <button
                onClick={() => makeChanceDecision(id, 'A')}
                disabled={buttonsDisabled}
                className="group relative flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-50 dark:bg-neutral-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-neutral-700/80 dark:hover:border-emerald-500/50 text-neutral-800 dark:text-white"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 font-mono">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-xs">A</span>
                    {optionA?.label}
                  </span>
                  {optionA?.cost > 0 ? (
                    <span className="text-xs font-mono font-bold bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-500/30">
                      -{optionA.cost.toLocaleString('tr-TR')} ₺
                    </span>
                  ) : optionA?.cost < 0 ? (
                    <span className="text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                      +{(-optionA.cost).toLocaleString('tr-TR')} ₺ Giriş
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                      Masrafsız / Yatırım
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 transition-colors text-neutral-600 dark:text-neutral-400 dark:group-hover:text-neutral-300">
                  {optionA?.description}
                </p>
              </button>

              {/* Seçenek B */}
              <button
                onClick={() => makeChanceDecision(id, 'B')}
                disabled={buttonsDisabled}
                className="group relative flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-amber-50 dark:bg-neutral-800/60 hover:bg-amber-100 dark:hover:bg-amber-950/30 border-amber-200 dark:border-neutral-700/80 dark:hover:border-amber-500/50 text-neutral-800 dark:text-white"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1.5 font-mono">
                    <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-xs">B</span>
                    {optionB?.label}
                  </span>
                  {optionB?.cost > 0 ? (
                    <span className="text-xs font-mono font-bold bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-500/30">
                      -{optionB.cost.toLocaleString('tr-TR')} ₺
                    </span>
                  ) : optionB?.cost < 0 ? (
                    <span className="text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                      +{(-optionB.cost).toLocaleString('tr-TR')} ₺ Giriş
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700">
                      Masrafsız
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 transition-colors text-neutral-600 dark:text-neutral-400 dark:group-hover:text-neutral-300">
                  {optionB?.description}
                </p>
              </button>
            </>
          )}
        </div>

        {/* Uyarı Alt Bilgi */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
          <span>
            {isDrawer 
              ? "Kararınız anında Borsa İstanbul Gazetesi manşeti olarak tüm odada yayınlanır."
              : `Bu karar ${activeChanceCard?.drawerName || 'rakibiniz'} tarafından verilecek. Bekleniyor...`}
          </span>
        </div>
      </div>
    </div>
  );
}
