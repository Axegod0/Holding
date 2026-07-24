export const CHANCE_CARDS = [
  {
    id: 1,
    title: 'Maliye Bakanlığı Teftişi',
    description: 'Şirket hesaplarında yapılan yüksek tutarlı transferler Maliye\'nin dikkatini çekti.',
    newspaperHeadline: 'Şirket Hakkında Vergi Kaçakçılığı Soruşturması Başlatıldı',
    durationLaps: 1,
    actionHandler: 'TAX_AUDIT',
    optionA: {
      label: 'Rüşvet verip dosyayı kapattır',
      description: 'Sabit nakit öder, olay kapanır, haber çıkmaz.',
      actionType: 'TAX_AUDIT_A'
    },
    optionB: {
      label: 'Resmi sürece git, mahkemeye taşı',
      description: '1 tur gelir %40 düşer, %30 hapis riski oluşur.',
      actionType: 'TAX_AUDIT_B'
    }
  },
  {
    id: 2,
    title: 'Kara Propaganda',
    description: 'Rakip bir grup, şirketiniz hakkında piyasaya yalan yanlış haberler sızdırdı. Yatırımcılar panik halinde.',
    newspaperHeadline: 'İş Dünyasında Şok İddia: Batmanın Eşiğinde mi?',
    durationLaps: 3,
    actionHandler: 'BLACK_PROPAGANDA',
    optionA: {
      label: 'Haber ajansına büyük bütçe döküp kampanyayı sustur',
      description: 'Yüksek sabit nakit öder, olay kapanır.',
      actionType: 'BLACK_PROPAGANDA_A'
    },
    optionB: {
      label: 'Sessiz kal, iftirayı önemseme',
      description: '3 tur boyunca tüm mülklerin kira getirisi %30 düşer.',
      actionType: 'BLACK_PROPAGANDA_B'
    }
  },
  {
    id: 3,
    title: 'Hacker Kurbanı',
    description: 'Rakip holdinglerin tuttuğu hackerlar sunucularınızı şifreledi. Verileri geri almanın tek yolu fidye ödemek.',
    newspaperHeadline: 'Siber Saldırı: Şirket Verileri Fidye İçin Kilitlendi!',
    durationLaps: 0,
    actionHandler: 'HACKER_ATTACK',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Kasandaki nakdin %15\'i anında silinir ve Varlık Fonu\'na aktarılır.',
      actionType: 'HACKER_ATTACK'
    },
    optionB: null
  },
  {
    id: 4,
    title: 'Teşvik Primi',
    description: 'Yaptığınız yatırımlar devletin dikkatini çekti. Yerli üretim teşvik ödülü kazandınız.',
    newspaperHeadline: 'Sanayi Bakanlığı\'ndan Yerli Üreticilere Büyük Teşvik!',
    durationLaps: 0,
    actionHandler: 'SUBSIDY_BONUS',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Sahip olduğun her şehir tapusu başına devlet kasasından 20.000 TL ödül alırsın.',
      actionType: 'SUBSIDY_BONUS'
    },
    optionB: null
  },
  {
    id: 5,
    title: 'Lojistik Maliyetleri Patladı',
    description: 'Uluslararası krize bağlı olarak nakliye ve operasyon giderleri aniden arttı.',
    newspaperHeadline: 'Ulaşım ve Lojistikte Dev Zam: Maliyetler Tavan Yaptı!',
    durationLaps: 0,
    actionHandler: 'LOGISTICS_COST',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Sahip olduğun her mülk başına bakım masrafı olarak 5.000 TL kesilir.',
      actionType: 'LOGISTICS_COST'
    },
    optionB: null
  },
  {
    id: 6,
    title: 'Karanlık Konsorsiyum',
    description: 'Kaynağı belirsiz bir konsorsiyum şirketine hızlıca nakit enjekte etmek istiyor ancak arkalarında derin ilişkiler var.',
    newspaperHeadline: 'Karanlık Sermaye Piyasaya Girdi: Emniyet Tetikte!',
    durationLaps: 6,
    actionHandler: 'DARK_CONSORTIUM',
    optionA: {
      label: 'Parayı kabul et ve kasayı rahatlat',
      description: 'Anında 200.000 TL nakit girer, sonraki 6 zar atışında %20 polis riski başlar.',
      actionType: 'DARK_CONSORTIUM_A'
    },
    optionB: {
      label: 'Teklifi reddet',
      description: 'Para almazsın, 3 tur boyunca başlangıç bonusun %8\'e yükselir.',
      actionType: 'DARK_CONSORTIUM_B'
    }
  },
  {
    id: 7,
    title: 'Gayrimenkul Varlık Vergisi',
    description: 'Maliye, zengin mülk sahiplerinden dönemsel bir servet ve denge vergisi alınacağını duyurdu.',
    newspaperHeadline: 'Hükümetten Yeni Servet Vergisi: Mülk Sahipleri İsyanda!',
    durationLaps: 0,
    actionHandler: 'WEALTH_TAX',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Sahip olduğun her tapu başına devlete 10.000 TL zorunlu vergi ödersin.',
      actionType: 'WEALTH_TAX'
    },
    optionB: null
  },
  {
    id: 8,
    title: 'Belediye İmar Denetimi',
    description: 'Büyükşehir Belediyesi mülklerinizin bulunduğu bölgelerde ani bir imar teftişi başlattı.',
    newspaperHeadline: 'Belediyeden İmar Şoku: Kaçak Yapılara Ceza Yağdı!',
    durationLaps: 0,
    actionHandler: 'MUNICIPAL_AUDIT',
    optionA: {
      label: 'Belediyeye rüşvet verip raporu kapattır',
      description: 'Orta düzey nakit ödersin, olay kapanır.',
      actionType: 'MUNICIPAL_AUDIT_A'
    },
    optionB: {
      label: 'Cezayı resmi yoldan öde',
      description: 'Sahip olduğun her mülk başına 7.500 TL çevre cezası ödersin.',
      actionType: 'MUNICIPAL_AUDIT_B'
    }
  },
  {
    id: 9,
    title: 'Yıl Sonu Temettü Ödemesi',
    description: 'Şirketin borsadaki hisseleri yıl sonunda yatırımcılarına kâr payı dağıtma kararı aldı.',
    newspaperHeadline: 'Borsada Temettü Rüzgarı: Yatırımcılara Dev Kâr Payı!',
    durationLaps: 0,
    actionHandler: 'DIVIDEND_PAYOUT',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Mal varlığın 450.000 TL altı ise 40.000 TL, üstü ise 100.000 TL temettü kazanırsın.',
      actionType: 'DIVIDEND_PAYOUT'
    },
    optionB: null
  },
  {
    id: 10,
    title: 'Gizli İhale Bilgisi',
    description: 'Özelleştirilecek devlet arazileri hakkında çok gizli bir ihale bilgisi elinize geçti.',
    newspaperHeadline: 'Özelleştirme İhalesinde Gizli Bilgi Sızdı!',
    durationLaps: 1,
    actionHandler: 'SECRET_TENDER',
    optionA: {
      label: 'Bilgiyi kullanıp yeri piyasa fiyatına direkt al',
      description: '%60 ihtimalle hapse girersin ve 100.000 TL ceza ödersin.',
      actionType: 'SECRET_TENDER_A'
    },
    optionB: {
      label: 'Etik davran, bilgiyi imha et ve ihbar et',
      description: '30.000 TL ödül alırsın ve o yer tüm masanın katılabileceği açık artırmaya çıkar.',
      actionType: 'SECRET_TENDER_B'
    }
  },
  {
    id: 11,
    title: 'Ani Maliye Baskını',
    description: 'Hazine ve Maliye Bakanlığı denetimleri sıkılaştırdı.',
    newspaperHeadline: 'Maliye Bakanlığı\'ndan Tüm Holdinglere Ani Baskın!',
    durationLaps: 0,
    actionHandler: 'TREASURY_RAID',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Masadaki herkesin kasasından 20.000 TL kesilip Varlık Fonu\'na aktarılır.',
      actionType: 'TREASURY_RAID'
    },
    optionB: null
  },
  {
    id: 12,
    title: 'Ankara\'ya Acil Uçuş',
    description: 'Hükümet projeleri için başkentte acil bir yönetim kurulu toplantısına çağrıldınız.',
    newspaperHeadline: 'Başkentte Kritik Zirve: Bakanlık Liderleri Çağırdı!',
    durationLaps: 0,
    actionHandler: 'ANKARA_FLIGHT',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Doğrudan tahtadaki #38 Ankara karesine ışınlanırsın (Başlangıçtan geçersen bonus alırsın).',
      actionType: 'ANKARA_FLIGHT'
    },
    optionB: null
  },
  {
    id: 13,
    title: 'İşçi Sendikası Grevi',
    description: 'Şirketler grubunuzda çalışan personel toplu iş sözleşmesi için grev oylaması yapıyor.',
    newspaperHeadline: 'Üretim Durdu! Fabrikalarında Hayat Felç',
    durationLaps: 2,
    actionHandler: 'STRIKE_ACTION',
    optionA: {
      label: 'Sendikaya toplu ikramiye öde',
      description: 'Yüksek bir bütçe ödersin, operasyonlar aksamaz.',
      actionType: 'STRIKE_ACTION_A'
    },
    optionB: {
      label: 'Grev yapmalarına izin ver',
      description: '2 tur boyunca mülklerinden hiç kira alamazsın.',
      actionType: 'STRIKE_ACTION_B'
    }
  },
  {
    id: 14,
    title: 'Üstün Hizmet ve Yatırım Teşekkürü',
    description: 'Ülkeye yaptığınız stratejik yatırımlardan dolayı teşekkür ederiz!',
    newspaperHeadline: 'Cumhurbaşkanlığı\'ndan Üstün Hizmet ve Yatırım Ödülü!',
    durationLaps: 0,
    actionHandler: 'STATE_THANKS',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Kasana anında 75.000 TL nakit hibe eklenir.',
      actionType: 'STATE_THANKS'
    },
    optionB: null
  },
  {
    id: 15,
    title: 'Offshore Kaçamağı',
    description: 'Yurt dışındaki gizli hesaplarınıza büyük bir transfer yapmayı planlıyorsunuz.',
    newspaperHeadline: 'Uluslararası Para Kaçakçılığı Operasyonu Başlatıldı!',
    durationLaps: 2,
    actionHandler: 'OFFSHORE_TRANSFER',
    optionA: {
      label: 'Transferi yasal yoldan yap, vergisini öde',
      description: 'Küçük yasal kesinti ödersin, kafan rahat olur.',
      actionType: 'OFFSHORE_TRANSFER_A'
    },
    optionB: {
      label: 'Parayı kaçak yolla geçir',
      description: '%40 hapis riski ve 2 tur boyunca tahtadaki gelirlerin %60 düşer.',
      actionType: 'OFFSHORE_TRANSFER_B'
    }
  },
  {
    id: 16,
    title: 'Kritik İş Görüşmesi ve Rota Oyunu',
    description: 'Şehircilikte acil iş görüşmesi teklifi aldın, rakip firmanın şoförüne rüşvet verip rotasını karıştırabilirsin.',
    newspaperHeadline: 'Sürücü Skandalı: İş İnsanları Yolda Yer Değiştirdi!',
    durationLaps: 0,
    actionHandler: 'DRIVER_SABOTAGE',
    optionA: {
      label: 'Rüşvet işine bulaşma',
      description: 'Küçük harcama yaparsın, piyonun yerinde kalır.',
      actionType: 'DRIVER_SABOTAGE_A'
    },
    optionB: {
      label: 'Rakip şoförü ayarla, yer değiştir',
      description: 'Tahtadaki istediğin bir oyuncuyla piyon yerini anında karşılıklı değiştirirsin.',
      actionType: 'DRIVER_SABOTAGE_B'
    }
  },
  {
    id: 17,
    title: 'İmar Planı Revizyonu',
    description: 'Büyükşehir Belediyesi mülklerinizin bulunduğu bölgede ani bir imar revizyonuna gitti.',
    newspaperHeadline: 'Belediyeden İmar Revizyonu: Tapular Askıya Alındı!',
    durationLaps: 1,
    actionHandler: 'ZONING_REVISION',
    optionA: {
      label: 'Belediyeye proje onayı verdir',
      description: 'Orta düzey harcama yaparsın, durumun etkilenmez.',
      actionType: 'ZONING_REVISION_A'
    },
    optionB: {
      label: 'Mahkemeye taşı, itiraz et',
      description: '1 tur boyunca mülklerin mühürlenir, hiç kira alamazsın.',
      actionType: 'ZONING_REVISION_B'
    }
  },
  {
    id: 18,
    title: 'Çapraz İttifak',
    description: 'Masadaki rakiplerinizden biriyle gizli bir ticari entrika çevirme fırsatı yakaladınız.',
    newspaperHeadline: 'Büyük İttifak: Rakiplerin Kasasına Çöküldü!',
    durationLaps: 0,
    actionHandler: 'CROSS_ALLIANCE',
    optionA: {
      label: 'Teklifi reddet, kendi yoluna bak',
      description: 'Hiçbir şey değişmez.',
      actionType: 'CROSS_ALLIANCE_A'
    },
    optionB: {
      label: 'Masadaki rakibin kasasından %10 nakit çek',
      description: 'Karşı tarafın kasasından nakit doğrudan sana akar.',
      actionType: 'CROSS_ALLIANCE_B'
    }
  },
  {
    id: 19,
    title: 'Ar-Ge Proje Desteği',
    description: 'Üniversitelerle ortak geliştirdiğiniz teknoloji projesi TÜBİTAK tarafından ödüle layık görüldü.',
    newspaperHeadline: 'TÜBİTAK Ar-Ge Ödülleri Sahiplerini Buldu!',
    durationLaps: 2,
    actionHandler: 'R_D_SUPPORT',
    optionA: {
      label: 'Fona ek bütçe yatır',
      description: 'Sonraki 2 tur boyunca mülk kiraların %30 artar.',
      actionType: 'R_D_SUPPORT_A'
    },
    optionB: {
      label: 'Ödülü doğrudan nakit olarak çek',
      description: 'Anında 40.000 TL nakit kazanırsın.',
      actionType: 'R_D_SUPPORT_B'
    }
  },
  {
    id: 20,
    title: 'Düşman Mülklerine Sızma',
    description: 'Rakip holdingin zayıf anını yakalayıp mülkleri üzerinde gizli bir operasyon başlatma şansı doğdu.',
    newspaperHeadline: 'Büyük Sızma: Şehir Geçici Süre Kapatıldı',
    durationLaps: 1,
    actionHandler: 'HOSTILE_TAKEOVER',
    optionA: {
      label: 'Operasyonu iptal et',
      description: 'Risksiz devam edersin.',
      actionType: 'HOSTILE_TAKEOVER_A'
    },
    optionB: {
      label: 'Rakip mülkü bloke et',
      description: 'Seçilen mülk 1 tur mühürlenir, sahibi gelir alamaz.',
      actionType: 'HOSTILE_TAKEOVER_B'
    }
  },
  {
    id: 21,
    title: 'Yol Geçici Süre Kapalı',
    description: 'Karayolları Genel Müdürlüğü\'nün ani altyapı çalışması nedeniyle ana güzergah tamamen ulaşıma kapatıldı.',
    newspaperHeadline: 'Yol Geçici Süre Kapalı: Ulaşımda Büyük Aksamalar!',
    durationLaps: 1,
    actionHandler: 'ROAD_BLOCK',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Piyonun olduğu yerde kilitlenir; sonraki turda ilk zar atışını yapsan bile piyonu hareket ettiremezsin, turunu pas geçersin.',
      actionType: 'ROAD_BLOCK'
    },
    optionB: null
  },
  {
    id: 22,
    title: 'Basın Konseyi ile Gizli Zirve',
    description: 'Hakkınızda çıkabilecek olası skandal dosyaları masaya gelmeden önce medyayı kontrol altına alabilirsiniz.',
    newspaperHeadline: 'Basın Konseyi\'nden Gizli Zirve Açıklaması!',
    durationLaps: 1,
    actionHandler: 'PRESS_SUMMIT',
    optionA: {
      label: 'Medya patronlarına bütçe akıtıp dosyaları imha ettir',
      description: 'Sonraki şans kartındaki negatif ceza veya hapis riskini tamamen engeller ve sıfırlarsın.',
      actionType: 'PRESS_SUMMIT_A'
    },
    optionB: {
      label: 'Riski göze al, para verme',
      description: 'Normal akışta devam edersin.',
      actionType: 'PRESS_SUMMIT_B'
    }
  },
  {
    id: 23,
    title: 'Rakip Şirkete Maliye Markajı',
    description: 'Maliye bakanlığındaki köprüleriniz sayesinde rakip holding üzerine ani denetim kurulu gönderme imkanınız var.',
    newspaperHeadline: 'Maliye Bakanlığı\'ndan Rakip Holdinglere Markaj!',
    durationLaps: 1,
    actionHandler: 'TAX_MARKET',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Masadaki rastgele bir rakip oyuncu 1 tur boyunca bankadan kredi çekemez ve otel dikemez.',
      actionType: 'TAX_MARKET'
    },
    optionB: null
  },
  {
    id: 24,
    title: 'Düşman Mülkünü Zorla İhaleye Çıkarma',
    description: 'Rakip holdingin zayıflığını yakaladın ve mülklerinden birini zorla masaya sürme şansı elde ettin.',
    newspaperHeadline: 'Düşman Hatlarında Şok İhale: Rakip Mülk Masaya Sürüldü!',
    durationLaps: 0,
    actionHandler: 'FORCED_AUCTION',
    optionA: {
      label: 'Bu hamleyi pas geç',
      description: 'Risksiz devam edersin.',
      actionType: 'FORCED_AUCTION_A'
    },
    optionB: {
      label: 'Rakip mülkü masaya açık artırmaya sür',
      description: 'Seçilen rakip mülk sahibinin rızası olmadan açık artırmaya çıkarılır.',
      actionType: 'FORCED_AUCTION_B'
    }
  },
  {
    id: 25,
    title: 'Şirketler Arası Lojistik Abluka',
    description: 'Rakip oyuncunun ana sevkiyat güzergahını abluka altına alıp geçişini kısıtlayabilirsin.',
    newspaperHeadline: 'Lojistik Savaş: Rakibe Yol Kesildi!',
    durationLaps: 1,
    actionHandler: 'LOGISTICS_BLOCKADE',
    optionA: {
      label: 'Ambargoyu uygulama',
      description: 'Pas geçersin.',
      actionType: 'LOGISTICS_BLOCKADE_A'
    },
    optionB: {
      label: 'Rakip piyonuna ambargo koy',
      description: 'Rakip ilerlemeden önce sana haraç ödemek zorunda kalır.',
      actionType: 'LOGISTICS_BLOCKADE_B'
    }
  },
  {
    id: 26,
    title: 'Piyasada Hedef Gösterme ve Çift Kira Darbesi',
    description: 'Masadaki bir oyuncuyu ifşa ederek piyasanın ve mülk sahiplerinin baskısını doğrudan onun üzerine çeviriyorsun.',
    newspaperHeadline: 'Piyasada Cadı Avı: Rakip Çift Kira Tuzağına Düşürüldü!',
    durationLaps: 1,
    actionHandler: 'DOUBLE_RENT_TARGET',
    optionA: {
      label: 'Sessiz kal, dikkat çekme',
      description: 'Pas.',
      actionType: 'DOUBLE_RENT_TARGET_A'
    },
    optionB: {
      label: 'Rakibi hedef göster',
      description: 'Hedef alınan oyuncu 1 tur boyunca ödediği kiranın bir o kadarını da senin kasana öder (Toplam 2x).',
      actionType: 'DOUBLE_RENT_TARGET_B'
    }
  },
  {
    id: 27,
    title: 'Gizli Dosya Sızdırma ve Şantaj',
    description: 'Rakip bir CEO\'nun geçmişteki karanlık ticari ilişkilerini ve gizli transferlerini ele geçirdin.',
    newspaperHeadline: 'CEO Savaşları: Gizli Dosyalar Ortalığa Saçıldı!',
    durationLaps: 0,
    actionHandler: 'BLACKMAIL',
    optionA: {
      label: 'Dosyaları imha et',
      description: 'Pas.',
      actionType: 'BLACKMAIL_A'
    },
    optionB: {
      label: 'Dosyayı masaya sür',
      description: 'Rakip kasasındaki nakdin %15\'ini kendi kasana zorla transfer edersin.',
      actionType: 'BLACKMAIL_B'
    }
  },
  {
    id: 28,
    title: 'Büyük İhale Operasyonu',
    description: 'Şehirdeki en değerli arsa ihalesi öncesinde rakip firmanın teklif zarfını manipüle etme şansın var.',
    newspaperHeadline: 'İhale Masasında Büyük Skandal: Zarf Krizi!',
    durationLaps: 1,
    actionHandler: 'TENDER_SABOTAGE',
    optionA: {
      label: 'Riskli işlere bulaşma',
      description: 'Hiçbir şey değişmez.',
      actionType: 'TENDER_SABOTAGE_A'
    },
    optionB: {
      label: 'Rakibin teklif zarfını karıştır',
      description: 'Seçilen rakip oyuncu sonraki ilk ihale veya açık artırma hakkından mahrum kalır.',
      actionType: 'TENDER_SABOTAGE_B'
    }
  },
  {
    id: 29,
    title: 'Hissedar Darbesi ve Zorunlu Takas',
    description: 'Elindeki gizli hisse senetleriyle rakip şirketin yönetim kurulunu abluka altına alıp mülk değişimi dayatabilirsin.',
    newspaperHeadline: 'Yönetim Kurulunda Şok Darbe: Tapular Havada Uçuştu!',
    durationLaps: 0,
    actionHandler: 'FORCED_SWAP',
    optionA: {
      label: 'Bu riske girme',
      description: 'Pas.',
      actionType: 'FORCED_SWAP_A'
    },
    optionB: {
      label: 'Rakiple mülkünü zorla takas et',
      description: 'Rakibin mülkü ile senin mülkün karşılıklı zorunlu değiştirilir.',
      actionType: 'FORCED_SWAP_B'
    }
  },
  {
    id: 30,
    title: 'Mahkemeden İhtiyati Tedbir Kararı',
    description: 'Hakkınızda açılan ticari bir dava nedeniyle mahkeme varlıklarınız üzerine geçici tedbir koydu.',
    newspaperHeadline: 'Ticari Mahkemeden Şok Karar: Varlıklara Tedbir Konuldu!',
    durationLaps: 1,
    actionHandler: 'INJUNCTION',
    optionA: {
      label: 'Uygula',
      description: 'Rastgele bir rakibin en değerli mülkü 1 tur dondurulur; ev/otel dikemez, gelir alamaz.',
      actionType: 'INJUNCTION_A'
    },
    optionB: null
  },
  {
    id: 31,
    title: 'Gizli Blokaj ve Kredi Kapama',
    description: 'Bankacılık sistemi üzerindeki nüfuzunu kullanarak rakip bir oyuncunun likidite akışını kesebilirsin.',
    newspaperHeadline: 'Bankacılıkta Şok Operasyon: Rakibin Kredi Musluğu Kesildi!',
    durationLaps: 1,
    actionHandler: 'CREDIT_BLOCK',
    optionA: {
      label: 'Bulaşma',
      description: 'Pas.',
      actionType: 'CREDIT_BLOCK_A'
    },
    optionB: {
      label: 'Rakibin banka işlemlerini bloke et',
      description: 'Seçilen rakip 1 tur boyunca bankadan kredi çekemez ve ipotek bozduramaz.',
      actionType: 'CREDIT_BLOCK_B'
    }
  },
  {
    id: 32,
    title: 'Gizli Komisyon Vurgunu',
    description: 'Şehirdeki gayrimenkul transferlerini arkadan yöneterek mülk satışlarından komisyon koparabilirsin.',
    newspaperHeadline: 'Gayrimenkul Piyasasında Komisyon Vurgunu Başladı!',
    durationLaps: 1,
    actionHandler: 'COMMISSION_RAID',
    optionA: {
      label: 'Dürüst ol',
      description: 'Pas.',
      actionType: 'COMMISSION_RAID_A'
    },
    optionB: {
      label: 'Komisyon ağı kur',
      description: 'Seçilen rakibin sonraki ilk mülk satın alımında ödediği bedelin %20\'si komisyon olarak sana akar.',
      actionType: 'COMMISSION_RAID_B'
    }
  },
  {
    id: 33,
    title: 'Şüpheli Kredi ve Zorunlu İpotek',
    description: 'Bankacılık açıklarıyla rakip mülkünü zorla ipoteğe düşürebilirsin.',
    newspaperHeadline: 'Bankacılıkta Şok Operasyon: Rakip Tapular Zorunlu İpotekte!',
    durationLaps: 1,
    actionHandler: 'FORCED_MORTGAGE',
    optionA: {
      label: 'Bulaşma',
      description: 'Pas.',
      actionType: 'FORCED_MORTGAGE_A'
    },
    optionB: {
      label: 'Rakip mülkünü ipoteğe düşür',
      description: 'Seçilen mülk 1 tur mühürlenir, sahibi gelir alamaz ve ipoteği kaldıramaz.',
      actionType: 'FORCED_MORTGAGE_B'
    }
  },
  {
    id: 34,
    title: 'Özel Jet Filosu ile Rota Değişikliği',
    description: 'Özel uçuş izinleri onaylandı. Trafiğe takılmadan tahtada stratejik bir hamle yapabilirsin.',
    newspaperHeadline: 'Özel Jetlerle Hızlı Konumlanma: Harita Değişti!',
    durationLaps: 0,
    actionHandler: 'PRIVATE_JET_JUMP',
    optionA: {
      label: 'Normal akışa devam et',
      description: 'Normal ilerlersin.',
      actionType: 'PRIVATE_JET_JUMP_A'
    },
    optionB: {
      label: 'Özel jeti kullan',
      description: 'Tahtadaki en yakın boş arsa veya tesise ışınlanır ve doğrudan satın alma hakkı kazanırsın.',
      actionType: 'PRIVATE_JET_JUMP_B'
    }
  },
  {
    id: 35,
    title: 'Stratejik İstihbarat ve Çift Zar',
    description: 'Casusluk ağınız sayesinde önümüzdeki tur piyasanın hareketlerini ve zar atış sonuçlarını önceden manipüle edebilirsin.',
    newspaperHeadline: 'Gizli İstihbaratla Tam İsabet: Piyasayı Önceden Okudular!',
    durationLaps: 1,
    actionHandler: 'INTEL_DOUBLE_DICE',
    optionA: {
      label: 'İstihbaratla uğraşma',
      description: 'Normal akış.',
      actionType: 'INTEL_DOUBLE_DICE_A'
    },
    optionB: {
      label: 'İstihbarat avantajını kullan',
      description: 'Sonraki tur zar atarken zarları manuel olarak çift 6 (12) kabul edip ilerleme hakkı kazanırsın.',
      actionType: 'INTEL_DOUBLE_DICE_B'
    }
  },
  {
    id: 36,
    title: 'Mega Konsorsiyum Fonu',
    description: 'Piyasada dev bir ortaklık dalgası başlattın. Tüm oyuncuların katılabileceği özel fon kuruluyor.',
    newspaperHeadline: 'Mega Konsorsiyum Kuruldu: Sermaye Dağılımı Yeniden Şekillendi!',
    durationLaps: 0,
    actionHandler: 'MEGA_CONSORTIUM_FUND',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Masadaki tüm oyuncular cüzi katkı yapar; toplanan devasa para tahtada en az mülke sahip dezavantajlı oyuncuya hibe edilir.',
      actionType: 'MEGA_CONSORTIUM_FUND'
    },
    optionB: null
  },
  {
    id: 37,
    title: 'Çapraz Ortaklık Dayatması',
    description: 'Güç dengelerini kendi lehine çevirmek için masadaki bir rakiple zorunlu ortaklık imzalayabilirsin.',
    newspaperHeadline: 'İş Dünyasında Beklenmedik Evlilik: Zorunlu Ortaklık Başladı!',
    durationLaps: 1,
    actionHandler: 'FORCED_PARTNERSHIP',
    optionA: {
      label: 'Reddet',
      description: 'Pas.',
      actionType: 'FORCED_PARTNERSHIP_A'
    },
    optionB: {
      label: 'Zorunlu ortaklık kur',
      description: 'Seçilen rakip oyuncunun topladığı tüm kiraların %30\'u 1 tur boyunca senin kasana akar.',
      actionType: 'FORCED_PARTNERSHIP_B'
    }
  },
  {
    id: 38,
    title: 'Uluslararası Endüstri Fuarı ve Lansman',
    description: 'Şehrin merkezinde dev bir uluslararası fuar düzenleniyor.',
    newspaperHeadline: 'Endüstri Fuarlarında Görkemli Lansman: Yeni Tesisler Yükseldi!',
    durationLaps: 0,
    actionHandler: 'INDUSTRIAL_FAIR',
    optionA: {
      label: 'Fuar maliyetine girme',
      description: 'Pas.',
      actionType: 'INDUSTRIAL_FAIR_A'
    },
    optionB: {
      label: 'Bütçeyle fuara sponsor ol',
      description: 'Tahtadaki istediğin bir mülküne normal inşaat maliyeti ödemeden anında 1 bina dik.',
      actionType: 'INDUSTRIAL_FAIR_B'
    }
  },
  {
    id: 39,
    title: 'Borsada Açığa Satış Vurgunu',
    description: 'Borsadaki ani dalgalanmalardan yararlanarak düşüşe oynadın ve riskli bir finansal manevra yaptın.',
    newspaperHeadline: 'Borsada Açığa Satış Vurgunu: Ciro Patladı, Rota Değişti!',
    durationLaps: 0,
    actionHandler: 'SHORT_SELLING',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Kasana anında 60.000 TL nakit girer, ancak piyonun tahtada geriye doğru 2 kare zorunlu adım atar.',
      actionType: 'SHORT_SELLING'
    },
    optionB: null
  },
  {
    id: 40,
    title: 'Gizli Ar-Ge Laboratuvarı Ortaklığı',
    description: 'Rakip bir oyuncunun bölgesinde yürüttüğü gizli Ar-Ge projesine sonradan ortak olma şansı yakaladın.',
    newspaperHeadline: 'Ar-Ge Masasında Ortaklık Krizi: Gelirler Bölündü!',
    durationLaps: 1,
    actionHandler: 'SECRET_RD_PARTNER',
    optionA: {
      label: 'Teklifi reddet',
      description: 'Pas.',
      actionType: 'SECRET_RD_PARTNER_A'
    },
    optionB: {
      label: 'Projeye zorla ortak ol',
      description: 'Rakip oyuncunun tesisinden sonraki tur geleceği gelirin yarısını kendi kasana yönlendirirsin.',
      actionType: 'SECRET_RD_PARTNER_B'
    }
  },
  {
    id: 41,
    title: 'Yüksek Hızlı Tren Projesi Hizmette',
    description: 'Ulaştırma Bakanlığı\'nın yeni yüksek hızlı tren hatları devreye girdi.',
    newspaperHeadline: 'Hızlı Tren Hatları Açıldı: Ticarette Ulaşım Hızlandı!',
    durationLaps: 0,
    actionHandler: 'HIGH_SPEED_TRAIN',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Piyonun tahtada doğrudan bir sonraki Başlangıç veya en yakın şirket karesine doğru ilerler.',
      actionType: 'HIGH_SPEED_TRAIN'
    },
    optionB: null
  },
  {
    id: 42,
    title: 'Ankara\'da Lobicilik Faaliyeti',
    description: 'Piyasada esen olumsuz rüzgarlara karşı başkentte güçlü bir lobicilik faaliyeti yürütebilirsin.',
    newspaperHeadline: 'Ankara’da Güçlü Lobi Faaliyeti: Krizler Savuşturuldu!',
    durationLaps: 2,
    actionHandler: 'LOBBYING_SHIELD',
    optionA: {
      label: 'Yatırım yapma',
      description: 'Pas.',
      actionType: 'LOBBYING_SHIELD_A'
    },
    optionB: {
      label: 'Güçlü bir lobi kur',
      description: '2 tur boyunca gelebilecek tüm negatif şans kartı etkilerini veya sabotajları engeller.',
      actionType: 'LOBBYING_SHIELD_B'
    }
  },
  {
    id: 43,
    title: 'İpotekli Varlıkta Acil Satış Operasyonu',
    description: 'Rakip bir oyuncunun sıkışıp ipoteğe attığı değerli bir mülkü el altından kendi üzerinize geçirebilirsiniz.',
    newspaperHeadline: 'El Sıkışma Krizi: İpotekli Tapu El Değiştirdi!',
    durationLaps: 0,
    actionHandler: 'BUY_MORTGAGED_PROPERTY',
    optionA: {
      label: 'Fırsatı pas geç',
      description: 'Pas.',
      actionType: 'BUY_MORTGAGED_PROPERTY_A'
    },
    optionB: {
      label: 'Rakibin ipotekli mülkünü zorla satın al',
      description: 'Seçilen ipotekli mülk piyasa bedelinin altında senin tapularına eklenir.',
      actionType: 'BUY_MORTGAGED_PROPERTY_B'
    }
  },
  {
    id: 44,
    title: 'Düzenleyici Kurum Baskısı',
    description: 'Masadaki bir rakibin en karlı mülkünü denetime sokarak geçici süre kilitleyebilirsin.',
    newspaperHeadline: 'Düzenleyici Kurumdan Şok Baskın: Tesisler Denetimde!',
    durationLaps: 1,
    actionHandler: 'REGULATORY_PRESSURE',
    optionA: {
      label: 'Pas geç',
      description: 'Pas.',
      actionType: 'REGULATORY_PRESSURE_A'
    },
    optionB: {
      label: 'Rakip mülkü denetime sok',
      description: 'Seçilen rakip mülk 1 tur boyunca kilitlenir, gelir getirmez.',
      actionType: 'REGULATORY_PRESSURE_B'
    }
  },
  {
    id: 45,
    title: 'İşletme Kiralama Sözleşmesi',
    description: 'Masadaki bir işletme sahibinin tesisini belirli bir süreyle kiralayıp gelirine ortak olabilirsin.',
    newspaperHeadline: 'Dev Kiralama Sözleşmesi: İşletme Hakları Devredildi!',
    durationLaps: 5,
    actionHandler: 'LEASE_BUSINESS',
    optionA: {
      label: 'Kiralama',
      description: 'Pas.',
      actionType: 'LEASE_BUSINESS_A'
    },
    optionB: {
      label: 'Tesisini 5 turuna kirala',
      description: '100.000 TL kira bedeli ödeyerek 5 tur boyunca seçilen tesisin gelirine ortak olursun.',
      actionType: 'LEASE_BUSINESS_B'
    }
  },
  {
    id: 46,
    title: 'Piyasa Dayanışma Fonu',
    description: 'Piyasada geride kalan şirketler için acil dayanışma fonu devreye sokuldu.',
    newspaperHeadline: 'Piyasada Dayanışma Rüzgarı: Geride Kalanlara Destek Fonu!',
    durationLaps: 0,
    actionHandler: 'SOLIDARITY_FUND',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Masadaki en düşük mal varlığına sahip olan oyuncuya herkes zorunlu olarak 70.000\'er TL nakit aktarır.',
      actionType: 'SOLIDARITY_FUND'
    },
    optionB: null
  },
  {
    id: 47,
    title: 'Çift Yönlü Komisyon Ağı',
    description: 'Bir kişiyi seçip devlet ödemelerinden ve kira akışından komisyon koparacak bir ağ kurabilirsin.',
    newspaperHeadline: 'Gölge Komisyon Ağı Kuruldu: Para Trafiği Değişti!',
    durationLaps: 3,
    actionHandler: 'DUAL_COMMISSION_NETWORK',
    optionA: {
      label: 'Kurma',
      description: 'Pas.',
      actionType: 'DUAL_COMMISSION_NETWORK_A'
    },
    optionB: {
      label: 'Komisyon ağını kur',
      description: '3 tur boyunca seçilen kişinin devlete ödediği arsa bedelinin %20\'si ve ona ödenen kiraların %30\'u sana gelir.',
      actionType: 'DUAL_COMMISSION_NETWORK_B'
    }
  },
  {
    id: 48,
    title: 'Sızdırılan Finansal Raporlar',
    description: 'Bilgi işlem departmanınız tüm masanın gizli varlıklarını deşifre eden bir raporu sızdırdı.',
    newspaperHeadline: 'Büyük Sızıntı: Tüm Şirketlerin Gizli Bilgileri Ortaya Saçıldı!',
    durationLaps: 3,
    actionHandler: 'LEAK_FINANCIAL_REPORTS',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: '3 tur boyunca bütün oyuncular herkesin anlık parasını ve tapu varlıklarını açıkça görebilir.',
      actionType: 'LEAK_FINANCIAL_REPORTS'
    },
    optionB: null
  },
  {
    id: 49,
    title: 'Yönetim Kurulu Acil Zirve Daveti',
    description: 'Kendi genel merkezinde acil bir zirve toplayarak masadaki bir rakibi doğrudan yanına getirtebilirsin.',
    newspaperHeadline: 'Acil Zirve Toplantısı: Rakipler Aynı Masada Buluştu!',
    durationLaps: 0,
    actionHandler: 'SUMMON_PLAYER',
    optionA: {
      label: 'Zirve düzenleme',
      description: 'Pas.',
      actionType: 'SUMMON_PLAYER_A'
    },
    optionB: {
      label: 'Rakibi yanına ışınla',
      description: 'Masadaki istediğin bir rakip oyuncunun piyonunu doğrudan senin bulunduğun kareye ışınlarsın.',
      actionType: 'SUMMON_PLAYER_B'
    }
  },
  {
    id: 50,
    title: 'Teşvikli Bedelsiz Otel Yatırımı',
    description: 'Hükümet sanayi ve turizm yatırımları için hiçbir ücret alınmayacak bir otel teşviki açıkladı.',
    newspaperHeadline: 'Devletten Turizm ve Sanayi Hamlesi: Bedelsiz Otel Teşviki!',
    durationLaps: 0,
    actionHandler: 'FREE_HOTEL_BUILD',
    isNoOption: true,
    optionA: {
      label: 'Tamam • Doğrudan Uygula',
      description: 'Kartı çeken oyuncu hiçbir ücret ödemeden sahip olduğu en düşük seviyeli/değerli şehrine doğrudan 1 adet otel diker.',
      actionType: 'FREE_HOTEL_BUILD'
    },
    optionB: null
  },
];

export default CHANCE_CARDS;
