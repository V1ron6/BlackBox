import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn, execFile } from 'child_process';

// Public http(s) only; blocks obvious local/private targets.
const PUBLIC_URL = /^https?:\/\/(?!(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.))/i;

export default {
  id: 'video',
  timeout: 300_000,
  check: () => new Promise((r) => execFile('yt-dlp', ['--version'], (e) => r(e ? 'yt-dlp is not installed on the server' : true))),
  run(req, res) {
    const { url, format } = req.body;
    if (!PUBLIC_URL.test(url || '')) return Promise.reject(new Error('Enter a valid public URL'));
    const tpl = path.join(os.tmpdir(), `bb-${Date.now()}${Math.random().toString(36).slice(2)}.%(ext)s`);
    const args = ['--no-playlist', '-o', tpl, '--print', 'after_move:filepath',
      ...(format === 'audio' ? ['-x', '--audio-format', 'mp3'] : ['-f', 'b[ext=mp4]/b']), '--', url];
    return new Promise((resolve, reject) => {
      let out = '';
      const p = spawn('yt-dlp', args, { timeout: 280_000 });
      p.stdout.on('data', (d) => (out += d));
      p.on('error', reject);
      p.on('close', (code) => {
        const file = out.trim().split('\n').pop();
        if (code || !file || !fs.existsSync(file)) return reject(new Error('Download failed. The site may be unsupported or blocking.'));
        res.download(file, path.basename(file).replace(/^bb-[^.]*/, 'download'), () => { fs.rm(file, () => {}); resolve(); });
      });
    });
  },
};
