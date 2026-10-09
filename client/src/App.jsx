import { Suspense, useEffect, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { ArrowLeft, Box, Loader2, Search, Star } from 'lucide-react';
import { CATEGORIES, TOOLS } from './data.js';
import { ICONS } from './icons.js';
import { CLIENT_TOOLS } from './tools/index.js';
import { API } from './lib/api.js';
import ToolBoundary from './components/ToolBoundary.jsx';
import ServerTool from './components/ServerTool.jsx';
import Admin from './Admin.jsx';

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH;

function useFavs() {
  const [favs, setFavs] = useState(() => { try { return JSON.parse(localStorage.getItem('bb-favs')) || []; } catch { return []; } });
  const toggle = (id) => setFavs((f) => {
    const n = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    try { localStorage.setItem('bb-favs', JSON.stringify(n)); } catch { /* storage unavailable */ }
    return n;
  });
  return [favs, toggle];
}

function Home({ status }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [favs, toggle] = useFavs();
  const list = TOOLS
    .filter((t) => (cat === 'All' || t.category === cat) && (t.name + t.desc).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => favs.includes(b.id) - favs.includes(a.id));

  return (
    <div className="page">
      <div className="search"><Search size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools" /></div>
      <div className="chips">{CATEGORIES.map((c) => <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div className="grid">
        {list.map((t) => {
          const Icon = ICONS[t.icon] || Box;
          const off = t.kind === 'server' && status && !status[t.id]?.ok;
          const fav = favs.includes(t.id);
          return (
            <Link to={`/tool/${t.id}`} key={t.id} className="card">
              <Icon size={22} /><h3>{t.name}</h3><p>{t.desc}</p>
              {off && <span className="badge">Offline</span>}
              <button className={'star' + (fav ? ' on' : '')} aria-label="Favourite" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(t.id); }}>
                <Star size={16} fill={fav ? 'currentColor' : 'none'} />
              </button>
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
  const st = status ? status[id] || { ok: false, reason: 'Not available on this server' } : undefined;

  return (
    <div className="page">
      <Link to="/" className="back"><ArrowLeft size={16} /> All tools</Link>
      <h2><Icon size={22} /> {t.name}</h2>
      <p>{t.desc}</p>
      <ToolBoundary key={id}>
        {Client
          ? <Suspense fallback={<Loader2 className="spin" />}><Client /></Suspense>
          : <ServerTool tool={t} status={st} down={down} />}
      </ToolBoundary>
    </div>
  );
}

export default function App() {
  const [status, setStatus] = useState(null);
  const [down, setDown] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 3000);
    fetch(`${API}/api/tools`).then((r) => r.json())
      .then((l) => setStatus(Object.fromEntries(l.map((s) => [s.id, s]))))
      .catch(() => setDown(true)) // backend down: client-side tools still work
      .finally(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <header><Link to="/"><Box size={20} /> Blackbox</Link></header>
      {slow && !status && !down && (
        <div className="notice banner"><Loader2 size={16} className="spin" /> Waking the server (free hosting sleeps when idle, this can take about a minute). Browser tools work meanwhile.</div>
      )}
      <Routes>
        <Route path="/" element={<Home status={status} />} />
        <Route path="/tool/:id" element={<ToolPage status={status} down={down} />} />
        {ADMIN_PATH && <Route path={`/${ADMIN_PATH}`} element={<Admin />} />}
        <Route path="*" element={<div className="page">Not found.</div>} />
      </Routes>
    </>
  );
}
