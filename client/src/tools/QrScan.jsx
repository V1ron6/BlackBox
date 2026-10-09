import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera } from 'lucide-react';

export default function QrScan() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);
  const video = useRef(null);

  const decode = (data, w, h) => jsQR(data, w, h)?.data;

  async function fromFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const bmp = await createImageBitmap(f);
      const c = Object.assign(document.createElement('canvas'), { width: bmp.width, height: bmp.height });
      const ctx = c.getContext('2d');
      ctx.drawImage(bmp, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      const r = decode(d.data, d.width, d.height);
      r ? (setResult(r), setError('')) : setError('No QR code found in that image');
    } catch { setError('Could not read that image'); }
  }

  useEffect(() => {
    if (!live) return;
    let stop = false, stream, raf;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const v = video.current; v.srcObject = stream; await v.play();
        const c = document.createElement('canvas'), ctx = c.getContext('2d', { willReadFrequently: true });
        const tick = () => {
          if (stop) return;
          if (v.videoWidth) {
            c.width = v.videoWidth; c.height = v.videoHeight; ctx.drawImage(v, 0, 0);
            const d = ctx.getImageData(0, 0, c.width, c.height);
            const r = decode(d.data, d.width, d.height);
            if (r) { setResult(r); setLive(false); return; }
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch { setError('Camera not available or permission denied'); setLive(false); }
    })();
    return () => { stop = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); };
  }, [live]);

  return (
    <div className="form">
      <label>Scan from an image<input type="file" accept="image/*" onChange={fromFile} /></label>
      <button onClick={() => { setError(''); setLive(!live); }}><Camera size={16} /> {live ? 'Stop camera' : 'Use camera'}</button>
      {live && <video ref={video} muted playsInline style={{ width: '100%', borderRadius: 8 }} />}
      {error && <div className="notice err">{error}</div>}
      {result && <div className="notice">{/^https?:\/\//i.test(result) ? <a href={result} target="_blank" rel="noreferrer noopener">{result}</a> : result}</div>}
    </div>
  );
}
