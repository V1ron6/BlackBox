import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn, execFile } from 'child_process';

// Public http(s) only; blocks obvious local/private targets.
const PUBLIC_URL = /^https?:\/\/(?!(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.))/i;
const HEIGHTS = { best: 0, '1080p': 1080, '720p': 720, '480p': 480, '360p': 360 };
const AUDIO = ['mp3', 'm4a', 'flac', 'wav', 'opus', 'aac'];
const BITRATES = ['128', '192', '256', '320'];

export default {
  id: 'video',
  heavy: true,
  timeout: 300_000,
  check: () => new Promise((r) => execFile('yt-dlp', ['--version'], (e) => r(e ? 'yt-dlp is not installed on the server' : true))),
  run(req, res) {
    const { url, format } = req.body;
    if (!PUBLIC_URL.test(url || '')) return Promise.reject(new Error('Enter a valid public URL'));
    const h = HEIGHTS[req.body.quality] ?? 720;
    const af = AUDIO.includes(req.body.audio_format) ? req.body.audio_format : 'mp3';
    const ab = BITRATES.includes(req.body.audio_quality) ? req.body.audio_quality : '192';
    const tpl = path.join(os.tmpdir(), `bb-${Date.now()}${Math.random().toString(36).slice(2)}.%(ext)s`);
    const sel = h
      ? `bv*[height<=${h}][ext=mp4]+ba[ext=m4a]/b[height<=${h}][ext=mp4]/bv*[height<=${h}]+ba/b[height<=${h}]/b`
      : 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b';
    const args = [
      '--no-playlist', '--no-warnings', '--socket-timeout', '20',
      '--max-filesize', process.env.DL_MAX_SIZE || '300M',
      ...(process.env.YTDLP_COOKIES ? ['--cookies', process.env.YTDLP_COOKIES] : []),
      ...(process.env.YTDLP_PROXY ? ['--proxy', process.env.YTDLP_PROXY] : []),
      '-o', tpl, '--print', 'after_move:filepath',
      ...(format === 'audio'
        ? ['-f', 'bestaudio/best', '-x', '--audio-format', af, '--audio-quality', `${ab}K`]
        : ['-f', sel, '--merge-output-format', 'mp4']),
      '--', url,
    ];
    return new Promise((resolve, reject) => {
      let out = '';
      const p = spawn('yt-dlp', args, { timeout: 280_000 });
      p.stdout.on('data', (d) => (out += d));
      p.on('error', reject);
      p.on('close', (code) => {
        const file = out.trim().split('\n').pop();
        if (code || !file || !fs.existsSync(file)) return reject(new Error('Download failed. The site may be unsupported, blocking, or the file is too large.'));
        res.download(file, path.basename(file).replace(/^bb-[^.]*/, 'download'), () => { fs.rm(file, () => {}); resolve(); });
      });
    });
  },
};
