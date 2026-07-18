import React from 'react';
import { Building2, X, Hammer, Star, Home, ShieldCheck, AlertCircle, DollarSign } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';
import { BOARD_DATA } from '../constants/boardData.js';

export default function PropertyManagementModal() {
  const activePropertyManagement = useGameStore(state => state.activePropertyManagement);
  const setActivePropertyManagement = useGameStore(state => state.setActivePropertyManagement);
  const buildHouse = useGameStore(state => state.buildHouse);
  const gameState = useGameStore(state => state.gameState);
  const loading = useGameStore(state => state.loading);
  const theme = useGameStore(state => state.theme);
  const players = useGameStore(state => state.players);
  const myId = useGameStore(state => state.myId) || socket?.id;

  if (!activePropertyManagement) return null;

  const isLight = theme === 'light';
  const propertyId = activePropertyManagement.id;
  
  // En güncel tapu sahipliği ve ev sayısını alalım
  const propertyOwnership = gameState?.propertyOwnership || {};
  const currentOwnership = propertyOwnership[propertyId];
  const ownerId = currentOwnership?.ownerId || null;
  const houseCount = currentOwnership?.houses || 0;
  const isMortgaged = !!currentOwnership?.isMortgaged;


  const ownerPlayer = ownerId ? players.find(p => p.id === ownerId) : null;
  const isMe = ownerId === myId || ownerId === socket?.id;

  const myState = gameState?.playersState[myId] || gameState?.playersState[socket?.id] || { balance: 0 };
  const canAffordHouse = myState.balance >= (activePropertyManagement.housePrice || 0);

  // Tekel (Monopoly) Kontrolü
  const groupSquares = BOARD_DATA.filter(s => s.type === 'property' && s.group === activePropertyManagement.group);
  const hasMonopoly = ownerId ? groupSquares.every(s => propertyOwnership[s.id]?.ownerId === ownerId) : false;

  const getGroupName = (group) => {
    switch (group) {
      case 'group1': case 'brown': return 'Kahverengi Bölge';
      case 'group2': case 'light_blue': return 'Açık Mavi Bölge';
      case 'group3': case 'pink': return 'Pembe Bölge';
      case 'group4': case 'orange': return 'Turuncu Bölge';
      case 'group5': case 'red': return 'Kırmızı Bölge';
      case 'group6': case 'yellow': return 'Sarı Bölge';
      case 'group7': case 'green': return 'Yeşil Bölge';
      case 'group8': case 'dark_blue': return 'Lacivert Bölge';
      default: return 'Şehir Mülkü';
    }
  };

  const handleBuild = () => {
    buildHouse(propertyId);
    // Modalda güncel kalsın diye state kapatmayalım, sadece işlem yapılsın
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-md border rounded-3xl overflow-hidden flex flex-col relative shadow-2xl ${isLight ? 'bg-white/80 border-neutral-200/50' : 'bg-neutral-950/80 border-white/10'} backdrop-blur-xl text-neutral-900 dark:text-white`}>
        
        {/* Üst Renk Vurgu Şeridi */}
        <div 
          className="h-3.5 w-full shrink-0" 
          style={{ backgroundColor: activePropertyManagement.color || '#3B82F6' }}
        />

        {/* Header ve Kapat Butonu */}
        <div className="p-5 pb-4 border-b flex items-start justify-between gap-3 border-neutral-200 dark:border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-950 font-black shadow-md shrink-0"
              style={{ backgroundColor: activePropertyManagement.color || '#3B82F6' }}
            >
              <Building2 className="w-5 h-5 text-gray-950" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-500 dark:text-neutral-400 block mb-0.5">
                {getGroupName(activePropertyManagement.group)} • #{propertyId}
              </span>
              <h3 className="text-lg font-extrabold leading-tight text-neutral-900 dark:text-white">
                {activePropertyManagement.name} Yönetim Detayı
              </h3>
            </div>
          </div>
          <button
            onClick={() => setActivePropertyManagement(null)}
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detay ve Rapor İçeriği */}
        <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto pr-2">
          
          {/* Mülk Sahibi Durumu */}
          <div className="p-3 rounded-xl border text-xs font-mono flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
            <div>
              <span className="text-neutral-500 dark:text-neutral-400 font-bold">TAPU MÜLKİYETİ:</span>
              <span className="block font-bold mt-0.5">
                {ownerPlayer ? (isMe ? '👑 SİZ' : `👤 ${ownerPlayer.name}`) : '❌ SAHİPSİZ ARAZİ'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 dark:text-neutral-400 font-bold">İNŞAAT SEVİYESİ:</span>
              <span className="block font-bold mt-0.5 text-amber-400 flex items-center gap-1 justify-end">
                {houseCount === 5 ? (
                  <>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    OTEL
                  </>
                ) : houseCount > 0 ? (
                  <>
                    <Home className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                    {houseCount} Ev
                  </>
                ) : (
                  'Arsa (0 Ev)'
                )}
              </span>
            </div>
          </div>

          {/* İpotek Durumu ve Tekel Bilgisi */}
          {(isMe || ownerPlayer) && (
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className={`p-2.5 rounded-lg border flex flex-col justify-center ${
                isMortgaged ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300' : 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}>
                <span>İpotek Durumu:</span>
                <strong className={`mt-0.5 ${isMortgaged ? 'text-red-600 dark:text-red-500' : 'text-emerald-600'}`}>
                  {isMortgaged ? '🔒 İPOTEKLİ' : '✅ TEMİZ'}
                </strong>
              </div>
              <div className={`p-2.5 rounded-lg border flex flex-col justify-center ${
                hasMonopoly ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-300' : 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}>
                <span>Grup Tekeli:</span>
                <strong className={`mt-0.5 ${hasMonopoly ? 'text-emerald-600' : 'text-neutral-500'}`}>
                  {hasMonopoly ? '⚡ TEKEL (MONOPOLY)' : 'Tekel Değil'}
                </strong>
              </div>
            </div>
          )}

          {/* Medya, Liman veya Ticaret Şirketi Özel Bilgi Paneli */}
          {(activePropertyManagement.id === 29 || activePropertyManagement.type === 'MEDIA' || activePropertyManagement.type === 'utility') ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border text-xs font-mono space-y-2 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-200">
                <div className="flex items-center gap-2 font-bold text-sm text-cyan-600 dark:text-cyan-400">
                  <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Rüşvet & PR Toplama Gücü (Özel İmtiyaz)</span>
                </div>
                <p className="leading-relaxed">
                  Bu şirketin sahibi olduğunuz sürece, diğer oyuncuların <strong>Karalama Kampanyası, Skandal, İtibar Suikasti</strong> gibi Şans Kartlarında örtbas etmek için ödediği rüşvetlerin ve PR bedellerinin <strong>%100'ü doğrudan sizin kasanıza aktarılır!</strong>
                </p>
                <div className="pt-2 border-t border-cyan-200 dark:border-cyan-500/20 flex justify-between items-center text-[11px]">
                  <span>Basın & Danışmanlık Hizmet Bedeli:</span>
                  <strong className="text-cyan-600 dark:text-cyan-300 font-bold">{(activePropertyManagement.rent?.[0] || 25000)?.toLocaleString('tr-TR')} ₺</strong>
                </div>
              </div>
              {isMe && (
                <button
                  onClick={() => {
                    useGameStore.setState({ activeBusinessNaming: { propertyId: activePropertyManagement.id, propertyName: activePropertyManagement.name } });
                    setActivePropertyManagement(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-400 text-gray-950 hover:from-cyan-400 hover:to-blue-300 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Hammer className="w-4 h-4" />
                  <span>Şirket Tabelasını / Adını Değiştir</span>
                </button>
              )}
            </div>
          ) : (activePropertyManagement.id === 5 || activePropertyManagement.type === 'station' || activePropertyManagement.type === 'PORT') ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border text-xs font-mono space-y-2 bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-500/40 text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2 font-bold text-sm text-neutral-800 dark:text-neutral-300">
                  <ShieldCheck className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <span>Uluslararası Liman Tesisleri & Lojistik</span>
                </div>
                <p className="leading-relaxed">
                  Liman karesine uğrayan tüm rakip oyunculardan lojistik ve transit gümrük vergisi tahsil edilir. Holdinginizin deniz ticaret ağını kontrol edin ve ithalat/ihracattan pay alın!
                </p>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-500/20 flex justify-between items-center text-[11px]">
                  <span>Transit Geçiş ve Gümrük Bedeli:</span>
                  <strong className="text-neutral-800 dark:text-neutral-200 font-bold">{(activePropertyManagement.rent?.[0] || 35000)?.toLocaleString('tr-TR')} ₺</strong>
                </div>
              </div>
              {isMe && (
                <button
                  onClick={() => {
                    useGameStore.setState({ activeBusinessNaming: { propertyId: activePropertyManagement.id, propertyName: activePropertyManagement.name } });
                    setActivePropertyManagement(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-slate-400 to-slate-200 text-gray-950 hover:from-slate-300 hover:to-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Hammer className="w-4 h-4" />
                  <span>Liman Adını / Tabelasını Değiştir</span>
                </button>
              )}
            </div>
          ) : activePropertyManagement.type === 'TRADE' ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border text-xs font-mono space-y-2 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>{activePropertyManagement.name}</span>
                </div>
                <p className="leading-relaxed">
                  {activePropertyManagement.subtitle || 'Holdinginizin temel ticaret ve sanayi üretim zinciridir.'} Bu tesise basan rakip oyunculardan ayakbastı ve hizmet bedeli tahsil edilir.
                </p>
                <div className="pt-2 border-t border-amber-200 dark:border-amber-500/20 flex justify-between items-center text-[11px]">
                  <span>Hizmet Bedeli:</span>
                  <strong className="text-amber-600 dark:text-amber-300 font-bold">{(activePropertyManagement.rent?.[0] || (activePropertyManagement.id === 35 ? 2600000 : 15000))?.toLocaleString('tr-TR')} ₺</strong>
                </div>
              </div>
              {isMe && (
                <button
                  onClick={() => {
                    useGameStore.setState({ activeBusinessNaming: { propertyId: activePropertyManagement.id, propertyName: activePropertyManagement.name } });
                    setActivePropertyManagement(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 hover:from-amber-400 hover:to-yellow-300 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Hammer className="w-4 h-4" />
                  <span>Tesis Tabelasını / Adını Değiştir</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Detaylı Kira Tarifesi Tablosu */}
              <div className="p-3.5 rounded-xl border text-xs font-mono space-y-2 bg-neutral-50 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800/60">
                <h4 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase border-b border-neutral-200 dark:border-neutral-800/60 pb-1.5 mb-2 tracking-wider">
                  DETAYLI KİRA TARİFESİ
                </h4>
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span>Arsa Kirası (Boş)</span>
                  <span className="text-neutral-900 dark:text-white font-bold">{(activePropertyManagement.rent?.[0])?.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center justify-between text-amber-600 font-semibold">
                  <span>Tekel (2 Kat) Kirası</span>
                  <span>{(activePropertyManagement.rent?.[0] * 2)?.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span>🏠 1 Evli Kira</span>
                  <span className="text-neutral-900 dark:text-white font-bold">{(activePropertyManagement.rent?.[1])?.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span>🏠🏠 2 Evli Kira</span>
                  <span className="text-neutral-900 dark:text-white font-bold">{(activePropertyManagement.rent?.[2])?.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span>🏠🏠🏠 3 Evli Kira</span>
                  <span className="text-neutral-900 dark:text-white font-bold">{(activePropertyManagement.rent?.[3])?.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span>🏠🏠🏠🏠 4 Evli Kira</span>
                  <span className="text-neutral-900 dark:text-white font-bold">{(activePropertyManagement.rent?.[4])?.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-extrabold pt-1.5 border-t border-neutral-200 dark:border-neutral-800/60">
                  <span>⭐️ Otelli Kira (Maksimum)</span>
                  <span>{(activePropertyManagement.rent?.[5])?.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>

              {/* Ev Dikme Maliyeti */}
              <div className="flex items-center justify-between text-xs font-mono bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded-xl">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Hammer className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  Ev/Otel İnşa Bedeli:
                </span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{(activePropertyManagement.housePrice)?.toLocaleString('tr-TR')} ₺</strong>
              </div>

              {/* İnşa Aksiyon / Uyarı Alanı */}
              {isMe && (
                <div className="pt-2">
                  {!hasMonopoly ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-500" />
                      <span>İnşaat yapabilmek için öncelikle bu renk grubunun tamamını satın alıp tekel oluşturmalısınız.</span>
                    </div>
                  ) : isMortgaged ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-500" />
                      <span>Bu mülk ipotekli durumdadır. İnşaat yapabilmek için Merkez Bankasından ipoteği kaldırmalısınız.</span>
                    </div>
                  ) : houseCount >= 5 ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded-xl">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
                      <span>Bu mülk maksimum inşaat seviyesine (Otel) ulaştı. Ek ev kurulamaz.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono text-neutral-500 dark:text-gray-500 px-1">
                        <span>Kasandaki Nakit:</span>
                        <span className={myState.balance >= (activePropertyManagement.housePrice || 0) ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                          {myState.balance?.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                      <button
                        onClick={handleBuild}
                        disabled={!canAffordHouse || loading}
                        className={`w-full py-3 px-4 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                          canAffordHouse
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-gray-950 hover:from-emerald-400 hover:to-teal-300 cursor-pointer active:scale-98 shadow-emerald-500/20'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 opacity-50 cursor-not-allowed border border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        <Hammer className="w-4 h-4" />
                        <span>
                          {houseCount === 4 ? 'Otel İnşa Et' : 'Ev İnşa Et'} ({(activePropertyManagement.housePrice)?.toLocaleString('tr-TR')} ₺)
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Kapat Butonu */}
        <div className="p-5 pt-0">
          <button
            onClick={() => setActivePropertyManagement(null)}
            className="w-full py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-colors border bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 cursor-pointer"
          >
            Detayları Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
