import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import { Server as IOServer } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import type { PlayerId, RoomCode, RoomSettings } from '../../shared/src/types.ts';
import { Room } from './room.ts';
import { registry } from './registry.ts';
import { lanAddress } from './net.ts';
import { startMatch, saveRound, finishMatch, hallOfFame, recentMatches, bestByGame, stats, isPersistent } from './db.ts';

const PORT = Number(process.env.PORT ?? 3000);
const PUBLIC_DIR = fileURLToPath(new URL('../public', import.meta.url));

const app = Fastify({ logger: false });
await app.register(cors, { origin: true });

if (existsSync(PUBLIC_DIR)) {
  await app.register(fastifyStatic, { root: PUBLIC_DIR });
  app.setNotFoundHandler((_req, reply) => reply.sendFile('index.html'));
}

/** Su quale indirizzo devono puntare i QR code.
 *  In locale serve l'IP di rete (i telefoni non risolvono "localhost");
 *  in produzione conta il dominio pubblico, che il client ricava da solo. */
app.get('/api/net', async () => ({
  host: lanAddress(),
  port: PORT,
  publicUrl: process.env.PUBLIC_URL ?? null,
}));
/** `commit` dice quale versione e' online dopo un deploy:
 *  Render espone l'hash del commit nella variabile RENDER_GIT_COMMIT. */
app.get('/api/health', async () => ({
  ok: true,
  rooms: rooms.size,
  commit: process.env.RENDER_GIT_COMMIT?.slice(0, 7) ?? null,
}));
app.get('/api/albo', async () => ({ albo: hallOfFame(20), stats: stats(), persistente: isPersistent }));
app.get('/api/partite', async () => ({ partite: recentMatches(15) }));
app.get('/api/statistiche-giochi', async () => ({ giochi: bestByGame() }));

/* ------------------------------- room store ------------------------------- */

const rooms = new Map<RoomCode, Room>();
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // niente I/O, si confondono

function newCode(): RoomCode {
  let code: string;
  do {
    code = Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('');
  } while (rooms.has(code));
  return code;
}

const server = app.server;
const io = new IOServer(server, { cors: { origin: true } });

function broadcast(code: RoomCode) {
  const room = rooms.get(code);
  if (!room) return;
  const pub = room.publicState();
  io.to(`room:${code}`).emit('room', pub);
  for (const socket of io.sockets.sockets.values()) {
    const d = socket.data as SocketData;
    if (d.code === code && d.playerId) {
      socket.emit('private', { playerId: d.playerId, game: room.privateState(d.playerId) });
    }
  }
}

function toastTo(code: RoomCode, playerId: PlayerId | null, kind: 'info'|'good'|'bad', text: string) {
  if (!playerId) { io.to(`room:${code}`).emit('toast', { kind, text }); return; }
  for (const socket of io.sockets.sockets.values()) {
    const d = socket.data as SocketData;
    if (d.code === code && d.playerId === playerId) socket.emit('toast', { kind, text });
  }
}

interface SocketData { code?: RoomCode; playerId?: PlayerId; isHost?: boolean }

/** I comandi di regia li puo' dare la TV oppure il telefono del regista:
 *  con una smart TV senza mouse e' il telefono a far avanzare la partita. */
function directedRoom(data: SocketData): Room | null {
  const room = data.code ? rooms.get(data.code) : null;
  if (!room) return null;
  if (data.isHost) return room;
  if (data.playerId && room.directorId === data.playerId) return room;
  return null;
}
const NOT_DIRECTOR = { ok: false as const, error: 'Solo la TV o il regista possono farlo' };

/** Alcuni eventi arrivano con o senza payload: la callback e' sempre l'ultimo argomento. */
function splitArgs<T>(args: unknown[]): { payload: T | undefined; cb: ((r: unknown) => void) | undefined } {
  const last = args[args.length - 1];
  const cb = typeof last === 'function' ? (last as (r: unknown) => void) : undefined;
  const payload = (cb ? args.slice(0, -1) : args)[0] as T | undefined;
  return { payload, cb };
}

function createRoom(): Room {
  const room = new Room(newCode(), {
    registry,
    broadcast,
    toast: toastTo,
    onStarted: (r) => {
      try { return startMatch(r); } catch (e) { console.error('[db] startMatch', e); return null; }
    },
    onRoundEnd: (r, recap) => {
      if (r.dbMatchId === null) return;
      try { saveRound(r.dbMatchId, r.roundIndex, recap, r.players); }
      catch (e) { console.error('[db] saveRound', e); }
    },
    onFinished: (r) => {
      if (r.dbMatchId === null) return;
      try { finishMatch(r.dbMatchId, r); } catch (e) { console.error('[db] finishMatch', e); }
    },
  });
  rooms.set(room.code, room);
  return room;
}

/* -------------------------------- socket -------------------------------- */

io.on('connection', (socket) => {
  const data = socket.data as SocketData;

  socket.on('host:create', (cb) => {
    const room = createRoom();
    data.code = room.code;
    data.isHost = true;
    socket.join(`room:${room.code}`);
    cb?.({ code: room.code });
    broadcast(room.code);
  });

  socket.on('host:attach', (p: { code: RoomCode }, cb) => {
    const room = rooms.get(p.code?.toUpperCase?.() ?? '');
    if (!room) return cb?.({ ok: false, error: 'Stanza inesistente' });
    data.code = room.code;
    data.isHost = true;
    socket.join(`room:${room.code}`);
    cb?.({ ok: true });
    broadcast(room.code);
  });

  socket.on('player:join', (p: { code: RoomCode; name: string; token?: string }, cb) => {
    const code = (p.code ?? '').toUpperCase();
    const room = rooms.get(code);
    if (!room) return cb?.({ ok: false, error: 'Codice stanza non valido' });

    const token = p.token && room.tokens.has(p.token)
      ? p.token
      : `t_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

    const res = room.addPlayer(p.name, token);
    if ('error' in res) return cb?.({ ok: false, error: res.error });

    data.code = code;
    data.playerId = res.player.id;
    socket.join(`room:${code}`);
    cb?.({ ok: true, playerId: res.player.id, token });
    broadcast(code);
  });

  socket.on('host:start', (...args: unknown[]) => {
    const { payload, cb } = splitArgs<{ settings?: Partial<RoomSettings> }>(args);
    const room = directedRoom(data);
    if (!room) return cb?.(NOT_DIRECTOR);
    cb?.(room.start(payload?.settings));
    broadcast(room.code);
  });

  socket.on('host:settings', (...args: unknown[]) => {
    const { payload, cb } = splitArgs<{ settings?: Partial<RoomSettings> }>(args);
    const room = directedRoom(data);
    if (!room) return cb?.(NOT_DIRECTOR);
    cb?.(room.updateSettings(payload?.settings));
    broadcast(room.code);
  });

  socket.on('host:next', (...args: unknown[]) => {
    const { payload, cb } = splitArgs<{ expect?: string }>(args);
    const room = directedRoom(data);
    if (!room) return cb?.(NOT_DIRECTOR);
    cb?.(room.advance(payload?.expect));
    broadcast(room.code);
  });

  socket.on('host:restart', (...args: unknown[]) => {
    const { cb } = splitArgs(args);
    const room = directedRoom(data);
    if (!room) return cb?.(NOT_DIRECTOR);
    cb?.(room.restart());
    broadcast(room.code);
  });

  socket.on('director:transfer', (...args: unknown[]) => {
    const { payload, cb } = splitArgs<{ playerId?: PlayerId }>(args);
    const room = directedRoom(data);
    if (!room) return cb?.(NOT_DIRECTOR);
    cb?.(room.transferDirector(payload?.playerId ?? ''));
    broadcast(room.code);
  });

  socket.on('host:kick', (...args: unknown[]) => {
    const { payload, cb } = splitArgs<{ playerId?: PlayerId }>(args);
    const room = directedRoom(data);
    if (!room) return cb?.(NOT_DIRECTOR);
    room.kick(payload?.playerId ?? '');
    cb?.({ ok: true });
    broadcast(room.code);
  });

  socket.on('game:action', (p: { type: string; payload?: unknown }, cb) => {
    const room = data.code ? rooms.get(data.code) : null;
    if (!room || !data.playerId) return cb?.({ ok: false, error: 'Non sei in partita' });
    room.action(data.playerId, p.type, p.payload);
    cb?.({ ok: true });
  });

  socket.on('disconnect', () => {
    if (data.code && data.playerId) {
      const room = rooms.get(data.code);
      room?.setConnected(data.playerId, false);
      if (room) broadcast(room.code);
    }
  });
});

/* --------------------------- pulizia stanze morte -------------------------- */

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    const empty = room.players.every((p) => !p.connected);
    const old = now - room.createdAt > 6 * 60 * 60 * 1000;
    if ((empty && now - room.createdAt > 15 * 60 * 1000) || old) {
      room.dispose();
      rooms.delete(code);
    }
  }
}, 60_000);

await app.listen({ port: PORT, host: '0.0.0.0' });
const ip = lanAddress();
console.log(`\n  Uni Games\n  TV      http://localhost:${PORT}/host`);
console.log(`  Telefoni http://${ip}:${PORT}\n`);
