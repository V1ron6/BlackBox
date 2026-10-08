import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';

const soffice = (args) =>
  new Promise((ok, no) => execFile('soffice', args, { timeout: 90_000 }, (e, out) => (e ? no(e) : ok(out))));

export default {
  id: 'word-to-pdf',
  timeout: 100_000,
  check: () => new Promise((r) => execFile('soffice', ['--version'], (e) => r(e ? 'LibreOffice (soffice) is not installed on the server' : true))),
  async run(req, res, files) {
    const f = files[0];
    if (!f || !/\.(docx?|odt|rtf|txt)$/i.test(f.originalname)) throw new Error('Upload a .doc, .docx, .odt, .rtf or .txt file');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-'));
    try {
      const src = path.join(dir, 'in' + path.extname(f.originalname).toLowerCase());
      fs.copyFileSync(f.path, src);
      await soffice(['--headless', '--convert-to', 'pdf', '--outdir', dir, src]);
      const pdf = path.join(dir, 'in.pdf');
      if (!fs.existsSync(pdf)) throw new Error('Conversion failed');
      await new Promise((done) => res.download(pdf, f.originalname.replace(/\.[^.]+$/, '') + '.pdf', done));
    } finally {
      fs.rm(dir, { recursive: true, force: true }, () => {});
    }
  },
};
