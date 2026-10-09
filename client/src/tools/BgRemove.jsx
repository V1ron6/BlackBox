import { useState } from 'react';
import { Loader2, Download } from 'lucide-react';

export default function BgRemove() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');

  async function go(e) {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true); setError(''); setUrl('');
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      setUrl(URL.createObjectURL(await removeBackground(f)));
    } catch (err) { setError('Background removal failed: ' + (err.message || 'unknown error')); }
    finally { setBusy(false); }
  }

  return (
    <div className="form">
      <input type="file" accept="image/*" onChange={go} disabled={busy} />
      {busy && <div className="notice"><Loader2 size={16} className="spin" /> Working. The first run downloads an AI model.</div>}
      {error && <div className="notice err">{error}</div>}
      {url && <><img src={url} alt="Result" className="qr checker" /><a className="btn" href={url} download="no-background.png"><Download size={16} /> Download PNG</a></>}
      <small>Runs in your browser. Images are not uploaded.</small>
    </div>
  );
}
