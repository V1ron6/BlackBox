import { useState } from 'react';
import { zipSync } from 'fflate';
import { Download } from 'lucide-react';

const SIZES = [16, 32, 48, 180, 192, 512];

export default function Favicon() {
  const [error, setError] = useState('');

  async function go(e) {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const bmp = await createImageBitmap(f);
      const files = {};
      for (const s of SIZES) {
        const c = Object.assign(document.createElement('canvas'), { width: s, height: s });
        const side = Math.min(bmp.width, bmp.height);
        c.getContext('2d').drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, s, s);
        const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
        files[`favicon-${s}.png`] = new Uint8Array(await blob.arrayBuffer());
      }
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([zipSync(files)])), download: 'favicons.zip' });
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); setError('');
    } catch { setError('Could not read that image'); }
  }

  return (
    <div className="form">
      <label><span><Download size={14} /> Pick a square-ish logo to get {SIZES.join(', ')} px PNGs in a zip</span><input type="file" accept="image/*" onChange={go} /></label>
      {error && <div className="notice err">{error}</div>}
      <small>Center-cropped to a square. Runs in your browser.</small>
    </div>
  );
}
