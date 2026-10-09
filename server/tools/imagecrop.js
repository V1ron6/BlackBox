import { lazy, num } from '../lib/util.js';

export default {
  id: 'image-crop',
  check: () => lazy('sharp'),
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload an image');
    const { default: sharp } = await import('sharp');
    const meta = await sharp(files[0].path).rotate().metadata();
    const left = Math.max(0, Math.floor(num(req.body.left, 0)));
    const top = Math.max(0, Math.floor(num(req.body.top, 0)));
    const width = Math.floor(num(req.body.width, meta.width - left));
    const height = Math.floor(num(req.body.height, meta.height - top));
    if (width < 1 || height < 1 || left + width > meta.width || top + height > meta.height) {
      throw new Error(`Crop area must fit inside the image (${meta.width} x ${meta.height})`);
    }
    const buf = await sharp(files[0].path).rotate().extract({ left, top, width, height }).png().toBuffer();
    res.type('png').attachment('cropped.png').send(buf);
  },
};
