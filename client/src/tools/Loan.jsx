import { useState } from 'react';

export default function Loan() {
  const [p, setP] = useState('10000');
  const [r, setR] = useState('20');
  const [m, setM] = useState('12');
  const P = parseFloat(p), n = parseInt(m, 10), i = (parseFloat(r) || 0) / 1200;
  const ok = P > 0 && n > 0;
  const pay = !ok ? 0 : i === 0 ? P / n : (P * i) / (1 - Math.pow(1 + i, -n));
  const rows = [];
  let bal = P;
  for (let k = 1; ok && k <= Math.min(n, 12); k++) { const int = bal * i; const pr = pay - int; bal -= pr; rows.push([k, int, pr, Math.max(bal, 0)]); }

  return (
    <div className="form">
      <label>Loan amount<input type="number" value={p} onChange={(e) => setP(e.target.value)} /></label>
      <label>Annual interest %<input type="number" step="any" value={r} onChange={(e) => setR(e.target.value)} /></label>
      <label>Term in months<input type="number" value={m} onChange={(e) => setM(e.target.value)} /></label>
      {ok && (
        <>
          <div className="stats"><div><b>{pay.toFixed(2)}</b><span>Monthly</span></div><div><b>{(pay * n).toFixed(2)}</b><span>Total paid</span></div><div><b>{(pay * n - P).toFixed(2)}</b><span>Interest</span></div></div>
          <table className="table"><thead><tr><th>#</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead>
            <tbody>{rows.map((x) => <tr key={x[0]}><td>{x[0]}</td>{x.slice(1).map((v, j) => <td key={j}>{v.toFixed(2)}</td>)}</tr>)}</tbody></table>
          {n > 12 && <small>First 12 months shown. Reducing-balance method.</small>}
        </>
      )}
    </div>
  );
}
