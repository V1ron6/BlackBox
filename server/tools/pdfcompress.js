import path from 'path';
import { has, sh, tmp, clean, send, baseName } from '../lib/util.js';

export default {
  id: 'pdf-compress',
  heavy: true,
  timeout: 150_000,
  check: () => has('gs'),
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload a PDF');
    const q = ['screen', 'ebook', 'printer'].includes(req.body.quality) ? req.body.quality : 'ebook';
    const d = tmp();
    try {
      const out = path.join(d, 'out.pdf');
      await sh('gs', ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', `-dPDFSETTINGS=/${q}`, '-dNOPAUSE', '-dQUIET', '-dBATCH', `-sOutputFile=${out}`, files[0].path], 140_000);
      await send(res, out, baseName(files[0]) + '-compressed.pdf');
    } finally { clean(d); }
  },
};
