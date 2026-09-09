import os from 'node:os';

/** Primo IPv4 non-loopback: serve a costruire l'URL del QR code. */
export function lanAddress(): string {
  const ifaces = os.networkInterfaces();
  const preferred = ['en0', 'en1', 'eth0', 'wlan0'];
  const candidates: string[] = [];
  for (const [name, addrs] of Object.entries(ifaces)) {
    for (const a of addrs ?? []) {
      if (a.family === 'IPv4' && !a.internal) {
        if (preferred.includes(name)) candidates.unshift(a.address);
        else candidates.push(a.address);
      }
    }
  }
  return candidates[0] ?? 'localhost';
}
