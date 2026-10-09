import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { API } from '../lib/api.js';

const TOP = ['GHS', 'USD', 'EUR', 'GBP', 'NGN', 'CAD', 'CNY', 'ZAR'];

export default function Currency() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [amt, setAmt] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('GHS');

  useEffect(() => {
    fetch(`${API}/api/tools/currency/run`, { method: 'POST', body: new FormData() })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Failed'); setData(j); })
      .catch((e) => setError(e.message || 'Rates unavailable'));
  }, []);

  if (error) return <div className="notice err"><AlertTriangle size={18} /> {error}</div>;
  if (!data) return <Loader2 className="spin" />;
  const codes = [...TOP.filter((c) => data.rates[c]), ...Object.keys(data.rates).filter((c) => !TOP.includes(c)).sort()];
  const n = parseFloat(amt);
  const out = Number.isFinite(n) ? (n / data.rates[from]) * data.rates[to] : null;

  return (
    <div className="form">
      <input type="number" step="any" value={amt} onChange={(e) => setAmt(e.target.value)} />
      <div className="row">
        <select value={from} onChange={(e) => setFrom(e.target.value)}>{codes.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={to} onChange={(e) => setTo(e.target.value)}>{codes.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      {out !== null && <h3 className="big">{out.toLocaleString(undefined, { maximumFractionDigits: 4 })} {to}</h3>}
      <small>Indicative rates, updated {data.updated}. Not for trading. <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer noopener">Rates by Exchange Rate API</a>.</small>
    </div>
  );
}
