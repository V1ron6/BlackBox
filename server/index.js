import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { loadTools, listTools, runTool } from './registry.js';
import { adminRouter } from './admin.js';

process.on('uncaughtException', (e) => console.error('uncaught:', e));
process.on('unhandledRejection', (e) => console.error('unhandled:', e));

const app = express();
app.set('trust proxy', 1); // behind Render's proxy: real client IP for rate limiting
const origins = (process.env.ALLOWED_ORIGIN || '').split(',').map((x) => x.trim().replace(/\/$/, '')).filter(Boolean);
app.use(cors(origins.length ? { origin: origins, exposedHeaders: ['Content-Disposition'] } : { exposedHeaders: ['Content-Disposition'] }));
app.get('/healthz', (_q, r) => r.send('ok'));
app.use(express.json());
await loadTools();

app.get('/api/tools', async (_q, r) => r.json(await listTools()));
app.post('/api/tools/:id/run', rateLimit({ windowMs: 60_000, limit: parseInt(process.env.RATE_LIMIT, 10) || 30 }), runTool);
app.use('/api/admin', adminRouter);
app.use((e, _q, r, _n) => r.status(500).json({ error: 'Server error' }));

app.listen(process.env.PORT || 4000, () => console.log('Blackbox server up'));
