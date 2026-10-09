import { useState } from 'react';

const toRgb = (h) => { const m = h.replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i); if (!m) return null; let x = m[1]; if (x.length === 3) x = [...x].map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); };
const toHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [Math.round(((h * 60) + 360) % 360), Math.round(s * 100), Math.round(l * 100)];
};
const lum = (rgb) => rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);

export default function ColorTool() {
  const [hex, setHex] = useState('#22c55e');
  const rgb = toRgb(hex);
  const contrast = (c) => { const a = lum(rgb), b = lum(c); return ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2); };

  return (
    <div className="form">
      <div className="row"><input type="color" value={rgb ? '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('') : '#000000'} onChange={(e) => setHex(e.target.value)} style={{ maxWidth: 70, padding: 2 }} /><input value={hex} onChange={(e) => setHex(e.target.value)} /></div>
      {rgb ? (
        <div className="notice" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>HEX {'#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}</span>
          <span>RGB rgb({rgb.join(', ')})</span>
          <span>HSL hsl({toHsl(rgb)[0]}, {toHsl(rgb)[1]}%, {toHsl(rgb)[2]}%)</span>
          <span>Contrast on white {contrast([255, 255, 255])}:1 | on black {contrast([0, 0, 0])}:1 (4.5+ is good for text)</span>
        </div>
      ) : <div className="notice err">Enter a hex colour like #22c55e</div>}
    </div>
  );
}
