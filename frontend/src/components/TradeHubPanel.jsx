import React, { useState } from 'react';
import { Factory, Package, Building2, TrendingUp, DollarSign, Send, ArrowRightLeft, Sparkles, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';

export default function TradeHubPanel() {
  const gameState = useGameStore(state => state.gameState);
  const players = useGameStore(state => state.players);
  const sendTradeOffer = useGameStore(state => state.sendTradeOffer);
  const tradeWithState = useGameStore(state => state.tradeWithState);
  const processMaterial = useGameStore(state => state.processMaterial);
  const stockMall = useGameStore(state => state.stockMall);
  const useSelfResource = useGameStore(state => state.useSelfResource);
  const loading = useGameStore(state => state.loading);
  const theme = useGameStore(state => state.theme);
  const myId = useGameStore(state => state.myId) || socket?.id;

  const [rawPriceInput, setRawPriceInput] = useState('35000');
  const [selectedFactoryOwner, setSelectedFactoryOwner] = useState('');

  const [productPriceInput, setProductPriceInput] = useState('90000');
  const [selectedMallOwner, setSelectedMallOwner] = useState('');

  if (!gameState) return null;

  const myState = gameState.playersState[myId] || { balance: 0 };
  const tradeState = gameState.tradeState || {
    15: { stock: 0 },
    24: { rawMaterialStock: 0, productStock: 0 },
    35: { productStock: 0, activeStockTurns: 0 }
  };

  const ownsRawMaterial = gameState.propertyOwnership?.[15]?.ownerId === myId;
  const ownsFactory = gameState.propertyOwnership?.[24]?.ownerId === myId;
  const ownsMall = gameState.propertyOwnership?.[35]?.ownerId === myId;

  if (!ownsRawMaterial && !ownsFactory && !ownsMall) {
    return (
      <div className="w-full border rounded-3xl p-6 shadow-md dark:shadow-[0_0_35px_rgba(245,158,11,0.12)] space-y-5 text-center animate-fade-in bg-white dark:bg-[#1c1c1e] border-amber-400 dark:border-amber-500/30 text-neutral-900 dark:text-white">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 mx-auto shadow-lg">
          <TrendingUp className="w-7 h-7 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold">Ticaret Zincirine Henüz Girmediniz</h3>
          <p className="text-xs font-mono max-w-md mx-auto mt-1 text-neutral-500 dark:text-neutral-400">
            Üretim ve ticaret halkasına katılmak için tahtadaki 3 kritik tesisten (ID 15, 24 veya 35) en az birini satın almalısınız.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left text-xs font-mono text-neutral-700 dark:text-neutral-300">
          <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800">
            <span className="text-amber-500 dark:text-amber-400 font-bold block mb-1">#15 Maden & Tarım</span>
            Her tur otomatik +1 birim hammadde üretir. Fabrikalara satılır veya devlete ihraç edilir.
          </div>
          <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800">
            <span className="text-amber-500 dark:text-amber-400 font-bold block mb-1">#24 Üretim Fabrikası</span>
            Hammaddeyi işleyerek Son Ürün'e çevirir. AVM'lere satılır veya devlete ihraç edilir.
          </div>
          <div className="p-3 rounded-xl border bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800">
            <span className="text-amber-500 dark:text-amber-400 font-bold block mb-1">#35 Mega AVM & Perakende</span>
            Son ürünü stoklayarak 5 tur boyunca tüm 7. Grup kiraların %100 zamlı olmasını sağlar!
          </div>
        </div>
      </div>
    );
  }

  // Fabrika (ID 24) Sahiplerini Bul (Kendimiz dahil)
  const factoryOwners = players.filter(p => gameState.propertyOwnership?.[24]?.ownerId === p.id);
  // AVM (ID 35) Sahiplerini Bul (Kendimiz dahil)
  const mallOwners = players.filter(p => gameState.propertyOwnership?.[35]?.ownerId === p.id);

  return (
    <div className="w-full border rounded-3xl p-6 space-y-6 bg-white dark:bg-[#1c1c1e] border-amber-400 dark:border-amber-500/30 text-neutral-900 dark:text-white shadow-md dark:shadow-[0_0_35px_rgba(245,158,11,0.12)]">
      
      {/* Panel Başlığı */}
      <div className="flex items-center justify-between border-b pb-4 border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold leading-tight">
              Ticaret Masası & Üretim Zinciri Hub'ı
            </h3>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              Hammadde (15) -&gt; Fabrika (24) -&gt; Mega AVM (35)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
          <DollarSign className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="text-xs font-mono text-neutral-500">Bakiye:</span>
          <span className="text-sm font-mono font-bold text-neutral-900 dark:text-white">{myState.balance?.toLocaleString('tr-TR')} ₺</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. HALKA: HAMMADDE ÜRETİM TESİSLERİ (ID 15) */}
        {ownsRawMaterial ? (
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-yellow-500/40 space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30">
                  1. HALKA - HAMMADDE
                </span>
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">ID #15</span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  {gameState.propertyOwnership?.[15]?.customName || 'Hammadde Üretim Tesisleri'}
                </h4>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Her tur başında otomatik +1 hammadde üretir.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">Stok Miktarı:</span>
                <span className="text-xl font-mono font-black text-yellow-500 dark:text-yellow-400">
                  📦 {tradeState[15]?.stock || 0} Birim
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => tradeWithState('sell_raw_to_state')}
                disabled={loading || (tradeState[15]?.stock || 0) < 1}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Devlete Sat (+20.000 ₺)</span>
              </button>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                <div className="text-[11px] font-mono text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
                  <span>Fabrikaya Satış Teklifi Gönder</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={selectedFactoryOwner}
                    onChange={e => setSelectedFactoryOwner(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">Fabrika Sahibi Seçin...</option>
                    {factoryOwners.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.id === myId ? 'Kendin (Öz Kaynak)' : `${o.name} (Fabrikacı)`}
                      </option>
                    ))}
                  </select>

                  {selectedFactoryOwner === myId ? (
                    <button
                      onClick={() => useSelfResource('rawMaterial')}
                      disabled={loading || (tradeState[15]?.stock || 0) < 1}
                      className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ÖZ KAYNAĞI KULLAN
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={rawPriceInput}
                        onChange={e => setRawPriceInput(e.target.value)}
                        placeholder="Fiyat ₺"
                        className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-yellow-500"
                      />
                      <button
                        onClick={() => {
                          if (!selectedFactoryOwner) return;
                          sendTradeOffer(selectedFactoryOwner, 'rawMaterial', Number(rawPriceInput) || 35000);
                        }}
                        disabled={loading || !selectedFactoryOwner || (tradeState[15]?.stock || 0) < 1}
                        className="px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        TEKLİF ET
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800/60 flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-2">
            <Package className="w-8 h-8 opacity-40" />
            <span className="text-xs font-mono">1. Halka - Hammadde Tesisine Sahip Değilsiniz</span>
          </div>
        )}

        {/* 2. HALKA: SANAYİ VE ÜRETİM FABRİKASI (ID 24) */}
        {ownsFactory ? (
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-slate-400 space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-500/40">
                  2. HALKA - FABRİKA
                </span>
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">ID #24</span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  {gameState.propertyOwnership?.[24]?.customName || 'Sanayi ve Üretim Fabrikası'}
                </h4>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Hammaddeyi işleyerek bitmiş ürüne dönüştürür.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block">Hammadde Depo:</span>
                  <span className="text-sm font-mono font-bold text-yellow-500 dark:text-yellow-400">
                    📦 {tradeState[24]?.rawMaterialStock || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block">Bitmiş Ürün:</span>
                  <span className="text-sm font-mono font-bold text-cyan-500 dark:text-cyan-400">
                    🏬 {tradeState[24]?.productStock || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => tradeWithState('buy_raw_from_state')}
                  disabled={loading || myState.balance < 55000}
                  className="py-2 px-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1 border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer disabled:opacity-40"
                  title="Devletten acil hammadde çek"
                >
                  <span>+ İthal (-55K ₺)</span>
                </button>
                <button
                  onClick={() => tradeWithState('sell_product_to_state')}
                  disabled={loading || (tradeState[24]?.productStock || 0) < 1}
                  className="py-2 px-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all cursor-pointer disabled:opacity-40"
                  title="Devlete ürün ihraç et"
                >
                  <span>İhraç (+60K ₺)</span>
                </button>
              </div>

              <button
                onClick={() => processMaterial()}
                disabled={loading || (tradeState[24]?.rawMaterialStock || 0) < 1}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-600 via-cyan-600 to-slate-600 hover:from-slate-500 hover:to-cyan-500 text-white font-mono text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                <span>1 Hammadde İşle -&gt; 1 Ürün Üret</span>
              </button>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 space-y-2.5">
                <div className="text-[11px] font-mono text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  <span>AVM'ye Ürün Satış Teklifi Gönder</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={selectedMallOwner}
                    onChange={e => setSelectedMallOwner(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">AVM Sahibi Seçin...</option>
                    {mallOwners.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.id === myId ? 'Kendin (Öz Kaynak)' : `${o.name} (AVM'ci)`}
                      </option>
                    ))}
                  </select>

                  {selectedMallOwner === myId ? (
                    <button
                      onClick={() => useSelfResource('product')}
                      disabled={loading || (tradeState[24]?.productStock || 0) < 1}
                      className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ÖZ KAYNAĞI KULLAN
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={productPriceInput}
                        onChange={e => setProductPriceInput(e.target.value)}
                        placeholder="Fiyat ₺"
                        className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => {
                          if (!selectedMallOwner) return;
                          sendTradeOffer(selectedMallOwner, 'product', Number(productPriceInput) || 90000);
                        }}
                        disabled={loading || !selectedMallOwner || (tradeState[24]?.productStock || 0) < 1}
                        className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        TEKLİF ET
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800/60 flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-2">
            <Factory className="w-8 h-8 opacity-40" />
            <span className="text-xs font-mono">2. Halka - Sanayi Fabrikasına Sahip Değilsiniz</span>
          </div>
        )}

        {/* 3. HALKA: MEGA AVM VE YAŞAM MERKEZİ (ID 35) */}
        {ownsMall ? (
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-pink-500/50 space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/40">
                  3. HALKA - MEGA AVM
                </span>
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">ID #35</span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                  {gameState.propertyOwnership?.[35]?.customName || 'Mega AVM ve Yaşam Merkezi'}
                </h4>
                <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Vitrin doluyken basan rakipten 2.6M ₺ kira keser!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block">Depo Ürün Stoku:</span>
                  <span className="text-sm font-mono font-bold text-cyan-500 dark:text-cyan-400">
                    🏬 {tradeState[35]?.productStock || 0} Adet
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 block">Vitrin Dolu Süre:</span>
                  <span className={`text-sm font-mono font-bold ${(tradeState[35]?.activeStockTurns || 0) > 0 ? 'text-pink-500 dark:text-pink-400' : 'text-neutral-500 dark:text-gray-500'}`}>
                    ⏳ {tradeState[35]?.activeStockTurns || 0} Tur
                  </span>
                </div>
              </div>

              {/* Doluluk Rozeti */}
              <div className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 text-center ${
                (tradeState[35]?.activeStockTurns || 0) > 0
                  ? 'bg-pink-50 dark:bg-pink-500/15 border-pink-200 dark:border-pink-500/40 text-pink-600 dark:text-pink-300 shadow-lg dark:shadow-pink-500/10'
                  : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400'
              }`}>
                {(tradeState[35]?.activeStockTurns || 0) > 0 ? (
                  <>
                    <Sparkles className="w-4 h-4 text-pink-500 dark:text-pink-400 shrink-0" />
                    <span>LÜKS KİRADA! RAKİP KİRASI: 2.600.000 ₺ 👑</span>
                  </>
                ) : (
                  <span>BOŞ VİTRİN ⚠️ GİRİŞ KİRASI: 5.000 ₺</span>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => tradeWithState('buy_product_from_state')}
                disabled={loading || myState.balance < 120000}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-xs font-bold flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Devletten Acil Ürün İthal Et (-120.000 ₺)</span>
              </button>

              <button
                onClick={() => stockMall()}
                disabled={loading || (tradeState[35]?.productStock || 0) < 1}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:to-rose-400 text-white font-mono text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Vitrine Ürün Diz (+3 Tur Lüks Kira ⚡)</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800/60 flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-2">
            <Building2 className="w-8 h-8 opacity-40" />
            <span className="text-xs font-mono">3. Halka - Mega AVM Mülküne Sahip Değilsiniz</span>
          </div>
        )}

      </div>

    </div>
  );
}
