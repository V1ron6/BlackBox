import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

const esc = (s) => String(s).replace(/([\;,:"])/g, '\\$1');
const MODES = ['Text', 'WiFi', 'Contact'];

export default function Qr() {
  const [mode, setMode] = useState('Text');
  const [f, setF] = useState({ text: '', ssid: '', pass: '', sec: 'WPA', name: '', phone: '', email: '', org: '' });
  const [img, setImg] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const data = mode === 'Text' ? f.text
    : mode === 'WiFi' ? (f.ssid ? `WIFI:T:${f.sec === 'None' ? 'nopass' : f.sec};S:${esc(f.ssid)};${f.sec === 'None' ? '' : `P:${esc(f.pass)};`};` : '')
    : f.name ? `BEGIN:VCARD\nVERSION:3.0\nFN:${f.name}\n${f.org ? `ORG:${f.org}\n` : ''}${f.phone ? `TEL:${f.phone}\n` : ''}${f.email ? `EMAIL:${f.email}\n` : ''}END:VCARD` : '';

  useEffect(() => {
    if (!data) return setImg('');
    QRCode.toDataURL(data, { width: 320, margin: 2 }).then(setImg).catch(() => setImg(''));
  }, [data]);

  return (
    <div className="form">
      <div className="chips">{MODES.map((m) => <button key={m} className={m === mode ? 'on' : ''} onClick={() => setMode(m)}>{m}</button>)}</div>
      {mode === 'Text' && <input value={f.text} onChange={set('text')} placeholder="Text or link" />}
      {mode === 'WiFi' && <>
        <input value={f.ssid} onChange={set('ssid')} placeholder="Network name (SSID)" />
        <select value={f.sec} onChange={set('sec')}><option>WPA</option><option>WEP</option><option>None</option></select>
        {f.sec !== 'None' && <input value={f.pass} onChange={set('pass')} placeholder="Password" />}
      </>}
      {mode === 'Contact' && ['name', 'org', 'phone', 'email'].map((k) => <input key={k} value={f[k]} onChange={set(k)} placeholder={{ name: 'Full name', org: 'Organisation', phone: 'Phone', email: 'Email' }[k]} />)}
      {img && <><img src={img} alt="QR code" className="qr" /><a className="btn" href={img} download="qr.png"><Download size={16} /> Download PNG</a></>}
    </div>
  );
}
