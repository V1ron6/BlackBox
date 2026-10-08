import { useState } from 'react';
import { Loader2, Download, AlertTriangle } from 'lucide-react';

export default function ServerTool({ tool, status, down }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [links, setLinks] = useState([]);

  if (down) return <div className="notice err"><AlertTriangle size={18} /> Can't reach the server right now.</div>;
  if (status && !status.ok) return <div className="notice err"><AlertTriangle size={18} /> Offline: {status.reason}</div>;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(''); setLinks([]);
    try {
      const r = await fetch(`/api/tools/${tool.id}/run`, { method: 'POST', body: new FormData(e.target) });
      const type = r.headers.get('content-type') || '';
      if (type.includes('json')) {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Failed');
        setLinks(j.links || []);
      } else {
        if (!r.ok) throw new Error('Failed');
        const name = (r.headers.get('content-disposition') || '').match(/filename="?([^";]+)"?/)?.[1] || 'download';
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(await r.blob()), download: name });
        a.click(); URL.revokeObjectURL(a.href);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="form">
      {tool.fields?.map((f) => (
        <label key={f.name}>{f.label}
          {f.options
            ? <select name={f.name}>{f.options.map((o) => <option key={o}>{o}</option>)}</select>
            : <input name={f.name} required />}
        </label>
      ))}
      {tool.accept && <label>Files<input type="file" name="files" accept={tool.accept} multiple={tool.multiple} required /></label>}
      <button disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Download size={16} />} Run</button>
      {error && <div className="notice err"><AlertTriangle size={18} /> {error}</div>}
      {links.length > 0 && (
        <ul className="links">{links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer" download>{l.title}</a></li>)}</ul>
      )}
    </form>
  );
}
