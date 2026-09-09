import type {
  Player, PlayerId, RoomCode, RoomState, RoomSettings, RoomPhase,
  Team, GameId, RoundRecap, RecapRow,
} from '../../shared/src/types.ts';
import { gameDef, MAX_PLAYERS } from '../../shared/src/catalog.ts';
import { buildSchedule, drawTeams } from '../../shared/src/rotation.ts';
import { curveRound } from '../../shared/src/scoring.ts';
import type { GameContext, GameResult, MiniGame, Registry } from './minigame.ts';

const AVATARS = ['🦊','🐼','🐸','🦁','🐙','🦄','🐝','🦖','🐧','🦉','🐺','🦝','🐨','🦩','🐢','🦔'];
const COLORS  = ['#ff2e88','#00e5ff','#ffd93d','#7c4dff','#00ffa3','#ff7a29','#ff4d6d','#4dd2ff',
                 '#c4ff4d','#b14dff','#ff9ecd','#2dffcf','#ffe066','#5b8cff','#ff6b35','#8affd1'];

const INTRO_MS = 9000;

export interface RoomDeps {
  registry: Registry;
  broadcast: (code: RoomCode) => void;
  toast: (code: RoomCode, playerId: PlayerId | null, kind: 'info'|'good'|'bad', text: string) => void;
  /** la partita e' iniziata: restituisce l'id con cui archiviare i round */
  onStarted?: (room: Room) => number | null;
  /** un round si e' chiuso: si archivia subito, senza aspettare la fine */
  onRoundEnd?: (room: Room, recap: RoundRecap) => void;
  onFinished?: (room: Room) => void;
}

export class Room {
  readonly code: RoomCode;
  readonly createdAt = Date.now();
  phase: RoomPhase = 'lobby';
  players: Player[] = [];
  teams: Team[] | null = null;
  settings: RoomSettings = { totalRounds: 9, excluded: [] };

  schedule: GameId[] = [];
  roundIndex = -1;
  recap: RoundRecap | null = null;

  /** token persistente -> playerId, per il reconnect da telefono */
  tokens = new Map<string, PlayerId>();
  /** riga della partita nel database, per archiviare i round man mano */
  dbMatchId: number | null = null;

  private game: MiniGame | null = null;
  private _deadline: number | null = null;
  private loop: NodeJS.Timeout | null = null;

  constructor(code: RoomCode, private deps: RoomDeps) {
    this.code = code;
  }

  /* ------------------------------ giocatori ------------------------------ */

  addPlayer(name: string, token: string): { player: Player } | { error: string } {
    const clean = name.trim().slice(0, 14);
    if (clean.length < 1) return { error: 'Serve un nome' };

    const existingId = this.tokens.get(token);
    if (existingId) {
      const p = this.players.find((x) => x.id === existingId);
      if (p) { p.connected = true; p.name = clean; return { player: p }; }
    }
    if (this.phase !== 'lobby') return { error: 'Partita gia iniziata' };
    if (this.players.length >= MAX_PLAYERS) return { error: `Massimo ${MAX_PLAYERS} giocatori` };
    if (this.players.some((p) => p.name.toLowerCase() === clean.toLowerCase()))
      return { error: 'Nome gia preso' };

    const idx = this.players.length;
    const player: Player = {
      id: `p${idx}_${Math.random().toString(36).slice(2, 7)}`,
      name: clean,
      avatar: AVATARS[idx % AVATARS.length],
      color: COLORS[idx % COLORS.length],
      connected: true,
      score: 0,
    };
    this.players.push(player);
    this.tokens.set(token, player.id);
    return { player };
  }

  setConnected(playerId: PlayerId, connected: boolean) {
    const p = this.players.find((x) => x.id === playerId);
    if (!p) return;
    p.connected = connected;
    if (!connected && this.phase === 'playing') this.game?.onDisconnect(playerId);
  }

  kick(playerId: PlayerId) {
    this.players = this.players.filter((p) => p.id !== playerId);
    for (const [t, id] of this.tokens) if (id === playerId) this.tokens.delete(t);
  }

  get activePlayers(): Player[] {
    return this.players.filter((p) => p.connected);
  }

  /* ------------------------------- partita ------------------------------- */

  start(settings?: Partial<RoomSettings>): { ok: true } | { ok: false; error: string } {
    if (this.phase !== 'lobby') return { ok: false, error: 'Partita gia in corso' };
    this.settings = { ...this.settings, ...settings };

    const count = this.activePlayers.length;
    this.schedule = buildSchedule({
      playerCount: count,
      rounds: this.settings.totalRounds,
      excluded: this.settings.excluded,
    });
    if (this.schedule.length === 0)
      return { ok: false, error: `Nessun minigioco disponibile con ${count} giocatori` };

    for (const p of this.players) p.score = 0;
    this.roundIndex = -1;
    this.dbMatchId = this.deps.onStarted?.(this) ?? null;
    this.startLoop();
    this.nextRound();
    return { ok: true };
  }

  /** Avanza: lobby/recap -> intro del round successivo, oppure classifica finale. */
  nextRound() {
    this.recap = null;
    this.teams = null;
    this.game = null;
    this._deadline = null;
    this.roundIndex++;

    if (this.roundIndex >= this.schedule.length) {
      this.phase = 'final';
      this.stopLoop();
      this.deps.onFinished?.(this);
      this.deps.broadcast(this.code);
      return;
    }

    const def = gameDef(this.currentGame!);
    if (def.category === 'team') this.teams = this.makeTeams();

    this.phase = 'intro';
    this._deadline = Date.now() + INTRO_MS;
    this.deps.broadcast(this.code);
  }

  /** Salta l'intro e fa partire davvero il minigioco. */
  beginPlay() {
    if (this.phase !== 'intro') return;
    const id = this.currentGame!;
    const factory = this.deps.registry[id];
    if (!factory) {
      // gioco non implementato: salta il round senza rompere la partita
      this.deps.toast(this.code, null, 'bad', `${gameDef(id).title} non e ancora disponibile`);
      this.nextRound();
      return;
    }
    this._deadline = null;
    this.phase = 'playing';
    this.game = factory(this.context());
    this.game.start();
    this.deps.broadcast(this.code);
  }

  action(playerId: PlayerId, type: string, payload: unknown) {
    if (this.phase !== 'playing' || !this.game) return;
    this.game.action(playerId, type, payload);
  }

  /** "avanti" premuto sulla TV durante un round: solo i giochi a fasi lo usano */
  hostAdvance() {
    if (this.phase !== 'playing' || !this.game) return;
    this.game.hostAdvance();
  }

  private makeTeams(): Team[] {
    const [a, b] = drawTeams(this.activePlayers.map((p) => p.id));
    return [
      { id: 'A', name: 'Squadra Neon', color: '#00e5ff', members: a, score: 0 },
      { id: 'B', name: 'Squadra Magma', color: '#ff2e88', members: b, score: 0 },
    ];
  }

  /* ------------------------------- risultati ------------------------------ */

  private finishRound(result: GameResult) {
    const before = this.rankMap();
    const points = curveRound(result.raw);

    for (const [pid, pts] of Object.entries(points)) {
      const p = this.players.find((x) => x.id === pid);
      if (p) p.score += pts;
    }
    const after = this.rankMap();

    const rows: RecapRow[] = Object.keys(points)
      .map((pid) => ({
        playerId: pid,
        raw: Math.round(result.raw[pid] ?? 0),
        points: points[pid],
        detail: result.detail[pid] ?? '',
        rankBefore: before.get(pid) ?? 0,
        rankAfter: after.get(pid) ?? 0,
      }))
      .sort((x, y) => y.points - x.points);

    const def = gameDef(this.currentGame!);
    this.recap = { gameId: def.id, category: def.category, rows, reveal: result.reveal };
    this.deps.onRoundEnd?.(this, this.recap);
    this.phase = 'recap';
    this._deadline = null;
    this.game = null;
    this.deps.broadcast(this.code);
  }

  rankMap(): Map<PlayerId, number> {
    const sorted = [...this.players].sort((a, b) => b.score - a.score);
    const m = new Map<PlayerId, number>();
    sorted.forEach((p, i) => m.set(p.id, i + 1));
    return m;
  }

  get currentGame(): GameId | null {
    return this.schedule[this.roundIndex] ?? null;
  }

  /* -------------------------------- timer -------------------------------- */

  private startLoop() {
    if (this.loop) return;
    this.loop = setInterval(() => this.tick(), 1000);
  }
  private stopLoop() {
    if (this.loop) { clearInterval(this.loop); this.loop = null; }
  }

  private tick() {
    const now = Date.now();
    if (this.phase === 'intro' && this._deadline && now >= this._deadline) {
      this.beginPlay();
      return;
    }
    if (this.phase === 'playing' && this.game) {
      this.game.tick();
      if (this._deadline && now >= this._deadline) {
        this._deadline = null;
        this.game.onDeadline();
      }
      this.deps.broadcast(this.code);
    }
  }

  dispose() { this.stopLoop(); }

  /* ------------------------------- contesto ------------------------------- */

  private context(): GameContext {
    const room = this;
    return {
      get players() { return room.activePlayers; },
      get teams() { return room.teams; },
      rng: Math.random,
      push: () => room.deps.broadcast(room.code),
      setDeadline: (ms) => { room._deadline = ms === null ? null : Date.now() + ms; },
      deadline: () => room._deadline,
      finish: (r) => room.finishRound(r),
      toast: (pid, kind, text) => room.deps.toast(room.code, pid, kind, text),
      player: (id) => room.players.find((p) => p.id === id),
      teamOf: (id) => room.teams?.find((t) => t.members.includes(id)) ?? null,
    };
  }

  /* ------------------------------- snapshot ------------------------------- */

  publicState(): RoomState {
    const def = this.currentGame ? gameDef(this.currentGame) : null;
    return {
      code: this.code,
      phase: this.phase,
      players: this.players,
      teams: this.teams,
      settings: this.settings,
      roundIndex: this.roundIndex,
      totalRounds: this.schedule.length || this.settings.totalRounds,
      currentGame: this.currentGame,
      currentCategory: def?.category ?? null,
      game: this.game ? this.game.publicState() : null,
      recap: this.recap,
      deadline: this._deadline,
      serverNow: Date.now(),
    };
  }

  privateState(playerId: PlayerId): unknown {
    return this.game ? this.game.privateState(playerId) : null;
  }
}
