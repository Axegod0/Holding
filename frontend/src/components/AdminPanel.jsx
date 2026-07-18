import React, { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';
import BOARD_DATA from '../constants/boardData.js';
import { CHANCE_CARDS } from '../constants/chanceCards.js';
import { X, DollarSign, TrendingDown, Dices, Landmark, Zap } from 'lucide-react';

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const players = useGameStore(state => state.players);
  const gameState = useGameStore(state => state.gameState);
  const isHost = useGameStore(state => state.isHost);
  
  // States for actions
  const [targetPlayerId, setTargetPlayerId] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  
  const [dice1, setDice1] = useState('');
  const [dice2, setDice2] = useState('');

  const [targetPropertyId, setTargetPropertyId] = useState('');
  const [newOwnerId, setNewOwnerId] = useState(''); // 'state' for state ownership

  const [chanceCardId, setChanceCardId] = useState('');
  const [chanceTargetId, setChanceTargetId] = useState('');

  // Keybind: Cmd/Ctrl + Shift + K to toggle panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmdCtrl && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isHost) {
          setIsOpen(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHost]);

  if (!isOpen || !isHost) return null;

  const handleAction = (action, payload) => {
    socket.emit('client:adminAction', { action, ...payload });
  };

  const closePanel = () => {
    setIsOpen(false);
    // Clear states
    setTargetPlayerId('');
    setFundAmount('');
    setDice1('');
    setDice2('');
    setTargetPropertyId('');
    setNewOwnerId('');
    setChanceCardId('');
    setChanceTargetId('');
  };

  const properties = BOARD_DATA.filter(s => s.type === 'property' || s.type === 'TRADE' || s.type === 'PORT' || s.type === 'MEDIA' || s.type === 'station' || s.type === 'utility');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-8 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-5xl w-full bg-[#0a0a0a] border border-neutral-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-neutral-900/50 p-6 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">GÖLGE KABİNE</h2>
          </div>
          <button 
            onClick={closePanel}
            className="flex items-center gap-2 bg-red-950/30 hover:bg-red-900/50 text-red-500 hover:text-red-400 px-4 py-2 rounded-xl border border-red-900/50 transition-all font-bold tracking-wider"
          >
            <X className="w-5 h-5" /> İZLERİ SİL VE ÇIK
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-neutral-300">
          
          {/* 1. Kayıt Dışı Fon Aktar */}
          <div className="bg-neutral-900/50 p-5 rounded-2xl border border-neutral-800/80 shadow-inner flex flex-col gap-4">
            <h3 className="text-emerald-500 font-bold flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5" /> 💸 Kayıt Dışı Fon Aktar
            </h3>
            <p className="text-xs text-neutral-500">Seçilen oyuncunun kasasına anında para ekler.</p>
            <select 
              value={targetPlayerId} onChange={e => setTargetPlayerId(e.target.value)}
              className="bg-black/50 border border-neutral-700 text-white rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="">Oyuncu Seç</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input 
              type="number" placeholder="Miktar (Örn: 5000000)"
              value={fundAmount} onChange={e => setFundAmount(e.target.value)}
              className="bg-black/50 border border-neutral-700 text-white rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors"
            />
            <button 
              onClick={() => {
                if(targetPlayerId && fundAmount) {
                  handleAction('updateBalance', { targetId: targetPlayerId, amount: Number(fundAmount) });
                  setFundAmount('');
                }
              }}
              className="mt-auto bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-800/50 py-3 rounded-xl font-bold transition-all"
            >
              FONU AKTAR
            </button>
          </div>

          {/* 2. Varlıklara El Koy */}
          <div className="bg-neutral-900/50 p-5 rounded-2xl border border-neutral-800/80 shadow-inner flex flex-col gap-4">
            <h3 className="text-red-500 font-bold flex items-center gap-2 text-lg">
              <TrendingDown className="w-5 h-5" /> 📉 Varlıklara El Koy
            </h3>
            <p className="text-xs text-neutral-500">Seçilen oyuncunun parasını tamamen sıfırlar.</p>
            <select 
              id="confiscatePlayer"
              className="bg-black/50 border border-neutral-700 text-white rounded-xl p-3 outline-none focus:border-red-500 transition-colors"
            >
              <option value="">Oyuncu Seç</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button 
              onClick={() => {
                const el = document.getElementById('confiscatePlayer');
                if(el.value) {
                  handleAction('adminConfiscateWealth', { targetId: el.value });
                  el.value = '';
                }
              }}
              className="mt-auto bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-800/50 py-3 rounded-xl font-bold transition-all"
            >
              EL KOY
            </button>
          </div>

          {/* 3. Kaderi Belirle */}
          <div className="bg-neutral-900/50 p-5 rounded-2xl border border-neutral-800/80 shadow-inner flex flex-col gap-4">
            <h3 className="text-purple-500 font-bold flex items-center gap-2 text-lg">
              <Dices className="w-5 h-5" /> 🎲 Kaderi Belirle
            </h3>
            <p className="text-xs text-neutral-500">Bir sonraki atılacak zarı manuel olarak X ve Y şeklinde zorlar.</p>
            <div className="flex gap-4">
              <input 
                type="number" min="1" max="6" placeholder="Zar 1"
                value={dice1} onChange={e => setDice1(e.target.value)}
                className="flex-1 bg-black/50 border border-neutral-700 text-white text-center rounded-xl p-3 outline-none focus:border-purple-500 transition-colors"
              />
              <input 
                type="number" min="1" max="6" placeholder="Zar 2"
                value={dice2} onChange={e => setDice2(e.target.value)}
                className="flex-1 bg-black/50 border border-neutral-700 text-white text-center rounded-xl p-3 outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button 
              onClick={() => {
                if(dice1 && dice2) {
                  handleAction('setNextDice', { dice1: Number(dice1), dice2: Number(dice2) });
                  setDice1(''); setDice2('');
                }
              }}
              className="mt-auto bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-800/50 py-3 rounded-xl font-bold transition-all"
            >
              ZARI ZORLA
            </button>
          </div>

          {/* 4. Kayyum Ata / Tapuya Çök */}
          <div className="bg-neutral-900/50 p-5 rounded-2xl border border-neutral-800/80 shadow-inner flex flex-col gap-4">
            <h3 className="text-amber-500 font-bold flex items-center gap-2 text-lg">
              <Landmark className="w-5 h-5" /> 📜 Kayyum Ata / Tapuya Çök
            </h3>
            <p className="text-xs text-neutral-500">Tahtadaki mülkü birinden alıp diğerine veya devlete geçirir.</p>
            <select 
              value={targetPropertyId} onChange={e => setTargetPropertyId(e.target.value)}
              className="bg-black/50 border border-neutral-700 text-white rounded-xl p-3 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="">Mülk Seç</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select 
              value={newOwnerId} onChange={e => setNewOwnerId(e.target.value)}
              className="bg-black/50 border border-neutral-700 text-white rounded-xl p-3 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="">Yeni Sahip Seç</option>
              <option value="state">Devlet (Sahipsiz)</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button 
              onClick={() => {
                if(targetPropertyId && newOwnerId) {
                  handleAction('adminTransferProperty', { propertyId: Number(targetPropertyId), newOwnerId });
                  setTargetPropertyId(''); setNewOwnerId('');
                }
              }}
              className="mt-auto bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-800/50 py-3 rounded-xl font-bold transition-all"
            >
              KAYYUM ATA
            </button>
          </div>

          {/* 5. Kriz Tetikle (Force Event) */}
          <div className="bg-neutral-900/50 p-5 rounded-2xl border border-neutral-800/80 shadow-inner flex flex-col gap-4 md:col-span-2">
            <h3 className="text-sky-500 font-bold flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5" /> ⚡ Kriz Tetikle (Force Event)
            </h3>
            <p className="text-xs text-neutral-500">Seçilen şans veya kriz kartını anında oyuncunun ekranına düşürür.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select 
                value={chanceTargetId} onChange={e => setChanceTargetId(e.target.value)}
                className="bg-black/50 border border-neutral-700 text-white rounded-xl p-3 outline-none focus:border-sky-500 transition-colors"
              >
                <option value="">Kurban Seç</option>
                <option value="ALL">Tüm Oyuncular (Global Kriz)</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select 
                value={chanceCardId} onChange={e => setChanceCardId(e.target.value)}
                className="bg-black/50 border border-neutral-700 text-white rounded-xl p-3 outline-none focus:border-sky-500 transition-colors"
              >
                <option value="">Olay Seç</option>
                {CHANCE_CARDS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <button 
              onClick={() => {
                if(chanceTargetId && chanceCardId) {
                  handleAction('adminForceChanceCard', { targetId: chanceTargetId, cardId: Number(chanceCardId) });
                  setChanceCardId(''); setChanceTargetId('');
                }
              }}
              className="w-full bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-800/50 py-3 rounded-xl font-bold transition-all"
            >
              OLAYI TETİKLE
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
