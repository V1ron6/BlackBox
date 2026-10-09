import { useEffect, useState } from 'react';

const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
const unb64 = (s) => { try { return decodeURIComponent(escape(atob(s))); } catch { return 'Invalid Base64'; } };

export default function Encoder() {
  const [t, setT] = useState('');
  const [sha, setSha] = useState('');

  useEffect(() => {
    if (!t) return setSha('');
    crypto.subtle?.digest('SHA-256', new TextEncoder().encode(t))
      .then((d) => setSha([...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('')))
      .catch(() => setSha('Unavailable (needs HTTPS)'));
  }, [t]);

  const rows = t ? [['Base64', b64(t)], ['Base64 decoded', unb64(t)], ['URL encoded', encodeURIComponent(t)], ['SHA-256', sha]] : [];
  return (
    <div className="form">
      <textarea rows="4" value={t} onChange={(e) => setT(e.target.value)} placeholder="Input text" />
      {rows.map(([k, v]) => <label key={k}>{k}<textarea readOnly rows="2" value={v} /></label>)}
    </div>
  );
}
