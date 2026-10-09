import { useState } from 'react';

export default function Percent() {
  const [v, setV] = useState({ a: '20', b: '150', c: '80', d: '100', e: '200', f: '25' });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const n = (k) => parseFloat(v[k]);
  const fmt = (x) => (Number.isFinite(x) ? Number(x.toFixed(4)) : '-');
  const In = ({ k }) => <input type="number" step="any" value={v[k]} onChange={set(k)} />;

  return (
    <div className="form">
      <div className="card-lite"><span>What is</span><div className="row"><In k="a" /><span>% of</span><In k="b" /></div><b>= {fmt((n('a') / 100) * n('b'))}</b></div>
      <div className="card-lite"><span>What percent is</span><div className="row"><In k="c" /><span>of</span><In k="d" /></div><b>= {fmt((n('c') / n('d')) * 100)}%</b></div>
      <div className="card-lite"><span>Price</span><div className="row"><In k="e" /><span>with</span><In k="f" /><span>% off</span></div><b>= {fmt(n('e') * (1 - n('f') / 100))} (saves {fmt((n('e') * n('f')) / 100)})</b></div>
    </div>
  );
}
