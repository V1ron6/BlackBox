import { Router } from 'express';
import { listTools, disabled, stats } from './registry.js';

export const adminRouter = Router();

// Hidden admin: 404 for anyone without the key. Disabled entirely if ADMIN_KEY is unset.
adminRouter.use((req, res, next) => {
  const k = process.env.ADMIN_KEY;
  if (!k || req.get('x-admin-key') !== k) return res.status(404).json({ error: 'Not found' });
  next();
});
adminRouter.get('/status', async (_q, r) =>
  r.json({ tools: await listTools(), stats, uptime: Math.round(process.uptime()) }));
adminRouter.post('/toggle/:id', (req, res) => {
  const id = req.params.id;
  disabled.has(id) ? disabled.delete(id) : disabled.add(id);
  res.json({ disabled: [...disabled] });
});
