/** Nomi Cose Citta: compilazione, STOP che congela tutti, revisione con
 *  annullamento a maggioranza e punteggio (unica 10 / duplicata 5 / nulla 0).
 *  Richiede il server su :3000. */

import { io, type Socket } from 'socket.io-client';
import { GAMES } from '../shared/src/catalog.ts';

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

const NOMI = ['Andrea', 'Giulia', 'Marco', 'Sara'];
const players: any[] = [];
for (const name of NOMI) {
  const s = await conn();
  const p: any = { s, name, priv: null, id: '' };
  s.on('private', (v: any) => { p.priv = v.game; p.id = v.playerId; });
  const r = await ask<any>(s, 'player:join', { code, name });
  p.id = r.playerId;
  players.push(p);
}

const excluded = GAMES.filter((g) => g.id !== 'nomi-cose-citta').map((g) => g.id);
await ask(host, 'host:start', { settings: { totalRounds: 1, excluded } });
await waitFor('intro', () => room?.phase === 'intro');
await ask(host, 'host:next');
await waitFor('compilazione', () => room?.game?.phase === 'fill');
await waitFor('schede consegnate', () => players.every((p) => p.priv?.letter));

const L = players[0].priv.letter;
check('lettera estratta', /^[A-Z]$/.test(L), L);
check('sei categorie', players[0].priv.categorie.length === 6, players[0].priv.categorie.join(', '));

/* Andrea e Giulia scrivono le stesse risposte (duplicate), Marco tutte diverse,
   Sara ne lascia due vuote. Cosi si controllano i tre casi di punteggio. */
const comuni = [0, 1, 2, 3, 4, 5].map((i) => `${L}comune${i}`);
const propri  = [0, 1, 2, 3, 4, 5].map((i) => `${L}proprio${i}`);

for (let i = 0; i < 6; i++) {
  await ask(players[0].s, 'game:action', { type: 'fill', payload: { index: i, value: comuni[i] } });
  await ask(players[1].s, 'game:action', { type: 'fill', payload: { index: i, value: comuni[i] } });
  await ask(players[2].s, 'game:action', { type: 'fill', payload: { index: i, value: propri[i] } });
  if (i < 4) await ask(players[3].s, 'game:action', { type: 'fill', payload: { index: i, value: `${L}sara${i}` } });
}
await sleep(400);

check('le risposte arrivano al server',
  room.game.progress.find((p: any) => p.playerId === players[0].id)?.filled === 6,
  `Andrea: ${room.game.progress.find((p: any) => p.playerId === players[0].id)?.filled}/6`);
check('chi ha lasciato caselle vuote non risulta completo',
  room.game.progress.find((p: any) => p.playerId === players[3].id)?.complete === false);
check('durante la compilazione le risposte altrui restano nascoste',
  room.game.progress.every((p: any) => p.cells === null));

/* solo chi ha riempito tutto puo fermare il gioco */
await ask(players[3].s, 'game:action', { type: 'stop' });
await sleep(250);
check('chi non ha finito non puo premere STOP', room.game.phase === 'fill');

await ask(players[0].s, 'game:action', { type: 'stop' });
await waitFor('revisione', () => room?.game?.phase === 'review');
check('lo STOP congela tutti', room.game.stopperId === players[0].id);
check('in revisione le risposte diventano pubbliche',
  room.game.progress.every((p: any) => Array.isArray(p.cells)));

/* tre giocatori su quattro annullano la prima casella di Marco: e maggioranza */
for (const p of [players[0], players[1], players[3]]) {
  await ask(p.s, 'game:action', { type: 'flag', payload: { target: players[2].id, index: 0 } });
}
await sleep(300);
const marco = room.game.progress.find((p: any) => p.playerId === players[2].id);
check('una segnalazione di maggioranza annulla la casella', marco.voided[0] === true,
  `voided: ${JSON.stringify(marco.voided)}`);
check('le altre caselle restano valide', marco.voided.slice(1).every((v: boolean) => !v));

await ask(host, 'host:next');
await waitFor('recap', () => room?.phase === 'recap');

const riga = (name: string) => {
  const p = room.players.find((x: any) => x.name === name);
  return room.recap.rows.find((r: any) => r.playerId === p.id);
};
const andrea = riga('Andrea'), marcoR = riga('Marco'), sara = riga('Sara');

console.log(`\n  ${room.recap.reveal.join(' · ')}`);
for (const n of NOMI) console.log(`  ${n.padEnd(8)} grezzo ${String(riga(n).raw).padStart(4)}  ${riga(n).detail}`);

check('chi ha risposte tutte uniche batte chi le ha duplicate',
  marcoR.raw > andrea.raw, `Marco ${marcoR.raw} > Andrea ${andrea.raw}`);
check('chi ha lasciato caselle vuote prende meno di chi ha completato',
  sara.raw < marcoR.raw, `Sara ${sara.raw} < Marco ${marcoR.raw}`);
check('il bonus STOP e riconosciuto', andrea.detail.includes('STOP'), andrea.detail);
check('la casella annullata conta come nulla',
  marcoR.detail.includes('1 nulle') || marcoR.detail.includes('1 nulla'), marcoR.detail);

host.close();
players.forEach((p) => p.s.close());
console.log(failures === 0 ? '\n  NOMI COSE CITTA OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
