import { useState } from 'react';
import { Download } from 'lucide-react';
import { textPdf, download } from '../lib/pdf.js';

export default function NotesPdf() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  return (
    <div className="form">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" />
      <textarea rows="14" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type or paste your notes" />
      <button disabled={!body.trim()} onClick={async () => download(await textPdf(title, body), (title || 'notes').replace(/[^\w-]+/g, '_') + '.pdf')}><Download size={16} /> Save as PDF</button>
      <small>Latin characters only; other symbols print as ?.</small>
    </div>
  );
}
