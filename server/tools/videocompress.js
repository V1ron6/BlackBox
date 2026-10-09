import fs from 'fs';
import path from 'path';
import { has, ff, tmp, clean, send, baseName, MAX_SECONDS } from '../lib/util.js';

const CRF = { light: 28, medium: 32, strong: 36 };

export default {
  id: 'video-compress',
  heavy: true,
  timeout: 290_000,
  check: () => has('ffmpeg', ['-version']),
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload a video');
    const crf = CRF[req.body.level] || CRF.medium;
    const d = tmp();
    try {
      const out = path.join(d, 'out.mp4');
      await ff(['-i', files[0].path, '-vf', 'scale=-2:min(720\\,ih)', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf),
        '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', '-t', MAX_SECONDS, out]);
      if (!fs.existsSync(out)) throw new Error('Compression failed');
      await send(res, out, baseName(files[0]) + '-small.mp4');
    } finally { clean(d); }
  },
};
