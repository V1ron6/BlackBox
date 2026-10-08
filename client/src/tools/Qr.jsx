import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

export default function Qr() {
  const [text, setText] = useState('');
  const [img, setImg] = useState('');

  useEffect(() => {
    if (!text) return setImg('');
    QRCode.toDataURL(text, { width: 320, margin: 2 }).then(setImg).catch(() => setImg(''));
  }, [text]);

  return (
    <div className="form">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Text or link" />
      {img && <><img src={img} alt="QR code" className="qr" /><a className="btn" href={img} download="qr.png"><Download size={16} /> Download PNG</a></>}
    </div>
  );
}
