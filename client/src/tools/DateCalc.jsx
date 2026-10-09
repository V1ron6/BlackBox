import { useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

export default function DateCalc() {
  const [a, setA] = useState(today());
  const [b, setB] = useState(today());
  const [birth, setBirth] = useState('');
  const [add, setAdd] = useState('30');

  let age = '';
  if (birth) {
    const d = new Date(birth), n = new Date();
    let y = n.getFullYear() - d.getFullYear(), m = n.getMonth() - d.getMonth(), dd = n.getDate() - d.getDate();
    if (dd < 0) { m--; dd += new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    age = `${y} years, ${m} months, ${dd} days`;
  }
  const later = new Date(new Date(a).getTime() + (parseInt(add, 10) || 0) * 86400000);

  return (
    <div className="form">
      <h3>Days between</h3>
      <div className="row"><input type="date" value={a} onChange={(e) => setA(e.target.value)} /><input type="date" value={b} onChange={(e) => setB(e.target.value)} /></div>
      {a && b && <div className="notice">{Math.abs(days(a, b))} days ({(Math.abs(days(a, b)) / 7).toFixed(1)} weeks)</div>}
      <h3>Add days to the first date</h3>
      <input type="number" value={add} onChange={(e) => setAdd(e.target.value)} />
      {a && !isNaN(later) && <div className="notice">{later.toDateString()}</div>}
      <h3>Age</h3>
      <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
      {age && <div className="notice">{age}</div>}
    </div>
  );
}
