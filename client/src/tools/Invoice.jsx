import { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { Writer, download } from '../lib/pdf.js';

const item = () => ({ id: Math.random(), desc: '', qty: '1', price: '' });
const money = (n, c) => `${c} ${n.toFixed(2)}`;

export default function Invoice() {
  const [f, setF] = useState({ kind: 'Invoice', no: '001', date: new Date().toISOString().slice(0, 10), cur: 'GHS', from: '', to: '', tax: '0', notes: '' });
  const [items, setItems] = useState([item()]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const upd = (id, p) => setItems(items.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const sub = items.reduce((s, x) => s + (parseFloat(x.qty) || 0) * (parseFloat(x.price) || 0), 0);
  const tax = (sub * (parseFloat(f.tax) || 0)) / 100;

  async function build() {
    const w = await Writer.create();
    w.write(f.kind.toUpperCase(), { size: 24, bold: true, after: 6 });
    w.write(`No. ${f.no}    Date: ${f.date}`, { size: 10, after: 14 });
    w.write('From', { size: 9, bold: true, after: 1 }); w.write(f.from || '-', { after: 10 });
    w.write('To', { size: 9, bold: true, after: 1 }); w.write(f.to || '-', { after: 14 });
    w.row([['Description', 50, 'l'], ['Qty', 360, 'r'], ['Price', 450, 'r'], ['Amount', 545, 'r']], { bold: true });
    w.rule();
    for (const x of items.filter((i) => i.desc || i.price)) {
      const a = (parseFloat(x.qty) || 0) * (parseFloat(x.price) || 0);
      w.row([[x.desc.slice(0, 55), 50, 'l'], [x.qty, 360, 'r'], [(parseFloat(x.price) || 0).toFixed(2), 450, 'r'], [a.toFixed(2), 545, 'r']]);
    }
    w.rule();
    w.row([['Subtotal', 450, 'r'], [money(sub, f.cur), 545, 'r']]);
    if (tax) w.row([[`Tax (${f.tax}%)`, 450, 'r'], [money(tax, f.cur), 545, 'r']]);
    w.row([['TOTAL', 450, 'r'], [money(sub + tax, f.cur), 545, 'r']], { bold: true, size: 12 });
    if (f.notes) { w.space(16); w.write('Notes', { size: 9, bold: true, after: 1 }); w.write(f.notes); }
    download(await w.save(), `${f.kind.toLowerCase()}-${f.no}.pdf`);
  }

  return (
    <div className="form wide">
      <div className="row">
        <select value={f.kind} onChange={set('kind')}><option>Invoice</option><option>Receipt</option></select>
        <input value={f.no} onChange={set('no')} placeholder="Number" /><input type="date" value={f.date} onChange={set('date')} />
        <input value={f.cur} onChange={set('cur')} placeholder="Currency" style={{ maxWidth: 90 }} />
      </div>
      <textarea rows="3" value={f.from} onChange={set('from')} placeholder="From (your name, address, contact)" />
      <textarea rows="3" value={f.to} onChange={set('to')} placeholder="To (client name, address)" />
      {items.map((x) => (
        <div className="row" key={x.id}>
          <input value={x.desc} onChange={(e) => upd(x.id, { desc: e.target.value })} placeholder="Description" />
          <input type="number" value={x.qty} onChange={(e) => upd(x.id, { qty: e.target.value })} style={{ maxWidth: 80 }} />
          <input type="number" step="any" value={x.price} onChange={(e) => upd(x.id, { price: e.target.value })} placeholder="Price" style={{ maxWidth: 110 }} />
          <button type="button" onClick={() => setItems(items.filter((i) => i.id !== x.id))}><Trash2 size={16} /></button>
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, item()])}><Plus size={16} /> Add line</button>
      <label>Tax %<input type="number" step="any" value={f.tax} onChange={set('tax')} /></label>
      <textarea rows="2" value={f.notes} onChange={set('notes')} placeholder="Notes / payment details" />
      <h3 className="big">Total: {money(sub + tax, f.cur)}</h3>
      <button onClick={build}><Download size={16} /> Download PDF</button>
    </div>
  );
}
