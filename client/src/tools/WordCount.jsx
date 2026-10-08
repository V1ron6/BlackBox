import { useState } from 'react';

export default function WordCount() {
  const [t, setT] = useState('');
  const words = t.trim() ? t.trim().split(/\s+/).length : 0;
  const sentences = (t.match(/[^.!?]+[.!?]+/g) || []).length;
  const stats = [['Words', words], ['Characters', t.length], ['Sentences', sentences], ['Reading time', `${Math.ceil(words / 230)} min`]];

  return (
    <div className="form">
      <textarea rows="10" value={t} onChange={(e) => setT(e.target.value)} placeholder="Paste or type here" />
      <div className="stats">{stats.map(([k, v]) => <div key={k}><b>{v}</b><span>{k}</span></div>)}</div>
    </div>
  );
}
