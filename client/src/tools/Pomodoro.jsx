import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

const MODES = { Focus: 25 * 60, Break: 5 * 60 };

export default function Pomodoro() {
  const [mode, setMode] = useState('Focus');
  const [left, setLeft] = useState(MODES.Focus);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [run]);
  useEffect(() => { if (run && left === 0) setRun(false); }, [left, run]);

  const pick = (m) => { setMode(m); setLeft(MODES[m]); setRun(false); };
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="form">
      <div className="chips">{Object.keys(MODES).map((m) => <button key={m} className={m === mode ? 'on' : ''} onClick={() => pick(m)}>{m}</button>)}</div>
      <h3 className="big">{mm}:{ss}</h3>
      <div className="row">
        <button onClick={() => setRun(!run)}>{run ? <Pause size={16} /> : <Play size={16} />} {run ? 'Pause' : 'Start'}</button>
        <button onClick={() => pick(mode)}><RotateCcw size={16} /> Reset</button>
      </div>
      {left === 0 && <div className="notice">Time is up. Switch modes.</div>}
    </div>
  );
}
