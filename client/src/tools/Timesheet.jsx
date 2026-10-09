import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const row = () => ({ id: Math.random(), day: '', from: '08:00', to: '17:00', brk: '60' });
const mins = (r) => { const [a, b] = [r.from, r.to].map((t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; }); return Math.max(0, b - a - (parseInt(r.brk, 10) || 0)); };

export default function Timesheet() {
  const [rows, setRows] = useState([row()]);
  const [rate, setRate] = useState('');
  const upd = (id, p) => setRows(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const total = rows.reduce((s, r) => s + mins(r), 0);

  return (
    <div className="form wide">
      {rows.map((r) => (
        <div className="row" key={r.id}>
          <input value={r.day} onChange={(e) => upd(r.id, { day: e.target.value })} placeholder="Day" />
          <input type="time" value={r.from} onChange={(e) => upd(r.id, { from: e.target.value })} />
          <input type="time" value={r.to} onChange={(e) => upd(r.id, { to: e.target.value })} />
          <input type="number" value={r.brk} onChange={(e) => upd(r.id, { brk: e.target.value })} style={{ maxWidth: 80 }} title="Break (min)" />
          <span>{(mins(r) / 60).toFixed(2)}h</span>
          <button onClick={() => setRows(rows.filter((x) => x.id !== r.id))}><Trash2 size={16} /></button>
        </div>
      ))}
      <button onClick={() => setRows([...rows, row()])}><Plus size={16} /> Add day</button>
      <label>Hourly rate (optional)<input type="number" step="any" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
      <h3 className="big">{Math.floor(total / 60)}h {total % 60}m{rate ? ` = ${((total / 60) * parseFloat(rate)).toFixed(2)}` : ''}</h3>
      <small>Columns: day, start, end, break in minutes.</small>
    </div>
  );
}
