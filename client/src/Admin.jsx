import { useState } from 'react';
import { Power, RefreshCw } from 'lucide-react';

export default function Admin() {
  const [key, setKey] = useState(sessionStorage.getItem('bbk') || '');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const headers = { 'x-admin-key': key };

  async function load() {
    try {
      const r = await fetch('/api/admin/status', { headers });
      if (!r.ok) throw new Error('Denied');
      sessionStorage.setItem('bbk', key);
      setData(await r.json()); setError('');
    } catch (e) { setData(null); setError(e.message); }
  }
  async function toggle(id) { await fetch(`/api/admin/toggle/${id}`, { method: 'POST', headers }); load(); }

  return (
    <div className="page">
      <h2>Control</h2>
      <div className="row">
        <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin key" />
        <button onClick={load}><RefreshCw size={16} /> Load</button>
      </div>
      {error && <div className="notice err">{error}</div>}
      {data && (
        <>
          <small>Uptime {data.uptime}s</small>
          <ul className="links">
            {data.tools.map((t) => (
              <li key={t.id} className="row">
                <span>{t.id} {t.ok ? 'OK' : `OFF (${t.reason})`} | runs {data.stats[t.id]?.runs} | errors {data.stats[t.id]?.errors}</span>
                <button onClick={() => toggle(t.id)}><Power size={16} /></button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
