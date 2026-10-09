import { useEffect, useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

// [label, width mm, height mm]
const SIZES = [['35 x 45 mm', 35, 45], ['2 x 2 in', 50.8, 50.8], ['40 x 50 mm', 40, 50], ['51 x 51 mm', 51, 51]];
const DPI = 300, mm = (v) => Math.round((v / 25.4) * DPI);

export default function PassportPhoto() {
  const [bmp, setBmp] = useState(null);
  const [size, setSize] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cv = useRef(null);
  const [, w, h] = SIZES[size];
  const [W, H] = [mm(w), mm(h)];

  useEffect(() => {
    const c = cv.current;
    if (!c || !bmp) return;
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    const base = Math.max(W / bmp.width, H / bmp.height) * zoom;
    const dw = bmp.width * base, dh = bmp.height * base;
    ctx.drawImage(bmp, (W - dw) / 2 + (x / 100) * W, (H - dh) / 2 + (y / 100) * H, dw, dh);
  }, [bmp, W, H, zoom, x, y]);

  async function load(e) {
    const f = e.target.files[0];
    if (f) { try { setBmp(await createImageBitmap(f, { imageOrientation: 'from-image' })); setError(''); } catch { setError('Could not read that image'); } }
  }
  async function whiteBg() {
    setBusy(true); setError('');
    try {
      const c = Object.assign(document.createElement('canvas'), { width: bmp.width, height: bmp.height });
      c.getContext('2d').drawImage(bmp, 0, 0);
      const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
      const { removeBackground } = await import('@imgly/background-removal');
      const cut = await createImageBitmap(await removeBackground(blob));
      const o = Object.assign(document.createElement('canvas'), { width: cut.width, height: cut.height });
      const ctx = o.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, o.width, o.height); ctx.drawImage(cut, 0, 0);
      setBmp(await createImageBitmap(o));
    } catch { setError('Background removal failed. You can still use the photo as is.'); }
    finally { setBusy(false); }
  }
  const save = (sheet) => {
    const single = cv.current;
    let out = single;
    if (sheet) {
      const [SW, SH, g] = [mm(152.4), mm(101.6), mm(2)];
      out = Object.assign(document.createElement('canvas'), { width: SW, height: SH });
      const ctx = out.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, SW, SH);
      const cols = Math.max(1, Math.floor((SW + g) / (W + g))), rows = Math.max(1, Math.floor((SH + g) / (H + g)));
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) ctx.drawImage(single, k * (W + g) + g, r * (H + g) + g);
    }
    out.toBlob((b) => { const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(b), download: sheet ? 'photo-sheet-4x6.png' : 'passport-photo.png' }); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); });
  };

  return (
    <div className="form">
      <input type="file" accept="image/*" onChange={load} />
      <label>Size<select value={size} onChange={(e) => setSize(+e.target.value)}>{SIZES.map((s, i) => <option key={s[0]} value={i}>{s[0]}</option>)}</select></label>
      {bmp && (
        <>
          <canvas ref={cv} style={{ width: '100%', maxWidth: 260, border: '1px solid var(--line)', borderRadius: 8, background: '#fff' }} />
          <label>Zoom<input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(+e.target.value)} /></label>
          <label>Left / right<input type="range" min="-50" max="50" value={x} onChange={(e) => setX(+e.target.value)} /></label>
          <label>Up / down<input type="range" min="-50" max="50" value={y} onChange={(e) => setY(+e.target.value)} /></label>
          <button onClick={whiteBg} disabled={busy}>{busy && <Loader2 size={16} className="spin" />} Make background white</button>
          <div className="row"><button onClick={() => save(false)}><Download size={16} /> Single photo</button><button onClick={() => save(true)}><Download size={16} /> 4 x 6 in print sheet</button></div>
        </>
      )}
      {error && <div className="notice err">{error}</div>}
      <small>300 dpi. Check your photo rules (size, face position, background) with the issuing office before printing.</small>
    </div>
  );
}
