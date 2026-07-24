import { io } from 'socket.io-client';

/**
 * Backend URL Belirleme:
 * Üretim ortamında frontend ile backend aynı domainde çalışır.
 * Socket.io bağlantısı https://ismetpascha.com.tr/socket.io/ üzerinden geçer.
 * Bu sayede Nginx kendi nginx.conf içindeki /socket.io/ proxy kuralını kullanır.
 *
 * Sadece localhost/geliştirme ortamında ayrı backend URL'ye gider.
 */
function getBackendUrl() {
  // Önce env değişkenini kontrol et (manuel override)
  if (import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_BACKEND_URL.trim() !== '') {
    return import.meta.env.VITE_BACKEND_URL.trim();
  }

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;

    // Yerel geliştirme: ayrı backend portuna git
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:3000';
    }

    // Üretim: Socket.io bağlantısını AYNI origin'den kur.
    // Nginx /socket.io/ path'ini backend:3000'e proxy'ler.
    // Bu sayede WebSocket upgrade frontend Nginx üzerinden geçer (doğru yol).
    return `${window.location.protocol}//${hostname}`;
  }

  return 'https://ismetpascha.com.tr';
}

const BACKEND_URL = getBackendUrl();

/**
 * Socket.io İstemci — Kararlı Bağlantı Yapılandırması
 *
 * Neden polling önce?
 * Socket.io'nun standart el sıkışması HTTP polling ile başlar,
 * ardından WebSocket'e yükselir. Bu Nginx, Cloudflare ve proxy
 * katmanlarında en güvenilir çalışma şeklidir.
 * Sadece websocket: true ayarı bu handshake'i atlar ve bazı
 * proxy/CDN konfigürasyonlarında hata verir.
 */
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  // ÖNEMLİ: Polling ile başla, websocket'e upgrade et (en stabil yol)
  transports: ['polling', 'websocket'],
  upgrade: true,

  // Reconnection:
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 8000,
  randomizationFactor: 0.5,

  timeout: 25000,
  withCredentials: false,

  // /socket.io/ path'i Nginx tarafından proxy edilecek
  path: '/socket.io/'
});

socket.on('connect', () => {
  console.log(`[Socket.io ✅ Bağlandı] ID: ${socket.id} | Hedef: ${BACKEND_URL} | Transport: ${socket.io.engine.transport.name}`);
});

socket.on('disconnect', (reason) => {
  console.warn(`[Socket.io ⚠️ Koptu] Sebep: ${reason}`);
  // Sunucu taraflı kopmalarda otomatik yeniden bağlan
  if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
    setTimeout(() => socket.connect(), 1000);
  }
});

socket.on('connect_error', (error) => {
  console.error(`[Socket.io ❌ Bağlantı Hatası (${BACKEND_URL})]:`, error.message, error.type || '');
});

export default socket;
