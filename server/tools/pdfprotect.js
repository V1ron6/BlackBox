import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { has, sh, tmp, clean, send, baseName } from '../lib/util.js';

export default {
  id: 'pdf-protect',
  check: () => has('qpdf'),
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload a PDF');
    const pw = String(req.body.password || '');
    if (!pw || pw.length > 128) throw new Error('Enter a password (up to 128 characters)');
    const unlock = req.body.mode === 'unlock';
    const d = tmp();
    try {
      const out = path.join(d, 'out.pdf');
      const args = unlock
        ? [`--password=${pw}`, '--decrypt', files[0].path, out]
        : ['--encrypt', pw, crypto.randomBytes(12).toString('hex'), '256', '--', files[0].path, out];
      try { await sh('qpdf', args); } catch (e) {
        // qpdf exits 3 on warnings but still writes the file
        if (!fs.existsSync(out)) throw new Error(/password/i.test(e.message) ? 'Wrong password' : e.message);
      }
      await send(res, out, baseName(files[0]) + (unlock ? '-unlocked.pdf' : '-protected.pdf'));
    } finally { clean(d); }
  },
};
