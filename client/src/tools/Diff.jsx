import { useState } from 'react';
import { diffLines } from 'diff';

export default function Diff() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const parts = a || b ? diffLines(a, b) : [];

  return (
    <div className="form wide">
      <div className="two">
        <textarea rows="8" value={a} onChange={(e) => setA(e.target.value)} placeholder="Original" />
        <textarea rows="8" value={b} onChange={(e) => setB(e.target.value)} placeholder="Changed" />
      </div>
      {parts.length > 0 && (
        <pre className="diff">{parts.map((p, i) => <span key={i} className={p.added ? 'add' : p.removed ? 'del' : ''}>{(p.added ? '+ ' : p.removed ? '- ' : '  ') + p.value.replace(/\n$/, '').split('\n').join('\n' + (p.added ? '+ ' : p.removed ? '- ' : '  ')) + '\n'}</span>)}</pre>
      )}
    </div>
  );
}
