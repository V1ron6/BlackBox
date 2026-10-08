# Blackbox
Utility tools site. JS only. React + Vite client, Express server.

    cd server && npm i && ADMIN_KEY=change-me npm start
    cd client && npm i && cp .env.example .env && npm run dev

Server tools need binaries: `yt-dlp` (video), `soffice` (LibreOffice, Word to PDF). Missing binary = that tool shows Offline, nothing else breaks.
Admin: open `/<VITE_ADMIN_PATH>` in the client, enter ADMIN_KEY. No ADMIN_KEY / path set = admin disabled.
Add a tool: drop a file in `server/tools/` ({id, check, run}), add an entry to `client/src/data.js`.
