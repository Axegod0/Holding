import React from 'react';
import { Building2, Home, Star, DollarSign, Hammer, Crown, AlertCircle, ShieldCheck } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';
import { BOARD_DATA } from '../constants/boardData.js';

export default function PortfolioPanel() {
  const players = useGameStore(state => state.players);
  const gameState = useGameStore(state => state.gameState);
  const buildHouse = useGameStore(state => state.buildHouse);
  const sellPropertyToState = useGameStore(state => state.sellPropertyToState);
  const startAuction = useGameStore(state => state.startAuction);
  const loading = useGameStore(state => state.loading);
  const theme = useGameStore(state => state.theme);

  const propertyOwnership = gameState?.propertyOwnership || {};
  const myId = useGameStore(state => state.myId) || socket?.id;
  const myState = gameState?.playersState[myId] || { balance: 0 };
  const showToast = useGameStore(state => state.showToast);
  const setActivePropertyManagement = useGameStore(state => state.setActivePropertyManagement);

  // Bir oyuncunun o renk grubundaki (Tekel / Monopoly) tüm şehirlere sahip olup olmadığını kontrol et
  const checkMonopoly = (ownerId, groupName) => {
    if (!groupName) return false;
    const groupSquares = BOARD_DATA.filter(s => s.type === 'property' && s.group === groupName);
    if (groupSquares.length === 0) return false;
    return groupSquares.every(s => propertyOwnership[s.id]?.ownerId === ownerId);
  };

  return (
    <div className="rounded-2xl p-5 border space-y-4 transition-colors bg-white dark:bg-[#1c1c1e] border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white shadow-md dark:shadow-none">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800/80">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 text-neutral-800 dark:text-neutral-300">
          <Building2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          MÜLK PORTFÖYÜ VE İNŞAAT YÖNETİMİ
        </h4>
        <span className="text-[11px] font-mono text-neutral-500">
          {Object.keys(propertyOwnership).length} / 22 Şehir Satıldı
        </span>
      </div>

      {players.length === 0 && (
        <div className="text-neutral-500 italic text-center py-6 text-xs font-mono">
          Yatırımcı bilgileri yükleniyor...
        </div>
      )}

      {players.map(player => {
        // Bu oyuncuya ait mülkleri bulalım
        const myProperties = Object.entries(propertyOwnership)
          .filter(([_, data]) => data?.ownerId === player.id)
          .map(([idStr, data]) => {
            const square = BOARD_DATA.find(s => s.id === Number(idStr));
            return { 
              ...square, 
              houses: data.houses || 0, 
              isMortgaged: !!data.isMortgaged,
              customName: data.customName
            };
          })
          .filter(Boolean);

        const isMe = player.id === myId;

        return (
          <div 
            key={player.id} 
            className={`p-4 rounded-xl border transition-all space-y-3 ${
              isMe 
                ? 'bg-emerald-50/80 dark:bg-emerald-950/10 border-emerald-400 dark:border-emerald-500/40 text-neutral-900 dark:text-white'
                : 'bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800/80 text-neutral-800 dark:text-neutral-200'
            }`}
          >
            {/* Oyuncu Üst Bilgisi */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span 
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: player.color?.hex || '#10B981' }}
                />
                <span className="font-bold text-sm">{player.name}</span>
                {isMe && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/30">
                    SİZİN PORTFÖYÜNÜZ
                  </span>
                )}
              </div>
              <div className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">
                {myProperties.length} Tapu
              </div>
            </div>

            {/* Tapu Kartları Listesi */}
            {myProperties.length === 0 ? (
              <div className="text-[11px] font-mono italic py-1 pl-5 text-neutral-500">
                Henüz satın alınmış bir şehir tapusu yok.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {myProperties.map(prop => {
                  const hasMonopoly = checkMonopoly(player.id, prop.group);
                  const canAffordHouse = myState.balance >= (prop.housePrice || 0);
                  const isMaxLevel = prop.houses >= 5;

                  return (
                    <div 
                      key={prop.id}
                      className="p-3 rounded-xl border flex flex-col justify-between space-y-2 relative overflow-hidden bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 shadow-sm text-neutral-900 dark:text-white"
                    >
                      <div 
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{ backgroundColor: prop.color || '#3B82F6' }}
                      />

                      <div className="pt-1 flex items-start justify-between gap-1">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-neutral-500">
                            #{prop.id} • {hasMonopoly ? '⚡ TEKEL (MONOPOLY)' : 'ŞEHİR'}
                          </div>
                          <div className="text-xs font-bold mt-0.5 flex items-center gap-1">
                            {prop.customName || prop.name}
                            {prop.isMortgaged && <span className="text-red-500 text-[10px]" title="Banka İpotekli">🔒</span>}
                          </div>
                        </div>

                        {/* Ev / Otel Göstergesi */}
                        <div className="flex items-center gap-1 shrink-0">
                          {prop.houses === 5 ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold shadow-sm">
                              <Star className="w-3 h-3 fill-amber-300" />
                              OTEL
                            </span>
                          ) : prop.houses > 0 ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 text-[10px] font-mono font-bold shadow-sm">
                              <Home className="w-3 h-3 text-emerald-500 dark:fill-emerald-300" />
                              {prop.houses} Ev
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600">Arsa (0 Ev)</span>
                          )}
                        </div>
                      </div>

                      {/* Ortak Yönet Butonu (Yönetim Pop-up'ı) */}
                      <button
                        onClick={() => setActivePropertyManagement(prop)}
                        className="w-full py-1.5 px-2 rounded-lg font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 border cursor-pointer"
                      >
                        <span>⚙️ Detaylı Yönet</span>
                      </button>

                      {/* İnşaat (Ev/Otel Dik) ile İhale ve Borç Acil Satış Butonları - Sadece Benim Mülkümse */}
                      {isMe && (
                        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/80 space-y-2">
                          <div>
                            {!hasMonopoly ? (
                              <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>İnşaat için grup tekel olmalı</span>
                              </div>
                            ) : isMaxLevel ? (
                              <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Maksimum Seviye (Otel Tamamlandı)</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => buildHouse(prop.id)}
                                disabled={!canAffordHouse || loading}
                                className={`w-full py-1.5 px-2 rounded-lg font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border ${
                                  canAffordHouse
                                    ? 'bg-emerald-50 dark:bg-emerald-500/15 hover:bg-emerald-100 dark:hover:bg-emerald-500 text-emerald-600 dark:text-emerald-300 dark:hover:text-neutral-950 border-emerald-200 dark:border-emerald-500/30 cursor-pointer shadow-sm'
                                    : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800 cursor-not-allowed'
                                }`}
                                title={`Ev/Otel bedeli: ${prop.housePrice?.toLocaleString('tr-TR')} ₺`}
                              >
                                <Hammer className="w-3.5 h-3.5" />
                                <span>
                                  {prop.houses === 4 ? 'Otel Dik' : 'Ev Dik'} ({prop.housePrice?.toLocaleString('tr-TR')} ₺)
                                </span>
                              </button>
                            )}
                          </div>

                          {/* FAZ 5: İhale ve Borç Acil Satış Butonları (İpotek Engel Korumalı) */}
                          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono font-bold">
                            <button
                              onClick={() => {
                                if (prop.isMortgaged) {
                                  showToast('❌ Önce ipoteği kaldırın!', 'error');
                                  return;
                                }
                                sellPropertyToState(prop.id);
                              }}
                              disabled={loading}
                              className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all border ${
                                prop.isMortgaged
                                  ? 'bg-neutral-100 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800 cursor-not-allowed'
                                  : 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 border-red-200 dark:border-red-500/30 cursor-pointer'
                              }`}
                              title={prop.isMortgaged ? 'İpotekli mülk satılamaz. Önce ipoteği kaldırın.' : 'Devlete -%30 zararla acil nakit satışı yap'}
                            >
                              <span>Devlete Sat</span>
                            </button>
                            <button
                              onClick={() => {
                                if (prop.isMortgaged) {
                                  showToast('❌ Önce ipoteği kaldırın!', 'error');
                                  return;
                                }
                                startAuction(prop.id);
                              }}
                              disabled={loading}
                              className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all border ${
                                prop.isMortgaged
                                  ? 'bg-neutral-100 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800 cursor-not-allowed'
                                  : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 cursor-pointer'
                              }`}
                              title={prop.isMortgaged ? 'İpotekli mülk ihaleye çıkarılamaz. Önce ipoteği kaldırın.' : 'Mülkü %65 açılış bedeliyle canlı 30 sn ihaleye çıkar'}
                            >
                              <span>İhale Et</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
