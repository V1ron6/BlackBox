import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Download, Eraser } from 'lucide-react';
import { download } from '../lib/pdf.js';

const POS = { 'Bottom right': [0.97, 0.06], 'Bottom left': [0.03, 0.06], 'Bottom center': [0.5, 0.06], 'Middle right': [0.97, 0.5], 'Top right': [0.97, 0.93] };

export default function PdfSign() {
  const [file, setFile] = useState(null);
  const [page, setPage] = useState('last');
  const [pos, setPos] = useState('Bottom right');
  const [width, setWidth] = useState(160);
  const [error, setError] = useState('');
  const cv = useRef(null);
  const drawing = useRef(false);

  const at = (e) => { const r = cv.current.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 400, ((e.clientY - r.top) / r.height) * 150]; };
  const start = (e) => { drawing.current = true; const c = cv.current.getContext('2d'); c.lineWidth = 3; c.lineCap = 'round'; c.strokeStyle = '#111'; const [x, y] = at(e); c.beginPath(); c.moveTo(x, y); cv.current.setPointerCapture(e.pointerId); };
  const move = (e) => { if (!drawing.current) return; const c = cv.current.getContext('2d'); const [x, y] = at(e); c.lineTo(x, y); c.stroke(); };
  const clear = () => cv.current.getContext('2d').clearRect(0, 0, 400, 150);

  async function build() {
    try {
      if (!file) throw new Error('Choose a PDF first');
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const png = await doc.embedPng(await new Promise((r) => cv.current.toBlob(async (b) => r(await b.arrayBuffer()))));
      const pages = doc.getPages();
      const p = pages[page === 'first' ? 0 : page === 'last' ? pages.length - 1 : Math.min(Math.max(parseInt(page, 10) || 1, 1), pages.length) - 1];
      const { width: pw, height: ph } = p.getSize();
      const [fx, fy] = POS[pos], w = width, h = (w * 150) / 400;
      p.drawImage(png, { x: Math.max(0, Math.min(pw - w, fx * pw - (fx > 0.6 ? w : fx > 0.4 ? w / 2 : 0))), y: Math.max(0, fy * ph - (fy > 0.9 ? h : 0)), width: w, height: h });
      download(await doc.save(), file.name.replace(/\.pdf$/i, '') + '-signed.pdf'); setError('');
    } catch (e) { setError(e.message || 'Could not sign this PDF'); }
  }

  return (
    <div className="form">
      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
      <canvas ref={cv} width="400" height="150" onPointerDown={start} onPointerMove={move} onPointerUp={() => { drawing.current = false; }} style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 8, touchAction: 'none' }} />
      <button onClick={clear}><Eraser size={16} /> Clear signature</button>
      <div className="row">
        <select value={page} onChange={(e) => setPage(e.target.value)}><option value="last">Last page</option><option value="first">First page</option><option value="2">Page 2</option><option value="3">Page 3</option></select>
        <select value={pos} onChange={(e) => setPos(e.target.value)}>{Object.keys(POS).map((k) => <option key={k}>{k}</option>)}</select>
      </div>
      <label>Signature width: {width}pt<input type="range" min="80" max="300" value={width} onChange={(e) => setWidth(+e.target.value)} /></label>
      <button onClick={build}><Download size={16} /> Sign and download</button>
      {error && <div className="notice err">{error}</div>}
      <small>Draw with mouse or finger. This places an image of your signature, not a cryptographic digital signature. Runs in your browser.</small>
    </div>
  );
}
