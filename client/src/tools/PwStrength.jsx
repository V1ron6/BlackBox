import { useState } from 'react';

const COMMON = ['password', '123456', 'qwerty', 'letmein', 'admin', 'welcome', 'iloveyou', 'abc123', 'monkey', 'dragon', 'ghana'];

function score(pw) {
  if (!pw) return null;
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 32;
  let bits = pw.length * Math.log2(pool || 1);
  const tips = [];
  if (pw.length < 12) tips.push('Use 12 or more characters');
  if (/(.)\1{2,}/.test(pw)) { bits *= 0.7; tips.push('Avoid repeated characters'); }
  if (/(0123|1234|2345|3456|abcd|bcde|qwer|asdf)/i.test(pw)) { bits *= 0.6; tips.push('Avoid sequences like 1234 or qwerty'); }
  if (COMMON.some((c) => pw.toLowerCase().includes(c))) { bits = Math.min(bits, 20); tips.push('Contains a very common word'); }
  if (!/[A-Z]/.test(pw) || !/\d/.test(pw)) tips.push('Mix upper case, digits and symbols');
  const label = bits < 28 ? 'Very weak' : bits < 40 ? 'Weak' : bits < 60 ? 'Fair' : bits < 80 ? 'Strong' : 'Very strong';
  return { bits: Math.round(bits), label, tips };
}

export default function PwStrength() {
  const [pw, setPw] = useState('');
  const r = score(pw);
  return (
    <div className="form">
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Type a password to test" autoComplete="off" />
      {r && <><h3 className="big">{r.label} ({r.bits} bits)</h3><ul className="links">{r.tips.map((t) => <li key={t}>{t}</li>)}</ul></>}
      <small>Checked in your browser only. Nothing is sent anywhere. An estimate, not a guarantee.</small>
    </div>
  );
}
