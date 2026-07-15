import React from 'react';
import GameBoard from './GameBoard.jsx';

/**
 * Holding Oyun Tahtası Bileşeni (Widescreen 14x8 Dikdörtgen Format)
 * Sabit kare (w-96 vb.) değerler yerine ekranın tamamına yayılır (w-full, h-full, 1fr grid).
 * App.jsx veya harici bileşenler tarafından `Board` ya da `GameBoard` olarak çağrıldığında çalışır.
 */
export default function Board() {
  return <GameBoard />;
}
