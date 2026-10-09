import { useState } from 'react';

const syl = (w) => {
  w = w.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  return (w.match(/[aeiouy]{1,2}/g) || []).length || 1;
};
const band = (s) => (s >= 90 ? 'Very easy' : s >= 70 ? 'Easy' : s >= 60 ? 'Plain English' : s >= 50 ? 'Fairly difficult' : s >= 30 ? 'Difficult' : 'Very difficult');

export default function Readability() {
  const [t, setT] = useState('');
  const words = t.match(/[A-Za-z']+/g) || [];
  const sentences = Math.max(1, (t.match(/[.!?]+(\s|$)/g) || []).length);
  const syllables = words.reduce((s, w) => s + syl(w), 0);
  const ready = words.length >= 5;
  const fre = ready ? 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length) : 0;
  const grade = ready ? 0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59 : 0;

  return (
    <div className="form">
      <textarea rows="10" value={t} onChange={(e) => setT(e.target.value)} placeholder="Paste English text (5+ words)" />
      {ready && (
        <div className="stats">
          <div><b>{fre.toFixed(0)}</b><span>Reading ease</span></div>
          <div><b>{grade.toFixed(1)}</b><span>Grade level</span></div>
          <div><b>{band(fre)}</b><span>Rating</span></div>
          <div><b>{(words.length / sentences).toFixed(1)}</b><span>Words / sentence</span></div>
        </div>
      )}
    </div>
  );
}
