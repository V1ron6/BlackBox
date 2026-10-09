import { useState } from 'react';
import { marked } from 'marked';
import TurndownService from 'turndown';

export default function MarkdownHtml() {
  const [md, setMd] = useState('# Hello\n\nSome **bold** text.');
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  const toHtml = () => { try { setHtml(marked.parse(md)); setError(''); } catch (e) { setError(e.message); } };
  const toMd = () => { try { setMd(new TurndownService({ headingStyle: 'atx' }).turndown(html)); setError(''); } catch (e) { setError(e.message); } };

  return (
    <div className="form wide">
      <label>Markdown<textarea rows="8" value={md} onChange={(e) => setMd(e.target.value)} /></label>
      <div className="row"><button onClick={toHtml}>Markdown to HTML</button><button onClick={toMd}>HTML to Markdown</button></div>
      <label>HTML<textarea rows="8" value={html} onChange={(e) => setHtml(e.target.value)} /></label>
      {error && <div className="notice err">{error}</div>}
      {html && <iframe title="preview" sandbox="" srcDoc={html} className="preview" />}
    </div>
  );
}
