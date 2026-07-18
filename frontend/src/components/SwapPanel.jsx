import React, { useState } from 'react';
import { Handshake, ArrowRightLeft, DollarSign, Send, Landmark, Briefcase } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function SwapPanel() {
  const gameState = useGameStore(state => state.gameState);
  const players = useGameStore(state => state.players);
  const sendSwapOffer = useGameStore(state => state.sendSwapOffer);
  const loading = useGameStore(state => state.loading);
  const theme = useGameStore(state => state.theme);

  const myId = useGameStore(state => state.myId) || socket?.id;

  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [offeredCash, setOfferedCash] = useState('0');
  const [requestedCash, setRequestedCash] = useState('0');
  const [selectedOfferedProps, setSelectedOfferedProps] = useState([]);
  const [selectedRequestedProps, setSelectedRequestedProps] = useState([]);

  if (!gameState) return null;

  const myState = gameState.playersState[myId] || { balance: 0 };
  const targetState = selectedTargetId ? gameState.playersState[selectedTargetId] : null;

  // Filter tradeable properties (not mortgaged, owned by player)
  const getPlayerProperties = (pid) => {
    return Object.entries(gameState.propertyOwnership || {})
      .filter(([_, data]) => data?.ownerId === pid && !data?.isMortgaged)
      .map(([idStr, _]) => {
        const id = Number(idStr);
        const sq = gameState.boardData.find(s => s.id === id);
        return sq || { id, name: `Mülk #${id}`, price: 0 };
      });
  };

  const myProperties = getPlayerProperties(myId);
  const targetProperties = selectedTargetId ? getPlayerProperties(selectedTargetId) : [];

  const handleToggleOfferedProp = (pid) => {
    setSelectedOfferedProps(prev =>
      prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]
    );
  };

  const handleToggleRequestedProp = (pid) => {
    setSelectedRequestedProps(prev =>
      prev.includes(pid) ? prev.filter(x => x !== pid) : [...prev, pid]
    );
  };

  const otherPlayers = players.filter(p => p.id !== myId);

  const handleSendOffer = (e) => {
    e.preventDefault();
    if (!selectedTargetId) return;
    
    const oCash = Number(offeredCash) || 0;
    const rCash = Number(requestedCash) || 0;

    sendSwapOffer(
      selectedTargetId,
      selectedOfferedProps,
      oCash,
      selectedRequestedProps,
      rCash
    );

    // Reset inputs
    setOfferedCash('0');
    setRequestedCash('0');
    setSelectedOfferedProps([]);
    setSelectedRequestedProps([]);
  };

  return (
    <div className="w-full border rounded-3xl p-5 space-y-5 animate-fade-in bg-white dark:bg-[#1c1c1e] border-amber-400 dark:border-amber-500/30 text-neutral-900 dark:text-white shadow-md dark:shadow-none">
      
      {/* Panel Header */}
      <div className="flex items-center gap-3 border-b pb-3 border-neutral-200 dark:border-neutral-800">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400">
          <Handshake className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold leading-tight">Takas Masası (Bilateral Trade)</h3>
          <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
            Karşılıklı varlık ve para takası sözleşmeleri teklif edin.
          </p>
        </div>
      </div>

      <form onSubmit={handleSendOffer} className="space-y-4">
        
        {/* Oyuncu Seçimi */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold tracking-wider uppercase block text-neutral-700 dark:text-neutral-400">
            🤝 TAKAS YAPILACAK ORTAK SEÇİN
          </label>
          <select
            required
            value={selectedTargetId}
            onChange={e => {
              setSelectedTargetId(e.target.value);
              setSelectedRequestedProps([]);
              setRequestedCash('0');
            }}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 focus:border-amber-500 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none"
          >
            <option value="">Bir yatırımcı seçin...</option>
            {otherPlayers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* İki Sütunlu Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* SOL: Sizin Sunduklarınız (Offered) */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 space-y-3.5">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">
              ➕ SİZİN VERECEKLERİNİZ (OFFERED)
            </span>

            {/* Para Sunduğu */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-neutral-500 block">Eklenecek Nakit (₺):</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={myState.balance}
                  value={offeredCash}
                  onChange={e => setOfferedCash(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 pl-7 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">₺</span>
              </div>
              <span className="text-[9px] font-mono text-neutral-500 block">Maks: {myState.balance?.toLocaleString('tr-TR')} ₺</span>
            </div>

            {/* Mülk Sunduğu */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-neutral-500 block">Sunduğunuz Tapular (Tapu seçin):</span>
              {myProperties.length === 0 ? (
                <span className="text-[10px] font-mono text-neutral-500 block italic">Takas edilebilir tapunuz bulunmuyor.</span>
              ) : (
                <div className="max-h-[120px] overflow-y-auto space-y-1 border border-neutral-200 dark:border-neutral-800/80 p-2 rounded-lg bg-white dark:bg-neutral-900/50">
                  {myProperties.map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800/50">
                      <input
                        type="checkbox"
                        checked={selectedOfferedProps.includes(p.id)}
                        onChange={() => handleToggleOfferedProp(p.id)}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-neutral-950"
                      />
                      <span className="text-[11px] font-mono text-neutral-700 dark:text-neutral-300 leading-tight">
                        {p.name} (#{p.id})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SAĞ: Karşıdan İstedikleriniz (Requested) */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 space-y-3.5">
            <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 block tracking-wider">
              ➖ KARŞIDAN İSTEDİKLERİNİZ (REQUESTED)
            </span>

            {/* Para İsteği */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-neutral-500 block">İstenecek Nakit (₺):</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  disabled={!selectedTargetId}
                  max={targetState?.balance || 0}
                  value={requestedCash}
                  onChange={e => setRequestedCash(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 pl-7 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none disabled:opacity-40"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs">₺</span>
              </div>
              {targetState && (
                <span className="text-[9px] font-mono text-neutral-500 block">Karşı Bakiye: {targetState.balance?.toLocaleString('tr-TR')} ₺</span>
              )}
            </div>

            {/* Mülk İsteği */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-neutral-500 block">Karşıdan İstenen Tapular:</span>
              {!selectedTargetId ? (
                <span className="text-[10px] font-mono text-neutral-500 block italic">Önce takas ortağı seçin.</span>
              ) : targetProperties.length === 0 ? (
                <span className="text-[10px] font-mono text-neutral-500 block italic">Ortağın takas edilebilir tapusu bulunmuyor.</span>
              ) : (
                <div className="max-h-[120px] overflow-y-auto space-y-1 border border-neutral-200 dark:border-neutral-800/80 p-2 rounded-lg bg-white dark:bg-neutral-900/50">
                  {targetProperties.map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800/50">
                      <input
                        type="checkbox"
                        checked={selectedRequestedProps.includes(p.id)}
                        onChange={() => handleToggleRequestedProp(p.id)}
                        className="rounded border-neutral-300 dark:border-neutral-700 text-red-500 focus:ring-red-500 bg-white dark:bg-neutral-950"
                      />
                      <span className="text-[11px] font-mono text-neutral-700 dark:text-neutral-300 leading-tight">
                        {p.name} (#{p.id})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={loading || !selectedTargetId || (selectedOfferedProps.length === 0 && Number(offeredCash) === 0 && selectedRequestedProps.length === 0 && Number(requestedCash) === 0)}
          className={`w-full py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
            !selectedTargetId
              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed border border-neutral-300 dark:border-neutral-700'
              : 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-white dark:text-neutral-950 hover:shadow-amber-500/20 cursor-pointer border border-amber-500/30'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'TEKLİF İLETİLİYOR...' : 'TAKAS SÖZLEŞMESİNİ GÖNDER 🤝'}</span>
        </button>

      </form>
    </div>
  );
}
