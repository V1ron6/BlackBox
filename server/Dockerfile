FROM node:22-slim

# Everything the tools shell out to. Trimmed LibreOffice (no Base/Draw/Math) to keep the image smaller.
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl ffmpeg ghostscript qpdf poppler-utils \
      tesseract-ocr tesseract-ocr-eng \
      libreoffice-writer libreoffice-calc libreoffice-impress \
      fonts-liberation fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*

# Standalone yt-dlp binary (no Python needed); it self-updates on every start
RUN curl -fsSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp \
 && chmod +x /usr/local/bin/yt-dlp

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .

ENV NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=256
CMD ["sh", "-c", "(yt-dlp -U >/dev/null 2>&1 || true); node index.js"]
