import React from 'react';
import { X, Building2, MapPin, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BOARD_DATA } from '../constants/boardData.js';
import useGameStore from '../store/gameStore.js';

export default function PropertyDetailModal({ propertyId, onClose }) {
  const gameState = useGameStore(state => state.gameState);
  const players = useGameStore(state => state.players);
  const theme = useGameStore(state => state.theme);

  const isLight = theme === 'light';

  if (propertyId === null || propertyId === undefined) return null;

  const square = BOARD_DATA.find(s => s.id === propertyId);
  if (!square) return null;

  // Sadece satın alınabilir veya ticaret yapılabilir (property, TRADE, AVM, vs.) alanlar için detay gösteriyoruz
  const isPurchasable = ['property', 'port', 'factory', 'TRADE', 'AVM', 'kamu'].includes(square.type);
  if (!isPurchasable && square.type !== 'tax' && square.type !== 'start') {
     // Geri kalanları şimdilik pas geçebiliriz veya basit bir view koyabiliriz
     // Ama biz şimdilik hepsini render edelim, olmayan kısımlar null döner.
  }

  const ownership = gameState?.propertyOwnership?.[square.id];
  const ownerPlayer = ownership ? players.find(p => p.id === ownership.ownerId) : null;
  const houseCount = ownership?.houses || 0;
  const isMortgaged = ownership?.isMortgaged || false;
  
  const bgGlass = isLight ? 'bg-white/80' : 'bg-neutral-950/80';
  const textMain = isLight ? 'text-neutral-900' : 'text-neutral-50';
  const textMuted = isLight ? 'text-neutral-500' : 'text-neutral-400';
  const borderGlass = isLight ? 'border-neutral-200/50' : 'border-white/10';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-sm overflow-hidden rounded-2xl ${bgGlass} backdrop-blur-xl border ${borderGlass} shadow-2xl`}>
        
        {/* Üst Renk Bantı */}
        <div 
          className="h-16 w-full relative flex items-center justify-center shadow-inner"
          style={{ backgroundColor: square.color || (isLight ? '#e5e5e5' : '#262626') }}
        >
          {/* Kare İndeksi (Kare Numarası) */}
          <div className="absolute top-2 left-3 bg-black/20 px-2 py-0.5 rounded text-white font-mono text-xs font-bold backdrop-blur-sm border border-white/20">
            #{square.id}
          </div>
          
          <div className="bg-black/20 px-4 py-1.5 rounded-full text-white font-black tracking-widest text-lg drop-shadow-md border border-white/20 backdrop-blur-sm">
            {square.name.toUpperCase()}
          </div>
          
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm border border-white/20"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* İçerik Bölgesi */}
        <div className="p-6 space-y-5">
          
          {/* Fiyat ve Sahip Bilgisi */}
          <div className="flex justify-between items-center pb-4 border-b border-neutral-200/20 dark:border-white/5">
            <div>
              <p className={`text-xs uppercase tracking-wider font-bold ${textMuted} mb-1`}>Mülk Değeri</p>
              <div className={`text-2xl font-black font-mono text-emerald-500 dark:text-emerald-400`}>
                {square.price ? `${square.price.toLocaleString('tr-TR')} ₺` : 'İhale Usulü'}
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs uppercase tracking-wider font-bold ${textMuted} mb-1`}>Sahibi</p>
              {ownerPlayer ? (
                <div className={`text-sm font-bold flex items-center justify-end gap-1.5 ${isMortgaged ? 'text-red-500' : textMain}`}>
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: ownerPlayer.color?.hex }} />
                  {ownerPlayer.name}
                </div>
              ) : (
                <div className="text-sm font-bold text-neutral-400">Devlet / Sahipsiz</div>
              )}
            </div>
          </div>

          {/* Kira Gelirleri (Sadece Arsalar İçin) */}
          {square.rent && square.rent.length > 0 && square.type === 'property' && (
            <div className={`rounded-xl p-4 border ${borderGlass} bg-black/5 dark:bg-white/5 shadow-inner`}>
              <h3 className={`text-xs uppercase font-bold text-center tracking-widest mb-3 ${textMuted}`}>Kira Getirisi Tablosu</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className={`flex justify-between ${houseCount === 0 && ownership && !isMortgaged ? 'text-amber-500 font-bold' : textMuted}`}>
                  <span>Arsa Kirası</span>
                  <span>{square.rent[0].toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className={`flex justify-between ${textMuted}`}>
                  <span>Set Kirası (2x)</span>
                  <span>{square.rent[1].toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className={`flex justify-between ${houseCount === 1 ? 'text-emerald-500 font-bold' : textMuted}`}>
                  <span>1 Ev</span>
                  <span>{square.rent[2].toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className={`flex justify-between ${houseCount === 2 ? 'text-emerald-500 font-bold' : textMuted}`}>
                  <span>2 Ev</span>
                  <span>{square.rent[3].toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className={`flex justify-between ${houseCount === 3 ? 'text-emerald-500 font-bold' : textMuted}`}>
                  <span>3 Ev</span>
                  <span>{square.rent[4].toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className={`flex justify-between ${houseCount === 4 ? 'text-emerald-500 font-bold' : textMuted}`}>
                  <span>4 Ev</span>
                  <span>{square.rent[5].toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className={`flex justify-between ${houseCount === 5 ? 'text-purple-500 font-bold' : textMuted}`}>
                  <span>Otel ⭐️</span>
                  <span>{Math.round(square.rent[5] * 2.5).toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>
            </div>
          )}

          {/* Liman, Kamu, Fabrika gibi diğer yapılar için özel gösterimler */}
          {square.type !== 'property' && (
            <div className={`rounded-xl p-4 border ${borderGlass} bg-black/5 dark:bg-white/5 flex flex-col items-center text-center space-y-2`}>
              <div className={`text-sm font-medium ${textMuted}`}>
                Burası bir işletmedir.
              </div>
              <div className={`text-base font-bold ${ownerPlayer ? textMain : textMuted}`}>
                {ownerPlayer ? `Sahibi: ${ownerPlayer.name}` : 'Şu an sahibi yok.'}
              </div>
            </div>
          )}

          {/* Geliştirme Maliyeti & İpotek Bedeli */}
          {square.type === 'property' && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className={`p-3 rounded-xl border ${borderGlass} bg-white/50 dark:bg-black/20 flex flex-col items-center justify-center text-center`}>
                <span className={`text-[10px] uppercase font-bold ${textMuted} mb-1`}>İnşaat / Ev</span>
                <span className={`font-mono font-black ${textMain}`}>
                  {square.housePrice ? `${square.housePrice.toLocaleString('tr-TR')} ₺` : '-'}
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${borderGlass} bg-white/50 dark:bg-black/20 flex flex-col items-center justify-center text-center`}>
                <span className={`text-[10px] uppercase font-bold ${textMuted} mb-1`}>İpotek Bedeli</span>
                <span className="font-mono font-black text-amber-500">
                  {square.price ? `${(square.price / 2).toLocaleString('tr-TR')} ₺` : '-'}
                </span>
              </div>
            </div>
          )}

          {/* Mevcut Durum */}
          {ownership && (
            <div className={`mt-2 flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-xs uppercase tracking-widest border ${
              isMortgaged 
                ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
            }`}>
              {isMortgaged ? (
                <><AlertCircle className="w-4 h-4" /> İPOTEKLİ</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> AKTİF</>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
