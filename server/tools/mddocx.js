import fs from 'fs';
import path from 'path';
import { has, lazy, tmp, clean, soffice, send, baseName } from '../lib/util.js';

export default {
  id: 'md-docx',
  heavy: true,
  timeout: 110_000,
  check: async () => {
    for (const c of [await has('soffice'), await lazy('marked'), await lazy('turndown')]) if (c !== true) return c;
    return true;
  },
  async run(req, res, files) {
    const f = files[0];
    if (!f) throw new Error('Upload a .md/.txt or .docx file');
    const d = tmp();
    try {
      if (/\.docx$/i.test(f.originalname)) {
        const src = path.join(d, 'in.docx');
        fs.copyFileSync(f.path, src);
        await soffice(d, ['--convert-to', 'html', '--outdir', d, src]);
        const { default: Turndown } = await import('turndown');
        const td = new Turndown({ headingStyle: 'atx' });
        td.remove(['style', 'script', 'head', 'title']);
        const md = td.turndown(fs.readFileSync(path.join(d, 'in.html'), 'utf8')).trim();
        res.type('text/markdown').attachment(baseName(f) + '.md').send(md);
      } else {
        const { marked } = await import('marked');
        const html = `<html><body>${marked.parse(fs.readFileSync(f.path, 'utf8'))}</body></html>`;
        const src = path.join(d, 'in.html');
        fs.writeFileSync(src, html);
        await soffice(d, ['--infilter=HTML (StarWriter)', '--convert-to', 'docx:MS Word 2007 XML', '--outdir', d, src]);
        const out = path.join(d, 'in.docx');
        if (!fs.existsSync(out)) throw new Error('Conversion failed');
        await send(res, out, baseName(f) + '.docx');
      }
    } finally { clean(d); }
  },
};
