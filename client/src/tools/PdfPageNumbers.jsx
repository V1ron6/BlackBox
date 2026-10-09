import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Download } from 'lucide-react';
import { download } from '../lib/pdf.js';

export default function PdfPageNumbers() {
  const [file, setFile] = useState(null);
  const [pos, setPos] = useState('Bottom center');
  const [fmt, setFmt] = useState('Page N of M');
  const [start, setStart] = useState(1);
  const [error, setError] = useState('');

  async function build() {
    try {
      if (!file) throw new Error('Choose a PDF first');
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      pages.forEach((p, i) => {
        const n = i + (parseInt(start, 10) || 1), total = pages.length + (parseInt(start, 10) || 1) - 1;
        const text = fmt === 'N' ? `${n}` : fmt === 'N / M' ? `${n} / ${total}` : `Page ${n} of ${total}`;
        const { width, height } = p.getSize(), tw = font.widthOfTextAtSize(text, 10);
        const x = pos.endsWith('left') ? 36 : pos.endsWith('right') ? width - 36 - tw : (width - tw) / 2;
        p.drawText(text, { x, y: pos.startsWith('Top') ? height - 28 : 22, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
      });
      download(await doc.save(), file.name.replace(/\.pdf$/i, '') + '-numbered.pdf'); setError('');
    } catch (e) { setError(e.message || 'Could not number this PDF'); }
  }

  return (
    <div className="form">
      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
      <label>Position<select value={pos} onChange={(e) => setPos(e.target.value)}>{['Bottom center', 'Bottom right', 'Bottom left', 'Top center', 'Top right', 'Top left'].map((k) => <option key={k}>{k}</option>)}</select></label>
      <label>Format<select value={fmt} onChange={(e) => setFmt(e.target.value)}>{['Page N of M', 'N / M', 'N'].map((k) => <option key={k}>{k}</option>)}</select></label>
      <label>Start at<input type="number" min="1" value={start} onChange={(e) => setStart(e.target.value)} /></label>
      <button onClick={build}><Download size={16} /> Number and download</button>
      {error && <div className="notice err">{error}</div>}
      <small>Runs in your browser. Nothing is uploaded.</small>
    </div>
  );
}
