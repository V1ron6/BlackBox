import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { ranges } from '../lib/util.js';

export default {
  id: 'pdf-reorder',
  check: async () => true,
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload a PDF');
    const src = await PDFDocument.load(await fs.readFile(files[0].path));
    const n = src.getPageCount();
    const sel = ranges(req.body.pages, n);
    let order;
    if (req.body.mode === 'delete') {
      const drop = new Set(sel);
      order = [...Array(n).keys()].filter((i) => !drop.has(i));
    } else order = sel;
    if (!order.length) throw new Error(req.body.mode === 'delete' ? 'Nothing left after deleting' : 'No valid pages. Example: 3,1,2');
    const out = await PDFDocument.create();
    (await out.copyPages(src, order)).forEach((p) => out.addPage(p));
    res.type('pdf').attachment('reordered.pdf').send(Buffer.from(await out.save()));
  },
};
