import { useState } from 'react';
import yaml from 'js-yaml';

export default function Yaml() {
  const [y, setY] = useState('name: Blackbox\ntools:\n  - pdf\n  - qr');
  const [j, setJ] = useState('');
  const [error, setError] = useState('');
  const run = (fn) => () => { try { fn(); setError(''); } catch (e) { setError(e.message); } };

  return (
    <div className="form wide">
      <label>YAML<textarea rows="8" value={y} onChange={(e) => setY(e.target.value)} /></label>
      <div className="row">
        <button onClick={run(() => setJ(JSON.stringify(yaml.load(y), null, 2)))}>YAML to JSON</button>
        <button onClick={run(() => setY(yaml.dump(JSON.parse(j))))}>JSON to YAML</button>
        <button onClick={run(() => { setY(yaml.dump(yaml.load(y))); })}>Tidy YAML</button>
      </div>
      <label>JSON<textarea rows="8" value={j} onChange={(e) => setJ(e.target.value)} /></label>
      {error && <div className="notice err">{error}</div>}
    </div>
  );
}
