import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const SCALE = { A: 4, 'B+': 3.5, B: 3, 'C+': 2.5, C: 2, 'D+': 1.5, D: 1, F: 0 };
const blank = () => ({ id: Math.random(), grade: 'A', credits: 3 });

export default function Gpa() {
  const [rows, setRows] = useState([blank()]);
  const set = (id, patch) => setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const total = rows.reduce((s, r) => s + (+r.credits || 0), 0);
  const points = rows.reduce((s, r) => s + SCALE[r.grade] * (+r.credits || 0), 0);

  return (
    <div className="form">
      {rows.map((r) => (
        <div className="row" key={r.id}>
          <select value={r.grade} onChange={(e) => set(r.id, { grade: e.target.value })}>
            {Object.keys(SCALE).map((g) => <option key={g}>{g}</option>)}
          </select>
          <input type="number" min="0" value={r.credits} onChange={(e) => set(r.id, { credits: e.target.value })} />
          <button type="button" onClick={() => setRows(rows.filter((x) => x.id !== r.id))}><Trash2 size={16} /></button>
        </div>
      ))}
      <button type="button" onClick={() => setRows([...rows, blank()])}><Plus size={16} /> Add course</button>
      <h3 className="big">GPA: {total ? (points / total).toFixed(2) : '0.00'}</h3>
      <small>4.0 scale. Adjust SCALE in Gpa.jsx to match your school.</small>
    </div>
  );
}
