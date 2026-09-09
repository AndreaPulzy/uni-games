/** Bot di supporto per provare l'app a mano: entrano nella stanza indicata e
 *  giocano da soli a qualsiasi minigioco.
 *
 *  Uso:  npx tsx tests/bots.mts <CODICE> [quanti]
 *  Esempio: apri /host sulla TV, leggi il codice, poi lancia i bot e unisciti
 *  col telefono come giocatore in piu. */

import { io, type Socket } from 'socket.io-client';
import { decide } from './bot-brain.mts';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const code = (process.argv[2] ?? '').toUpperCase();
const howMany = Number(process.argv[3] ?? 3);

if (!/^[A-Z]{4}$/.test(code)) {
  console.error('Uso: npx tsx tests/bots.mts <CODICE> [quanti]');
  process.exit(1);
}

const POOL = ['Giulia', 'Marco', 'Sara', 'Luca', 'Chiara', 'Dario', 'Elisa', 'Fabio'];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

for (let i = 0; i < howMany; i++) {
  const name = POOL[i % POOL.length];
  const socket: Socket = io(BASE, { transports: ['websocket'] });
  const bot = { name, priv: null as any };
  let room: any = null;
  let busy = false;

  socket.on('connect', () => {
    socket.emit('player:join', { code, name }, (r: any) => {
      console.log(r.ok ? `${name} è entrato` : `${name}: ${r.error}`);
    });
  });

  socket.on('private', (v: any) => { bot.priv = v.game; });
  socket.on('room', (s: any) => { room = s; });

  // ritmo umano: i bot non devono sembrare macchine né inondare il server
  setInterval(async () => {
    if (busy || !room || room.phase !== 'playing' || !room.currentGame) return;
    const move = decide(room.currentGame, bot, room);
    if (!move) return;
    busy = true;
    await sleep(600 + Math.random() * 1800);
    socket.emit('game:action', move);
    busy = false;
  }, 700);
}

console.log(`${howMany} bot in ascolto sulla stanza ${code}. Ctrl+C per fermarli.`);
