export const ILLEGAL_JOBS_DECK = [
  {
    id: "ILLEGAL_1",
    title: "Büyük Kaçak Lojistik Operasyonu",
    description: "Limana gelen kaçak konteynerları 3 zar atışında şehirden çıkarman gerekiyor.",
    targetType: "TILES_MOVED",
    targetValue: 30,
    maxRollsAllowed: 3,
    reward: { cash: 100000 },
    penalty: { action: "LOSE_MOST_VALUABLE_PROPERTY" },
    logHeadline: "Kaçak Lojistik Operasyonu Başlatıldı!"
  },
  {
    id: "ILLEGAL_2",
    title: "Karanlık Konsorsiyum Transit Geçişi",
    description: "Sınır kapısı kapanmadan 2 zar atışında Başlangıç noktasından geçmelisin.",
    targetType: "PASS_START_LAP",
    targetValue: 1,
    maxRollsAllowed: 2,
    reward: { cash: 150000 },
    penalty: { cashPercent: 0.30 },
    logHeadline: "Sınır Transit Geçişi İçi Zamana Karşı Yarış!"
  },
  {
    id: "ILLEGAL_3",
    title: "Kırmızı Hat Sevkiyatı",
    description: "Sevkiyat sırasında radara yakalanmamak için 2 tur boyunca ceza veya mahkeme karesine basmamalısın.",
    targetType: "AVOID_PENALTY_TILES",
    targetValueLaps: 2,
    reward: { cash: 120000 },
    penalty: { action: "GO_TO_JAIL", durationLaps: 1 },
    logHeadline: "Kırmızı Hat Sevkiyatı Devam Ediyor..."
  },
  {
    id: "ILLEGAL_4",
    title: "Borsada İçeriden Bilgi Sızdırma",
    description: "Sızdırılan bilgiyi değerlendirmek için 2 tur içinde yeni bir mülk al veya ihale kazan.",
    targetType: "ACQUIRE_PROPERTY",
    targetValueLaps: 2,
    reward: { cashBonus: 50000, refundPercentOnAcquire: 0.50 },
    penalty: { cash: 80000 },
    logHeadline: "Borsada İçeriden Bilgi Operasyonu!"
  }
];
