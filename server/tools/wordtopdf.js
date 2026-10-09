import fs from 'fs';
import path from 'path';
import { has, tmp, clean, soffice, send, baseName } from '../lib/util.js';

const OK = /\.(docx?|odt|rtf|txt|xlsx?|ods|csv|pptx?|odp)$/i;

export default {
  id: 'word-to-pdf',
  heavy: true,
  timeout: 110_000,
  check: () => has('soffice'),
  async run(req, res, files) {
    const f = files[0];
    if (!f || !OK.test(f.originalname)) throw new Error('Upload a Word, Excel, PowerPoint, ODF, RTF, CSV or TXT file');
    const d = tmp();
    try {
      const src = path.join(d, 'in' + path.extname(f.originalname).toLowerCase());
      fs.copyFileSync(f.path, src);
      await soffice(d, ['--convert-to', 'pdf', '--outdir', d, src]);
      const pdf = path.join(d, 'in.pdf');
      if (!fs.existsSync(pdf)) throw new Error('Conversion failed');
      await send(res, pdf, baseName(f) + '.pdf');
    } finally { clean(d); }
  },
};
