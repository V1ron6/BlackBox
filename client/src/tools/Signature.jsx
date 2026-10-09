import { useState } from 'react';
import { Copy } from 'lucide-react';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FIELDS = [['name', 'Full name'], ['title', 'Job title'], ['company', 'Company'], ['phone', 'Phone'], ['email', 'Email'], ['site', 'Website (https://...)']];

export default function Signature() {
  const [f, setF] = useState({ name: '', title: '', company: '', phone: '', email: '', site: '' });
  const [done, setDone] = useState(false);
  const safeUrl = /^https?:\/\//i.test(f.site) ? f.site : '';
  const html = `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#222"><tr><td style="padding-right:12px;border-right:3px solid #22c55e"></td><td style="padding-left:12px">
<div style="font-size:15px;font-weight:bold">${esc(f.name || 'Your Name')}</div>
<div>${esc([f.title, f.company].filter(Boolean).join(' | '))}</div>
<div>${[f.phone && esc(f.phone), f.email && `<a href="mailto:${esc(f.email)}">${esc(f.email)}</a>`].filter(Boolean).join(' | ')}</div>
${safeUrl ? `<div><a href="${esc(safeUrl)}">${esc(f.site)}</a></div>` : ''}</td></tr></table>`;

  return (
    <div className="form wide">
      {FIELDS.map(([k, l]) => <input key={k} placeholder={l} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}
      <iframe title="preview" sandbox="" srcDoc={`<body style="background:#fff;margin:12px">${html}</body>`} className="preview" />
      <button onClick={() => { navigator.clipboard?.writeText(html).then(() => setDone(true)).catch(() => {}); }}><Copy size={16} /> {done ? 'Copied' : 'Copy HTML'}</button>
      <small>Paste the HTML into your email client's signature settings (some need an HTML signature option).</small>
    </div>
  );
}
