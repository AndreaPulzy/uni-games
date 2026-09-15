/** Ghost a eliminazione pura: si gioca finche' resta un solo giocatore, e la
 *  classifica del round segue l'ordine di uscita.
 *  Richiede il server su :3000. */

import { io, type Socket } from 'socket.io-client';
import { GAMES } from '../shared/src/catalog.ts';
import { decide } from './bot-brain.mts';

const BASE = process.env.BASE ?? 'http://localhost:3000';
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

const onlyGhost = GAMES.filter((g) => g.id !== 'ghost').map((g) => g.id);

async function makeRoom(names: string[]) {
  const host = await conn();
  const state = { room: null as any, lastGame: null as any };
  // ogni aggiornamento viene registrato: campionando se ne perderebbe qualcuno
  host.on('room', (s) => { state.room = s; if (s.game) state.lastGame = s.game; });
  const { code } = await ask<{ code: string }>(host, 'host:create');
  const bots: { name: string; s: Socket; priv: any }[] = [];
  for (const name of names) {
    const s = await conn();
    const b = { name, s, priv: null as any };
    s.on('private', (v: any) => { b.priv = v.game; });
    await ask(s, 'player:join', { code, name });
    bots.push(b);
  }
  await waitFor('giocatori in stanza', () => state.room?.players?.length === names.length);
  const close = () => { host.close(); bots.forEach((b) => b.s.close()); };
  return { host, state, bots, close };
}

/* --------------------- con 5 giocatori Ghost non si propone --------------------- */

{
  const five = await makeRoom(['Andrea', 'Giulia', 'Marco', 'Sara', 'Luca']);
  const r = await ask(five.host, 'host:start', { settings: { totalRounds: 1, excluded: onlyGhost } });
  check('con 5 giocatori Ghost non parte', r.ok === false, r.error);
  five.close();
}

/* ------------------------ partita vera fino all'ultimo ------------------------ */

const { host, state, bots, close } = await makeRoom(['Andrea', 'Giulia', 'Marco']);
const r = await ask(host, 'host:start', { settings: { totalRounds: 1, excluded: onlyGhost } });
check('con 3 giocatori Ghost parte', r.ok === true, r.error ?? '');
await waitFor('intro', () => state.room?.phase === 'intro');
await ask(host, 'host:next');
await waitFor('gioco', () => state.room?.phase === 'playing');

const t0 = Date.now();
while (state.room?.phase === 'playing' && Date.now() - t0 < 240_000) {
  for (const b of bots) {
    const move = decide('ghost', b, state.room);
    if (move) await ask(b.s, 'game:action', move);
  }
  await sleep(120);
}
const seconds = Math.round((Date.now() - t0) / 1000);
const room = state.room;
check('il round finisce da solo, senza tetto di manche', room?.phase === 'recap', `${room?.phase} dopo ${seconds}s`);

if (room?.phase === 'recap') {
  const rows = room.recap.rows as any[];
  const nameOf = (id: string) => room.players.find((p: any) => p.id === id)?.name;
  console.log(`\n  ${room.recap.reveal.join('  ·  ')}  (${seconds}s)`);
  for (const row of rows) console.log(`  ${String(nameOf(row.playerId)).padEnd(8)} +${String(row.points).padStart(4)}  ${row.detail}`);

  const survivors = rows.filter((x) => x.detail.startsWith('Ultimo sopravvissuto'));
  check('resta esattamente un sopravvissuto', survivors.length === 1);
  check('il sopravvissuto vince il round', survivors[0]?.points === 1000, `${survivors[0]?.points}`);
  check('il titolo nomina il sopravvissuto', room.recap.reveal[0].includes(nameOf(survivors[0]?.playerId)));

  const second = rows.find((x) => x.detail.startsWith('2°'));
  const third = rows.find((x) => x.detail.startsWith('3°'));
  check('gli eliminati sono in classifica per ordine di uscita', !!second && !!third);
  const handOf = (row: any) => Number(/manche (\d+)/.exec(row?.detail ?? '')?.[1] ?? NaN);
  check('chi esce dopo sta sopra a chi esce prima', handOf(second) > handOf(third),
    `2° alla manche ${handOf(second)}, 3° alla manche ${handOf(third)}`);
  check('e prende piu punti', second.points > third.points, `${second.points} > ${third.points}`);

  const outPlayers = (state.lastGame?.players ?? []).filter((p: any) => p.out);
  check('gli eliminati avevano completato G-H-O-S-T',
    outPlayers.length === 2 && outPlayers.every((p: any) => p.letters === 5),
    outPlayers.map((p: any) => `${nameOf(p.playerId)}:${p.letters}`).join(' '));
  check('l eliminazione decisiva resta a schermo prima dei punti',
    state.lastGame?.mode === 'break' && outPlayers.length === 2, `ultimo stato visto: ${state.lastGame?.mode}`);
}

close();
console.log(failures === 0 ? '\n  GHOST OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
