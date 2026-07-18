import React, { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [keysPressed, setKeysPressed] = useState({});
  const players = useGameStore(state => state.players);
  const gameState = useGameStore(state => state.gameState);
  
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [amount, setAmount] = useState('');
  const [globalMessage, setGlobalMessage] = useState('');
  const [dice1, setDice1] = useState('');
  const [dice2, setDice2] = useState('');

  // Cmd/Ctrl + Shift + A + S + D
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      setKeysPressed(prev => ({ ...prev, [key]: true }));

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      if (cmdCtrl && e.shiftKey && 
          keysPressed['a'] && keysPressed['s'] && key === 'd') {
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

  if (!isOpen) return null;

  const handleUpdateBalance = () => {
    if (!selectedPlayerId || !amount) return;
    socket.emit('client:adminAction', { 
      action: 'updateBalance', 
      targetId: selectedPlayerId, 
      amount: Number(amount) 
    });
    setAmount('');
  };

  const handleSendGlobalMessage = () => {
    if (!globalMessage) return;
    socket.emit('client:adminAction', { 
      action: 'globalMessage', 
      message: globalMessage 
    });
    setGlobalMessage('');
  };

  const handleSetNextDice = () => {
    if (!dice1 || !dice2) return;
    socket.emit('client:adminAction', { 
      action: 'setNextDice', 
      dice1: Number(dice1), 
      dice2: Number(dice2) 
    });
    setDice1('');
    setDice2('');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 font-mono select-none">
      <div className="max-w-3xl w-full border border-green-500 bg-black p-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] rounded text-green-500">
        <div className="flex justify-between items-center mb-6 border-b border-green-800 pb-2">
          <h2 className="text-2xl font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="animate-pulse">_</span> ROOT_ACCESS // OVERRIDE
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-green-500 hover:text-green-400 border border-green-800 px-3 py-1 bg-green-900/20">
            EXIT()
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* BALANCE OVERRIDE */}
          <div className="border border-green-900 p-4 bg-green-950/10">
            <h3 className="text-green-400 mb-4 border-b border-green-900 pb-1">-- BALANCE_OVERRIDE --</h3>
            <div className="flex flex-col gap-3">
              <select 
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
                className="bg-black border border-green-800 text-green-500 p-2 outline-none focus:border-green-500"
              >
                <option value="">SELECT_TARGET</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Bakiye: {gameState?.playersState?.[p.id]?.balance?.toLocaleString()})</option>
                ))}
              </select>
              <input 
                type="number"
                placeholder="AMOUNT (e.g. 5000000 or -100000)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="bg-black border border-green-800 text-green-500 p-2 outline-none focus:border-green-500"
              />
              <button 
                onClick={handleUpdateBalance}
                className="bg-green-900/40 border border-green-700 hover:bg-green-800 text-green-400 py-2 transition-all uppercase"
              >
                EXECUTE_TRANSACTION
              </button>
            </div>
          </div>

          {/* GLOBAL INJECTION */}
          <div className="border border-green-900 p-4 bg-green-950/10">
            <h3 className="text-green-400 mb-4 border-b border-green-900 pb-1">-- GLOBAL_INJECTION --</h3>
            <div className="flex flex-col gap-3">
              <textarea 
                placeholder="ENTER_SYSTEM_MESSAGE..."
                value={globalMessage}
                onChange={e => setGlobalMessage(e.target.value)}
                className="bg-black border border-green-800 text-green-500 p-2 outline-none focus:border-green-500 h-24 resize-none"
              />
              <button 
                onClick={handleSendGlobalMessage}
                className="bg-green-900/40 border border-green-700 hover:bg-green-800 text-green-400 py-2 transition-all uppercase"
              >
                BROADCAST_OVERRIDE
              </button>
            </div>
          </div>

          {/* RNG MANIPULATION */}
          <div className="border border-green-900 p-4 bg-green-950/10 md:col-span-2 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col">
              <h3 className="text-green-400 mb-2">-- RNG_MANIPULATION --</h3>
              <p className="text-xs text-green-700">Set next dice values for the simulation engine.</p>
            </div>
            <div className="flex gap-2 items-center">
              <input 
                type="number" min="1" max="6"
                placeholder="D1"
                value={dice1}
                onChange={e => setDice1(e.target.value)}
                className="bg-black border border-green-800 text-green-500 p-2 w-16 text-center outline-none focus:border-green-500"
              />
              <span className="text-green-800">+</span>
              <input 
                type="number" min="1" max="6"
                placeholder="D2"
                value={dice2}
                onChange={e => setDice2(e.target.value)}
                className="bg-black border border-green-800 text-green-500 p-2 w-16 text-center outline-none focus:border-green-500"
              />
              <button 
                onClick={handleSetNextDice}
                className="bg-green-900/40 border border-green-700 hover:bg-green-800 text-green-400 px-6 py-2 transition-all uppercase ml-4"
              >
                INJECT_DICE
              </button>
            </div>
          </div>

        </div>
        
        <div className="mt-6 text-xs text-green-800 flex justify-between border-t border-green-900 pt-2">
          <span>TERMINAL SECURE CONNECTION ESTABLISHED.</span>
          <span className="animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}
