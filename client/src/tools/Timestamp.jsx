import { useState } from 'react';

export default function Timestamp() {
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [dt, setDt] = useState('');
  const n = Number(ts);
  const ms = n > 1e11 ? n : n * 1000;
  const d = new Date(ms);
  const parsed = dt ? new Date(dt) : null;

  return (
    <div className="form">
      <label>Unix timestamp (seconds or milliseconds)<input value={ts} onChange={(e) => setTs(e.target.value)} /></label>
      {ts && !isNaN(d) && <div className="notice">{d.toISOString()}<br />{d.toLocaleString()}</div>}
      <label>Date and time to timestamp<input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} /></label>
      {parsed && !isNaN(parsed) && <div className="notice">{Math.floor(parsed / 1000)} s | {parsed.getTime()} ms</div>}
      <button onClick={() => setTs(String(Math.floor(Date.now() / 1000)))}>Now</button>
    </div>
  );
}
