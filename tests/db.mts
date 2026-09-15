/** Gioca una partita intera e verifica che finisca archiviata nel database.
 *  Richiede il server su :3000. */

import { io, type Socket } from 'socket.io-client';
import { SOLUTION_LIST } from '../server/src/data/words-it.ts';
import { db, hallOfFame, recentMatches, stats } from '../server/src/db.ts';

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

const before = stats();

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

// due round di Wordle: bastano per verificare l'archiviazione
// tutti i giochi tranne Wordle, qualunque sia il catalogo del momento
const { GAMES } = await import('../shared/src/catalog.ts');
const excluded = GAMES.filter((g) => g.id !== 'wordle').map((g) => g.id);
const st = await ask<any>(host, 'host:start', { settings: { totalRounds: 2, excluded } });
check('partita avviata', st.ok === true, st.error ?? '');

const t0 = Date.now();
while (room?.phase !== 'final' && Date.now() - t0 < 40_000) {
  if (room?.phase === 'intro' || room?.phase === 'recap') { await ask(host, 'host:next'); await sleep(80); continue; }
  if (room?.phase === 'playing') {
    for (const b of bots) {
      if (b.priv && !b.priv.done) {
        await ask(b.s, 'game:action', { type: 'guess', payload: { word: SOLUTION_LIST[Math.floor(Math.random() * SOLUTION_LIST.length)] } });
      }
    }
  }
  await sleep(120);
}
check('partita arrivata alla classifica finale', room?.phase === 'final', `${room?.phase}`);

await sleep(400);
const after = stats();
check('una partita in piu archiviata', after.partite === before.partite + 1, `${before.partite} → ${after.partite}`);
check('round archiviati', after.round >= before.round + 2, `${before.round} → ${after.round}`);

const last = recentMatches(1)[0] as any;
check('ultima partita col vincitore giusto', !!last?.vincitore,
  `${last?.vincitore} con ${last?.punteggio} punti, ${last?.giocatori} giocatori`);
check('la partita risulta completata', last?.completed === 1);
check('durata registrata', last?.ended_at > last?.started_at);

const rounds = db.prepare(
  `SELECT round_index, game_id, category, COUNT(*) n FROM match_rounds WHERE match_id = ? GROUP BY round_index`
).all(last.id) as any[];
check('due round archiviati con 4 righe ciascuno',
  rounds.length === 2 && rounds.every((r) => r.n === 4),
  rounds.map((r) => `r${r.round_index}:${r.game_id}×${r.n}`).join(' '));

const albo = hallOfFame(5) as any[];
check('albo d oro popolato', albo.length > 0,
  albo.slice(0, 3).map((a) => `${a.name} ${a.vittorie}v/${a.partite}p`).join(' · '));

host.close();
bots.forEach((b) => b.s.close());
console.log(failures === 0 ? '\n  DATABASE OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
