import { useState } from 'react';
import { Camera, Download } from 'lucide-react';

export default function Screenshot() {
  const [img, setImg] = useState('');
  const [error, setError] = useState('');

  async function capture() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const v = document.createElement('video');
      v.srcObject = stream; v.muted = true;
      await v.play();
      await new Promise((r) => setTimeout(r, 300));
      const c = Object.assign(document.createElement('canvas'), { width: v.videoWidth, height: v.videoHeight });
      c.getContext('2d').drawImage(v, 0, 0);
      stream.getTracks().forEach((t) => t.stop());
      setImg(c.toDataURL('image/png'));
    } catch (e) { setError(e.name === 'NotAllowedError' ? 'Capture was cancelled' : 'Screen capture is not supported in this browser'); }
  }

  return (
    <div className="form">
      <button onClick={capture}><Camera size={16} /> Capture a screen, window or tab</button>
      {error && <div className="notice err">{error}</div>}
      {img && <><img src={img} alt="Screenshot" style={{ maxWidth: '100%', borderRadius: 8 }} /><a className="btn" href={img} download="screenshot.png"><Download size={16} /> Download PNG</a></>}
    </div>
  );
}
