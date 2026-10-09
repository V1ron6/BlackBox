import fs from 'fs';
import path from 'path';
import { has, sh, tmp, clean } from '../lib/util.js';

export default {
  id: 'ocr',
  heavy: true,
  timeout: 180_000,
  check: () => has('tesseract'),
  async run(req, res, files) {
    const f = files[0];
    if (!f) throw new Error('Upload an image or scanned PDF');
    const d = tmp();
    try {
      let imgs;
      if (/\.pdf$/i.test(f.originalname)) {
        if ((await has('pdftoppm', ['-v'])) !== true) throw new Error('pdftoppm (poppler) is needed for PDFs');
        await sh('pdftoppm', ['-png', '-r', '200', '-l', '15', f.path, path.join(d, 'p')], 100_000);
        imgs = fs.readdirSync(d).filter((x) => /^p.*\.png$/.test(x)).sort().map((x) => path.join(d, x));
      } else imgs = [f.path];
      let text = '';
      for (const [i, img] of imgs.entries()) {
        const base = path.join(d, 'o' + i);
        await sh('tesseract', [img, base, '-l', 'eng'], 60_000);
        text += fs.readFileSync(base + '.txt', 'utf8') + '\n';
      }
      if (!text.trim()) throw new Error('No text found');
      res.type('text/plain').attachment('ocr.txt').send(text);
    } finally { clean(d); }
  },
};
