import { Suspense, useEffect, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { ArrowLeft, Box, Loader2, Search } from 'lucide-react';
import { CATEGORIES, TOOLS } from './data.js';
import { ICONS } from './icons.js';
import { CLIENT_TOOLS } from './tools/index.js';
import ToolBoundary from './components/ToolBoundary.jsx';
import ServerTool from './components/ServerTool.jsx';
import Admin from './Admin.jsx';

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH;

function Home({ status }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const list = TOOLS.filter((t) => (cat === 'All' || t.category === cat) && (t.name + t.desc).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page">
      <div className="search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools" /></div>
      <div className="chips">{CATEGORIES.map((c) => <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div className="grid">
        {list.map((t) => {
          const Icon = ICONS[t.icon] || Box;
          const off = t.kind === 'server' && status && status[t.id] && !status[t.id].ok;
          return (
            <Link to={`/tool/${t.id}`} key={t.id} className="card">
              <Icon size={22} /><h3>{t.name}</h3><p>{t.desc}</p>
              {off && <span className="badge">Offline</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ToolPage({ status, down }) {
  const { id } = useParams();
  const t = TOOLS.find((x) => x.id === id);
  if (!t) return <div className="page">Tool not found.</div>;
  const Icon = ICONS[t.icon] || Box;
  const Client = CLIENT_TOOLS[id];

  return (
    <div className="page">
      <Link to="/" className="back"><ArrowLeft size={16} /> All tools</Link>
      <h2><Icon size={22} /> {t.name}</h2>
      <p>{t.desc}</p>
      <ToolBoundary key={id}>
        {Client
          ? <Suspense fallback={<Loader2 className="spin" />}><Client /></Suspense>
          : <ServerTool tool={t} status={status?.[id]} down={down} />}
      </ToolBoundary>
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState(null);
  const [down, setDown] = useState(false);

  useEffect(() => {
    fetch('/api/tools').then((r) => r.json())
      .then((l) => setStatus(Object.fromEntries(l.map((s) => [s.id, s]))))
      .catch(() => setDown(true)); // backend down: client-side tools still work
  }, []);

  return (
    <>
      <header><Link to="/"><Box size={20} /> Blackbox</Link></header>
      <Routes>
        <Route path="/" element={<Home status={status} />} />
        <Route path="/tool/:id" element={<ToolPage status={status} down={down} />} />
        {ADMIN_PATH && <Route path={`/${ADMIN_PATH}`} element={<Admin />} />}
        <Route path="*" element={<div className="page">Not found.</div>} />
      </Routes>
    </>
  );
}
