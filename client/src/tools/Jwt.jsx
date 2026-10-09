import { useState } from 'react';

const dec = (s) => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))));

export default function Jwt() {
  const [t, setT] = useState('');
  let out = null, error = '';
  if (t.trim()) {
    try {
      const [h, p] = t.trim().split('.');
      out = { header: dec(h), payload: dec(p) };
    } catch { error = 'Not a valid JWT'; }
  }
  const exp = out?.payload?.exp ? new Date(out.payload.exp * 1000) : null;

  return (
    <div className="form wide">
      <textarea rows="4" value={t} onChange={(e) => setT(e.target.value)} placeholder="Paste a JWT" />
      {error && <div className="notice err">{error}</div>}
      {out && <pre className="diff">{JSON.stringify(out, null, 2)}</pre>}
      {exp && <div className={'notice' + (exp < new Date() ? ' err' : '')}>{exp < new Date() ? 'Expired' : 'Expires'} {exp.toLocaleString()}</div>}
      <small>Decoded in your browser. The signature is NOT verified.</small>
    </div>
  );
}
