import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export const sh = (cmd, args, ms = 120_000) =>
  new Promise((ok, no) =>
    execFile(cmd, args, { timeout: ms, maxBuffer: 1 << 26 }, (e, out, err) =>
      e ? no(new Error(String(err || e.message).trim().split('\n').slice(-3).join(' ').slice(0, 300))) : ok(String(out))));

// Resolves true when the binary exists, otherwise a human-readable reason.
export const has = (cmd, args = ['--version']) =>
  new Promise((r) => execFile(cmd, args, (e) => r(e && e.code === 'ENOENT' ? `${cmd} is not installed on the server` : true)));

export const lazy = async (name) => { try { await import(name); return true; } catch { return `${name} is not installed on the server`; } };
export const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bb-'));
export const clean = (d) => fs.rm(d, { recursive: true, force: true }, () => {});
export const send = (res, file, name) =>
  new Promise((done) => res.download(file, name, (e) => { if (e && !res.headersSent) res.status(500).json({ error: 'Could not send file' }); done(); }));
export const soffice = (dir, args) => sh('soffice', [`-env:UserInstallation=file://${dir}/lo`, '--headless', ...args], 100_000);
export const ff = (args) => sh('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], 280_000);
export const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
export const baseName = (f) => String(f.originalname || 'file').replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '_') || 'file';

// "1-3,5" -> zero-based indexes (order kept), clamped to n pages
export const ranges = (s, n) => {
  const out = [];
  for (const part of String(s || '').split(',')) {
    const [a, b] = part.trim().split('-').map(Number);
    if (!a || a < 1) continue;
    for (let i = a; i <= Math.min(b || a, n); i++) out.push(i - 1);
  }
  return out;
};

// Free hosting has very little CPU: cap how much media one job may process (seconds)
export const MAX_SECONDS = String(parseInt(process.env.MAX_MEDIA_SECONDS, 10) || 300);
