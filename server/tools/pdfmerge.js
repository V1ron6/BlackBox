import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';

export default {
  id: 'pdf-merge',
  check: async () => true,
  async run(req, res, files) {
    if (files.length < 2) throw new Error('Upload at least 2 PDFs');
    const out = await PDFDocument.create();
    for (const f of files) {
      const doc = await PDFDocument.load(await fs.readFile(f.path));
      (await out.copyPages(doc, doc.getPageIndices())).forEach((p) => out.addPage(p));
    }
    res.type('pdf').attachment('merged.pdf').send(Buffer.from(await out.save()));
  },
};
