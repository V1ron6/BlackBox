import { useState } from 'react';
import { csvToObjects, objectsToCSV } from '../lib/csv.js';

export default function DataConvert() {
  const [csv, setCsv] = useState('name,score\nAma,90\nKofi,85');
  const [json, setJson] = useState('');
  const [error, setError] = useState('');

  const run = (fn) => () => { try { fn(); setError(''); } catch (e) { setError(e.message); } };
  return (
    <div className="form wide">
      <label>CSV<textarea rows="8" value={csv} onChange={(e) => setCsv(e.target.value)} /></label>
      <div className="row">
        <button onClick={run(() => setJson(JSON.stringify(csvToObjects(csv), null, 2)))}>CSV to JSON</button>
        <button onClick={run(() => setCsv(objectsToCSV(JSON.parse(json))))}>JSON to CSV</button>
      </div>
      <label>JSON<textarea rows="8" value={json} onChange={(e) => setJson(e.target.value)} /></label>
      {error && <div className="notice err">{error}</div>}
    </div>
  );
}
