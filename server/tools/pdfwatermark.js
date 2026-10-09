import fs from 'fs/promises';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export default {
  id: 'pdf-watermark',
  check: async () => true,
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload a PDF');
    const text = String(req.body.text || '').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?').trim().slice(0, 40);
    if (!text) throw new Error('Enter watermark text');
    const opacity = [0.15, 0.3, 0.5].includes(+req.body.opacity) ? +req.body.opacity : 0.15;
    const doc = await PDFDocument.load(await fs.readFile(files[0].path));
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const c = Math.SQRT1_2;
    for (const p of doc.getPages()) {
      const { width, height } = p.getSize();
      const size = Math.max(20, Math.min(110, (0.7 * Math.hypot(width, height)) / font.widthOfTextAtSize(text, 1)));
      const tw = font.widthOfTextAtSize(text, size);
      p.drawText(text, {
        x: width / 2 - (tw / 2) * c + (size / 3) * c,
        y: height / 2 - (tw / 2) * c - (size / 3) * c,
        size, font, color: rgb(0.45, 0.45, 0.45), opacity, rotate: degrees(45),
      });
    }
    res.type('pdf').attachment('watermarked.pdf').send(Buffer.from(await doc.save()));
  },
};
