export const BOARD_IMAGES = {
  // ─────────────────────────────────────────────────────────
  // KARE RESİMLERİ (SQUARE IMAGES)
  // Buradaki boş tırnakların ('') içine kendi resimlerinizin yollarını yazabilirsiniz.
  //
  // YÖNTEM 1: İnternetten bir link koymak: 'https://site.com/resim.jpg'
  // YÖNTEM 2: Kendi bilgisayarınızdan/sunucudan koymak: '/images/sehir.jpg'
  // (Yöntem 2 için resimleri "frontend/public/images/" klasörü içine koymalısınız)
  // ─────────────────────────────────────────────────────────

  // ALT KENAR (0 - 13)
  0: 'https://i.pinimg.com/736x/25/83/25/258325e218093f78599368d65312663d.jpg', // Başlangıç
  1: '', // Yozgat
  2: '', // Şans Kartı
  3: '', // Kars
  4: '', // Hazine Vergisi
  5: '', // Uluslararası Liman
  6: '', // Edirne
  7: '', // Şans Kartı
  8: '', // Tekirdağ
  9: '', // Çanakkale
  10: '', // Samsun
  11: '', // Trabzon
  12: '', // Rize
  13: '', // Hapis / Denetim

  // SOL KENAR (14 - 19)
  14: '', // Şanlıurfa
  15: '', // Hammadde Üretim Tesisi
  16: '', // Diyarbakır
  17: '', // Şans Kartı
  18: '', // Gaziantep
  19: '', // Borsa / Halka Arz

  // ÜST KENAR (20 - 32)
  20: '', // Merkez Bankası
  21: '', // Eskişehir
  22: '', // Konya
  23: '', // Kayseri
  24: '', // Sanayi Fabrikası
  25: '', // Muğla
  26: '', // Mersin
  27: '', // Bursa
  28: '', // Şans Kartı
  29: '', // Medya Şirketi
  30: '', // Antalya
  31: '', // İzmir
  32: '', // Aydın

  // SAĞ KENAR (33 - 39)
  33: '', // Yeraltı Kumarhanesi
  34: '', // Şans Kartı
  35: '', // AVM
  36: '', // Servet Vergisi
  37: '', // Türkiye Varlık Fonu
  38: '', // Ankara
  39: '', // İstanbul
};

// Eğer yukarıda bir kareye resim yazmazsanız (boş bırakırsanız) bu varsayılan sistem çalışır:
export const getSquareImage = (id) => {
  if (BOARD_IMAGES[id] && BOARD_IMAGES[id] !== '') {
    return BOARD_IMAGES[id];
  }
  // Kendi resmini eklemediğiniz kareler için internetten otomatik rastgele şık bir resim çeker (seed ile sabitlenmiş)
  return `https://picsum.photos/seed/${id + 100}/300/300`;
};
