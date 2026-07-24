import React, { useState } from 'react';
import { Landmark, AlertTriangle, ShieldCheck, DollarSign, Building2, Lock, Unlock, X, Scale } from 'lucide-react';
import useGameStore from '../store/gameStore.js';
import socket from '../services/socket.js';
import { BOARD_DATA } from '../constants/boardData.js';

export default function FinancialModal() {
  const activeBankModal = useGameStore(state => state.activeBankModal);
  const activeJailModal = useGameStore(state => state.activeJailModal);
  const setActiveBankModal = useGameStore(state => state.setActiveBankModal);
  const setActiveJailModal = useGameStore(state => state.setActiveJailModal);
  const bankAction = useGameStore(state => state.bankAction);
  const jailAction = useGameStore(state => state.jailAction);
  const rollDice = useGameStore(state => state.rollDice);
  const gameState = useGameStore(state => state.gameState);
  const loading = useGameStore(state => state.loading);
  const myId = useGameStore(state => state.myId) || socket?.id;

  const [depositAmount, setDepositAmount] = useState('');
  const [customLoanInputs, setCustomLoanInputs] = useState({});

  if (!activeBankModal && !activeJailModal) return null;

  const myState = gameState?.playersState[myId] || gameState?.playersState[socket?.id] || { balance: 0, totalAssetValue: 0, position: 0 };
  const bankInfo = gameState?.bankState?.[myId] || gameState?.bankState?.[socket?.id] || { deposit: 0, loans: [] };
  const jailInfo = gameState?.jailState?.[myId] || gameState?.jailState?.[socket?.id] || { inJail: false, turnsServed: 0 };
  const propertyOwnership = gameState?.propertyOwnership || {};
  const isRemote = myState.position !== 20;
  const isBankBlocked = myState.bankOperationsBlockedLaps > 0;

  // Bana ait mülkleri listele
  const myProperties = Object.entries(propertyOwnership)
    .filter(([_, data]) => data?.ownerId === myId || data?.ownerId === socket?.id)
    .map(([idStr, data]) => {
      const square = BOARD_DATA.find(s => s.id === Number(idStr));
      return { ...square, ...data };
    })
    .filter(Boolean);

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (isRemote) return;
    const val = Number(depositAmount);
    if (!val || isNaN(val) || val <= 0 || val > myState.balance) return;
    bankAction('deposit', { amount: val });
    setDepositAmount('');
  };

  const handleLoanSubmit = (propId, maxLimit) => {
    const val = Number(customLoanInputs[propId] || maxLimit);
    if (!val || isNaN(val) || val <= 0 || val > maxLimit) return;
    bankAction('loan', { propertyId: propId, amount: val });
  };

  // Kural: Kefalet = max(5.000, (Bakiye + TotalAsset) × %5)
  const myNetWorth = (myState.balance || 0) + (myState.totalAssetValue || 0);
  const bailCalculation = Math.max(5000, Math.round(myNetWorth * 0.05));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 dark:bg-neutral-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-2xl rounded-2xl p-6 border border-emerald-400/50 dark:border-emerald-500/50 shadow-xl dark:shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Üst Kapatma Butonu */}
        <button
          onClick={() => {
            setActiveBankModal(false);
            setActiveJailModal(false);
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200 dark:hover:text-white dark:hover:bg-neutral-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- BANKA MODALI --- */}
        {activeBankModal && (
          <div className="space-y-6 overflow-y-auto pr-1">
            <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-inner">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span>MERKEZ BANKASI // FİNANS & İPOTEK DAİRESİ (#20)</span>
                  {isRemote ? (
                    <span className="bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-1.5 py-0.5 rounded text-[9px]">MOBİL / UZAKTAN</span>
                  ) : (
                    <span className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.5 rounded text-[9px]">MERKEZ ŞUBE</span>
                  )}
                </div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white">Mevduat ve Serbest Kredi İpotek İşlemleri</h3>
              </div>
            </div>

            {/* Uzaktan İşlem Uyarı / Bilgi Paneli */}
            {isRemote ? (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/50 text-xs font-mono text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-700 dark:text-amber-300 uppercase">⚠️ Uzaktan / Mobil Bankacılık İşlemtesiniz</strong>
                  Şu an Merkez Bankası (#20) karesinde olmadığınız için uzaktan mevduata para ekleyemezsiniz. Acil nakit ihtiyacınız için mülklerinizi ipotekleyip kredi çekebilirsiniz; ancak uzaktan çekilen kredilerde tur başı bileşik faiz <strong className="text-neutral-900 dark:text-white">%8</strong> olarak işletilir (Merkez şubede %4).
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/50 text-xs font-mono text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-700 dark:text-emerald-300 uppercase">✅ Merkez Bankası Şubesindesiniz (#20)</strong>
                  Buradan mevduata para yatırabilir (Tur başı %4 faizle büyür ve istediğiniz zaman çekilebilir) ve mülklerinize düşük faizli (%4) ipotek kredisi alabilirsiniz.
                </div>
              </div>
            )}

            {/* 1. MEVDUAT ALANI */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 dark:from-emerald-950/30 to-neutral-100 dark:to-neutral-900 border border-emerald-200 dark:border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-neutral-600 dark:text-neutral-300 uppercase flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Aktif Bileşik Mevduatınız (Tur Başı +%4 Büyür)
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                  {bankInfo.deposit?.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Yatırdığınız tutar her tur başında otomatik olarak %4 bileşik faiz ile katlanarak artar. İstediğiniz zaman tahsil edebilirsiniz.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <form onSubmit={handleDepositSubmit} className="flex flex-1 items-center gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={isBankBlocked ? `Hesaplarınız donduruldu!` : `Yatırılacak tutar (Maks: ${myState.balance?.toLocaleString('tr-TR')} ₺)`}
                    disabled={loading || isRemote || myState.balance <= 0 || isBankBlocked}
                    className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isRemote || !depositAmount || Number(depositAmount) <= 0 || Number(depositAmount) > myState.balance || loading || isBankBlocked}
                    className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    Yatır (+%4 / Tur)
                  </button>
                </form>

                {bankInfo.deposit > 0 && (
                  <button
                    type="button"
                    onClick={() => bankAction('withdraw_deposit')}
                    disabled={loading || isBankBlocked}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-gray-950 font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md"
                  >
                    Mevduatı Tahsil Et ({bankInfo.deposit?.toLocaleString('tr-TR')} ₺)
                  </button>
                )}
              </div>
            </div>

            {/* 2. İPOTEK VE SERBEST KREDİ ALANI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 uppercase">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Serbest Kredi ve İpotekler (%70 Limit • Bileşik Faiz: {isRemote ? '%8 Mobil' : '%4 Şube'})
                </span>
                {isBankBlocked && (
                  <span className="text-[10px] text-red-500 animate-pulse flex items-center gap-1">
                    <Lock className="w-3 h-3" /> HESAPLAR DONDURULDU
                  </span>
                )}
                <span className="text-neutral-500">{myProperties.length} Mülk</span>
              </div>

              {myProperties.length === 0 ? (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-center text-xs font-mono text-neutral-500 italic">
                  İpotek verilecek herhangi bir mülkünüz bulunmuyor.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  {myProperties.map(prop => {
                    const activeLoan = bankInfo.loans.find(l => l.propertyId === prop.id);
                    const isMortgaged = prop.isMortgaged || activeLoan;
                    const maxLimit = Math.round((prop.price || 0) * 0.70);
                    const currentCustom = customLoanInputs[prop.id] !== undefined ? customLoanInputs[prop.id] : maxLimit;

                    return (
                      <div
                        key={prop.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 text-xs font-mono transition-all ${
                          isMortgaged
                            ? 'bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-500/40'
                            : 'bg-neutral-50 dark:bg-neutral-950/90 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-500">#{prop.id} • ŞEHİR TAPUSU</span>
                            {isMortgaged && (
                              <span className="bg-red-50 dark:bg-red-500/20 text-red-600 dark:bg-red-950/50 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded text-[9px] font-bold border border-red-200 dark:border-red-500/30 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> İPOTEKLİ
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-neutral-900 dark:text-white text-sm mt-0.5">{prop.name}</div>
                          <div className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5 flex items-center justify-between">
                            <span>Değer: {prop.price?.toLocaleString('tr-TR')} ₺</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-bold">Limit: {maxLimit?.toLocaleString('tr-TR')} ₺</span>
                          </div>
                        </div>

                        {isMortgaged ? (
                          <div className="space-y-2 pt-2 border-t border-amber-200 dark:border-amber-500/30">
                            <div className="text-[11px] text-amber-600 dark:text-amber-300 font-bold flex items-center justify-between">
                              <span>Borç / Geri Ödeme:</span>
                              <span className="text-amber-800 dark:text-white bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/40">
                                {activeLoan?.repayAmount?.toLocaleString('tr-TR') || 0} ₺
                              </span>
                            </div>
                            <button
                              onClick={() => bankAction('repay_loan', { propertyId: prop.id })}
                              disabled={loading || myState.balance < (activeLoan?.repayAmount || 0) || isBankBlocked}
                              className={`w-full py-2 px-2 rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                                myState.balance >= (activeLoan?.repayAmount || 0) && !isBankBlocked
                                  ? 'bg-amber-500 text-gray-950 hover:bg-amber-400 cursor-pointer shadow-sm'
                                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                              }`}
                            >
                              <Unlock className="w-3 h-3" />
                              <span>İpoteki Kaldır ve Kilidi Aç</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 shrink-0">Çekilecek Tutar:</span>
                              <input
                                type="number"
                                value={currentCustom}
                                onChange={(e) => setCustomLoanInputs({ ...customLoanInputs, [prop.id]: e.target.value })}
                                placeholder={maxLimit}
                                max={maxLimit}
                                min={1000}
                                disabled={loading || isBankBlocked}
                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-xs text-cyan-600 dark:text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 text-right disabled:opacity-50"
                              />
                            </div>
                            <button
                              onClick={() => handleLoanSubmit(prop.id, maxLimit)}
                              disabled={loading || Number(currentCustom) <= 0 || Number(currentCustom) > maxLimit || isBankBlocked}
                              className="w-full py-2 px-2 rounded-lg bg-cyan-50 dark:bg-cyan-500/15 hover:bg-cyan-100 dark:hover:bg-cyan-500 text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-neutral-950 border border-cyan-200 dark:border-cyan-500/30 font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Kredi Çek (+{Number(currentCustom || maxLimit).toLocaleString('tr-TR')} ₺)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- HAPİS VE SAYIŞTAY MODALI --- */}
        {activeJailModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                  SAYIŞTAY VE HAPİSHANE (#10)
                </div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white">Adli Durum ve Kefalet Dairesi</h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 dark:from-amber-950/30 via-neutral-100 dark:via-neutral-900 to-neutral-50 dark:to-neutral-900 border border-amber-200 dark:border-amber-500/40 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-neutral-600 dark:text-neutral-300">GÜNCEL ADLİ DURUMUNUZ:</span>
                <span className={`px-2.5 py-1 rounded-lg ${jailInfo.inJail ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/40' : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40'}`}>
                  {jailInfo.inJail ? '🚨 HAPİSTESİNİZ (GÖZALTI)' : '✅ SERBEST / TEMİZ'}
                </span>
              </div>

              {jailInfo.inJail ? (
                <div className="space-y-4 text-xs font-mono">
                  <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Sayıştay denetimi / Gözaltı karesine takıldığınız için şu an serbest hareket edemiyorsunuz. Aşağıdaki 3 seçenekten birini seçerek turunuza yön verebilirsiniz:
                  </p>

                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase">Gözaltı Süresi:</span>
                      <span className="text-neutral-900 dark:text-white font-bold block mt-0.5">{jailInfo.turnsServed || 0}. Tur / 3</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 block text-[10px] uppercase">Net Varlık %5 Kefalet:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-black text-sm block mt-0.5">{bailCalculation.toLocaleString('tr-TR')} ₺</span>
                      <span className="text-neutral-400 dark:text-neutral-600 block text-[9px] mt-0.5">(Bakiye + Mülk Değeri) × %5</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-3">
                    {/* Seçenek 1: Kefalet Öde */}
                    <button
                      onClick={() => jailAction('pay_bail')}
                      disabled={loading || myState.balance < bailCalculation}
                      className={`w-full py-3 px-4 rounded-xl font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
                        myState.balance >= bailCalculation
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-950 cursor-pointer shadow-lg shadow-amber-500/20'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>1. Kefalet Öde ({bailCalculation.toLocaleString('tr-TR')} ₺) ve Çık</span>
                    </button>

                    {/* Seçenek 2: Rüşvet Ver & Zar At */}
                    <button
                      onClick={() => jailAction('bribe_attempt')}
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl font-bold tracking-wider transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white cursor-pointer shadow-lg shadow-purple-500/20"
                    >
                      <DollarSign className="w-4 h-4 shrink-0" />
                      <span>2. Rüşvet Ver & Zar At (%50 ihtimalle kurtul, %50 ceza: 100.000 ₺)</span>
                    </button>

                    {/* Seçenek 3: Bekle & Çift Zar At */}
                    <button
                      onClick={() => {
                        setActiveJailModal(false);
                        rollDice();
                      }}
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Scale className="w-4 h-4 shrink-0 text-amber-500 dark:text-amber-400" />
                      <span>3. Bekle & Çift Zar At (3 Tur Çift Gelmezse Zorunlu Çıkış)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <p>Hapiste değilsiniz. Tahtada özgürce ticaret ve yatırım yapabilirsiniz.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
