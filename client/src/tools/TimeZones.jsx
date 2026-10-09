import { useState } from 'react';

const DEFAULTS = ['Africa/Accra', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Europe/Berlin', 'Africa/Lagos', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney'];
const valid = (z) => { try { new Intl.DateTimeFormat('en', { timeZone: z }); return true; } catch { return false; } };

// offset (ms) of a zone at an instant
function offset(ts, zone) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(ts)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ts / 1000) * 1000;
}
// wall-clock "YYYY-MM-DDTHH:mm" in a zone -> instant
function instant(local, zone) {
  const [d, t] = local.split('T'); const [y, mo, da] = d.split('-').map(Number); const [h, mi] = t.split(':').map(Number);
  const guess = Date.UTC(y, mo - 1, da, h, mi);
  let ts = guess - offset(guess, zone);
  ts = guess - offset(ts, zone);
  return ts;
}

export default function TimeZones() {
  const [src, setSrc] = useState('Africa/Accra');
  const [local, setLocal] = useState(() => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  const [zones, setZones] = useState(DEFAULTS);
  const [extra, setExtra] = useState('');
  const ts = local ? instant(local, src) : NaN;
  const fmt = (z) => new Intl.DateTimeFormat('en-GB', { timeZone: z, weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(ts));

  return (
    <div className="form">
      <label>Meeting time in<select value={src} onChange={(e) => setSrc(e.target.value)}>{zones.map((z) => <option key={z}>{z}</option>)}</select></label>
      <input type="datetime-local" value={local} onChange={(e) => setLocal(e.target.value)} />
      {Number.isFinite(ts) && <table className="table"><tbody>{zones.map((z) => <tr key={z}><td>{z.replace('_', ' ')}</td><td>{fmt(z)}</td></tr>)}</tbody></table>}
      <div className="row">
        <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Add zone, e.g. Africa/Nairobi" />
        <button onClick={() => { if (valid(extra) && !zones.includes(extra)) { setZones([...zones, extra]); setExtra(''); } }}>Add</button>
      </div>
    </div>
  );
}
