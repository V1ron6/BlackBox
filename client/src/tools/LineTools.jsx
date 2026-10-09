import { useState } from 'react';

export default function LineTools() {
  const [t, setT] = useState('');
  const lines = () => t.split('\n');
  const acts = {
    'Sort A-Z': () => lines().sort((a, b) => a.localeCompare(b)),
    'Sort Z-A': () => lines().sort((a, b) => b.localeCompare(a)),
    'Remove duplicates': () => [...new Set(lines())],
    'Remove empty lines': () => lines().filter((l) => l.trim()),
    'Trim spaces': () => lines().map((l) => l.trim()),
    Reverse: () => lines().reverse(),
    Shuffle: () => lines().map((l) => [Math.random(), l]).sort((a, b) => a[0] - b[0]).map((x) => x[1]),
  };
  return (
    <div className="form">
      <textarea rows="10" value={t} onChange={(e) => setT(e.target.value)} placeholder="One item per line" />
      <div className="chips">{Object.entries(acts).map(([k, fn]) => <button key={k} onClick={() => setT(fn().join('\n'))}>{k}</button>)}</div>
      <small>{t ? lines().length : 0} lines</small>
    </div>
  );
}
