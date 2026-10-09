import { useState } from 'react';

export default function Regex() {
  const [pat, setPat] = useState('(\\w+)@(\\w+\\.\\w+)');
  const [flags, setFlags] = useState('i');
  const [text, setText] = useState('mail ama@example.com or kofi@test.org');
  let matches = [], error = '';
  try {
    if (pat) matches = [...text.matchAll(new RegExp(pat, [...new Set((flags + 'g').split(''))].join('')))].slice(0, 200);
  } catch (e) { error = e.message; }

  return (
    <div className="form wide">
      <div className="row"><input value={pat} onChange={(e) => setPat(e.target.value)} placeholder="Pattern" /><input value={flags} onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ''))} placeholder="flags" style={{ maxWidth: 90 }} /></div>
      <textarea rows="6" value={text} onChange={(e) => setText(e.target.value)} />
      {error && <div className="notice err">{error}</div>}
      <small>{matches.length} match{matches.length === 1 ? '' : 'es'}</small>
      <ul className="links">{matches.map((m, i) => <li key={i}><b>{JSON.stringify(m[0])}</b> at {m.index}{m.length > 1 && <span> groups: {m.slice(1).map((g) => JSON.stringify(g)).join(', ')}</span>}</li>)}</ul>
    </div>
  );
}
