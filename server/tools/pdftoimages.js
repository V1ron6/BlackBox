import fs from 'fs';
import path from 'path';
import { has, lazy, sh, tmp, clean, send, baseName } from '../lib/util.js';

export default {
  id: 'pdf-to-images',
  heavy: true,
  timeout: 150_000,
  check: async () => (await has('pdftoppm', ['-v'])) === true ? lazy('adm-zip') : has('pdftoppm', ['-v']),
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload a PDF');
    const { default: AdmZip } = await import('adm-zip');
    const jpeg = req.body.format === 'jpeg';
    const d = tmp();
    try {
      await sh('pdftoppm', [jpeg ? '-jpeg' : '-png', '-r', '110', '-l', '40', files[0].path, path.join(d, 'page')], 140_000);
      const imgs = fs.readdirSync(d).filter((f) => /^page.*\.(png|jpe?g)$/.test(f)).sort();
      if (!imgs.length) throw new Error('No pages rendered');
      const z = new AdmZip();
      imgs.forEach((f) => z.addLocalFile(path.join(d, f)));
      const zip = path.join(d, 'pages.zip');
      z.writeZip(zip);
      await send(res, zip, baseName(files[0]) + '-pages.zip');
    } finally { clean(d); }
  },
};
