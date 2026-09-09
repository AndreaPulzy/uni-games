/** Verifica che al termine dei tentativi il Top 10 mostri la classifica INTERA
 *  (comprese le voci che nessuno ha indovinato) prima di passare ai punti.
 *  Richiede il server su :3000. */

import { io, type Socket } from 'socket.io-client';
import { GAMES } from '../shared/src/catalog.ts';
import { TOP10 } from '../server/src/data/top10.ts';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const conn = (): Promise<Socket> =>
  new Promise((res) => { const s = io(BASE, { transports: ['websocket'] }); s.on('connect', () => res(s)); });
const ask = <T>(s: Socket, ev: string, p?: unknown): Promise<T> =>
  new Promise((res) => (p === undefined ? s.emit(ev, res) : s.emit(ev, p, res)));

let failures = 0;
const check = (label: string, ok: boolean, extra = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
};
async function waitFor(label: string, cond: () => boolean, timeoutMs = 12_000) {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > timeoutMs) throw new Error(`timeout: ${label}`);
    await sleep(50);
  }
}

const host = await conn();
let room: any = null;
host.on('room', (s) => { room = s; });
const { code } = await ask<{ code: string }>(host, 'host:create');

const bots: any[] = [];
for (const name of ['Andrea', 'Giulia', 'Marco', 'Sara']) {
  const s = await conn();
  const b: any = { s, name, priv: null };
  s.on('private', (v: any) => { b.priv = v.game; });
  await ask(s, 'player:join', { code, name });
  bots.push(b);
}

const excluded = GAMES.filter((g) => g.id !== 'top10').map((g) => g.id);
await ask(host, 'host:start', { settings: { totalRounds: 1, excluded } });
await waitFor('intro', () => room?.phase === 'intro');
await ask(host, 'host:next');
await waitFor('gioco avviato', () => room?.phase === 'playing' && room?.game?.phase === 'guess');

const lista = TOP10.find((l) => l.titolo === room.game.titolo)!;
check('classifica estratta', !!lista, room.game.titolo);
check('durante il gioco le voci non trovate restano nascoste',
  room.game.voci.every((v: any) => v.nome === null || v.team !== null));

/* si indovinano solo le prime due voci: il resto deve comparire nel reveal */
let guessed = 0;
const t0 = Date.now();
while (room?.game?.phase === 'guess' && Date.now() - t0 < 40_000) {
  const turno = room.game.currentTeam;
  const bot = bots.find((b) => b.priv?.myTurn && b.priv?.myTeam === turno);
  if (bot) {
    const testo = guessed < 2 ? lista.voci[guessed].nome : 'risposta palesemente sbagliata';
    guessed++;
    await ask(bot.s, 'game:action', { type: 'guess', payload: { text: testo } });
  }
  await sleep(120);
}

check('si passa alla rivelazione, non direttamente ai punti',
  room?.phase === 'playing' && room?.game?.phase === 'reveal',
  `fase stanza ${room?.phase} / gioco ${room?.game?.phase}`);

const voci = room?.game?.voci ?? [];
check('la classifica e svelata per intero',
  voci.length === lista.voci.length && voci.every((v: any) => typeof v.nome === 'string' && v.nome.length > 0),
  `${voci.filter((v: any) => v.nome).length}/${lista.voci.length} voci visibili`);
check('le voci non indovinate sono comunque mostrate',
  voci.some((v: any) => v.nome && v.team === null),
  voci.filter((v: any) => v.team === null).slice(0, 3).map((v: any) => v.nome).join(', '));
check('resta visibile chi ha trovato cosa',
  voci.some((v: any) => v.team !== null));
check('c e tempo per leggerla', room?.deadline !== null && room.deadline > Date.now());

/* l'host puo chiudere la rivelazione in anticipo */
await ask(host, 'host:next');
await waitFor('recap', () => room?.phase === 'recap');
check('dopo la rivelazione arrivano i punti', room?.recap !== null,
  room?.recap?.reveal?.[0] ?? '');
check('il recap elenca le voci mai trovate',
  (room?.recap?.reveal ?? []).some((r: string) => r.includes('Non trovati') || r.includes('completata')),
  room?.recap?.reveal?.[1] ?? '');

host.close();
bots.forEach((b) => b.s.close());
console.log(failures === 0 ? '\n  TOP 10 OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
