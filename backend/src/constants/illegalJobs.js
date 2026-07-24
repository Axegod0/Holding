export const illegalJobsEngineConfig = {
  enabled: true,
  allowDecline: true,
  illegalDeck: [
    {
      id: "ILLEGAL_1",
      title: "Gece Yarısı Konteyner Sevkiyatı",
      description: "Limana gümrüksüz giren tırları polis radarına yakalanmadan şehirden çıkar.",
      targetType: "TILES_MOVED",
      targetValue: 25,
      maxRollsAllowed: 3,
      reward: { cash: 150000 },
      penalty: { action: "AUCTION_MOST_VALUABLE_PROPERTY" },
      logHeadline: "Gece Yarısı Konteyner Sevkiyatı Başlatıldı!"
    },
    {
      id: "ILLEGAL_2",
      title: "Soğuk Cüzdanda Kara Para Aklama",
      description: "Kaynağı belirsiz kripto fonunu izini belli etmeden hesaplarına geçir.",
      targetType: "AVOID_ENEMY_PROPERTIES_AND_RENT",
      targetValueLaps: 1,
      reward: { cash: 180000 },
      penalty: { cashPercent: 0.50, action: "GO_TO_JAIL", durationLaps: 1 },
      logHeadline: "Kripto Cüzdanlarında Kara Para Aklama Operasyonu!"
    },
    {
      id: "ILLEGAL_3",
      title: "Sınır Kapısında Transit Geçiş",
      description: "Özel sevkiyat için gümrük kapısındaki nöbet değişim saatini yakala.",
      targetType: "ROLL_DOUBLE_DICE",
      maxRollsAllowed: 2,
      reward: { cash: 200000 },
      penalty: { action: "GO_TO_JAIL", durationLaps: 2, collectRentDuringJail: false },
      logHeadline: "Sınır Kapısında Sahte Evrak Operasyonu!"
    },
    {
      id: "ILLEGAL_4",
      title: "Rakip Sunuculara Sızma",
      description: "Masadaki lider oyuncunun projelerini sabote etmek için sunucularına siber ajan yerleştir.",
      targetType: "LAND_NEAR_RICHEST_PLAYER",
      targetRange: 3,
      targetValueLaps: 2,
      reward: { stealCashPercentFromRichest: 0.25 },
      penalty: { transferMostValuablePropertyToTarget: true },
      logHeadline: "Siber Casusluk Operasyonu Başlatıldı!"
    },
    {
      id: "ILLEGAL_5",
      title: "Karaborsa Müzayede Teslimatı",
      description: "Yasa dışı kazıda bulunan tarihi eserleri karaborsadaki alıcıya ulaştır.",
      targetType: "LAND_ON_ANY_ENEMY_PROPERTY",
      targetValueLaps: 2,
      reward: { cash: 160000 },
      penalty: { action: "GO_TO_JAIL", durationLaps: 1, payCashToAllPlayers: 40000 },
      logHeadline: "Karaborsa Müzayede Teslimatı!"
    },
    {
      id: "ILLEGAL_6",
      title: "Sahte Teminat Mektubu Operasyonu",
      description: "Bankadan sahte teminat göstererek gümrükte takılan ithalat ürünlerini çek.",
      targetType: "ODD_DICE_ROLL",
      maxRollsAllowed: 1,
      reward: { cash: 140000 },
      penalty: { bankOperationsBlockedLaps: 3, cashPercent: 0.40 },
      logHeadline: "Sahte Teminat Mektubu Vurgunu!"
    },
    {
      id: "ILLEGAL_7",
      title: "Kaçak Akaryakıt Tankeri",
      description: "Kaçak akaryakıtı Sahil Güvenlik baskınından önce karaya çıkar.",
      targetType: "MIN_DICE_ROLL",
      targetValue: 8,
      maxRollsAllowed: 1,
      reward: { cash: 175000 },
      penalty: { seizeCheapestPropertiesCount: 2, skipNextTurn: true },
      logHeadline: "Kaçak Akaryakıt Tankeri Baskından Kaçıyor!"
    },
    {
      id: "ILLEGAL_8",
      title: "Yasa Dışı Bahis & Aklama Ağı",
      description: "Yasa dışı bahis parasını polis baskınından önce aklama merkezine ulaştır.",
      targetType: "TILES_MOVED",
      targetValue: 14,
      maxRollsAllowed: 2,
      reward: { cash: 220000 },
      penalty: { cashPercent: 0.60, action: "GO_TO_JAIL", durationLaps: 1 },
      logHeadline: "Yasa Dışı Bahis Konsorsiyumu Operasyonu!"
    },
    {
      id: "ILLEGAL_9",
      title: "Kaçak Kimyasal Atık Depolama",
      description: "Sanayi şirketlerinin zehirli atıklarını para karşılığı kendi arazilerinden birine göm.",
      targetType: "LAND_ON_OWN_PROPERTY",
      targetValueLaps: 2,
      reward: { cash: 130000 },
      penalty: { sealLandedPropertyLaps: 3, payCashToAllPlayers: 30000 },
      logHeadline: "Kaçak Kimyasal Atık Depolama Teslimatı!"
    },
    {
      id: "ILLEGAL_10",
      title: "Günah Keçisi & Kiralık Mahkûm",
      description: "Karanlık bir patronun işlediği suçu 300.000 TL karşılığında üzerine al.",
      targetType: "INSTANT_EXECUTION",
      reward: { cash: 300000 },
      penalty: { action: "GO_TO_JAIL", durationLaps: 3, collectRentDuringJail: true },
      logHeadline: "Kiralık Mahkûm Anlaşması İmzalandı!"
    },
    {
      id: "ILLEGAL_11",
      title: "Merkez Bankası Sunucusuna Sızma",
      description: "Güvenlik duvarını geçmek için spesifik sinyal frekansını tuttur.",
      targetType: "EVEN_DICE_ROLL_AND_MIN_VALUE",
      minRollValue: 8,
      mustBeEven: true,
      maxRollsAllowed: 1,
      reward: { cash: 210000 },
      penalty: { sealAllPropertiesLaps: 2, cash: 100000 },
      logHeadline: "Merkez Bankası Sunucularına Siber Baskın!"
    },
    {
      id: "ILLEGAL_12",
      title: "Karaborsa Tapu Sahteciliği",
      description: "Sahipsiz arazinin tapusunu sahte belgelerle üzerine geçirmek için oraya ulaş.",
      targetType: "LAND_ON_UNOWNED_PROPERTY",
      maxRollsAllowed: 1,
      reward: { acquireUnownedPropertyFree: true, cashBonus: 50000 },
      penalty: { action: "GO_TO_JAIL", durationLaps: 1, cash: 100000 },
      logHeadline: "Karaborsa Tapu Sahteciliği İle Mülk Çökme!"
    },
    {
      id: "ILLEGAL_13",
      title: "Borsada İçeriden Bilgi Sızdırma",
      description: "Sızdırılan bilgiyi nakde çevirirken regülatör radarına takılma.",
      targetType: "AVOID_PENALTY_AND_JAIL_TILES",
      targetValueLaps: 1,
      reward: { cash: 180000 },
      penalty: { cashPercent: 0.20, action: "GO_TO_JAIL", durationLaps: 1 },
      logHeadline: "SPK İçeriden Bilgi Sızdırma Operasyonu!"
    },
    {
      id: "ILLEGAL_14",
      title: "Rakip Holdingden Haraç Kesme",
      description: "Yerel çetelerle anlaşıp masadaki lider oyuncunun nakit akışına çök.",
      targetType: "LAND_NEAR_LEADER",
      targetRange: 2,
      targetValueLaps: 2,
      reward: { stealCashPercentFromLeader: 0.30 },
      penalty: { payCashToLeader: 150000, action: "GO_TO_JAIL", durationLaps: 1 },
      logHeadline: "Lider Holdingden Haraç Kesme Operasyonu!"
    },
    {
      id: "ILLEGAL_15",
      title: "Gümrükte Yeşil Hat Kaçakçılığı",
      description: "Gümrük memurunun denetim zarına güvenerek kaçak kargoyu geçirmeyi dene.",
      targetType: "EXACT_DICE_ROLL_VALUES",
      allowedValues: [7, 11],
      maxRollsAllowed: 1,
      reward: { cash: 280000 },
      penalty: { action: "AUCTION_MOST_VALUABLE_PROPERTY", bankOperationsBlockedLaps: 2, actionJail: "GO_TO_JAIL", durationLaps: 2 },
      logHeadline: "Gümrükte Yeşil Hat Kaçakçılık Baskını!"
    }
  ]
};

export const ILLEGAL_JOBS_DECK = illegalJobsEngineConfig.illegalDeck;
