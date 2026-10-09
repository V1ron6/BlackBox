import { useState } from 'react';

// factor = how many base units in one of this unit
const U = {
  Length: { base: 'm', u: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 } },
  Mass: { u: { kg: 1, g: 0.001, mg: 1e-6, t: 1000, lb: 0.45359237, oz: 0.028349523 } },
  Volume: { u: { L: 1, mL: 0.001, 'm3': 1000, 'gal (US)': 3.785411784, 'qt (US)': 0.946352946, 'cup (US)': 0.2365882365, 'fl oz (US)': 0.0295735296 } },
  Area: { u: { 'm2': 1, 'km2': 1e6, 'ha': 1e4, 'acre': 4046.8564224, 'ft2': 0.09290304, 'mi2': 2589988.110336 } },
  Speed: { u: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, knot: 0.514444 } },
  Data: { u: { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824 } },
  Temperature: { u: { C: 1, F: 1, K: 1 } },
};
const temp = (v, from, to) => {
  const c = from === 'C' ? v : from === 'F' ? (v - 32) * 5 / 9 : v - 273.15;
  return to === 'C' ? c : to === 'F' ? c * 9 / 5 + 32 : c + 273.15;
};

export default function Units() {
  const [cat, setCat] = useState('Length');
  const keys = Object.keys(U[cat].u);
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('km');
  const [val, setVal] = useState('1');
  const pick = (c) => { const k = Object.keys(U[c].u); setCat(c); setFrom(k[0]); setTo(k[1] || k[0]); };
  const n = parseFloat(val);
  const out = !Number.isFinite(n) ? '' : cat === 'Temperature' ? temp(n, from, to) : (n * U[cat].u[from]) / U[cat].u[to];

  return (
    <div className="form">
      <div className="chips">{Object.keys(U).map((c) => <button key={c} className={c === cat ? 'on' : ''} onClick={() => pick(c)}>{c}</button>)}</div>
      <input type="number" step="any" value={val} onChange={(e) => setVal(e.target.value)} />
      <div className="row">
        <select value={from} onChange={(e) => setFrom(e.target.value)}>{keys.map((k) => <option key={k}>{k}</option>)}</select>
        <select value={to} onChange={(e) => setTo(e.target.value)}>{keys.map((k) => <option key={k}>{k}</option>)}</select>
      </div>
      {out !== '' && <h3 className="big">{Number(out.toPrecision(10))} {to}</h3>}
    </div>
  );
}
