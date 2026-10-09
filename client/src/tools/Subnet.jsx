import { useState } from 'react';

const toInt = (ip) => { const p = ip.split('.').map(Number); return p.length === 4 && p.every((x) => x >= 0 && x <= 255) ? ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3] : null; };
const toIp = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

export default function Subnet() {
  const [v, setV] = useState('192.168.1.10/24');
  const [ip, bits] = v.trim().split('/');
  const n = toInt(ip), b = parseInt(bits, 10);
  let r = null;
  if (n !== null && b >= 0 && b <= 32) {
    const mask = b === 0 ? 0 : (0xffffffff << (32 - b)) >>> 0;
    const net = (n & mask) >>> 0, bc = (net | ~mask) >>> 0;
    r = [['Network', toIp(net)], ['Broadcast', toIp(bc)], ['Netmask', toIp(mask)], ['First host', b >= 31 ? toIp(net) : toIp(net + 1)], ['Last host', b >= 31 ? toIp(bc) : toIp(bc - 1)], ['Usable hosts', b >= 31 ? (b === 32 ? 1 : 2) : 2 ** (32 - b) - 2]];
  }
  return (
    <div className="form">
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="192.168.1.10/24" />
      {r ? <table className="table"><tbody>{r.map(([k, x]) => <tr key={k}><td>{k}</td><td>{x}</td></tr>)}</tbody></table> : <div className="notice err">Use IPv4 CIDR like 10.0.0.5/16</div>}
    </div>
  );
}
