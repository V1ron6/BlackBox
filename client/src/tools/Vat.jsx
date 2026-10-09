import { useState } from 'react';

export default function Vat() {
  const [amt, setAmt] = useState('100');
  const [rate, setRate] = useState('15');
  const [levy, setLevy] = useState('0');
  const [mode, setMode] = useState('add');
  const a = parseFloat(amt), r = (parseFloat(rate) || 0) + (parseFloat(levy) || 0);
  const ok = Number.isFinite(a);
  const net = ok ? (mode === 'add' ? a : a / (1 + r / 100)) : 0;
  const tax = (net * r) / 100;

  return (
    <div className="form">
      <div className="chips">
        <button className={mode === 'add' ? 'on' : ''} onClick={() => setMode('add')}>Add tax</button>
        <button className={mode === 'remove' ? 'on' : ''} onClick={() => setMode('remove')}>Remove tax</button>
      </div>
      <label>{mode === 'add' ? 'Price before tax' : 'Price including tax'}<input type="number" step="any" value={amt} onChange={(e) => setAmt(e.target.value)} /></label>
      <label>VAT / tax rate %<input type="number" step="any" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
      <label>Extra levies % (optional, added to the rate)<input type="number" step="any" value={levy} onChange={(e) => setLevy(e.target.value)} /></label>
      {ok && <div className="stats"><div><b>{net.toFixed(2)}</b><span>Net</span></div><div><b>{tax.toFixed(2)}</b><span>Tax</span></div><div><b>{(net + tax).toFixed(2)}</b><span>Gross</span></div></div>}
      <small>Check the current rates that apply to you. This tool only does the arithmetic.</small>
    </div>
  );
}
