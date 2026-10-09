import fs from 'fs';
import path from 'path';
import { has, ff, tmp, clean, send, baseName, MAX_SECONDS } from '../lib/util.js';

// "90", "1.5" or "mm:ss" / "hh:mm:ss" -> seconds
const toSec = (v) => {
  const s = String(v ?? '').trim();
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  const m = s.match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/);
  return m ? (+(m[1] || 0)) * 3600 + +m[2] * 60 + +m[3] : NaN;
};

export default {
  id: 'media-trim',
  heavy: true,
  timeout: 290_000,
  check: () => has('ffmpeg', ['-version']),
  async run(req, res, files) {
    const f = files[0];
    if (!f) throw new Error('Upload a video or audio file');
    const start = toSec(req.body.start || '0');
    const end = toSec(req.body.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('Use times like 30 or 1:15, with end after start');
    const ext = (path.extname(f.originalname).toLowerCase().match(/^\.[a-z0-9]{2,4}$/) || ['.mp4'])[0];
    const d = tmp();
    try {
      const out = path.join(d, 'out' + ext);
      await ff(['-ss', String(start), '-i', f.path, '-t', String(Math.min(end - start, +MAX_SECONDS)), out]);
      if (!fs.existsSync(out)) throw new Error('Trim failed');
      await send(res, out, baseName(f) + '-trimmed' + ext);
    } finally { clean(d); }
  },
};
