/** Chi esce un attimo dal browser (app in background, schermo spento, rete che
 *  salta) resta in partita: il server aspetta prima di segnarlo offline, una
 *  connessione vecchia che si chiude in ritardo non butta fuori quella nuova e
 *  si rientra col token anche a partita iniziata.
 *  Richiede il server su :3000. La tolleranza si legge da PLAYER_GRACE_MS
 *  (30 secondi di default: per i test conviene avviare il server più corto). */

import { io, type Socket } from 'socket.io-client';
import { GAMES } from '../shared/src/catalog.ts';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const GRACE = Number(process.env.PLAYER_GRACE_MS ?? 30_000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const conn = (): Promise<Socket> =>
  new Promise((res) => { const s = io(BASE, { transports: ['websocket'] }); s.on('connect', () => res(s)); });
const ask = <T = any>(s: Socket, ev: string, p?: unknown): Promise<T> =>
  new Promise((res) => (p === undefined ? s.emit(ev, res) : s.emit(ev, p, res)));

let failures = 0;
const check = (label: string, ok: boolean, extra = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
};
async function waitFor(label: string, cond: () => boolean, timeoutMs = 15_000) {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > timeoutMs) throw new Error(`timeout: ${label}`);
    await sleep(60);
  }
}

const host = await conn();
let room: any = null;
host.on('room', (s) => { room = s; });
const { code } = await ask<{ code: string }>(host, 'host:create');

async function joinAs(name: string, token?: string) {
  const s = await conn();
  const r = await ask(s, 'player:join', { code, name, token });
  if (!r.ok) throw new Error(`${name}: ${r.error}`);
  return { s, id: r.playerId as string, token: r.token as string };
}

const A = await joinAs('Andrea');
for (const name of ['Giulia', 'Marco', 'Sara']) await joinAs(name);
await waitFor('4 giocatori', () => room?.players?.length === 4);
const isOn = () => room.players.find((p: any) => p.id === A.id)?.connected === true;

const excluded = GAMES.filter((g) => g.id !== 'quiz-lampo').map((g) => g.id);
await ask(host, 'host:start', { settings: { totalRounds: 1, excluded } });
await waitFor('presentazione', () => room.phase === 'intro');
await ask(host, 'host:next');
await waitFor('gioco', () => room.phase === 'playing');

// il telefono torna in primo piano e apre una connessione nuova prima che la
// vecchia sia stata chiusa dal server
const A2 = await joinAs('Andrea', A.token);
check('rientrando si riprende lo stesso posto', A2.id === A.id);
A.s.disconnect();
await sleep(GRACE + 1500);
check('una connessione vecchia che si chiude dopo non fa risultare offline', isOn());

// app in background: la connessione cade davvero
A2.s.disconnect();
await sleep(Math.min(1500, GRACE / 2));
check('appena uscito si è ancora in partita', isOn());
await waitFor('offline dopo la tolleranza', () => !isOn(), GRACE + 5_000);
check('se non torna, dopo la tolleranza risulta offline', !isOn());

const A3 = await joinAs('Andrea', A.token);
await sleep(300);
check('si rientra col token anche a partita iniziata', A3.id === A.id && isOn() && room.phase !== 'lobby');
const stranger = await conn();
const denied = await ask(stranger, 'player:join', { code, name: 'Intruso' });
check('senza token a partita iniziata non si entra', denied.ok === false, denied.error);

// esce e rientra prima che scada la tolleranza
A3.s.disconnect();
await sleep(500);
const A4 = await joinAs('Andrea', A.token);
let everOff = false;
const t0 = Date.now();
while (Date.now() - t0 < GRACE + 1000) { if (!isOn()) everOff = true; await sleep(100); }
check('rientrando in tempo non si risulta mai offline', !everOff && isOn());

const pong = await new Promise((res) => A4.s.timeout(2000).emit('alive', (err: Error | null, r: any) => res(!err && r?.ok)));
check('il server risponde al controllo di connessione', pong === true);

host.close();
stranger.close();
A4.s.close();
console.log(failures === 0 ? '\n  RICONNESSIONE OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
