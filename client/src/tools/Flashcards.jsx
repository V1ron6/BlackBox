import { useState } from 'react';
import { rgb } from 'pdf-lib';
import { Download } from 'lucide-react';
import { Writer, wrap, download, safe } from '../lib/pdf.js';

export default function Flashcards() {
  const [t, setT] = useState('Capital of Ghana | Accra\nH2O | Water');
  const [error, setError] = useState('');

  async function build() {
    try {
      const cards = t.split('\n').map((l) => l.split('|').map((s) => s.trim())).filter((p) => p[0] && p[1]);
      if (!cards.length) throw new Error('Add lines like: front | back');
      const w = await Writer.create();
      w.doc.removePage(0);
      const [cw, ch, gx, gy] = [235, 170, 50, 60];
      for (let i = 0; i < cards.length; i += 8) {
        const chunk = cards.slice(i, i + 8);
        for (const side of [0, 1]) {
          const page = w.doc.addPage([595, 842]);
          page.drawText(side ? 'BACK (print double-sided, flip on long edge)' : 'FRONT', { x: 50, y: 810, size: 9, font: w.font, color: rgb(0.5, 0.5, 0.5) });
          chunk.forEach((c, k) => {
            const col = side ? 1 - (k % 2) : k % 2;
            const x = gx + col * (cw + 20), y = 842 - gy - (Math.floor(k / 2) + 1) * (ch + 12);
            page.drawRectangle({ x, y, width: cw, height: ch, borderColor: rgb(0.6, 0.6, 0.6), borderWidth: 1 });
            const lines = wrap(side ? w.font : w.bold, 14, c[side], cw - 24).slice(0, 8);
            let ty = y + ch / 2 + (lines.length * 18) / 2 - 14;
            for (const ln of lines) { page.drawText(ln, { x: x + 12, y: ty, size: 14, font: side ? w.font : w.bold }); ty -= 18; }
          });
        }
      }
      download(await w.save(), 'flashcards.pdf'); setError('');
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="form">
      <textarea rows="10" value={t} onChange={(e) => setT(e.target.value)} placeholder="front | back (one card per line)" />
      <button onClick={build}><Download size={16} /> Make PDF</button>
      {error && <div className="notice err">{error}</div>}
      <small>8 cards per sheet, fronts then mirrored backs for double-sided printing. Latin characters only.</small>
    </div>
  );
}
