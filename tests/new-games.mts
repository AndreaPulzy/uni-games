/** Controlli mirati sui quattro minigiochi nuovi: le risposte giuste danno i
 *  punti giusti e le regole bloccano quello che devono bloccare.
 *  Il test conosce le soluzioni leggendo gli archivi (quiz ed emoji) o dal
 *  telefono di chi disegna. Richiede il server su :3000. */

import { io, type Socket } from 'socket.io-client';
import { GAMES } from '../shared/src/catalog.ts';
import { QUIZ } from '../server/src/data/quiz.ts';
import { EMOJI_PUZZLES } from '../server/src/data/emoji.ts';
import { maskTitle } from '../server/src/games/fuzzy.ts';

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
async function waitFor(label: string, cond: () => boolean, timeoutMs = 12_000) {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > timeoutMs) throw new Error(`timeout: ${label}`);
    await sleep(50);
  }
}

interface P { name: string; s: Socket; id: string; priv: any }

async function openGame(gameId: string, names: string[]) {
  const host = await conn();
  const state = { room: null as any, events: [] as { name: string; data: any }[] };
  host.on('room', (s) => { state.room = s; });
  host.on('game:event', (e) => { state.events.push(e); });
  const { code } = await ask<{ code: string }>(host, 'host:create');

  const players: P[] = [];
  for (const name of names) {
    const s = await conn();
    const p: P = { name, s, id: '', priv: null };
    s.on('private', (v: any) => { p.priv = v.game; });
    const r = await ask(s, 'player:join', { code, name });
    p.id = r.playerId;
    players.push(p);
  }
  await waitFor('giocatori in stanza', () => state.room?.players?.length === names.length);

  const excluded = GAMES.filter((g) => g.id !== gameId).map((g) => g.id);
  const started = await ask(host, 'host:start', { settings: { totalRounds: 1, excluded } });
  if (!started.ok) throw new Error(`${gameId}: ${started.error}`);
  await waitFor('presentazione', () => state.room.phase === 'intro');
  await ask(host, 'host:next');
  await waitFor('gioco', () => state.room.phase === 'playing' && !!state.room.game);
  await waitFor('viste private', () => players.every((p) => p.priv));

  const pub = () => state.room.game;
  const byId = (id: string) => players.find((p) => p.id === id)!;
  const close = () => { host.close(); players.forEach((p) => p.s.close()); };
  return { host, state, players, pub, byId, close };
}

const act = (p: P, type: string, payload?: unknown) => ask(p.s, 'game:action', { type, payload });

/* --------------------------------- Quiz lampo --------------------------------- */

{
  console.log('\n— Quiz lampo');
  const g = await openGame('quiz-lampo', ['Andrea', 'Giulia', 'Marco']);
  const [A, B, C] = g.players;
  const q = QUIZ.find((x) => x.domanda === g.pub().domanda)!;
  check('la domanda viene dall archivio', !!q, g.pub().domanda);
  const right = g.pub().options.indexOf(q.giusta);
  check('le quattro opzioni contengono la risposta giusta', right >= 0 && g.pub().options.length === 4);
  check('durante la domanda la soluzione non si vede', g.pub().correct === null && A.priv.correct === null);

  await act(A, 'answer', { choice: right });
  await act(A, 'answer', { choice: (right + 1) % 4 });
  await waitFor('risposta di Andrea', () => A.priv.myChoice !== null);
  check('non si cambia risposta', A.priv.myChoice === right);

  await sleep(1500);
  await act(C, 'answer', { choice: right });
  await act(B, 'answer', { choice: (right + 1) % 4 });
  await waitFor('soluzione', () => g.pub().phase === 'reveal');
  await waitFor('telefoni aggiornati', () => B.priv.phase === 'reveal');

  const gains = g.pub().gains as { playerId: string; points: number }[];
  const gainOf = (p: P) => gains.find((x) => x.playerId === p.id)?.points ?? 0;
  check('risposto tutti, si passa subito alla soluzione', g.pub().correct === right);
  check('chi risponde prima prende di più', gainOf(A) > gainOf(C) && gainOf(C) >= 500, `${gainOf(A)} > ${gainOf(C)}`);
  check('chi sbaglia non prende punti', gainOf(B) === 0 && B.priv.gain === 0);
  check('i conteggi per risposta sono giusti', g.pub().counts[right] === 2 && g.pub().counts[(right + 1) % 4] === 1);
  g.close();
}

/* ---------------------------- Indovina dalle emoji ---------------------------- */

{
  console.log('\n— Indovina dalle emoji');
  const g = await openGame('emoji-film', ['Andrea', 'Giulia', 'Marco']);
  const [A, B, C] = g.players;
  const puzzle = EMOJI_PUZZLES.find((e) => e.emoji === g.pub().emoji)!;
  check('le emoji vengono dall archivio', !!puzzle, g.pub().emoji);
  check('il titolo non è né in TV né sui telefoni', g.pub().titolo === null && A.priv.titolo === null);

  await act(A, 'guess', { text: puzzle.titolo.toUpperCase() });
  await waitFor('Andrea indovina', () => A.priv.solved);
  check('le maiuscole non contano', A.priv.solved === true);

  for (let i = 0; i < 7; i++) await act(B, 'guess', { text: `sicuramente sbagliato ${i}` });
  await waitFor('tentativi di Giulia', () => B.priv.tries >= 5);
  check('i tentativi hanno un limite', B.priv.tries === 5 && !B.priv.solved);

  await sleep(1200);
  await act(C, 'guess', { text: puzzle.alias?.[0] ?? puzzle.titolo });
  await waitFor('titolo svelato', () => g.pub().phase === 'reveal');
  const solvers = g.pub().solvers as { playerId: string; points: number }[];
  check('quando tutti hanno finito si svela il titolo', g.pub().titolo === puzzle.titolo);
  check('conta l ordine di arrivo', solvers.length === 2 && solvers[0].playerId === A.id && solvers[1].playerId === C.id);
  check('chi arriva prima prende di più', solvers[0].points > solvers[1].points, solvers.map((s) => s.points).join(' > '));

  await waitFor('secondo titolo', () => g.pub().phase === 'guess' && g.pub().index === 1, 10_000);
  const second = EMOJI_PUZZLES.find((e) => e.emoji === g.pub().emoji)!;
  check('all inizio niente suggerimento', g.pub().hint === null);
  await waitFor('suggerimento', () => g.pub().hint !== null, 16_000);
  check('a metà tempo compaiono le iniziali', g.pub().hint === maskTitle(second.titolo), g.pub().hint);
  g.close();
}

/* -------------------------------- Indizio Secco -------------------------------- */

{
  console.log('\n— Indizio Secco');
  const g = await openGame('indizio-secco', ['Andrea', 'Giulia', 'Marco', 'Sara']);
  const teams = g.state.room.teams as { id: 'A' | 'B'; members: string[] }[];
  check('due squadre da due', teams.length === 2 && teams.every((t) => t.members.length === 2));
  check('parte la prima squadra con la richiesta di indizio', g.pub().turnTeam === 'A' && g.pub().phase === 'clue');

  const giverA = g.byId(g.pub().givers.A);
  const giverB = g.byId(g.pub().givers.B);
  const mateA = g.byId(teams.find((t) => t.id === 'A')!.members.find((id) => id !== giverA.id)!);
  const mateB = g.byId(teams.find((t) => t.id === 'B')!.members.find((id) => id !== giverB.id)!);
  const parola = giverA.priv.parola as string;
  check('chi dà gli indizi vede la parola', typeof parola === 'string' && giverB.priv.parola === parola, parola);
  check('i compagni non la vedono', mateA.priv.parola === null && mateB.priv.parola === null);

  await act(mateA, 'clue', { word: 'furbata' });
  await act(giverA, 'clue', { word: 'due parole' });
  await act(giverA, 'clue', { word: parola.replace(/[\s']/g, '') });
  await sleep(300);
  check('solo chi dà gli indizi, una parola sola, mai la parola segreta', g.pub().phase === 'clue' && g.pub().clues.length === 0);

  await act(giverA, 'clue', { word: 'primoindizio' });
  await waitFor('prima risposta', () => g.pub().phase === 'guess');
  check('primo indizio: vale 10 e giudica l altra squadra', g.pub().worth === 10 && g.pub().judgeId === giverB.id);
  await waitFor('compagno aggiornato', () => mateA.priv.phase === 'guess');
  check('chi risponde vede l indizio ma non la parola', mateA.priv.parola === null && mateA.priv.lastClue === 'primoindizio');

  await act(giverA, 'judge', { correct: true });
  await sleep(300);
  check('non ci si giudica da soli', g.pub().phase === 'guess' && g.pub().scores.A === 0);

  await act(giverB, 'judge', { correct: false });
  await waitFor('palla agli avversari', () => g.pub().phase === 'clue' && g.pub().turnTeam === 'B');
  check('dopo un errore tocca agli avversari, con gli indizi già detti', g.pub().clues.length === 1);

  await act(giverB, 'clue', { word: 'PrimoIndizio' });
  await sleep(300);
  check('un indizio già detto non vale', g.pub().phase === 'clue' && g.pub().clues.length === 1);

  await act(giverB, 'clue', { word: 'secondoindizio' });
  await waitFor('seconda risposta', () => g.pub().phase === 'guess');
  check('secondo indizio: vale 8', g.pub().worth === 8 && g.pub().judgeId === giverA.id);
  await act(giverA, 'judge', { correct: true });
  await waitFor('parola svelata', () => g.pub().phase === 'reveal');
  check('la squadra che indovina prende i punti', g.pub().scores.B === 8 && g.pub().scores.A === 0 && g.pub().outcome.points === 8);
  check('a fine parola la vedono tutti', g.pub().parola === parola);

  await ask(g.host, 'host:next');
  await waitFor('seconda parola', () => g.pub().phase === 'clue' && g.pub().wordIndex === 1);
  check('la parola dopo la inizia l altra squadra', g.pub().turnTeam === 'B');
  check('chi dà gli indizi cambia a ogni parola', g.pub().givers.A === mateA.id && g.pub().givers.B === mateB.id);
  g.close();
}

/* ----------------------------- Disegna e indovina ----------------------------- */

{
  console.log('\n— Disegna e indovina');
  const g = await openGame('disegna', ['Andrea', 'Giulia', 'Marco']);
  const drawer = g.byId(g.pub().drawerId);
  const [g1, g2] = g.players.filter((p) => p.id !== drawer.id);
  check('si parte dalla scelta della parola', g.pub().phase === 'choose' && drawer.priv.options.length === 3);
  check('gli altri non vedono le parole proposte', g1.priv.options === null && g1.priv.word === null);

  await act(g1, 'choose', { index: 0 });
  await sleep(250);
  check('solo chi disegna sceglie', g.pub().phase === 'choose');

  const chosen = drawer.priv.options[1] as string;
  await act(drawer, 'choose', { index: 1 });
  await waitFor('si disegna', () => g.pub().phase === 'draw');
  await waitFor('parola a chi disegna', () => drawer.priv.word === chosen);
  check('chi disegna vede la parola, gli altri solo le lettere',
    g1.priv.word === null && g.pub().mask === chosen.replace(/\p{L}/gu, '_'), `${g.pub().mask}`);

  g.state.events.length = 0;
  await act(drawer, 'stroke', { id: 1, color: '#e63946', size: 10, offset: 0, points: [10, 10, 200, 200] });
  await act(drawer, 'stroke', { id: 1, color: '#e63946', size: 10, offset: 4, points: [300, 300] });
  await act(drawer, 'stroke', { id: 1, color: '#e63946', size: 10, offset: 4, points: [300, 300] });
  await act(drawer, 'stroke', { id: 2, color: 'rosso', size: 999, offset: 0, points: [5000, -20] });
  await act(g1, 'stroke', { id: 3, color: '#000000', size: 5, offset: 0, points: [1, 1] });
  await waitFor('tratti in diretta', () => g.state.events.filter((e) => e.name === 'stroke').length >= 4);
  const strokeEvents = g.state.events.filter((e) => e.name === 'stroke');
  check('i tratti arrivano in diretta alla TV',
    strokeEvents[0].data.points.join(',') === '10,10,200,200' && strokeEvents[1].data.offset === 4);

  await waitFor('stato con i tratti', () => (g.pub().strokes ?? []).length === 2, 4000);
  const s1 = g.pub().strokes.find((s: any) => s.id === 1);
  const s2 = g.pub().strokes.find((s: any) => s.id === 2);
  check('un pezzo arrivato due volte non raddoppia il tratto', s1.points.length === 6, `${s1.points.length} coordinate`);
  check('colori, spessori e coordinate fuori scala vengono corretti',
    s2.color === '#111111' && s2.size === 60 && s2.points.join(',') === '1000,0', JSON.stringify(s2));
  check('solo chi disegna può disegnare', !g.pub().strokes.some((s: any) => s.id === 3));

  await act(drawer, 'undo', { id: 2 });
  await waitFor('annulla', () => g.pub().strokes.length === 1, 4000);
  check('annulla toglie il tratto per tutti', g.state.events.some((e) => e.name === 'undo' && e.data.id === 2));

  await act(g1, 'guess', { text: 'sicuramente sbagliato' });
  await waitFor('chat', () => g.pub().feed.length === 1, 4000);
  check('le risposte sbagliate compaiono sulla TV', g.pub().feed[0].text === 'sicuramente sbagliato');

  await act(g1, 'guess', { text: chosen.toLowerCase() });
  await waitFor('primo indovina', () => g1.priv.guessed);
  await sleep(1200);
  await act(g2, 'guess', { text: chosen.toUpperCase() });
  await waitFor('parola svelata', () => g.pub().phase === 'reveal');
  const gains = g.pub().gains as { playerId: string; points: number }[];
  check('quando indovinano tutti si svela la parola', g.pub().word === chosen);
  check('chi indovina prima prende di più',
    gains[0].playerId === g1.id && gains[0].points > gains[1].points, gains.map((x) => x.points).join(' > '));
  check('chi disegna guadagna per ogni persona che ci arriva', g.pub().drawerGain === 400, `${g.pub().drawerGain}`);

  await ask(g.host, 'host:next');
  await waitFor('secondo disegno', () => g.pub().phase === 'choose' && g.pub().turn === 1);
  check('al turno dopo disegna un altro, su una lavagna pulita', g.pub().drawerId !== drawer.id && g.pub().strokes.length === 0);
  check('la lavagna viene pulita anche in diretta', g.state.events.some((e) => e.name === 'clear' && e.data.turn === 1));
  g.close();
}

console.log(failures === 0 ? '\n  NUOVI MINIGIOCHI OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
