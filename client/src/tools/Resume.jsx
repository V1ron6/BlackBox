import { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { Writer, download } from '../lib/pdf.js';

const job = () => ({ id: Math.random(), role: '', org: '', dates: '', details: '' });
const edu = () => ({ id: Math.random(), school: '', degree: '', dates: '' });

export default function Resume() {
  const [p, setP] = useState({ name: '', title: '', email: '', phone: '', place: '', summary: '', skills: '' });
  const [jobs, setJobs] = useState([job()]);
  const [edus, setEdus] = useState([edu()]);
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const upd = (list, setList, id, patch) => setList(list.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  async function build() {
    const w = await Writer.create();
    w.write(p.name || 'Your Name', { size: 24, bold: true, after: 2 });
    if (p.title) w.write(p.title, { size: 13, after: 2 });
    w.write([p.email, p.phone, p.place].filter(Boolean).join('  |  '), { size: 10, after: 6 });
    w.rule();
    const head = (t) => { w.space(6); w.write(t.toUpperCase(), { size: 11, bold: true, after: 3 }); };
    if (p.summary) { head('Summary'); w.write(p.summary); }
    if (p.skills) { head('Skills'); w.write(p.skills.split(',').map((s) => s.trim()).filter(Boolean).join('  |  ')); }
    const js = jobs.filter((j) => j.role || j.org);
    if (js.length) {
      head('Experience');
      js.forEach((j) => {
        w.write(`${j.role}${j.org ? ', ' + j.org : ''}`, { bold: true, after: 1 });
        if (j.dates) w.write(j.dates, { size: 9, after: 2 });
        j.details.split('\n').filter((l) => l.trim()).forEach((l) => w.write('- ' + l.trim(), { x: 60, after: 1 }));
        w.space(6);
      });
    }
    const es = edus.filter((e) => e.school || e.degree);
    if (es.length) {
      head('Education');
      es.forEach((e) => { w.write(`${e.degree}${e.school ? ', ' + e.school : ''}`, { bold: true, after: 1 }); if (e.dates) w.write(e.dates, { size: 9 }); });
    }
    download(await w.save(), (p.name || 'resume').replace(/[^\w-]+/g, '_') + '-cv.pdf');
  }

  return (
    <div className="form wide">
      {[['name', 'Full name'], ['title', 'Job title'], ['email', 'Email'], ['phone', 'Phone'], ['place', 'Location']].map(([k, l]) => <input key={k} value={p[k]} onChange={set(k)} placeholder={l} />)}
      <textarea rows="3" value={p.summary} onChange={set('summary')} placeholder="Short summary" />
      <input value={p.skills} onChange={set('skills')} placeholder="Skills, separated by commas" />
      <h3>Experience</h3>
      {jobs.map((j) => (
        <div className="card-lite" key={j.id}>
          <div className="row">
            <input value={j.role} onChange={(e) => upd(jobs, setJobs, j.id, { role: e.target.value })} placeholder="Role" />
            <input value={j.org} onChange={(e) => upd(jobs, setJobs, j.id, { org: e.target.value })} placeholder="Organisation" />
            <button type="button" onClick={() => setJobs(jobs.filter((x) => x.id !== j.id))}><Trash2 size={16} /></button>
          </div>
          <input value={j.dates} onChange={(e) => upd(jobs, setJobs, j.id, { dates: e.target.value })} placeholder="Dates (e.g. Jan 2024 - Present)" />
          <textarea rows="3" value={j.details} onChange={(e) => upd(jobs, setJobs, j.id, { details: e.target.value })} placeholder="One achievement per line" />
        </div>
      ))}
      <button type="button" onClick={() => setJobs([...jobs, job()])}><Plus size={16} /> Add experience</button>
      <h3>Education</h3>
      {edus.map((x) => (
        <div className="row" key={x.id}>
          <input value={x.degree} onChange={(e) => upd(edus, setEdus, x.id, { degree: e.target.value })} placeholder="Degree" />
          <input value={x.school} onChange={(e) => upd(edus, setEdus, x.id, { school: e.target.value })} placeholder="School" />
          <input value={x.dates} onChange={(e) => upd(edus, setEdus, x.id, { dates: e.target.value })} placeholder="Dates" />
          <button type="button" onClick={() => setEdus(edus.filter((e) => e.id !== x.id))}><Trash2 size={16} /></button>
        </div>
      ))}
      <button type="button" onClick={() => setEdus([...edus, edu()])}><Plus size={16} /> Add education</button>
      <button onClick={build}><Download size={16} /> Download PDF</button>
    </div>
  );
}
