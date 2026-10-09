import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

const make = (n) => Array.from({ length: n }, () => crypto.randomUUID()).join('\n');

export default function Uuid() {
  const [n, setN] = useState(5);
  const [out, setOut] = useState(() => make(5));
  return (
    <div className="form">
      <label>How many: {n}<input type="range" min="1" max="50" value={n} onChange={(e) => setN(+e.target.value)} /></label>
      <textarea readOnly rows="8" value={out} />
      <div className="row">
        <button onClick={() => setOut(make(n))}><RefreshCw size={16} /> Generate</button>
        <button onClick={() => navigator.clipboard?.writeText(out).catch(() => {})}><Copy size={16} /> Copy</button>
      </div>
    </div>
  );
}
