import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Standard PDF fonts only cover Latin-1; swap anything else for '?'
export const safe = (s) => String(s ?? '').replace(/\t/g, '  ').replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '?');

export const download = (bytes, name, type = 'application/pdf') => {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([bytes], { type })), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

export function wrap(font, size, text, maxW) {
  const lines = [];
  for (const para of safe(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const t = line ? `${line} ${word}` : word;
      if (line && font.widthOfTextAtSize(t, size) > maxW) { lines.push(line); line = word; } else line = t;
    }
    lines.push(line);
  }
  return lines;
}

// Simple top-to-bottom page writer with wrapping and automatic page breaks
export class Writer {
  static async create({ margin = 50 } = {}) {
    const w = new Writer();
    w.doc = await PDFDocument.create();
    w.font = await w.doc.embedFont(StandardFonts.Helvetica);
    w.bold = await w.doc.embedFont(StandardFonts.HelveticaBold);
    w.W = 595; w.H = 842; w.m = margin;
    w.add();
    return w;
  }
  add() { this.page = this.doc.addPage([this.W, this.H]); this.y = this.H - this.m; }
  space(n = 8) { this.y -= n; }
  need(h) { if (this.y - h < this.m) this.add(); }
  write(text, { size = 11, bold = false, x = this.m, maxW = this.W - this.m - x, color = rgb(0.1, 0.1, 0.1), after = 4 } = {}) {
    const font = bold ? this.bold : this.font;
    for (const line of wrap(font, size, text, maxW)) {
      this.need(size * 1.3);
      this.y -= size;
      this.page.drawText(line, { x, y: this.y, size, font, color });
      this.y -= size * 0.3;
    }
    this.y -= after;
  }
  // one row of positioned cells: [text, x, 'l' | 'r']
  row(cells, { size = 10, bold = false } = {}) {
    const font = bold ? this.bold : this.font;
    this.need(size * 1.6);
    this.y -= size;
    for (const [t, x, al] of cells) {
      const s = safe(t);
      this.page.drawText(s, { x: al === 'r' ? x - font.widthOfTextAtSize(s, size) : x, y: this.y, size, font, color: rgb(0.1, 0.1, 0.1) });
    }
    this.y -= size * 0.6;
  }
  rule() {
    this.need(6);
    this.page.drawLine({ start: { x: this.m, y: this.y }, end: { x: this.W - this.m, y: this.y }, thickness: 0.7, color: rgb(0.7, 0.7, 0.7) });
    this.y -= 8;
  }
  save() { return this.doc.save(); }
}

export async function textPdf(title, body) {
  const w = await Writer.create();
  if (title) { w.write(title, { size: 18, bold: true, after: 10 }); }
  w.write(body, { size: 11, after: 0 });
  return w.save();
}
