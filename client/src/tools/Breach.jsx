import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Breach() {
  const [pw, setPw] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  async function check(e) {
    e.preventDefault();
    setBusy(true); setRes(null);
    try {
      const d = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(pw));
      const h = [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      const r = await fetch('https://api.pwnedpasswords.com/range/' + h.slice(0, 5));
      if (!r.ok) throw new Error();
      const hit = (await r.text()).split('\n').map((l) => l.trim().split(':')).find(([s]) => s === h.slice(5));
      setRes(hit ? { bad: true, n: Number(hit[1]).toLocaleString() } : { bad: false });
    } catch { setRes({ error: true }); }
    finally { setBusy(false); }
  }

  return (
    <form className="form" onSubmit={check}>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password to check" autoComplete="off" />
      <button disabled={!pw || busy}>{busy && <Loader2 size={16} className="spin" />} Check</button>
      {res?.error && <div className="notice err">Could not reach the breach service. Needs HTTPS and internet.</div>}
      {res?.bad && <div className="notice err">Found in {res.n} known breaches. Do not use it.</div>}
      {res && !res.bad && !res.error && <div className="notice">Not found in known breaches. That does not make it strong.</div>}
      <small>Only the first 5 characters of the password's SHA-1 hash leave your browser (k-anonymity, Have I Been Pwned range API, free).</small>
    </form>
  );
}
