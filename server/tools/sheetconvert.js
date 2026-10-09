import { lazy, baseName } from '../lib/util.js';

export default {
  id: 'sheet-convert',
  check: () => lazy('exceljs'),
  async run(req, res, files) {
    const f = files[0];
    if (!f || !/\.(csv|xlsx)$/i.test(f.originalname)) throw new Error('Upload a .csv or .xlsx file');
    const { default: Excel } = await import('exceljs');
    const wb = new Excel.Workbook();
    if (/\.csv$/i.test(f.originalname)) {
      await wb.csv.readFile(f.path);
      res.type('xlsx').attachment(baseName(f) + '.xlsx').send(Buffer.from(await wb.xlsx.writeBuffer()));
    } else {
      await wb.xlsx.readFile(f.path);
      res.type('csv').attachment(baseName(f) + '.csv').send(Buffer.from(await wb.csv.writeBuffer()));
    }
  },
};
