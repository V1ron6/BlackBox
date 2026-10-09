import { useState } from 'react';
import { Download } from 'lucide-react';

export default function ExifStrip() {
  const [out, setOut] = useState(null);
  const [error, setError] = useState('');

  async function go(e) {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' });
      const c = Object.assign(document.createElement('canvas'), { width: bmp.width, height: bmp.height });
      c.getContext('2d').drawImage(bmp, 0, 0);
      const type = f.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise((r) => c.toBlob(r, type, 0.95));
      setOut({ url: URL.createObjectURL(blob), name: 'clean.' + (type === 'image/png' ? 'png' : 'jpg') }); setError('');
    } catch { setError('Could not read that image'); }
  }

  return (
    <div className="form">
      <input type="file" accept="image/*" onChange={go} />
      {error && <div className="notice err">{error}</div>}
      {out && <><img src={out.url} alt="Clean" style={{ maxWidth: '100%', borderRadius: 8 }} /><a className="btn" href={out.url} download={out.name}><Download size={16} /> Download clean image</a></>}
      <small>Redraws the picture so location, camera and other hidden metadata are dropped. Runs in your browser.</small>
    </div>
  );
}
