/** Fa giocare ogni minigioco fino al recap, uno alla volta.
 *  Per isolare un gioco si escludono tutti gli altri dalla scaletta.
 *  Richiede il server su :3000 (npm run dev). */

import { io, type Socket } from 'socket.io-client';
import { GAMES } from '../shared/src/catalog.ts';
import { decide } from './bot-brain.mts';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const PLAYERS = ['Andrea', 'Giulia', 'Marco', 'Sara', 'Luca', 'Chiara'];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const conn = (): Promise<Socket> =>
  new Promise((res, rej) => {
    const s = io(BASE, { transports: ['websocket'], timeout: 5000 });
    s.on('connect', () => res(s));
    s.on('connect_error', rej);
  });
const ask = <T>(s: Socket, ev: string, p?: unknown): Promise<T> =>
  new Promise((res) => (p === undefined ? s.emit(ev, res) : s.emit(ev, p, res)));

interface Bot { socket: Socket; name: string; id: string; priv: any }

let failures = 0;
const check = (label: string, ok: boolean, extra = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
};

async function playOne(gameId: string): Promise<void> {
  const host = await conn();
  let room: any = null;
  host.on('room', (s) => { room = s; });
  const { code } = await ask<{ code: string }>(host, 'host:create');

  const def = GAMES.find((g) => g.id === gameId)!;
  const count = Math.max(def.minPlayers, Math.min(PLAYERS.length, def.maxPlayers));
  const bots: Bot[] = [];
  for (const name of PLAYERS.slice(0, count)) {
    const s = await conn();
    const bot: Bot = { socket: s, name, id: '', priv: null };
    s.on('private', (v: any) => { bot.priv = v.game; bot.id = v.playerId; });
    const r = await ask<any>(s, 'player:join', { code, name });
    if (!r.ok) throw new Error(`${name}: ${r.error}`);
    bot.id = r.playerId;
    bots.push(bot);
  }

  // isolando il gioco resta una sola categoria disponibile: la scaletta lo ripete
  const excluded = GAMES.filter((g) => g.id !== gameId).map((g) => g.id);
  const st = await ask<any>(host, 'host:start', { settings: { totalRounds: 1, excluded } });
  if (!st.ok) { check(gameId, false, st.error); host.close(); bots.forEach((b) => b.socket.close()); return; }

  for (let i = 0; i < 60 && room?.phase !== 'playing'; i++) {
    if (room?.phase === 'intro') await ask(host, 'host:next');
    await sleep(50);
  }
  check(`${gameId}: round avviato`, room?.currentGame === gameId, `${room?.currentGame} / ${room?.phase}`);

  // i bot giocano finche il round non si chiude; l'host sblocca le fasi di discussione
  const t0 = Date.now();
  let idle = 0;
  while (room?.phase === 'playing' && Date.now() - t0 < 150_000) {
    let acted = false;
    for (const bot of bots) {
      const move = decide(gameId, bot, room);
      if (move) { await ask(bot.socket, 'game:action', move); acted = true; await sleep(25); }
    }
    if (!acted) {
      idle++;
      // nessuno ha piu mosse: probabilmente serve l'avanzamento dalla TV
      // con `expect` un comando partito un attimo prima che il round si chiudesse
      // non scavalca il recap (con la latenza del server online succedeva)
      if (idle % 3 === 0) await ask(host, 'host:next', { expect: room?.directorAction ?? null });
      await sleep(120);
    } else idle = 0;
  }

  const ok = room?.phase === 'recap';
  check(`${gameId}: arriva al recap`, ok, ok ? `${room.recap.rows.length} righe · ${room.recap.reveal[0]}` : `fermo su ${room?.phase}`);

  if (ok) {
    const rows = room.recap.rows;
    check(`${gameId}: punti assegnati a tutti`, rows.length === bots.length, `${rows.length}/${bots.length}`);
    const anyRaw = rows.some((r: any) => r.raw > 0);
    check(`${gameId}: il migliore prende 1000`,
      anyRaw ? rows[0].points === 1000 : rows.every((r: any) => r.points === 100),
      anyRaw ? `${rows[0].points}` : 'nessuno ha segnato: tutti al pavimento');
    check(`${gameId}: nessuno sotto il pavimento`, rows.every((r: any) => r.points >= 100));
    check(`${gameId}: ogni riga ha un dettaglio`, rows.every((r: any) => typeof r.detail === 'string' && r.detail.length > 0));
  }

  host.close();
  bots.forEach((b) => b.socket.close());
  await sleep(120);
}

// ONLY=quiz-lampo,disegna limita il giro ai giochi indicati
const only = process.env.ONLY?.split(',').map((x) => x.trim()).filter(Boolean);
for (const g of GAMES.filter((x) => !only?.length || only.includes(x.id))) {
  console.log(`\n— ${g.title} (${g.category})`);
  try { await playOne(g.id); }
  catch (e) { check(`${g.id}: eccezione`, false, String(e)); }
}

console.log(failures === 0 ? '\n  TUTTI I MINIGIOCHI OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
