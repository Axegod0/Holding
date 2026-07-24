import { io } from 'socket.io-client';

/**
 * Akıllı Backend URL Belirleme Fonksiyonu:
 * 1. import.meta.env.VITE_BACKEND_URL tanımlıysa öncelikle onu kullanır.
 * 2. Tanımlı değilse veya boşsa, uygulamanın çalıştığı ana domainin (window.location.hostname)
 *    başında 'api.' yoksa otomatik olarak 'api.' ekleyip https://api.domain.com formatında döndürür.
 * 3. Yerel geliştirme (localhost / 127.0.0.1) ortamındaysa http://localhost:3000 adresine yönelir.
 */
function getBackendUrl() {
  if (import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_BACKEND_URL.trim() !== '') {
    return import.meta.env.VITE_BACKEND_URL.trim();
  }

  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    // Yerel geliştirme ortamı kontrolü
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:3000';
    }
    // Eğer halihazırda 'api.' ile başlamıyorsa başına 'api.' ekle (Örn: ismetpascha.com.tr -> https://api.ismetpascha.com.tr)
    if (!hostname.startsWith('api.')) {
      return `${window.location.protocol}//api.${hostname}`;
    }
    return `${window.location.protocol}//${hostname}`;
  }

  return 'https://api.ismetpascha.com.tr';
}

const BACKEND_URL = getBackendUrl();

/**
 * Socket.io İstemci Bağlantısı Singleton
 * Safari/Mobil ve Nginx reverse proxy ortamı için optimize edilmiş bağlantı ayarları.
 */
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  // Sadece WebSocket kullan — XHR polling transport hatasını tamamen ortadan kaldırır
  transports: ['websocket'],
  upgrade: false,
  
  // Reconnection ayarları:
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 8000,
  randomizationFactor: 0.5,
  
  timeout: 20000,
  withCredentials: false
});

socket.on('connect', () => {
  console.log(`[Socket.io Bağlantısı Başarılı] ID: ${socket.id} | Hedef: ${BACKEND_URL} | Transport: ${socket.io.engine.transport.name}`);
});

socket.on('disconnect', (reason) => {
  console.warn(`[Socket.io Bağlantısı Kesildi] Sebep: ${reason}`);
  if (reason === 'io server disconnect' || reason === 'transport close') {
    // Sunucu taraflı bir kopma veya transport kapanması yaşandıysa otomatik yeniden bağlan
    socket.connect();
  }
});

socket.on('connect_error', (error) => {
  console.error(`[Socket.io Bağlantı Hatası (${BACKEND_URL})]:`, error.message);
});

export default socket;
