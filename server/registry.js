import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';
import { fileURLToPath, pathToFileURL } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools');
const MAX = (parseInt(process.env.MAX_UPLOAD_MB, 10) || 25) * 1024 * 1024;
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: MAX } });
export const tools = new Map();
export const disabled = new Set((process.env.DISABLE_TOOLS || '').split(',').map((x) => x.trim()).filter(Boolean));
export const stats = {};
export const jobs = []; // recent runs, newest first (in memory)

// Each tool loads in its own try/catch: a broken module is skipped, never fatal.
export async function loadTools() {
  for (const f of fs.readdirSync(dir)) {
    try {
      const t = (await import(pathToFileURL(path.join(dir, f)).href)).default;
      tools.set(t.id, t);
      stats[t.id] = { runs: 0, errors: 0 };
    } catch (e) {
      console.error('tool load failed:', f, e.message);
    }
  }
}

function withTimeout(p, ms, msg) {
  let t;
  const timer = new Promise((_, rej) => { t = setTimeout(() => rej(new Error(msg)), ms); });
  return Promise.race([p, timer]).finally(() => clearTimeout(t));
}

// Heavy tools (LibreOffice, ffmpeg, OCR...) run one at a time by default so a small server is not overwhelmed.
const MAX_HEAVY = parseInt(process.env.MAX_HEAVY_JOBS, 10) || 1;
let running = 0;
const waiting = [];
const acquire = () => {
  if (running < MAX_HEAVY) { running++; return Promise.resolve(); }
  if (waiting.length >= 3) return Promise.reject(new Error('Server is busy. Try again in a minute.'));
  return new Promise((r) => waiting.push(r));
};
const release = () => { const n = waiting.shift(); if (n) n(); else running--; };

let cache = { at: 0, data: null };
export async function listTools() {
  if (cache.data && Date.now() - cache.at < 30_000) {
    return cache.data.map((x) => (disabled.has(x.id) ? { ...x, ok: false, reason: 'Disabled by admin' } : x));
  }
  const out = await Promise.all([...tools.values()].map(async (t) => {
    let ok = true, reason;
    try {
      const c = await withTimeout(Promise.resolve(t.check()), 6000, 'Health check timed out');
      if (c !== true) { ok = false; reason = String(c); }
    } catch (e) { ok = false; reason = e.message; }
    return { id: t.id, ok, reason };
  }));
  cache = { at: Date.now(), data: out };
  return out.map((x) => (disabled.has(x.id) ? { ...x, ok: false, reason: 'Disabled by admin' } : x));
}

export function runTool(req, res) {
  const t = tools.get(req.params.id);
  if (!t || disabled.has(t.id)) return res.status(503).json({ error: 'Tool unavailable' });
  upload.array('files', 20)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const files = req.files || [];
    res.on('close', () => files.forEach((f) => fs.rm(f.path, () => {})));
    stats[t.id].runs++;
    const started = Date.now();
    let error, held = false;
    try {
      if (t.heavy) { await acquire(); held = true; }
      await withTimeout(Promise.resolve(t.run(req, res, files)), t.timeout || 120_000, 'Timed out');
    } catch (e) {
      error = e.message;
      stats[t.id].errors++;
      console.error(t.id, e.message);
      if (!res.headersSent) res.status(500).json({ error: e.message });
      else res.end();
    } finally {
      if (held) release();
      jobs.unshift({ id: t.id, at: new Date().toISOString(), ms: Date.now() - started, ok: !error, error });
      jobs.length = Math.min(jobs.length, 100);
    }
  });
}
