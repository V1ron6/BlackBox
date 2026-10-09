import { useState } from 'react';

export default function JsonFormat() {
  const [t, setT] = useState('');
  const [error, setError] = useState('');

  const apply = (spaces) => {
    try { setT(JSON.stringify(JSON.parse(t), null, spaces)); setError(''); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="form">
      <textarea rows="12" value={t} onChange={(e) => setT(e.target.value)} placeholder="Paste JSON" />
      <div className="row"><button onClick={() => apply(2)}>Prettify</button><button onClick={() => apply(0)}>Minify</button></div>
      {error && <div className="notice err">{error}</div>}
    </div>
  );
}
