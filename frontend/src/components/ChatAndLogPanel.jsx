import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Scale, ScrollText, Send, ChevronDown, ChevronUp } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function ChatAndLogPanel() {
  const [activeTab, setActiveTab] = useState('GLOBAL_CHAT'); // 'GLOBAL_CHAT' | 'COURT_CHAT' | 'SYSTEM_LOGS'
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [globalMessages, setGlobalMessages] = useState([]);
  const [courtMessages, setCourtMessages] = useState([]);
  const [unreadGlobal, setUnreadGlobal] = useState(0);
  const [unreadCourt, setUnreadCourt] = useState(0);

  const logs = useGameStore(state => state.logs) || [];
  const gameState = useGameStore(state => state.gameState);
  const isCourtroomActive = !!gameState?.courtroomState?.active;
  const messagesEndRef = useRef(null);

  // Mevcut oyuncunun piyon rengi: gameState'ten hesapla
  const mySocketId = socket.id;
  const myColor = gameState?.playersState?.[mySocketId]?.color?.hex
    || (gameState ? null : null);

  useEffect(() => {
    const handleGlobalMsg = (msg) => {
      setGlobalMessages(prev => [...prev.slice(-100), msg]);
      if (activeTab !== 'GLOBAL_CHAT' || isMinimized) {
        setUnreadGlobal(prev => prev + 1);
      }
    };

    const handleCourtMsg = (msg) => {
      setCourtMessages(prev => [...prev.slice(-100), msg]);
      if (activeTab !== 'COURT_CHAT' || isMinimized) {
        setUnreadCourt(prev => prev + 1);
      }
    };

    socket.on('server:chatMessage', handleGlobalMsg);
    socket.on('server:courtChatMessage', handleCourtMsg);

    return () => {
      socket.off('server:chatMessage', handleGlobalMsg);
      socket.off('server:courtChatMessage', handleCourtMsg);
    };
  }, [activeTab, isMinimized]);

  useEffect(() => {
    if (!isMinimized) {
      if (activeTab === 'GLOBAL_CHAT') setUnreadGlobal(0);
      if (activeTab === 'COURT_CHAT') setUnreadCourt(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, isMinimized, globalMessages, courtMessages, logs]);

  // Mahkeme başladığında COURT_CHAT'e otomatik geç
  useEffect(() => {
    if (isCourtroomActive) {
      setActiveTab('COURT_CHAT');
      setIsMinimized(false);
    }
  }, [isCourtroomActive]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (activeTab === 'GLOBAL_CHAT') {
      socket.emit('client:sendChatMessage', { message: trimmed });
    } else if (activeTab === 'COURT_CHAT') {
      socket.emit('client:sendCourtChatMessage', { message: trimmed });
    }

    setInputText('');
  };

  const sendButtonColor = activeTab === 'COURT_CHAT'
    ? 'bg-purple-500 hover:bg-purple-400'
    : 'bg-amber-500 hover:bg-amber-400';

  const inputBorderFocus = activeTab === 'COURT_CHAT'
    ? 'focus:border-purple-500/50'
    : 'focus:border-amber-500/50';

  return (
    <div className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
      isMinimized ? 'w-72 h-12' : 'w-80 sm:w-96 h-96'
    } bg-neutral-900/95 dark:bg-[#18181b]/98 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-sans`}>

      {/* Panel Header & Tabs */}
      <div className="flex items-center justify-between bg-neutral-950/90 border-b border-neutral-800 px-3 py-2 shrink-0">
        <div className="flex items-center gap-1">
          {/* Tab 1: Global Chat */}
          <button
            onClick={() => { setActiveTab('GLOBAL_CHAT'); setUnreadGlobal(0); setIsMinimized(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'GLOBAL_CHAT'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>💬 Masa</span>
            {unreadGlobal > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                {unreadGlobal}
              </span>
            )}
          </button>

          {/* Tab 2: Court Chat */}
          <button
            onClick={() => { setActiveTab('COURT_CHAT'); setUnreadCourt(0); setIsMinimized(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer relative ${
              activeTab === 'COURT_CHAT'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            } ${isCourtroomActive ? 'animate-pulse' : ''}`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>⚖️ Mahkeme</span>
            {isCourtroomActive && (
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping absolute -top-0.5 -right-0.5" />
            )}
            {unreadCourt > 0 && (
              <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCourt}
              </span>
            )}
          </button>

          {/* Tab 3: System Logs */}
          <button
            onClick={() => { setActiveTab('SYSTEM_LOGS'); setIsMinimized(false); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'SYSTEM_LOGS'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>📜 Loglar</span>
          </button>
        </div>

        {/* Minimize Toggle Button */}
        <button
          onClick={() => setIsMinimized(prev => !prev)}
          className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 rotate-180" />}
        </button>
      </div>

      {/* Main Messages View (When Expanded) */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-sans font-normal">

            {/* TAB 1: GLOBAL CHAT */}
            {activeTab === 'GLOBAL_CHAT' && (
              globalMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 font-mono space-y-1 my-auto">
                  <MessageSquare className="w-8 h-8 text-neutral-600" />
                  <p>Masa sohbeti henüz boş.</p>
                  <p className="text-[10px]">Pazarlık yapmak ve konuşmak için yazın!</p>
                </div>
              ) : (
                globalMessages.map(msg => (
                  <div key={msg.id} className="flex flex-col gap-0.5 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800/80">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="flex items-center gap-1.5 font-bold">
                        {/* Piyon rengi dot */}
                        <span
                          className="w-2 h-2 rounded-full shrink-0 inline-block shadow-sm"
                          style={{ backgroundColor: msg.senderColorHex || '#EAB308' }}
                        />
                        <span style={{ color: msg.senderColorHex || '#EAB308' }}>
                          {msg.senderName}
                        </span>
                      </span>
                      <span className="text-neutral-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-neutral-200 text-xs leading-relaxed pl-3.5">{msg.message}</p>
                  </div>
                ))
              )
            )}

            {/* TAB 2: COURT CHAT */}
            {activeTab === 'COURT_CHAT' && (
              courtMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 font-mono space-y-1 my-auto">
                  <Scale className="w-8 h-8 text-purple-500/40" />
                  <p>Mahkeme Sohbet Kanalı</p>
                  <p className="text-[10px]">Duruşma esnasında Jüri ve Sanık mesajları buraya düşer.</p>
                </div>
              ) : (
                courtMessages.map(msg => (
                  <div key={msg.id} className="flex flex-col gap-0.5 bg-purple-950/30 p-2 rounded-xl border border-purple-500/30">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="flex items-center gap-1.5 font-bold">
                        {/* Piyon rengi dot */}
                        <span
                          className="w-2 h-2 rounded-full shrink-0 inline-block shadow-sm"
                          style={{ backgroundColor: msg.senderColorHex || '#A855F7' }}
                        />
                        <span style={{ color: msg.senderColorHex || '#A855F7' }}>
                          {msg.senderName}
                        </span>
                        <span className="text-neutral-500 font-normal">(Duruşma)</span>
                      </span>
                      <span className="text-neutral-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-purple-100 text-xs leading-relaxed pl-3.5">{msg.message}</p>
                  </div>
                ))
              )
            )}

            {/* TAB 3: SYSTEM LOGS */}
            {activeTab === 'SYSTEM_LOGS' && (
              logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 font-mono space-y-1 my-auto">
                  <ScrollText className="w-8 h-8 text-neutral-600" />
                  <p>Henüz sistem logu yok.</p>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl text-xs font-mono leading-relaxed border ${
                      log.type === 'error'
                        ? 'bg-red-950/40 border-red-500/30 text-red-300'
                        : log.type === 'warning'
                        ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                        : log.type === 'success'
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <span className="text-[10px] text-neutral-500 mr-2">[{log.time}]</span>
                    <span>{log.text}</span>
                  </div>
                ))
              )
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input (Only for Chat Tabs) */}
          {activeTab !== 'SYSTEM_LOGS' && (
            <form onSubmit={handleSendMessage} className="p-2 border-t border-neutral-800 bg-neutral-950 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={activeTab === 'GLOBAL_CHAT' ? "Masa sohbetine yazın..." : "Duruşma kanalına yazın..."}
                maxLength={200}
                className={`flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none ${inputBorderFocus}`}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`p-2 rounded-xl ${sendButtonColor} disabled:opacity-40 text-${activeTab === 'COURT_CHAT' ? 'white' : 'black'} font-bold transition-all cursor-pointer`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
