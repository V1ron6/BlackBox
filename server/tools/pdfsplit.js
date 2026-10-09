import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';

// "1-3,5" -> zero-based page indexes, clamped to the document length
const parse = (s, n) => {
  const out = [];
  for (const part of String(s || '').split(',')) {
    const [a, b] = part.trim().split('-').map(Number);
    if (!a || a < 1) continue;
    for (let i = a; i <= Math.min(b || a, n); i++) out.push(i - 1);
  }
  return out;
};

export default {
  id: 'pdf-split',
  check: async () => true,
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload a PDF');
    const src = await PDFDocument.load(await fs.readFile(files[0].path));
    const pages = parse(req.body.ranges, src.getPageCount());
    if (!pages.length) throw new Error('No valid pages. Use a format like 1-3,5');
    const out = await PDFDocument.create();
    (await out.copyPages(src, pages)).forEach((p) => out.addPage(p));
    res.type('pdf').attachment('extracted.pdf').send(Buffer.from(await out.save()));
  },
};
