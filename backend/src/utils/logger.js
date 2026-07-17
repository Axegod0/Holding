import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We place the log directory at the root of the backend folder
const logDir = path.resolve(__dirname, '../../logs');
const logFilePath = path.join(logDir, 'game.log');

// Ensure the logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Clears/truncates the game log file.
 */
export function clearLog() {
  try {
    fs.writeFileSync(logFilePath, '', 'utf8');
    console.log('[LOG] Yeni oda kuruldu, eski game.log temizlendi.');
  } catch (err) {
    console.error('[LOG ERROR] Log dosyası temizlenirken hata oluştu:', err);
  }
}

/**
 * Logs a message to both console.log and the game.log file with a timestamp.
 * @param {string} message 
 */
export function logGame(message) {
  // Output to standard console (so docker-compose logs shows it)
  console.log(message);

  // Append to the local log file
  try {
    const timestamp = new Date().toLocaleString('tr-TR');
    fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`, 'utf8');
  } catch (err) {
    console.error('[LOG ERROR] Log dosyasına yazılamadı:', err);
  }
}
