import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';

async function embeddable(f) {
  if (/jpe?g/i.test(f.mimetype)) return ['jpg', await fs.readFile(f.path)];
  if (/png/i.test(f.mimetype)) return ['png', await fs.readFile(f.path)];
  const { default: sharp } = await import('sharp'); // other formats (webp, gif, ...) need sharp
  return ['png', await sharp(f.path).png().toBuffer()];
}

export default {
  id: 'images-to-pdf',
  check: async () => true,
  async run(req, res, files) {
    if (!files.length) throw new Error('Upload at least one image');
    const doc = await PDFDocument.create();
    const [W, H, M] = [595, 842, 20];
    for (const f of files) {
      let kind, buf;
      try { [kind, buf] = await embeddable(f); } catch { throw new Error(`Cannot read ${f.originalname}. Use JPG or PNG.`); }
      const img = kind === 'jpg' ? await doc.embedJpg(buf) : await doc.embedPng(buf);
      const s = Math.min((W - 2 * M) / img.width, (H - 2 * M) / img.height, 1);
      const [w, h] = [img.width * s, img.height * s];
      doc.addPage([W, H]).drawImage(img, { x: (W - w) / 2, y: (H - h) / 2, width: w, height: h });
    }
    res.type('pdf').attachment('images.pdf').send(Buffer.from(await doc.save()));
  },
};
