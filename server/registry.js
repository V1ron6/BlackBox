import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';
import { fileURLToPath, pathToFileURL } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools');
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 50 * 1024 * 1024 } });
export const tools = new Map();
export const disabled = new Set();
export const stats = {};

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

const timeout = (ms, msg) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));

export async function listTools() {
  const out = [];
  for (const t of tools.values()) {
    let ok = true, reason;
    try {
      const c = await Promise.race([t.check(), timeout(3000, 'Health check timed out')]);
      if (c !== true) { ok = false; reason = String(c); }
    } catch (e) { ok = false; reason = e.message; }
    if (disabled.has(t.id)) { ok = false; reason = 'Disabled by admin'; }
    out.push({ id: t.id, ok, reason });
  }
  return out;
}

export function runTool(req, res) {
  const t = tools.get(req.params.id);
  if (!t || disabled.has(t.id)) return res.status(503).json({ error: 'Tool unavailable' });
  upload.array('files', 10)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const files = req.files || [];
    res.on('close', () => files.forEach((f) => fs.rm(f.path, () => {})));
    stats[t.id].runs++;
    try {
      await Promise.race([t.run(req, res, files), timeout(t.timeout || 120_000, 'Timed out')]);
    } catch (e) {
      stats[t.id].errors++;
      console.error(t.id, e.message);
      if (!res.headersSent) res.status(500).json({ error: e.message });
      else res.end();
    }
  });
}
