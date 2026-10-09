import fs from 'fs';
import path from 'path';
import { has, ff, tmp, clean, send, baseName, MAX_SECONDS } from '../lib/util.js';

const ARGS = {
  mp3: ['-vn', '-codec:a', 'libmp3lame', '-q:a', '2'],
  wav: ['-vn'],
  mp4: ['-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac', '-movflags', '+faststart'],
  webm: ['-c:v', 'libvpx', '-crf', '10', '-b:v', '1M', '-c:a', 'libvorbis'],
  gif: ['-vf', 'fps=12,scale=480:-1:flags=lanczos', '-t', '15'],
};

export default {
  id: 'media-convert',
  heavy: true,
  timeout: 290_000,
  check: () => has('ffmpeg', ['-version']),
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload a video or audio file');
    const ext = ARGS[req.body.target] ? req.body.target : 'mp3';
    const d = tmp();
    try {
      const out = path.join(d, `out.${ext}`);
      await ff(['-i', files[0].path, '-t', MAX_SECONDS, ...ARGS[ext], out]);
      if (!fs.existsSync(out)) throw new Error('Conversion failed');
      await send(res, out, `${baseName(files[0])}.${ext}`);
    } finally { clean(d); }
  },
};
