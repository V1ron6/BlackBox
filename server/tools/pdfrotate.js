import fs from 'fs/promises';
import { PDFDocument, degrees } from 'pdf-lib';
import { ranges } from '../lib/util.js';

export default {
  id: 'pdf-rotate',
  check: async () => true,
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload a PDF');
    const doc = await PDFDocument.load(await fs.readFile(files[0].path));
    const n = doc.getPageCount();
    const sel = String(req.body.pages || '').trim() ? ranges(req.body.pages, n) : [...Array(n).keys()];
    if (!sel.length) throw new Error('No valid pages. Use a format like 1-3,5 or leave empty for all');
    const a = [90, 180, 270].includes(+req.body.angle) ? +req.body.angle : 90;
    const pages = doc.getPages();
    sel.forEach((i) => pages[i].setRotation(degrees((pages[i].getRotation().angle + a) % 360)));
    res.type('pdf').attachment('rotated.pdf').send(Buffer.from(await doc.save()));
  },
};
