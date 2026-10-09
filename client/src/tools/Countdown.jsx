import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const load = () => { try { return JSON.parse(localStorage.getItem('bb-countdowns')) || []; } catch { return []; } };

export default function Countdown() {
  const [items, setItems] = useState(load);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 60000); return () => clearInterval(t); }, []);
  const save = (n) => { setItems(n); try { localStorage.setItem('bb-countdowns', JSON.stringify(n)); } catch { /* storage unavailable */ } };
  const left = (d) => { const ms = new Date(d + 'T00:00:00') - Date.now(); return ms <= 0 ? 'Passed' : `${Math.floor(ms / 86400000)} days, ${Math.floor((ms % 86400000) / 3600000)} hours`; };

  return (
    <div className="form">
      <div className="row"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Exam or deadline" /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={() => { if (name && date) { save([...items, { id: Math.random(), name, date }].sort((a, b) => a.date.localeCompare(b.date))); setName(''); setDate(''); } }}><Plus size={16} /></button></div>
      <ul className="links">{items.map((i) => <li key={i.id} className="row"><span><b>{i.name}</b> ({i.date}): {left(i.date)}</span><button onClick={() => save(items.filter((x) => x.id !== i.id))}><Trash2 size={16} /></button></li>)}</ul>
      <small>Saved in this browser only.</small>
    </div>
  );
}
