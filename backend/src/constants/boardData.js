/**
 * Holding Simülasyonu — 40 Karelik Tahta Verisi
 * Belirtilen kurallara göre kesinleştirilmiş dizilim:
 *
 * Köşeler: #0 Başlangıç, #13 Hapis, #20 Merkez Bankası, #33 Gümrük Kapısı
 * Alt Kenar (Sol→Sağ 0-13): 0..13
 * Sol Kenar (Aşağı→Yukarı 14-19): 14..19
 * Üst Kenar (Sol→Sağ 20-32): 20..32  (köşe dahil)
 * Sağ Kenar (Yukarı→Aşağı 33-39): 33..39 (köşe dahil)
 */
export const BOARD_DATA = [
  // ───────────────── ALT KENAR (Sol → Sağ): 0 → 13 ─────────────────
  {
    id: 0, type: 'start',
    name: 'Başlangıç',
    subtitle: 'Maaş: 15.000 ₺ + Net Varlık × %5',
    color: '#10B981'
  },
  {
    id: 1, type: 'property',
    name: 'Yozgat', group: 'group1',
    price: 60000, housePrice: 50000,
    rent: [4000, 8000, 20000, 60000, 180000, 320000, 450000],
    color: '#A1887F'
  },
  {
    id: 2, type: 'chance',
    name: 'Şans Kartı', subtitle: 'Piyasa Haberi',
    color: '#F59E0B'
  },
  {
    id: 3, type: 'property',
    name: 'Kars', group: 'group1',
    price: 60000, housePrice: 50000,
    rent: [4000, 8000, 20000, 60000, 180000, 320000, 450000],
    color: '#A1887F'
  },
  {
    id: 4, type: 'tax',
    name: 'Hazine Vergisi', subtitle: 'Net Varlığın %10\'u Kesilir',
    color: '#EF4444'
  },
  {
    id: 5, type: 'station', subType: 'PORT',
    name: 'Uluslararası Liman', subtitle: '5 Turluk Kiralama İhalesi',
    price: 200000, leaseTax: 30000,
    color: '#64748B'
  },
  {
    id: 6, type: 'property',
    name: 'Edirne', group: 'group2',
    price: 100000, housePrice: 50000,
    rent: [6000, 12000, 30000, 90000, 270000, 400000, 550000],
    color: '#38BDF8'
  },
  {
    id: 7, type: 'chance',
    name: 'Şans Kartı',
    color: '#F59E0B'
  },
  {
    id: 8, type: 'property',
    name: 'Tekirdağ', group: 'group2',
    price: 100000, housePrice: 50000,
    rent: [6000, 12000, 30000, 90000, 270000, 400000, 550000],
    color: '#38BDF8'
  },
  {
    id: 9, type: 'property',
    name: 'Çanakkale', group: 'group2',
    price: 120000, housePrice: 50000,
    rent: [8000, 16000, 40000, 100000, 300000, 450000, 600000],
    color: '#38BDF8'
  },
  {
    id: 10, type: 'property',
    name: 'Samsun', group: 'group3',
    price: 140000, housePrice: 100000,
    rent: [10000, 20000, 50000, 150000, 450000, 625000, 750000],
    color: '#EC4899'
  },
  {
    id: 11, type: 'property',
    name: 'Trabzon', group: 'group3',
    price: 140000, housePrice: 100000,
    rent: [10000, 20000, 50000, 150000, 450000, 625000, 750000],
    color: '#EC4899'
  },
  {
    id: 12, type: 'property',
    name: 'Rize', group: 'group3',
    price: 160000, housePrice: 100000,
    rent: [12000, 24000, 60000, 180000, 500000, 700000, 900000],
    color: '#EC4899'
  },
  {
    id: 13, type: 'jail',
    name: 'Sayıştay Denetimi / Hapis',
    subtitle: 'Gözaltı — %5 Ödeyerek veya Zarla Çık',
    color: '#94A3B8'
  },

  // ───────────────── SOL KENAR (Aşağı → Yukarı): 14 → 19 ─────────────────
  {
    id: 14, type: 'property',
    name: 'Şanlıurfa', group: 'group4',
    price: 180000, housePrice: 100000,
    rent: [14000, 28000, 70000, 200000, 550000, 750000, 950000],
    color: '#F97316'
  },
  {
    id: 15, type: 'TRADE', subType: 'RAW_MATERIAL',
    name: 'Hammadde Üretim Tesisi',
    subtitle: 'Ticaret Zinciri — 1. Halka',
    price: 150000, color: '#EAB308'
  },
  {
    id: 16, type: 'property',
    name: 'Diyarbakır', group: 'group4',
    price: 180000, housePrice: 100000,
    rent: [14000, 28000, 70000, 200000, 550000, 750000, 950000],
    color: '#F97316'
  },
  {
    id: 17, type: 'chance',
    name: 'Şans Kartı', subtitle: 'Piyasa Haberi',
    color: '#F59E0B'
  },
  {
    id: 18, type: 'property',
    name: 'Gaziantep', group: 'group4',
    price: 200000, housePrice: 100000,
    rent: [16000, 32000, 80000, 220000, 600000, 800000, 1000000],
    color: '#F97316'
  },
  {
    id: 19, type: 'station', subType: 'BORSA',
    name: 'Borsa / Halka Arz',
    subtitle: '2 Tur Sonra: %55 x2 KAZANÇ / %45 -%50 KAYIP',
    price: 0, color: '#8B5CF6'
  },

  // ───────────────── ÜST KENAR (Sol → Sağ): 20 → 32 ─────────────────
  {
    id: 20, type: 'bank',
    name: 'Merkez Bankası',
    subtitle: 'Kredi Çek — Mevduat Yatır',
    color: '#10B981'
  },
  {
    id: 21, type: 'property',
    name: 'Eskişehir', group: 'group5',
    price: 220000, housePrice: 150000,
    rent: [18000, 36000, 90000, 250000, 700000, 875000, 1050000],
    color: '#EF4444'
  },
  {
    id: 22, type: 'property',
    name: 'Konya', group: 'group5',
    price: 220000, housePrice: 150000,
    rent: [18000, 36000, 90000, 250000, 700000, 875000, 1050000],
    color: '#EF4444'
  },
  {
    id: 23, type: 'property',
    name: 'Kayseri', group: 'group5',
    price: 240000, housePrice: 150000,
    rent: [20000, 40000, 100000, 300000, 750000, 925000, 1100000],
    color: '#EF4444'
  },
  {
    id: 24, type: 'TRADE', subType: 'FACTORY',
    name: 'Sanayi ve Üretim Fabrikası',
    subtitle: 'Ticaret Zinciri — 2. Halka',
    price: 150000, color: '#64748B'
  },
  {
    id: 25, type: 'property',
    name: 'Muğla', group: 'group6',
    price: 260000, housePrice: 150000,
    rent: [22000, 44000, 110000, 330000, 800000, 975000, 1150000],
    color: '#FACC15'
  },
  {
    id: 26, type: 'property',
    name: 'Mersin', group: 'group6',
    price: 260000, housePrice: 150000,
    rent: [22000, 44000, 110000, 330000, 800000, 975000, 1150000],
    color: '#FACC15'
  },
  {
    id: 27, type: 'property',
    name: 'Bursa', group: 'group6',
    price: 280000, housePrice: 150000,
    rent: [24000, 48000, 120000, 360000, 850000, 1025000, 1200000],
    color: '#FACC15'
  },
  {
    id: 28, type: 'chance',
    name: 'Şans Kartı', subtitle: 'Piyasa Haberi',
    color: '#F59E0B'
  },
  {
    id: 29, type: 'MEDIA', subType: 'MEDIA',
    name: 'Medya Şirketi & PR Holdingi',
    subtitle: 'Rüşvet Toplama — Broadcast Gücü',
    price: 150000, rent: [25000],
    color: '#06B6D4'
  },
  {
    id: 30, type: 'property',
    name: 'Antalya', group: 'group7',
    price: 300000, housePrice: 200000,
    rent: [26000, 52000, 130000, 390000, 900000, 1100000, 1275000],
    color: '#22C55E'
  },
  {
    id: 31, type: 'property',
    name: 'İzmir', group: 'group7',
    price: 300000, housePrice: 200000,
    rent: [26000, 52000, 130000, 390000, 900000, 1100000, 1275000],
    color: '#22C55E'
  },
  {
    id: 32, type: 'property',
    name: 'Aydın', group: 'group7',
    price: 320000, housePrice: 200000,
    rent: [28000, 56000, 150000, 450000, 1000000, 1200000, 1400000],
    color: '#22C55E'
  },

  // ───────────────── SAĞ KENAR (Yukarı → Aşağı): 33 → 39 ─────────────────
  {
    id: 33, type: 'CASINO',
    name: 'Yeraltı Kumarhanesi',
    subtitle: 'Blackjack Masası',
    color: '#10B981'
  },
  {
    id: 34, type: 'chance',
    name: 'Şans Kartı', subtitle: 'Piyasa Haberi',
    color: '#F59E0B'
  },
  {
    id: 35, type: 'TRADE', subType: 'MALL',
    name: 'AVM / Perakende Merkezi',
    subtitle: 'Ticaret Zinciri — 3. Halka',
    price: 150000, color: '#EC4899'
  },
  {
    id: 36, type: 'tax',
    name: 'Servet ve Varlık Vergisi', subtitle: 'Net Varlığın %10\'u Kesilir',
    color: '#EF4444'
  },
  {
    id: 37, type: 'WEALTH_FUND',
    name: 'Türkiye Varlık Fonu',
    subtitle: 'Devlet Kasası İhalesi',
    color: '#8B5CF6'
  },
  {
    id: 38, type: 'property',
    name: 'Ankara', group: 'group8',
    price: 350000, housePrice: 200000,
    rent: [35000, 70000, 175000, 500000, 1100000, 1300000, 1500000],
    color: '#3B82F6'
  },
  {
    id: 39, type: 'property',
    name: 'İstanbul', group: 'group8',
    price: 400000, housePrice: 200000,
    rent: [50000, 100000, 200000, 600000, 1400000, 1700000, 2000000],
    color: '#3B82F6'
  }
];

/**
 * Rent dizin haritası:
 * [0] = Sahip tek mülk (monopoly yok)
 * [1] = Tekel (monopoly, ev yok) → 2x kira
 * [2] = 1 Ev
 * [3] = 2 Ev
 * [4] = 3 Ev
 * [5] = 4 Ev
 * [6] = Otel (5 ev → otel)
 */

export const GROUP_COLORS = {
  group1: '#A1887F',
  group2: '#38BDF8',
  group3: '#EC4899',
  group4: '#F97316',
  group5: '#EF4444',
  group6: '#FACC15',
  group7: '#22C55E',
  group8: '#3B82F6',
};

export const GROUP_SIZES = {
  group1: 2, group2: 3, group3: 3,
  group4: 3, group5: 3, group6: 3,
  group7: 3, group8: 2,
};

export default BOARD_DATA;
