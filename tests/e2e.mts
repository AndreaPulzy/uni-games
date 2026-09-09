/** Test end-to-end del ciclo di partita: 4 giocatori entrano, giocano un
 *  round di Wordle (con un solver che deduce dai feedback) e arrivano al recap.
 *  Richiede il server in ascolto su :3000 (npm run dev). */

import { io, type Socket } from 'socket.io-client';
import { SOLUTION_LIST } from '../server/src/data/words-it.ts';
import { GAMES } from '../shared/src/catalog.ts';
import { isWord5 } from '../server/src/data/dictionary.ts';
import { evaluate } from '../server/src/games/wordle.ts';

const BASE = process.env.BASE ?? 'http://localhost:3000';

const conn = (): Promise<Socket> =>
  new Promise((res, rej) => {
    const s = io(BASE, { transports: ['websocket'], timeout: 4000 });
    s.on('connect', () => res(s));
    s.on('connect_error', rej);
  });

const ask = <T>(s: Socket, ev: string, p?: unknown): Promise<T> =>
  new Promise((res) => (p === undefined ? s.emit(ev, res) : s.emit(ev, p, res)));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitFor(label: string, cond: () => boolean, timeoutMs = 5000) {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > timeoutMs) throw new Error(`timeout in attesa di: ${label}`);
    await sleep(40);
  }
}

let failures = 0;
function check(label: string, ok: boolean, extra = '') {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
}

/* ------------------------------- setup ---------------------------------- */

const host = await conn();
let room: any = null;
host.on('room', (s) => { room = s; });

const { code } = await ask<{ code: string }>(host, 'host:create');
await waitFor('snapshot iniziale', () => room !== null);
check('stanza creata', /^[A-Z]{4}$/.test(code), code);

const NAMES = ['Andrea', 'Giulia', 'Marco', 'Sara'];
const players = await Promise.all(NAMES.map(async (name) => {
  const s = await conn();
  const state = { socket: s, name, priv: null as any, candidates: [...SOLUTION_LIST] };
  s.on('private', (v: any) => { state.priv = v.game; });
  const r = await ask<any>(s, 'player:join', { code, name });
  if (!r.ok) throw new Error(`${name}: ${r.error}`);
  return state;
}));
await waitFor('4 giocatori in lobby', () => room.players.filter((p: any) => p.connected).length === 4);
check('4 giocatori connessi', true, room.players.map((p: any) => `${p.avatar} ${p.name}`).join(' '));

/* --------------------------- rifiuti attesi ------------------------------ */

const dup = await conn();
const dupRes = await ask<any>(dup, 'player:join', { code, name: 'Andrea' });
check('nome duplicato rifiutato', dupRes.ok === false, dupRes.error);
dup.close();

const badRoom = await conn();
const badRes = await ask<any>(badRoom, 'player:join', { code: 'ZZZZ', name: 'X' });
check('codice inesistente rifiutato', badRes.ok === false, badRes.error);
badRoom.close();

/* ------------------------------ partita ---------------------------------- */

// questo test guida il Wordle: si isola escludendo gli altri minigiochi
const excluded = GAMES.filter((g) => g.id !== 'wordle').map((g) => g.id);
const st = await ask<any>(host, 'host:start', { settings: { totalRounds: 2, excluded } });
check('partita avviata', st.ok === true, st.error ?? '');
await waitFor('fase intro', () => room.phase === 'intro');
check('primo round e Wordle', room.currentGame === 'wordle', `${room.currentGame} / ${room.currentCategory}`);

await ask(host, 'host:next');
await waitFor('fase playing', () => room.phase === 'playing');
await waitFor('griglie consegnate', () => players.every((p) => p.priv !== null));
check('timer server attivo', room.deadline !== null);

/* ogni bot gioca deducendo dai feedback: verifica il ciclo azione -> stato */
for (let turn = 0; turn < 6 && room.phase === 'playing'; turn++) {
  for (const p of players) {
    // il round puo chiudersi a meta giro: allora il server azzera le viste private
    if (room.phase !== 'playing' || !p.priv || p.priv.done) continue;
    const before = p.priv.guesses.length;
    const pick = p.candidates.find((w) => isWord5(w)) ?? SOLUTION_LIST[0];
    await ask(p.socket, 'game:action', { type: 'guess', payload: { word: pick } });
    // il guess stesso puo essere quello che chiude il round: allora priv torna null
    await waitFor(`${p.name} riceve il feedback`,
      () => !p.priv || p.priv.guesses.length > before);
    if (!p.priv) break;

    const i = p.priv.guesses.length - 1;
    const g = p.priv.guesses[i];
    const m = JSON.stringify(p.priv.marks[i]);
    p.candidates = p.candidates.filter((c) => c !== g && JSON.stringify(evaluate(g, c)) === m);
  }
  if (players.every((p) => p.priv?.done ?? true)) break;
}

await waitFor('round concluso', () => room.phase === 'recap', 8000);
check('si passa al recap', room.recap !== null);

const solvedCount = room.recap.rows.filter((r: any) => r.raw > 0).length;
check('almeno un solver ha risolto', solvedCount > 0, `${solvedCount}/4 risolti`);

console.log('\n  ' + room.recap.reveal.join('  ·  '));
for (const r of room.recap.rows) {
  const p = room.players.find((x: any) => x.id === r.playerId);
  console.log(`  ${p.name.padEnd(8)} grezzo ${String(r.raw).padStart(4)}  →  +${String(r.points).padStart(4)} pt   ${r.detail}`);
}

const top = room.recap.rows[0];
check('il migliore del round prende 1000', top.points === 1000, `${top.points}`);
check('nessuno sotto il pavimento', room.recap.rows.every((r: any) => r.points >= 100));
check('i punti sono entrati in classifica',
  room.players.every((p: any) => p.score === (room.recap.rows.find((r: any) => r.playerId === p.id)?.points ?? 0)));

/* ------------------------------ round 2 ---------------------------------- */

await ask(host, 'host:next');
await waitFor('secondo round', () => room.roundIndex === 1);
check('il secondo round e partito', room.phase === 'intro' && room.currentGame !== null,
  `${room.currentGame} / ${room.currentCategory}`);
// l'alternanza fra categorie e verificata a parte in tests/rotation.mts:
// qui dipende da quanti giochi sono gia implementati nel registry.

console.log('\n  classifica:', [...room.players].sort((a, b) => b.score - a.score)
  .map((p) => `${p.name} ${p.score}`).join('  |  '));

host.close();
players.forEach((p) => p.socket.close());
console.log(failures === 0 ? '\n  TUTTO OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
