# Blackbox
All-in-one utility tools site. Plain JavaScript. React + Vite client, Express server. No user accounts. Everything is free to run: no paid APIs.

## Local run
    cd server && npm i && ADMIN_KEY=change-me npm start        # API on :4000
    cd client && npm i && cp .env.example .env && npm run dev   # site on :5173 (proxies /api)

## Deploy (all free tiers)
**Backend on Render (Docker, free plan)**
1. Push this folder to GitHub. In Render choose New > Blueprint and select the repo; it reads `render.yaml`.
2. Set `ALLOWED_ORIGIN` to your client URL (e.g. `https://blackbox.vercel.app`). `ADMIN_KEY` is generated for you (see it in the service's Environment tab).
3. Health check is `/healthz`.

**Client on Vercel / Netlify / Cloudflare Pages (free)**
- Root directory `client`, build `npm run build`, output `dist`.
- Environment: `VITE_API_URL=https://<your-service>.onrender.com` and `VITE_ADMIN_PATH=<secret-path>`.
- SPA fallback files are included (`vercel.json`, `public/_redirects`).

**Render free plan facts** ([docs](https://render.com/docs/free)): spins down after 15 min idle and takes about a minute to wake (the site shows a banner); the disk is ephemeral (everything here uses temp files, so that is fine); 750 free instance hours a month; if included outbound bandwidth runs out without a payment method, free services are suspended until next month, so watch heavy download/convert usage.

## Free-tier safety knobs (server env)
| Variable | Default | Purpose |
|---|---|---|
| `ADMIN_KEY` | none | Enables the hidden admin API |
| `ALLOWED_ORIGIN` | any | Comma-separated client origins allowed by CORS |
| `MAX_UPLOAD_MB` | 25 | Upload size cap |
| `MAX_HEAVY_JOBS` | 1 | LibreOffice / ffmpeg / OCR / ghostscript / poppler / yt-dlp jobs at once; up to 3 more wait, the rest get "busy" |
| `MAX_MEDIA_SECONDS` | 300 | Longest audio/video a job will process |
| `RATE_LIMIT` | 30 | Runs per minute per IP |
| `DISABLE_TOOLS` | none | Comma-separated tool ids to switch off, e.g. `video,video-compress,media-convert` |

Free CPU is small, so video conversion will be slow. Switch heavy tools off with `DISABLE_TOOLS` if they are not worth it. The admin page can also toggle tools live.

## Hidden admin
Open `/<VITE_ADMIN_PATH>` and enter `ADMIN_KEY`. Shows tool health, run/error counts, the last 50 jobs and a kill switch per tool. Without the key the API answers 404.

## Failure isolation
- Server: every tool file loads in its own try/catch and has a health check, a timeout and an error handler. A missing program only marks its tools Offline.
- Client: every tool is a lazy chunk inside an error boundary. Browser tools work even when the server is asleep or down.

## Programs the server tools call (all installed by the Dockerfile)
libreoffice (Office to PDF, PDF to Word, Markdown and Word), ghostscript (Compress PDF), qpdf (Protect/Unlock), poppler-utils (PDF to Images, PDF OCR), tesseract (OCR), ffmpeg (audio/video tools), yt-dlp (Video Downloader).

## Add a tool
- Browser tool: component in `client/src/tools/`, register in `tools/index.js`, entry in `data.js`, icon in `icons.js`.
- Server tool: file in `server/tools/` exporting `{ id, check, run }` (add `heavy: true` if it spawns a big program), plus a `kind: 'server'` entry in `data.js`.

## Notes
- Downloading videos or podcasts may breach the source site's terms, and big sites such as YouTube often block datacenter IPs, so expect the video tool to fail there. Use only for content you may save.
- The URL guard blocks obvious private addresses only. Add DNS-level checks before exposing the downloaders publicly.
- Generated PDFs use standard fonts, so non-Latin characters print as `?`.
- Background Remover and Passport Photo's white background use @imgly/background-removal (AGPL-3.0 for open-source use; see its license if you ever make this commercial).
- Currency rates come from the free Exchange Rate API (attribution is shown in the tool).
