/** Il telefono regista: comanda la partita al posto della TV (smart TV senza
 *  mouse), passa la mano, sopravvive a un telefono che si blocca e non fa mai
 *  saltare una schermata col doppio tocco.
 *  Richiede il server su :3000. La tolleranza di default e' 20 secondi. */

import { io, type Socket } from 'socket.io-client';
import { GAMES } from '../shared/src/catalog.ts';
import { decide } from './bot-brain.mts';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const GRACE = Number(process.env.DIRECTOR_GRACE_MS ?? 20_000);
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

interface P { name: string; s: Socket; id: string; token: string; priv: any }

const host = await conn();
let room: any = null;
host.on('room', (s) => { room = s; });
const { code } = await ask<{ code: string }>(host, 'host:create');

async function joinAs(name: string, token?: string): Promise<P> {
  const s = await conn();
  const p: P = { name, s, id: '', token: '', priv: null };
  s.on('private', (v: any) => { p.priv = v.game; });
  const r = await ask(s, 'player:join', { code, name, token });
  if (!r.ok) throw new Error(`${name}: ${r.error}`);
  p.id = r.playerId;
  p.token = r.token;
  return p;
}

const players: P[] = [];
for (const name of ['Andrea', 'Giulia', 'Marco', 'Sara']) players.push(await joinAs(name));
const [A, B, C] = players;
const nameOf = (id: string) => room.players.find((p: any) => p.id === id)?.name;
await waitFor('4 giocatori', () => room?.players?.length === 4);

/* --------------------------------- lobby --------------------------------- */

check('il primo arrivato è il regista', room.directorId === A.id, nameOf(room.directorId));

let r = await ask(B.s, 'host:settings', { settings: { totalRounds: 5 } });
check('un giocatore qualsiasi non cambia le impostazioni', r.ok === false, r.error);

const excluded = GAMES.filter((g) => g.id !== 'wordle').map((g) => g.id);
r = await ask(A.s, 'host:settings', { settings: { totalRounds: 2, excluded } });
await waitFor('impostazioni', () => room.settings.totalRounds === 2);
check('il regista sceglie giochi e round dal telefono',
  r.ok === true && room.settings.excluded.length === excluded.length);

r = await ask(A.s, 'host:settings', { settings: { totalRounds: 99 } });
check('impostazioni non valide rifiutate', r.ok === false && room.settings.totalRounds === 2, r.error);

// tocchi rapidi: dieci giochi accesi in raffica non devono perdersi per strada
const burst = ['connections', 'nerdle', 'ghost', 'impostore-parola', 'impostore-numeri',
  'nomi-cose-citta', 'risposta-bastarda', 'fabbrica-meme', 'taboo', 'mimo'];
await Promise.all(burst.map((id) => ask(A.s, 'host:settings', { settings: { toggle: id } })));
await sleep(300);
check('tocchi rapidi sui giochi: nessuno va perso',
  burst.every((id) => !room.settings.excluded.includes(id)) && room.settings.excluded.length === excluded.length - burst.length,
  `esclusi: ${room.settings.excluded.join(', ')}`);
await Promise.all(burst.map((id) => ask(A.s, 'host:settings', { settings: { toggle: id } })));
await sleep(300);
check('e rispegnendoli tornano esattamente come prima', room.settings.excluded.length === excluded.length);

r = await ask(B.s, 'host:start', {});
check('un giocatore qualsiasi non avvia la partita', r.ok === false && room.phase === 'lobby');

r = await ask(A.s, 'host:start', {});
await waitFor('intro', () => room.phase === 'intro');
check('il regista avvia la partita dal telefono', r.ok === true);
check('in presentazione il pulsante dice "Si comincia"', room.directorAction === 'Si comincia', room.directorAction);

r = await ask(B.s, 'host:next', { expect: 'Si comincia' });
await sleep(200);
check('un giocatore qualsiasi non fa avanzare', r.ok === false && room.phase === 'intro');

/* ------------------------------ doppio tocco ------------------------------ */

const tap1 = await Promise.all([
  ask(A.s, 'host:next', { expect: 'Si comincia' }),
  ask(host, 'host:next', { expect: 'Si comincia' }),
]);
await waitFor('gioco', () => room.phase === 'playing');
await sleep(300);
check('regista e TV premono insieme: si avanza una volta sola',
  tap1.filter((x) => x.ok).length === 1 && room.phase === 'playing',
  tap1.map((x) => (x.ok ? 'ok' : x.error)).join(' / '));
check('durante il Wordle non c è niente da far avanzare', room.directorAction === null);

async function playRound() {
  const t0 = Date.now();
  while (room.phase === 'playing' && Date.now() - t0 < 100_000) {
    for (const p of players) {
      if (!p.s.connected) continue;
      const move = decide('wordle', p, room);
      if (move) await ask(p.s, 'game:action', move);
    }
    await sleep(80);
  }
  await waitFor('recap', () => room.phase === 'recap', 10_000);
}

await playRound();
check('nel recap il pulsante dice "Prossimo minigioco"', room.directorAction === 'Prossimo minigioco', room.directorAction);

// un "avanti" partito quando a schermo non c'era nessuna etichetta (turno in corso)
// e arrivato a recap gia' comparso non deve saltarlo
r = await ask(host, 'host:next', { expect: null });
await sleep(200);
check('un avanti in ritardo dal gioco non scavalca il recap', r.ok === false && room.phase === 'recap', room.phase);

const tap2 = await Promise.all([
  ask(A.s, 'host:next', { expect: 'Prossimo minigioco' }),
  ask(A.s, 'host:next', { expect: 'Prossimo minigioco' }),
]);
await sleep(500);
check('doppio tocco nel recap: la presentazione del gioco non viene saltata',
  room.phase === 'intro' && tap2.filter((x) => x.ok).length === 1, room.phase);

/* ------------------------------ passaggio di regia ------------------------------ */

r = await ask(A.s, 'director:transfer', { playerId: B.id });
await waitFor('regia a Giulia', () => room.directorId === B.id);
check('il regista passa la mano', r.ok === true);

r = await ask(A.s, 'host:next', { expect: 'Si comincia' });
await sleep(200);
check('chi ha ceduto la regia non comanda più', r.ok === false && room.phase === 'intro');

r = await ask(B.s, 'host:next', { expect: 'Si comincia' });
await waitFor('secondo round', () => room.phase === 'playing');
check('il nuovo regista comanda', r.ok === true);

/* -------------------------- telefono che si blocca -------------------------- */

B.s.disconnect();
await sleep(1500);
const B2 = await joinAs('Giulia', B.token);
await sleep(400);
check('un telefono che si riconnette in fretta resta regista', room.directorId === B.id && B2.id === B.id);
players[1] = B2;

B2.s.disconnect();
await sleep(1500);
check('durante la tolleranza la regia non cambia', room.directorId === B.id);
await waitFor('regia passata di mano', () => room.directorId !== B.id, GRACE + 10_000);
check('se il regista resta offline, la regia passa al primo collegato', room.directorId === A.id, nameOf(room.directorId));

const B3 = await joinAs('Giulia', B.token);
players[1] = B3;
await sleep(400);
check('al rientro non si riprende la regia da solo', room.directorId === A.id);

/* ------------------------------ fine e rivincita ------------------------------ */

await playRound();
check('ultimo recap: il pulsante dice "Classifica finale"', room.directorAction === 'Classifica finale', room.directorAction);
r = await ask(A.s, 'host:next', { expect: 'Classifica finale' });
await waitFor('finale', () => room.phase === 'final');
check('il regista porta alla classifica finale', r.ok === true);

r = await ask(C.s, 'host:restart');
check('un giocatore qualsiasi non fa ripartire', r.ok === false && room.phase === 'final');

r = await ask(A.s, 'host:restart');
await waitFor('lobby', () => room.phase === 'lobby');
check('il regista lancia una nuova partita', r.ok === true);
check('stessi giocatori, punteggi azzerati',
  room.players.length === 4 && room.players.every((p: any) => p.score === 0));
check('le impostazioni restano quelle scelte', room.settings.totalRounds === 2);

r = await ask(host, 'host:settings', { settings: { totalRounds: 3 } });
await sleep(200);
check('la TV continua a poter comandare', r.ok === true && room.settings.totalRounds === 3);

host.close();
players.forEach((p) => p.s.close());
console.log(failures === 0 ? '\n  REGISTA OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
