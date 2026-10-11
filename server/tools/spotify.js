import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import AdmZip from 'adm-zip';
import { has, tmp, clean, send } from '../lib/util.js';

const URL_RE = /^https:\/\/open\.spotify\.com\/(intl-[a-z]{2}\/)?(track|album|playlist)\/[A-Za-z0-9]+(\?.*)?$/;
const FORMATS = ['mp3', 'flac', 'ogg', 'opus', 'm4a', 'wav'];
const BITRATES = ['128k', '192k', '256k', '320k'];
const MAX_TRACKS = parseInt(process.env.SPOTIFY_MAX_TRACKS, 10) || 25;

// spotdl matches each track on YouTube Music and downloads that audio (it does not rip Spotify).
// Albums/playlists are zipped. If the time limit hits, whatever finished is still returned.
export default {
  id: 'spotify',
  heavy: true,
  timeout: 295_000,
  check: () => has('spotdl', ['--version']),
  async run(req, res) {
    const { url } = req.body;
    const format = FORMATS.includes(req.body.format) ? req.body.format : 'mp3';
    const bitrate = BITRATES.includes(req.body.bitrate) ? req.body.bitrate : '192k';
    if (!URL_RE.test(String(url || '').trim())) throw new Error('Enter a Spotify track, album or playlist link');
    const d = tmp();
    try {
      await new Promise((resolve, reject) => {
        const p = spawn('spotdl', ['download', url.trim(),
          '--output', path.join(d, '{artist} - {title}.{output-ext}'),
          '--format', format, '--bitrate', bitrate, '--threads', '2'], { stdio: 'ignore' });
        const t = setTimeout(() => p.kill('SIGKILL'), 270_000);
        p.on('error', (e) => { clearTimeout(t); reject(e); });
        p.on('close', () => { clearTimeout(t); resolve(); }); // judged by the files produced, not the exit code
      });
      const files = fs.readdirSync(d).filter((f) => f.endsWith('.' + format));
      if (!files.length) throw new Error('Nothing downloaded. Spotify or YouTube may be rate-limiting the server.');
      if (files.length === 1) return await send(res, path.join(d, files[0]), files[0]);
      const zip = new AdmZip();
      files.slice(0, MAX_TRACKS).forEach((f) => zip.addLocalFile(path.join(d, f)));
      const out = path.join(d, 'spotify.zip');
      zip.writeZip(out);
      await send(res, out, 'spotify.zip');
    } finally { clean(d); }
  },
};
