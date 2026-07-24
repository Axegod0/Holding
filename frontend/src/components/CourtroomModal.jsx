import React, { useState, useEffect } from 'react';
import { Scale, Gavel, ShieldAlert, UserCheck, Flame, Clock, Lock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function CourtroomModal() {
  const gameState = useGameStore(state => state.gameState);
  const myId = useGameStore(state => state.myId) || socket?.id;

  const courtroomState = gameState?.courtroomState;
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!courtroomState || !courtroomState.active) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((courtroomState.phaseEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [courtroomState]);

  if (!courtroomState || !courtroomState.active) return null;

  const {
    crime,
    defendantId,
    defendantName,
    prosecutorId,
    prosecutorName,
    phase,
    votes = {},
    finalVerdict,
    resultMessage,
    isBackfire
  } = courtroomState;

  const isDefendant = myId === defendantId;
  const isProsecutor = myId === prosecutorId;
  const isJury = !isDefendant && !isProsecutor;

  const votesList = Object.values(votes);
  const beraatCount = votesList.filter(v => v === 'BERAAT').length;
  const hapisCount = votesList.filter(v => v === 'HAPIS').length;
  const totalVotes = votesList.length;

  const myVote = votes[myId];

  const handleJuryVote = (vote) => {
    if (submitting || myVote) return;
    setSubmitting(true);
    socket.emit('client:submitJuryVote', { vote }, (res) => {
      setSubmitting(false);
    });
  };

  const handleProsecutorVerdict = (verdict) => {
    if (submitting) return;
    setSubmitting(true);
    socket.emit('client:submitProsecutorVerdict', { verdict }, (res) => {
      setSubmitting(false);
    });
  };

  // Phase labels & badges
  const getPhaseHeader = () => {
    switch (phase) {
      case 'PREPARATION':
        return { label: 'SAFHA 1/4: SUÇLAMA VE İNCELEME', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'DEFENSE':
        return { label: 'SAFHA 2/4: SANIK SAVUNMASI (CANLI)', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'JURY_VOTING':
        return { label: 'SAFHA 3/4: JÜRİ OYLAMASI (GİZLİ)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'PROSECUTOR_VERDICT':
        return { label: 'SAFHA 4/4: SAVCI / HAKİM KARARI', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'RESOLVED':
        return { label: 'DURUŞMA SONUÇLANDI', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      default:
        return { label: 'DURUŞMA', color: 'bg-neutral-500/20 text-neutral-400' };
    }
  };

  const phaseHeader = getPhaseHeader();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className={`border rounded-2xl max-w-xl max-h-[92vh] overflow-y-auto w-full p-6 shadow-2xl flex flex-col gap-5 relative bg-[#18181b] ${
        isBackfire 
          ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.35)]' 
          : 'border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.15)]'
      } text-white`}>

        {/* Top Glowing Stripe */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
          isBackfire ? 'from-red-600 via-orange-500 to-red-600 animate-pulse' : 'from-amber-500 via-yellow-400 to-amber-500'
        }`} />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${phaseHeader.color}`}>
                {phaseHeader.label}
              </span>
              <h3 className="text-xl font-bold mt-1 leading-tight text-white flex items-center gap-2">
                Mahkeme Salonu • Adalet Karesi
              </h3>
            </div>
          </div>

          {/* Countdown Timer Badge */}
          {phase !== 'RESOLVED' && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded-xl font-mono text-amber-400 font-bold text-base shadow-inner">
                <Clock className="w-4 h-4 animate-spin-slow text-amber-400" />
                <span>{timeLeft}s</span>
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 font-mono">Kalan Süre</span>
            </div>
          )}
        </div>

        {/* Role Identity Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-mono">Rolünüz:</span>
            {isDefendant ? (
              <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 font-bold border border-red-500/40 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> SANIK
              </span>
            ) : isProsecutor ? (
              <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 font-bold border border-purple-500/40 flex items-center gap-1">
                <Gavel className="w-3.5 h-3.5" /> SAVCI / HAKİM
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> JÜRİ ÜYESİ
              </span>
            )}
          </div>
          <div className="text-neutral-400 text-[11px] font-mono">
            Savcı: <strong className="text-purple-300">{prosecutorName}</strong> | Sanık: <strong className="text-red-300">{defendantName}</strong>
          </div>
        </div>

        {/* Crime Card Box */}
        <div className="p-4 rounded-xl border bg-neutral-950/70 border-red-500/30 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500" /> RESMİ SABIKA KAYDI VE SUÇLAMA
            </span>
          </div>
          <p className="text-sm font-sans leading-relaxed text-neutral-200 font-medium">
            "{crime}"
          </p>
        </div>

        {/* Phase Specific Dynamic Content */}

        {/* PREPARATION Phase */}
        {phase === 'PREPARATION' && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
            <p className="text-sm text-amber-200 font-medium">
              Sanık <strong className="text-amber-400">{defendantName}</strong> suçlamayı inceliyor. Duruşma 40 saniye içinde başlayacak.
            </p>
            <p className="text-xs text-neutral-400 font-mono">
              Savunma aşamasında sanık sözlü/yazılı savunmasını sunacaktır.
            </p>
          </div>
        )}

        {/* DEFENSE Phase */}
        {phase === 'DEFENSE' && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center space-y-2 animate-pulse">
            <div className="flex items-center justify-center gap-2 text-blue-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" /> SANIK SAVUNMA SÜRESİ (60 İŞLİYOR)
            </div>
            <p className="text-sm text-neutral-200">
              {isDefendant ? (
                <span className="text-amber-300 font-bold">Lütfen sesli veya sohbet/log panelinden savunmanızı yapın! Jüri ve Savcı sizi dinliyor.</span>
              ) : (
                <span>Sanık <strong className="text-blue-300">{defendantName}</strong> mikrofon veya mesaj paneli üzerinden savunmasını sunuyor...</span>
              )}
            </p>
          </div>
        )}

        {/* JURY_VOTING Phase */}
        {phase === 'JURY_VOTING' && (
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Jüri Karar Paneli ({timeLeft}s)
            </div>

            {isJury ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-neutral-300 font-sans">
                  Sanığın savunmasını ve suçlamayı değerlendirerek gizli oyunuzu verin:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleJuryVote('BERAAT')}
                    disabled={submitting || !!myVote}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold font-mono transition-all duration-200 border cursor-pointer ${
                      myVote === 'BERAAT'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                    } disabled:opacity-60`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>⚖️ BERAAT</span>
                  </button>

                  <button
                    onClick={() => handleJuryVote('HAPIS')}
                    disabled={submitting || !!myVote}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold font-mono transition-all duration-200 border cursor-pointer ${
                      myVote === 'HAPIS'
                        ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30'
                        : 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/40'
                    } disabled:opacity-60`}
                  >
                    <Lock className="w-5 h-5 text-red-400" />
                    <span>🔒 HAPİS</span>
                  </button>
                </div>
                {myVote && (
                  <p className="text-center text-xs font-mono text-emerald-400">
                    ✓ Oyunuz ({myVote}) kaydedildi. Jüri oylamasının tamamlanması bekleniyor...
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center space-y-1">
                <p className="text-sm text-neutral-300 font-medium">
                  Jüri üyeleri gizli oy kullanıyor ({totalVotes} oy verildi).
                </p>
                <p className="text-xs text-neutral-500 font-mono">
                  Oylama bittiğinde sonuçlar Savcı ekranına düşecektir.
                </p>
              </div>
            )}
          </div>
        )}

        {/* PROSECUTOR_VERDICT Phase */}
        {phase === 'PROSECUTOR_VERDICT' && (
          <div className="space-y-4">
            {/* Jury Vote Summary */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 font-bold">JÜRİ OY DAĞILIMI ({totalVotes} OY):</span>
                <span className="text-emerald-400 font-bold">Beraat: {beraatCount}</span> | <span className="text-red-400 font-bold">Hapis: {hapisCount}</span>
              </div>
              <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 transition-all duration-300" style={{ width: `${totalVotes > 0 ? (beraatCount / totalVotes) * 100 : 50}%` }} />
                <div className="bg-red-500 transition-all duration-300" style={{ width: `${totalVotes > 0 ? (hapisCount / totalVotes) * 100 : 50}%` }} />
              </div>
            </div>

            {/* Prosecutor Controls */}
            {isProsecutor ? (
              <div className="space-y-3">
                {/* Backfire Warning Banner */}
                {beraatCount > hapisCount && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-sans leading-relaxed flex items-start gap-2">
                    <Flame className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-400 font-bold">DİKKAT (ADALET TEPER UYARISI):</strong> Jüri çoğunluğu <strong>BERAAT</strong> verdi! Eğer jüri kararını çiğneyip <strong>HAPİS</strong> verirseniz yetki istismarından <strong>KENDİNİZ 1 TUR HAPSE DÜŞERSİNİZ!</strong>
                    </div>
                  </div>
                )}

                <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                  Nihai Savcı / Hakim Kararınızı Verin ({timeLeft}s):
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleProsecutorVerdict('BERAAT')}
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono transition-all duration-200 shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <Scale className="w-5 h-5" />
                    <span>⚖️ BERAAT VER</span>
                  </button>

                  <button
                    onClick={() => handleProsecutorVerdict('HAPIS')}
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold font-mono transition-all duration-200 shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <Gavel className="w-5 h-5" />
                    <span>🔒 HAPİS KARARI</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center space-y-1">
                <p className="text-sm text-purple-200 font-bold">
                  Savcı <span className="text-purple-400">{prosecutorName}</span> jüri oylarını değerlendiriyor ve nihai kararı veriyor...
                </p>
                <p className="text-xs text-neutral-400 font-mono">
                  Sonuç birkaç saniye içinde açıklanacaktır.
                </p>
              </div>
            )}
          </div>
        )}

        {/* RESOLVED Phase */}
        {phase === 'RESOLVED' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            {isBackfire ? (
              <div className="p-5 rounded-2xl bg-red-950/80 border-2 border-red-500 text-center space-y-3 shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 mx-auto flex items-center justify-center text-red-500 animate-bounce">
                  <Flame className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-extrabold text-red-400 tracking-tight font-mono">
                  🔥 ADALET TEPTİ! (YETKİ İSTİSMARI)
                </h4>
                <p className="text-sm text-red-200 font-medium leading-relaxed">
                  {resultMessage}
                </p>
              </div>
            ) : finalVerdict === 'BERAAT' ? (
              <div className="p-5 rounded-2xl bg-emerald-950/70 border-2 border-emerald-500 text-center space-y-3 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                  <Scale className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-emerald-400 font-mono">
                  ⚖️ BERAAT KARARI!
                </h4>
                <p className="text-sm text-emerald-200 font-medium">
                  {resultMessage}
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-red-950/70 border-2 border-red-600 text-center space-y-3 shadow-[0_0_40px_rgba(220,38,38,0.3)]">
                <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 mx-auto flex items-center justify-center text-red-400">
                  <Lock className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-red-400 font-mono">
                  🔒 HAPİS CEZASI TESCİLLENDİ!
                </h4>
                <p className="text-sm text-red-200 font-medium">
                  {resultMessage}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
