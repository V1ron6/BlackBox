export default {
  id: 'image',
  // sharp is imported lazily so a missing/broken install only takes this tool offline
  check: async () => { try { await import('sharp'); return true; } catch { return 'sharp is not installed on the server'; } },
  async run(req, res, files) {
    if (!files[0]) throw new Error('Upload an image');
    const { default: sharp } = await import('sharp');
    const fmt = ['jpeg', 'png', 'webp'].includes(req.body.format) ? req.body.format : 'jpeg';
    const width = parseInt(req.body.width, 10) || undefined;
    const buf = await sharp(files[0].path).rotate().resize({ width, withoutEnlargement: true })[fmt]({ quality: 80 }).toBuffer();
    res.type(fmt).attachment(`image.${fmt === 'jpeg' ? 'jpg' : fmt}`).send(buf);
  },
};
