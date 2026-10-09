import { useState } from 'react';

const FN = { sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, sqrt: Math.sqrt, ln: Math.log, log: Math.log10, abs: Math.abs, exp: Math.exp };
const TRIG = new Set(['sin', 'cos', 'tan']);
const ATRIG = new Set(['asin', 'acos', 'atan']);

function evaluate(src, deg) {
  const clean = src.replace(/\s+/g, '').toLowerCase();
  const tok = clean.match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-z]+|[-+*/^()%!]/g) || [];
  if (!tok.length || tok.join('') !== clean) throw new Error('Invalid input');
  let i = 0;
  const peek = () => tok[i];
  const next = () => tok[i++];
  const expr = () => { let v = term(); while (peek() === '+' || peek() === '-') v = next() === '+' ? v + term() : v - term(); return v; };
  const term = () => { let v = unary(); while (peek() === '*' || peek() === '/' || peek() === '%') { const o = next(); const r = unary(); v = o === '*' ? v * r : o === '/' ? v / r : v % r; } return v; };
  const unary = () => (peek() === '-' ? (next(), -unary()) : peek() === '+' ? (next(), unary()) : power());
  const power = () => { const b = post(); if (peek() === '^') { next(); return Math.pow(b, unary()); } return b; };
  const post = () => { let v = primary(); while (peek() === '!') { next(); if (!Number.isInteger(v) || v < 0 || v > 170) throw new Error('Invalid factorial'); let f = 1; for (let k = 2; k <= v; k++) f *= k; v = f; } return v; };
  const primary = () => {
    const t = next();
    if (t === undefined) throw new Error('Unexpected end');
    if (t === '(') { const v = expr(); if (next() !== ')') throw new Error('Missing )'); return v; }
    if (/^[\d.]/.test(t)) return parseFloat(t);
    if (t === 'pi') return Math.PI;
    if (t === 'e') return Math.E;
    if (FN[t]) {
      if (next() !== '(') throw new Error(`${t} needs ( )`);
      let v = expr();
      if (next() !== ')') throw new Error('Missing )');
      if (TRIG.has(t) && deg) v = (v * Math.PI) / 180;
      const r = FN[t](v);
      return ATRIG.has(t) && deg ? (r * 180) / Math.PI : r;
    }
    throw new Error(`Unknown: ${t}`);
  };
  const v = expr();
  if (i < tok.length) throw new Error('Unexpected ' + tok[i]);
  return v;
}

export default function Calculator() {
  const [src, setSrc] = useState('');
  const [deg, setDeg] = useState(true);
  const [hist, setHist] = useState([]);
  const [error, setError] = useState('');

  const run = (e) => {
    e.preventDefault();
    try { const v = evaluate(src, deg); setHist([[src, Number(v.toPrecision(12))], ...hist].slice(0, 10)); setError(''); setSrc(''); }
    catch (err) { setError(err.message); }
  };

  return (
    <form className="form" onSubmit={run}>
      <input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="e.g. sin(30) + sqrt(16)^2 / 5!" autoFocus />
      <div className="row"><button>Calculate</button><button type="button" onClick={() => setDeg(!deg)}>{deg ? 'Degrees' : 'Radians'}</button></div>
      {error && <div className="notice err">{error}</div>}
      <ul className="links">{hist.map(([s, r], i) => <li key={i}>{s} = <b>{r}</b></li>)}</ul>
      <small>Functions: sin cos tan asin acos atan sqrt ln log abs exp. Constants: pi e. Operators: + - * / % ^ !</small>
    </form>
  );
}
