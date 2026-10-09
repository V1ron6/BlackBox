export function parseCSV(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x !== ''));
}
export const csvToObjects = (text) => { const [h, ...r] = parseCSV(text); return r.map((x) => Object.fromEntries(h.map((k, i) => [k, x[i] ?? '']))); };
const esc = (v) => { const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export function objectsToCSV(arr) {
  if (!Array.isArray(arr) || !arr.length || typeof arr[0] !== 'object') throw new Error('Expected a JSON array of objects');
  const keys = [...new Set(arr.flatMap((o) => Object.keys(o)))];
  return [keys.map(esc).join(','), ...arr.map((o) => keys.map((k) => esc(o[k])).join(','))].join('\n');
}
