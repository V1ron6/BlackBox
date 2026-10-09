import { useState } from 'react';

export default function GradeTarget() {
  const [v, setV] = useState({ gpa: '3.0', done: '60', target: '3.5', next: '15', max: '4' });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const [gpa, done, target, next, max] = ['gpa', 'done', 'target', 'next', 'max'].map((k) => parseFloat(v[k]));
  const ok = [gpa, done, target, next, max].every(Number.isFinite) && next > 0;
  const need = ok ? (target * (done + next) - gpa * done) / next : 0;
  const L = { gpa: 'Current CGPA', done: 'Credits completed', target: 'Target CGPA', next: 'Credits still to take', max: 'Maximum GPA on your scale' };

  return (
    <div className="form">
      {Object.keys(L).map((k) => <label key={k}>{L[k]}<input type="number" step="any" value={v[k]} onChange={set(k)} /></label>)}
      {ok && (
        <div className={'notice' + (need > max ? ' err' : '')}>
          {need > max ? `Not reachable: you would need ${need.toFixed(2)}, above the maximum of ${max}.`
            : need <= 0 ? 'You already meet this target whatever you score.'
            : `You need an average GPA of ${need.toFixed(2)} over the next ${next} credits.`}
        </div>
      )}
    </div>
  );
}
