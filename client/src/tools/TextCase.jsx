import { useState } from 'react';

const title = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
const sentence = (s) => s.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, a, b) => a + b.toUpperCase());
const MODES = { UPPER: (s) => s.toUpperCase(), lower: (s) => s.toLowerCase(), 'Title Case': title, 'Sentence case': sentence,
  camelCase: (s) => title(s).replace(/[^A-Za-z0-9]+/g, '').replace(/^./, (c) => c.toLowerCase()), snake_case: (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
  'kebab-case': (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') };

export default function TextCase() {
  const [t, setT] = useState('');
  return (
    <div className="form">
      <textarea rows="8" value={t} onChange={(e) => setT(e.target.value)} placeholder="Type or paste text" />
      <div className="chips">{Object.entries(MODES).map(([k, fn]) => <button key={k} onClick={() => setT(fn(t))}>{k}</button>)}</div>
    </div>
  );
}
