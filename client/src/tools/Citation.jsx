import { useState } from 'react';
import { Copy, Loader2, Search } from 'lucide-react';

const FIELDS = [['author', 'Author (Surname, F.)'], ['year', 'Year'], ['title', 'Title'], ['publisher', 'Publisher / Journal / Site'], ['url', 'URL or DOI link (optional)']];
const STYLES = {
  APA: (f) => `${f.author} (${f.year}). ${f.title}. ${f.publisher}.${f.url ? ' ' + f.url : ''}`,
  MLA: (f) => `${f.author}. ${f.title}. ${f.publisher}, ${f.year}${f.url ? ', ' + f.url : ''}.`,
  Harvard: (f) => `${f.author} (${f.year}) ${f.title}. ${f.publisher}.${f.url ? ' Available at: ' + f.url : ''}`,
};
const initials = (g = '') => g.split(/[\s-]+/).filter(Boolean).map((p) => p[0].toUpperCase() + '.').join(' ');

export default function Citation() {
  const [f, setF] = useState({ author: '', year: '', title: '', publisher: '', url: '' });
  const [style, setStyle] = useState('APA');
  const [doi, setDoi] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const out = f.author && f.title ? STYLES[style](f) : '';

  async function fill() {
    setBusy(true); setError('');
    try {
      const id = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
      const r = await fetch('https://api.crossref.org/works/' + encodeURIComponent(id));
      if (!r.ok) throw new Error('DOI not found');
      const m = (await r.json()).message;
      const au = (m.author || []).map((a) => `${a.family}, ${initials(a.given)}`.trim());
      setF({
        author: au.length > 3 ? `${au[0]} et al.` : au.join(', '),
        year: String(m.issued?.['date-parts']?.[0]?.[0] ?? ''),
        title: m.title?.[0] || '',
        publisher: m['container-title']?.[0] || m.publisher || '',
        url: 'https://doi.org/' + m.DOI,
      });
    } catch (e) { setError(e.message || 'Could not look up that DOI'); }
    finally { setBusy(false); }
  }

  return (
    <div className="form">
      <div className="row"><input value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="DOI (optional), e.g. 10.1038/nature14539" /><button onClick={fill} disabled={!doi.trim() || busy}>{busy ? <Loader2 size={16} className="spin" /> : <Search size={16} />} Fill</button></div>
      {error && <div className="notice err">{error}</div>}
      <select value={style} onChange={(e) => setStyle(e.target.value)}>{Object.keys(STYLES).map((s) => <option key={s}>{s}</option>)}</select>
      {FIELDS.map(([k, label]) => <input key={k} placeholder={label} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}
      {out && <><div className="notice">{out}</div><button type="button" onClick={() => navigator.clipboard?.writeText(out).catch(() => {})}><Copy size={16} /> Copy</button></>}
      <small>DOI lookup uses Crossref (free). Plain text output: italicise the title where your style requires it, and check details against the source.</small>
    </div>
  );
}
