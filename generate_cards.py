import json

raw_json = {
  "chanceCards": [
    {
      "id": 1,
      "title": "Maliye Bakanlığı Teftişi",
      "type": "choice",
      "description": "Şirket hesaplarında yapılan yüksek tutarlı transferler Maliye'nin dikkatini çekti.",
      "actionHandler": "TAX_AUDIT",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Rüşvet verip dosyayı kapattır", "effect": "Sabit nakit öder, olay kapanır, haber çıkmaz." },
        "B": { "text": "Resmi sürece git, mahkemeye taşı", "effect": "1 tur gelir %40 düşer, %30 hapis riski oluşur." }
      },
      "newspaperHeadline": "Şirket Hakkında Vergi Kaçakçılığı Soruşturması Başlatıldı"
    },
    {
      "id": 2,
      "title": "Kara Propaganda",
      "type": "choice",
      "description": "Rakip bir grup, şirketiniz hakkında piyasaya yalan yanlış haberler sızdırdı. Yatırımcılar panik halinde.",
      "actionHandler": "BLACK_PROPAGANDA",
      "durationLaps": 3,
      "options": {
        "A": { "text": "Haber ajansına büyük bütçe döküp kampanyayı sustur", "effect": "Yüksek sabit nakit öder, olay kapanır." },
        "B": { "text": "Sessiz kal, iftirayı önemseme", "effect": "3 tur boyunca tüm mülklerin kira getirisi %30 düşer." }
      },
      "newspaperHeadline": "İş Dünyasında Şok İddia: Batmanın Eşiğinde mi?"
    },
    {
      "id": 3,
      "title": "Hacker Kurbanı",
      "type": "choice",
      "description": "Rakip holdinglerin tuttuğu hackerlar sunucularınızı şifreledi. Verileri geri almanın tek yolu fidye ödemek.",
      "actionHandler": "HACKER_ATTACK",
      "durationLaps": 0,
      "effect": "Kasandaki nakdin %15'i anında silinir ve Varlık Fonu'na aktarılır.",
      "newspaperHeadline": "Siber Saldırı: Şirket Verileri Fidye İçin Kilitlendi!"
    },
    {
      "id": 4,
      "title": "Teşvik Primi",
      "type": "choice",
      "description": "Yaptığınız yatırımlar devletin dikkatini çekti. Yerli üretim teşvik ödülü kazandınız.",
      "actionHandler": "SUBSIDY_BONUS",
      "durationLaps": 0,
      "effect": "Sahip olduğun her şehir tapusu başına devlet kasasından 20.000 TL ödül alırsın.",
      "newspaperHeadline": "Sanayi Bakanlığı'ndan Yerli Üreticilere Büyük Teşvik!"
    },
    {
      "id": 5,
      "title": "Lojistik Maliyetleri Patladı",
      "type": "choice",
      "description": "Uluslararası krize bağlı olarak nakliye ve operasyon giderleri aniden arttı.",
      "actionHandler": "LOGISTICS_COST",
      "durationLaps": 0,
      "effect": "Sahip olduğun her mülk başına bakım masrafı olarak 5.000 TL kesilir.",
      "newspaperHeadline": "Ulaşım ve Lojistikte Dev Zam: Maliyetler Tavan Yaptı!"
    },
    {
      "id": 6,
      "title": "Karanlık Konsorsiyum",
      "type": "choice",
      "description": "Kaynağı belirsiz bir konsorsiyum şirketine hızlıca nakit enjekte etmek istiyor ancak arkalarında derin ilişkiler var.",
      "actionHandler": "DARK_CONSORTIUM",
      "durationLaps": 6,
      "options": {
        "A": { "text": "Parayı kabul et ve kasayı rahatlat", "effect": "Anında 200.000 TL nakit girer, sonraki 6 zar atışında %20 polis riski başlar." },
        "B": { "text": "Teklifi reddet", "effect": "Para almazsın, 3 tur boyunca başlangıç bonusun %8'e yükselir." }
      },
      "newspaperHeadline": "Karanlık Sermaye Piyasaya Girdi: Emniyet Tetikte!"
    },
    {
      "id": 7,
      "title": "Gayrimenkul Varlık Vergisi",
      "type": "choice",
      "description": "Maliye, zengin mülk sahiplerinden dönemsel bir servet ve denge vergisi alınacağını duyurdu.",
      "actionHandler": "WEALTH_TAX",
      "durationLaps": 0,
      "effect": "Sahip olduğun her tapu başına devlete 10.000 TL zorunlu vergi ödersin.",
      "newspaperHeadline": "Hükümetten Yeni Servet Vergisi: Mülk Sahipleri İsyanda!"
    },
    {
      "id": 8,
      "title": "Belediye İmar Denetimi",
      "type": "choice",
      "description": "Büyükşehir Belediyesi mülklerinizin bulunduğu bölgelerde ani bir imar teftişi başlattı.",
      "actionHandler": "MUNICIPAL_AUDIT",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Belediyeye rüşvet verip raporu kapattır", "effect": "Orta düzey nakit ödersin, olay kapanır." },
        "B": { "text": "Cezayı resmi yoldan öde", "effect": "Sahip olduğun her mülk başına 7.500 TL çevre cezası ödersin." }
      },
      "newspaperHeadline": "Belediyeden İmar Şoku: Kaçak Yapılara Ceza Yağdı!"
    },
    {
      "id": 9,
      "title": "Yıl Sonu Temettü Ödemesi",
      "type": "choice",
      "description": "Şirketin borsadaki hisseleri yıl sonunda yatırımcılarına kâr payı dağıtma kararı aldı.",
      "actionHandler": "DIVIDEND_PAYOUT",
      "durationLaps": 0,
      "effect": "Mal varlığın 450.000 TL altı ise 40.000 TL, üstü ise 100.000 TL temettü kazanırsın.",
      "newspaperHeadline": "Borsada Temettü Rüzgarı: Yatırımcılara Dev Kâr Payı!"
    },
    {
      "id": 10,
      "title": "Gizli İhale Bilgisi",
      "type": "choice",
      "description": "Özelleştirilecek devlet arazileri hakkında çok gizli bir ihale bilgisi elinize geçti.",
      "actionHandler": "SECRET_TENDER",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Bilgiyi kullanıp yeri piyasa fiyatına direkt al", "effect": "%60 ihtimalle hapse girersin ve 100.000 TL ceza ödersin." },
        "B": { "text": "Etik davran, bilgiyi imha et ve ihbar et", "effect": "30.000 TL ödül alırsın ve o yer tüm masanın katılabileceği açık artırmaya çıkar." }
      },
      "newspaperHeadline": "Özelleştirme İhalesinde Gizli Bilgi Sızdı!"
    },
    {
      "id": 11,
      "title": "Ani Maliye Baskını",
      "type": "choice",
      "description": "Hazine ve Maliye Bakanlığı denetimleri sıkılaştırdı.",
      "actionHandler": "TREASURY_RAID",
      "durationLaps": 0,
      "effect": "Masadaki herkesin kasasından 20.000 TL kesilip Varlık Fonu'na aktarılır.",
      "newspaperHeadline": "Maliye Bakanlığı'ndan Tüm Holdinglere Ani Baskın!"
    },
    {
      "id": 12,
      "title": "Ankara'ya Acil Uçuş",
      "type": "choice",
      "description": "Hükümet projeleri için başkentte acil bir yönetim kurulu toplantısına çağrıldınız.",
      "actionHandler": "ANKARA_FLIGHT",
      "durationLaps": 0,
      "effect": "Doğrudan tahtadaki #38 Ankara karesine ışınlanırsın (Başlangıçtan geçersen bonus alırsın).",
      "newspaperHeadline": "Başkentte Kritik Zirve: Bakanlık Liderleri Çağırdı!"
    },
    {
      "id": 13,
      "title": "İşçi Sendikası Grevi",
      "type": "choice",
      "description": "Şirketler grubunuzda çalışan personel toplu iş sözleşmesi için grev oylaması yapıyor.",
      "actionHandler": "STRIKE_ACTION",
      "durationLaps": 2,
      "options": {
        "A": { "text": "Sendikaya toplu ikramiye öde", "effect": "Yüksek bir bütçe ödersin, operasyonlar aksamaz." },
        "B": { "text": "Grev yapmalarına izin ver", "effect": "2 tur boyunca mülklerinden hiç kira alamazsın." }
      },
      "newspaperHeadline": "Üretim Durdu! Fabrikalarında Hayat Felç"
    },
    {
      "id": 14,
      "title": "Üstün Hizmet ve Yatırım Teşekkürü",
      "type": "choice",
      "description": "Ülkeye yaptığınız stratejik yatırımlardan dolayı teşekkür ederiz!",
      "actionHandler": "STATE_THANKS",
      "durationLaps": 0,
      "effect": "Kasana anında 75.000 TL nakit hibe eklenir.",
      "newspaperHeadline": "Cumhurbaşkanlığı'ndan Üstün Hizmet ve Yatırım Ödülü!"
    },
    {
      "id": 15,
      "title": "Offshore Kaçamağı",
      "type": "choice",
      "description": "Yurt dışındaki gizli hesaplarınıza büyük bir transfer yapmayı planlıyorsunuz.",
      "actionHandler": "OFFSHORE_TRANSFER",
      "durationLaps": 2,
      "options": {
        "A": { "text": "Transferi yasal yoldan yap, vergisini öde", "effect": "Küçük yasal kesinti ödersin, kafan rahat olur." },
        "B": { "text": "Parayı kaçak yolla geçir", "effect": "%40 hapis riski ve 2 tur boyunca tahtadaki gelirlerin %60 düşer." }
      },
      "newspaperHeadline": "Uluslararası Para Kaçakçılığı Operasyonu Başlatıldı!"
    },
    {
      "id": 16,
      "title": "Kritik İş Görüşmesi ve Rota Oyunu",
      "type": "choice",
      "description": "Şehircilikte acil iş görüşmesi teklifi aldın, rakip firmanın şoförüne rüşvet verip rotasını karıştırabilirsin.",
      "actionHandler": "DRIVER_SABOTAGE",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Rüşvet işine bulaşma", "effect": "Küçük harcama yaparsın, piyonun yerinde kalır." },
        "B": { "text": "Rakip şoförü ayarla, yer değiştir", "effect": "Tahtadaki istediğin bir oyuncuyla piyon yerini anında karşılıklı değiştirirsin." }
      },
      "newspaperHeadline": "Sürücü Skandalı: İş İnsanları Yolda Yer Değiştirdi!"
    },
    {
      "id": 17,
      "title": "İmar Planı Revizyonu",
      "type": "choice",
      "description": "Büyükşehir Belediyesi mülklerinizin bulunduğu bölgede ani bir imar revizyonuna gitti.",
      "actionHandler": "ZONING_REVISION",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Belediyeye proje onayı verdir", "effect": "Orta düzey harcama yaparsın, durumun etkilenmez." },
        "B": { "text": "Mahkemeye taşı, itiraz et", "effect": "1 tur boyunca mülklerin mühürlenir, hiç kira alamazsın." }
      },
      "newspaperHeadline": "Belediyeden İmar Revizyonu: Tapular Askıya Alındı!"
    },
    {
      "id": 18,
      "title": "Çapraz İttifak",
      "type": "choice",
      "description": "Masadaki rakiplerinizden biriyle gizli bir ticari entrika çevirme fırsatı yakaladınız.",
      "actionHandler": "CROSS_ALLIANCE",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Teklifi reddet, kendi yoluna bak", "effect": "Hiçbir şey değişmez." },
        "B": { "text": "Masadaki rakibin kasasından %10 nakit çek", "effect": "Karşı tarafın kasasından nakit doğrudan sana akar." }
      },
      "newspaperHeadline": "Büyük İttifak: Rakiplerin Kasasına Çöküldü!"
    },
    {
      "id": 19,
      "title": "Ar-Ge Proje Desteği",
      "type": "choice",
      "description": "Üniversitelerle ortak geliştirdiğiniz teknoloji projesi TÜBİTAK tarafından ödüle layık görüldü.",
      "actionHandler": "R_D_SUPPORT",
      "durationLaps": 2,
      "options": {
        "A": { "text": "Fona ek bütçe yatır", "effect": "Sonraki 2 tur boyunca mülk kiraların %30 artar." },
        "B": { "text": "Ödülü doğrudan nakit olarak çek", "effect": "Anında 40.000 TL nakit kazanırsın." }
      },
      "newspaperHeadline": "TÜBİTAK Ar-Ge Ödülleri Sahiplerini Buldu!"
    },
    {
      "id": 20,
      "title": "Düşman Mülklerine Sızma",
      "type": "choice",
      "description": "Rakip holdingin zayıf anını yakalayıp mülkleri üzerinde gizli bir operasyon başlatma şansı doğdu.",
      "actionHandler": "HOSTILE_TAKEOVER",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Operasyonu iptal et", "effect": "Risksiz devam edersin." },
        "B": { "text": "Rakip mülkü bloke et", "effect": "Seçilen mülk 1 tur mühürlenir, sahibi gelir alamaz." }
      },
      "newspaperHeadline": "Büyük Sızma: Şehir Geçici Süre Kapatıldı"
    },
    {
      "id": 21,
      "title": "Yol Geçici Süre Kapalı",
      "type": "choice",
      "description": "Karayolları Genel Müdürlüğü'nün ani altyapı çalışması nedeniyle ana güzergah tamamen ulaşıma kapatıldı.",
      "actionHandler": "ROAD_BLOCK",
      "durationLaps": 1,
      "effect": "Piyonun olduğu yerde kilitlenir; sonraki turda ilk zar atışını yapsan bile piyonu hareket ettiremezsin, turunu pas geçersin.",
      "newspaperHeadline": "Yol Geçici Süre Kapalı: Ulaşımda Büyük Aksamalar!"
    },
    {
      "id": 22,
      "title": "Basın Konseyi ile Gizli Zirve",
      "type": "choice",
      "description": "Hakkınızda çıkabilecek olası skandal dosyaları masaya gelmeden önce medyayı kontrol altına alabilirsiniz.",
      "actionHandler": "PRESS_SUMMIT",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Medya patronlarına bütçe akıtıp dosyaları imha ettir", "effect": "Sonraki şans kartındaki negatif ceza veya hapis riskini tamamen engeller ve sıfırlarsın." },
        "B": { "text": "Riski göze al, para verme", "effect": "Normal akışta devam edersin." }
      },
      "newspaperHeadline": "Basın Konseyi'nden Gizli Zirve Açıklaması!"
    },
    {
      "id": 23,
      "title": "Rakip Şirkete Maliye Markajı",
      "type": "choice",
      "description": "Maliye bakanlığındaki köprüleriniz sayesinde rakip holding üzerine ani denetim kurulu gönderme imkanınız var.",
      "actionHandler": "TAX_MARKET",
      "durationLaps": 1,
      "effect": "Masadaki rastgele bir rakip oyuncu 1 tur boyunca bankadan kredi çekemez ve otel dikemez.",
      "newspaperHeadline": "Maliye Bakanlığı'ndan Rakip Holdinglere Markaj!"
    },
    {
      "id": 24,
      "title": "Düşman Mülkünü Zorla İhaleye Çıkarma",
      "type": "choice",
      "description": "Rakip holdingin zayıflığını yakaladın ve mülklerinden birini zorla masaya sürme şansı elde ettin.",
      "actionHandler": "FORCED_AUCTION",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Bu hamleyi pas geç", "effect": "Risksiz devam edersin." },
        "B": { "text": "Rakip mülkü masaya açık artırmaya sür", "effect": "Seçilen rakip mülk sahibinin rızası olmadan açık artırmaya çıkarılır." }
      },
      "newspaperHeadline": "Düşman Hatlarında Şok İhale: Rakip Mülk Masaya Sürüldü!"
    },
    {
      "id": 25,
      "title": "Şirketler Arası Lojistik Abluka",
      "type": "choice",
      "description": "Rakip oyuncunun ana sevkiyat güzergahını abluka altına alıp geçişini kısıtlayabilirsin.",
      "actionHandler": "LOGISTICS_BLOCKADE",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Ambargoyu uygulama", "effect": "Pas geçersin." },
        "B": { "text": "Rakip piyonuna ambargo koy", "effect": "Rakip ilerlemeden önce sana haraç ödemek zorunda kalır." }
      },
      "newspaperHeadline": "Lojistik Savaş: Rakibe Yol Kesildi!"
    },
    {
      "id": 26,
      "title": "Piyasada Hedef Gösterme ve Çift Kira Darbesi",
      "type": "choice",
      "description": "Masadaki bir oyuncuyu ifşa ederek piyasanın ve mülk sahiplerinin baskısını doğrudan onun üzerine çeviriyorsun.",
      "actionHandler": "DOUBLE_RENT_TARGET",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Sessiz kal, dikkat çekme", "effect": "Pas." },
        "B": { "text": "Rakibi hedef göster", "effect": "Hedef alınan oyuncu 1 tur boyunca ödediği kiranın bir o kadarını da senin kasana öder (Toplam 2x)." }
      },
      "newspaperHeadline": "Piyasada Cadı Avı: Rakip Çift Kira Tuzağına Düşürüldü!"
    },
    {
      "id": 27,
      "title": "Gizli Dosya Sızdırma ve Şantaj",
      "type": "choice",
      "description": "Rakip bir CEO'nun geçmişteki karanlık ticari ilişkilerini ve gizli transferlerini ele geçirdin.",
      "actionHandler": "BLACKMAIL",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Dosyaları imha et", "effect": "Pas." },
        "B": { "text": "Dosyayı masaya sür", "effect": "Rakip kasasındaki nakdin %15'ini kendi kasana zorla transfer edersin." }
      },
      "newspaperHeadline": "CEO Savaşları: Gizli Dosyalar Ortalığa Saçıldı!"
    },
    {
      "id": 28,
      "title": "Büyük İhale Operasyonu",
      "type": "choice",
      "description": "Şehirdeki en değerli arsa ihalesi öncesinde rakip firmanın teklif zarfını manipüle etme şansın var.",
      "actionHandler": "TENDER_SABOTAGE",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Riskli işlere bulaşma", "effect": "Hiçbir şey değişmez." },
        "B": { "text": "Rakibin teklif zarfını karıştır", "effect": "Seçilen rakip oyuncu sonraki ilk ihale veya açık artırma hakkından mahrum kalır." }
      },
      "newspaperHeadline": "İhale Masasında Büyük Skandal: Zarf Krizi!"
    },
    {
      "id": 29,
      "title": "Hissedar Darbesi ve Zorunlu Takas",
      "type": "choice",
      "description": "Elindeki gizli hisse senetleriyle rakip şirketin yönetim kurulunu abluka altına alıp mülk değişimi dayatabilirsin.",
      "actionHandler": "FORCED_SWAP",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Bu riske girme", "effect": "Pas." },
        "B": { "text": "Rakiple mülkünü zorla takas et", "effect": "Rakibin mülkü ile senin mülkün karşılıklı zorunlu değiştirilir." }
      },
      "newspaperHeadline": "Yönetim Kurulunda Şok Darbe: Tapular Havada Uçuştu!"
    },
    {
      "id": 30,
      "title": "Mahkemeden İhtiyati Tedbir Kararı",
      "type": "choice",
      "description": "Hakkınızda açılan ticari bir dava nedeniyle mahkeme varlıklarınız üzerine geçici tedbir koydu.",
      "actionHandler": "INJUNCTION",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Uygula", "effect": "Rastgele bir rakibin en değerli mülkü 1 tur dondurulur; ev/otel dikemez, gelir alamaz." }
      },
      "newspaperHeadline": "Ticari Mahkemeden Şok Karar: Varlıklara Tedbir Konuldu!"
    },
    {
      "id": 31,
      "title": "Gizli Blokaj ve Kredi Kapama",
      "type": "choice",
      "description": "Bankacılık sistemi üzerindeki nüfuzunu kullanarak rakip bir oyuncunun likidite akışını kesebilirsin.",
      "actionHandler": "CREDIT_BLOCK",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Bulaşma", "effect": "Pas." },
        "B": { "text": "Rakibin banka işlemlerini bloke et", "effect": "Seçilen rakip 1 tur boyunca bankadan kredi çekemez ve ipotek bozduramaz." }
      },
      "newspaperHeadline": "Bankacılıkta Şok Operasyon: Rakibin Kredi Musluğu Kesildi!"
    },
    {
      "id": 32,
      "title": "Gizli Komisyon Vurgunu",
      "type": "choice",
      "description": "Şehirdeki gayrimenkul transferlerini arkadan yöneterek mülk satışlarından komisyon koparabilirsin.",
      "actionHandler": "COMMISSION_RAID",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Dürüst ol", "effect": "Pas." },
        "B": { "text": "Komisyon ağı kur", "effect": "Seçilen rakibin sonraki ilk mülk satın alımında ödediği bedelin %20'si komisyon olarak sana akar." }
      },
      "newspaperHeadline": "Gayrimenkul Piyasasında Komisyon Vurgunu Başladı!"
    },
    {
      "id": 33,
      "title": "Şüpheli Kredi ve Zorunlu İpotek",
      "type": "choice",
      "description": "Bankacılık açıklarıyla rakip mülkünü zorla ipoteğe düşürebilirsin.",
      "actionHandler": "FORCED_MORTGAGE",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Bulaşma", "effect": "Pas." },
        "B": { "text": "Rakip mülkünü ipoteğe düşür", "effect": "Seçilen mülk 1 tur mühürlenir, sahibi gelir alamaz ve ipoteği kaldıramaz." }
      },
      "newspaperHeadline": "Bankacılıkta Şok Operasyon: Rakip Tapular Zorunlu İpotekte!"
    },
    {
      "id": 34,
      "title": "Özel Jet Filosu ile Rota Değişikliği",
      "type": "choice",
      "description": "Özel uçuş izinleri onaylandı. Trafiğe takılmadan tahtada stratejik bir hamle yapabilirsin.",
      "actionHandler": "PRIVATE_JET_JUMP",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Normal akışa devam et", "effect": "Normal ilerlersin." },
        "B": { "text": "Özel jeti kullan", "effect": "Tahtadaki en yakın boş arsa veya tesise ışınlanır ve doğrudan satın alma hakkı kazanırsın." }
      },
      "newspaperHeadline": "Özel Jetlerle Hızlı Konumlanma: Harita Değişti!"
    },
    {
      "id": 35,
      "title": "Stratejik İstihbarat ve Çift Zar",
      "type": "choice",
      "description": "Casusluk ağınız sayesinde önümüzdeki tur piyasanın hareketlerini ve zar atış sonuçlarını önceden manipüle edebilirsin.",
      "actionHandler": "INTEL_DOUBLE_DICE",
      "durationLaps": 1,
      "options": {
        "A": { "text": "İstihbaratla uğraşma", "effect": "Normal akış." },
        "B": { "text": "İstihbarat avantajını kullan", "effect": "Sonraki tur zar atarken zarları manuel olarak çift 6 (12) kabul edip ilerleme hakkı kazanırsın." }
      },
      "newspaperHeadline": "Gizli İstihbaratla Tam İsabet: Piyasayı Önceden Okudular!"
    },
    {
      "id": 36,
      "title": "Mega Konsorsiyum Fonu",
      "type": "choice",
      "description": "Piyasada dev bir ortaklık dalgası başlattın. Tüm oyuncuların katılabileceği özel fon kuruluyor.",
      "actionHandler": "MEGA_CONSORTIUM_FUND",
      "durationLaps": 0,
      "effect": "Masadaki tüm oyuncular cüzi katkı yapar; toplanan devasa para tahtada en az mülke sahip dezavantajlı oyuncuya hibe edilir.",
      "newspaperHeadline": "Mega Konsorsiyum Kuruldu: Sermaye Dağılımı Yeniden Şekillendi!"
    },
    {
      "id": 37,
      "title": "Çapraz Ortaklık Dayatması",
      "type": "choice",
      "description": "Güç dengelerini kendi lehine çevirmek için masadaki bir rakiple zorunlu ortaklık imzalayabilirsin.",
      "actionHandler": "FORCED_PARTNERSHIP",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Reddet", "effect": "Pas." },
        "B": { "text": "Zorunlu ortaklık kur", "effect": "Seçilen rakip oyuncunun topladığı tüm kiraların %30'u 1 tur boyunca senin kasana akar." }
      },
      "newspaperHeadline": "İş Dünyasında Beklenmedik Evlilik: Zorunlu Ortaklık Başladı!"
    },
    {
      "id": 38,
      "title": "Uluslararası Endüstri Fuarı ve Lansman",
      "type": "choice",
      "description": "Şehrin merkezinde dev bir uluslararası fuar düzenleniyor.",
      "actionHandler": "INDUSTRIAL_FAIR",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Fuar maliyetine girme", "effect": "Pas." },
        "B": { "text": "Bütçeyle fuara sponsor ol", "effect": "Tahtadaki istediğin bir mülküne normal inşaat maliyeti ödemeden anında 1 bina dik." }
      },
      "newspaperHeadline": "Endüstri Fuarlarında Görkemli Lansman: Yeni Tesisler Yükseldi!"
    },
    {
      "id": 39,
      "title": "Borsada Açığa Satış Vurgunu",
      "type": "choice",
      "description": "Borsadaki ani dalgalanmalardan yararlanarak düşüşe oynadın ve riskli bir finansal manevra yaptın.",
      "actionHandler": "SHORT_SELLING",
      "durationLaps": 0,
      "effect": "Kasana anında 60.000 TL nakit girer, ancak piyonun tahtada geriye doğru 2 kare zorunlu adım atar.",
      "newspaperHeadline": "Borsada Açığa Satış Vurgunu: Ciro Patladı, Rota Değişti!"
    },
    {
      "id": 40,
      "title": "Gizli Ar-Ge Laboratuvarı Ortaklığı",
      "type": "choice",
      "description": "Rakip bir oyuncunun bölgesinde yürüttüğü gizli Ar-Ge projesine sonradan ortak olma şansı yakaladın.",
      "actionHandler": "SECRET_RD_PARTNER",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Teklifi reddet", "effect": "Pas." },
        "B": { "text": "Projeye zorla ortak ol", "effect": "Rakip oyuncunun tesisinden sonraki tur geleceği gelirin yarısını kendi kasana yönlendirirsin." }
      },
      "newspaperHeadline": "Ar-Ge Masasında Ortaklık Krizi: Gelirler Bölündü!"
    },
    {
      "id": 41,
      "title": "Yüksek Hızlı Tren Projesi Hizmette",
      "type": "choice",
      "description": "Ulaştırma Bakanlığı'nın yeni yüksek hızlı tren hatları devreye girdi.",
      "actionHandler": "HIGH_SPEED_TRAIN",
      "durationLaps": 0,
      "effect": "Piyonun tahtada doğrudan bir sonraki Başlangıç veya en yakın şirket karesine doğru ilerler.",
      "newspaperHeadline": "Hızlı Tren Hatları Açıldı: Ticarette Ulaşım Hızlandı!"
    },
    {
      "id": 42,
      "title": "Ankara'da Lobicilik Faaliyeti",
      "type": "choice",
      "description": "Piyasada esen olumsuz rüzgarlara karşı başkentte güçlü bir lobicilik faaliyeti yürütebilirsin.",
      "actionHandler": "LOBBYING_SHIELD",
      "durationLaps": 2,
      "options": {
        "A": { "text": "Yatırım yapma", "effect": "Pas." },
        "B": { "text": "Güçlü bir lobi kur", "effect": "2 tur boyunca gelebilecek tüm negatif şans kartı etkilerini veya sabotajları engeller." }
      },
      "newspaperHeadline": "Ankara’da Güçlü Lobi Faaliyeti: Krizler Savuşturuldu!"
    },
    {
      "id": 43,
      "title": "İpotekli Varlıkta Acil Satış Operasyonu",
      "type": "choice",
      "description": "Rakip bir oyuncunun sıkışıp ipoteğe attığı değerli bir mülkü el altından kendi üzerinize geçirebilirsiniz.",
      "actionHandler": "BUY_MORTGAGED_PROPERTY",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Fırsatı pas geç", "effect": "Pas." },
        "B": { "text": "Rakibin ipotekli mülkünü zorla satın al", "effect": "Seçilen ipotekli mülk piyasa bedelinin altında senin tapularına eklenir." }
      },
      "newspaperHeadline": "El Sıkışma Krizi: İpotekli Tapu El Değiştirdi!"
    },
    {
      "id": 44,
      "title": "Düzenleyici Kurum Baskısı",
      "type": "choice",
      "description": "Masadaki bir rakibin en karlı mülkünü denetime sokarak geçici süre kilitleyebilirsin.",
      "actionHandler": "REGULATORY_PRESSURE",
      "durationLaps": 1,
      "options": {
        "A": { "text": "Pas geç", "effect": "Pas." },
        "B": { "text": "Rakip mülkü denetime sok", "effect": "Seçilen rakip mülk 1 tur boyunca kilitlenir, gelir getirmez." }
      },
      "newspaperHeadline": "Düzenleyici Kurumdan Şok Baskın: Tesisler Denetimde!"
    },
    {
      "id": 45,
      "title": "İşletme Kiralama Sözleşmesi",
      "type": "choice",
      "description": "Masadaki bir işletme sahibinin tesisini belirli bir süreyle kiralayıp gelirine ortak olabilirsin.",
      "actionHandler": "LEASE_BUSINESS",
      "durationLaps": 5,
      "options": {
        "A": { "text": "Kiralama", "effect": "Pas." },
        "B": { "text": "Tesisini 5 turuna kirala", "effect": "100.000 TL kira bedeli ödeyerek 5 tur boyunca seçilen tesisin gelirine ortak olursun." }
      },
      "newspaperHeadline": "Dev Kiralama Sözleşmesi: İşletme Hakları Devredildi!"
    },
    {
      "id": 46,
      "title": "Piyasa Dayanışma Fonu",
      "type": "choice",
      "description": "Piyasada geride kalan şirketler için acil dayanışma fonu devreye sokuldu.",
      "actionHandler": "SOLIDARITY_FUND",
      "durationLaps": 0,
      "effect": "Masadaki en düşük mal varlığına sahip olan oyuncuya herkes zorunlu olarak 70.000'er TL nakit aktarır.",
      "newspaperHeadline": "Piyasada Dayanışma Rüzgarı: Geride Kalanlara Destek Fonu!"
    },
    {
      "id": 47,
      "title": "Çift Yönlü Komisyon Ağı",
      "type": "choice",
      "description": "Bir kişiyi seçip devlet ödemelerinden ve kira akışından komisyon koparacak bir ağ kurabilirsin.",
      "actionHandler": "DUAL_COMMISSION_NETWORK",
      "durationLaps": 3,
      "options": {
        "A": { "text": "Kurma", "effect": "Pas." },
        "B": { "text": "Komisyon ağını kur", "effect": "3 tur boyunca seçilen kişinin devlete ödediği arsa bedelinin %20'si ve ona ödenen kiraların %30'u sana gelir." }
      },
      "newspaperHeadline": "Gölge Komisyon Ağı Kuruldu: Para Trafiği Değişti!"
    },
    {
      "id": 48,
      "title": "Sızdırılan Finansal Raporlar",
      "type": "choice",
      "description": "Bilgi işlem departmanınız tüm masanın gizli varlıklarını deşifre eden bir raporu sızdırdı.",
      "actionHandler": "LEAK_FINANCIAL_REPORTS",
      "durationLaps": 3,
      "effect": "3 tur boyunca bütün oyuncular herkesin anlık parasını ve tapu varlıklarını açıkça görebilir.",
      "newspaperHeadline": "Büyük Sızıntı: Tüm Şirketlerin Gizli Bilgileri Ortaya Saçıldı!"
    },
    {
      "id": 49,
      "title": "Yönetim Kurulu Acil Zirve Daveti",
      "type": "choice",
      "description": "Kendi genel merkezinde acil bir zirve toplayarak masadaki bir rakibi doğrudan yanına getirtebilirsin.",
      "actionHandler": "SUMMON_PLAYER",
      "durationLaps": 0,
      "options": {
        "A": { "text": "Zirve düzenleme", "effect": "Pas." },
        "B": { "text": "Rakibi yanına ışınla", "effect": "Masadaki istediğin bir rakip oyuncunun piyonunu doğrudan senin bulunduğun kareye ışınlarsın." }
      },
      "newspaperHeadline": "Acil Zirve Toplantısı: Rakipler Aynı Masada Buluştu!"
    },
    {
      "id": 50,
      "title": "Teşvikli Bedelsiz Otel Yatırımı",
      "type": "choice",
      "description": "Hükümet sanayi ve turizm yatırımları için hiçbir ücret alınmayacak bir otel teşviki açıkladı.",
      "actionHandler": "FREE_HOTEL_BUILD",
      "durationLaps": 0,
      "effect": "Kartı çeken oyuncu hiçbir ücret ödemeden sahip olduğu en düşük seviyeli/değerli şehrine doğrudan 1 adet otel diker.",
      "newspaperHeadline": "Devletten Turizm ve Sanayi Hamlesi: Bedelsiz Otel Teşviki!"
    }
  ]
}

js_content = "export const CHANCE_CARDS = [\n"
for c in raw_json['chanceCards']:
    is_no_option = "true" if 'options' not in c else "false"
    
    js_content += "  {\n"
    js_content += f"    id: {c['id']},\n"
    def clean(s):
        if not isinstance(s, str): return s
        return s.replace("'", "\\'")

    js_content += f"    title: '{clean(c['title'])}',\n"
    js_content += f"    description: '{clean(c['description'])}',\n"
    js_content += f"    newspaperHeadline: '{clean(c['newspaperHeadline'])}',\n"
    js_content += f"    durationLaps: {c['durationLaps']},\n"
    js_content += f"    actionHandler: '{clean(c['actionHandler'])}',\n"
    
    if is_no_option == "true":
        js_content += f"    isNoOption: true,\n"
        js_content += "    optionA: {\n"
        js_content += f"      label: 'Tamam • Doğrudan Uygula',\n"
        js_content += f"      description: '{clean(c['effect'])}',\n"
        js_content += f"      actionType: '{clean(c['actionHandler'])}'\n"
        js_content += "    },\n"
        js_content += "    optionB: null\n"
    else:
        js_content += "    optionA: {\n"
        js_content += f"      label: '{clean(c['options']['A']['text'])}',\n"
        js_content += f"      description: '{clean(c['options']['A']['effect'])}',\n"
        js_content += f"      actionType: '{clean(c['actionHandler'])}_A'\n"
        js_content += "    },\n"
        
        if 'B' in c['options']:
            js_content += "    optionB: {\n"
            js_content += f"      label: '{clean(c['options']['B']['text'])}',\n"
            js_content += f"      description: '{clean(c['options']['B']['effect'])}',\n"
            js_content += f"      actionType: '{clean(c['actionHandler'])}_B'\n"
            js_content += "    }\n"
        else:
            js_content += "    optionB: null\n"
        
    js_content += "  },\n"

js_content += "];\n\nexport default CHANCE_CARDS;\n"

with open("/Users/ismetbaltacioglu/Holding/backend/src/constants/chanceCards.js", "w") as f:
    f.write(js_content)
with open("/Users/ismetbaltacioglu/Holding/frontend/src/constants/chanceCards.js", "w") as f:
    f.write(js_content)

print("Generated chanceCards.js")
