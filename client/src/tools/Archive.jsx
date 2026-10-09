import { useState } from 'react';
import { zipSync, unzipSync } from 'fflate';
import { Download } from 'lucide-react';

const save = (bytes, name) => {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([bytes])), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

export default function Archive() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');

  async function zip(e) {
    try {
      const files = [...e.target.files];
      if (!files.length) return;
      const data = {};
      for (const f of files) data[f.name] = new Uint8Array(await f.arrayBuffer());
      save(zipSync(data), 'archive.zip'); setError('');
    } catch (err) { setError(err.message); }
  }
  async function unzip(e) {
    try {
      const f = e.target.files[0];
      if (!f) return;
      const out = unzipSync(new Uint8Array(await f.arrayBuffer()));
      setEntries(Object.entries(out).filter(([n]) => !n.endsWith('/'))); setError('');
    } catch { setEntries(null); setError('Could not read that zip file'); }
  }

  return (
    <div className="form">
      <label>Zip files<input type="file" multiple onChange={zip} /></label>
      <label>Unzip a .zip<input type="file" accept=".zip" onChange={unzip} /></label>
      {error && <div className="notice err">{error}</div>}
      {entries && (
        <ul className="links">
          {entries.map(([n, b]) => <li key={n} className="row"><span>{n}</span><button onClick={() => save(b, n.split('/').pop())}><Download size={16} /></button></li>)}
        </ul>
      )}
      <small>Runs in your browser. Files are not uploaded.</small>
    </div>
  );
}
