import { useState } from 'react';

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export default function Hash() {
  const [out, setOut] = useState([]);
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  async function run(bytes) {
    try {
      if (!crypto.subtle) throw new Error('Hashing needs HTTPS or localhost');
      setOut(await Promise.all(ALGOS.map(async (a) => [a, hex(await crypto.subtle.digest(a, bytes))]))); setError('');
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="form">
      <textarea rows="4" value={text} onChange={(e) => { setText(e.target.value); run(new TextEncoder().encode(e.target.value)); }} placeholder="Text to hash" />
      <label>Or a file<input type="file" onChange={async (e) => e.target.files[0] && run(await e.target.files[0].arrayBuffer())} /></label>
      {error && <div className="notice err">{error}</div>}
      {out.map(([a, h]) => <label key={a}>{a}<textarea readOnly rows="2" value={h} /></label>)}
      <small>MD5 is not offered because it is broken for security use.</small>
    </div>
  );
}
