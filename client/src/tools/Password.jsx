import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

const SETS = { lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', digits: '0123456789', symbols: '!@#$%^&*()-_=+[]{};:,.?' };

function make(len, on) {
  const pool = Object.keys(SETS).filter((k) => on[k]).map((k) => SETS[k]).join('');
  if (!pool) return '';
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  return [...buf].map((n) => pool[n % pool.length]).join('');
}

export default function Password() {
  const [len, setLen] = useState(16);
  const [on, setOn] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [pw, setPw] = useState(() => make(16, { lower: true, upper: true, digits: true, symbols: true }));

  return (
    <div className="form">
      <div className="notice">{pw || 'Pick at least one set'}</div>
      <label>Length: {len}<input type="range" min="8" max="64" value={len} onChange={(e) => setLen(+e.target.value)} /></label>
      <div className="chips">{Object.keys(SETS).map((k) => <button key={k} className={on[k] ? 'on' : ''} onClick={() => setOn({ ...on, [k]: !on[k] })}>{k}</button>)}</div>
      <div className="row">
        <button onClick={() => setPw(make(len, on))}><RefreshCw size={16} /> Generate</button>
        <button onClick={() => navigator.clipboard?.writeText(pw).catch(() => {})}><Copy size={16} /> Copy</button>
      </div>
    </div>
  );
}
