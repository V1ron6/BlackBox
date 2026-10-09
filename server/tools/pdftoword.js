import fs from 'fs';
import path from 'path';
import { has, tmp, clean, soffice, send, baseName } from '../lib/util.js';

export default {
  id: 'pdf-to-word',
  heavy: true,
  timeout: 110_000,
  check: () => has('soffice'),
  async run(req, res, files) {
    const f = files[0];
    if (!f || !/\.pdf$/i.test(f.originalname)) throw new Error('Upload a PDF');
    const d = tmp();
    try {
      const src = path.join(d, 'in.pdf');
      fs.copyFileSync(f.path, src);
      await soffice(d, ['--infilter=writer_pdf_import', '--convert-to', 'docx:MS Word 2007 XML', '--outdir', d, src]);
      const out = path.join(d, 'in.docx');
      if (!fs.existsSync(out)) throw new Error('Conversion failed. Scanned PDFs need OCR instead.');
      await send(res, out, baseName(f) + '.docx');
    } finally { clean(d); }
  },
};
