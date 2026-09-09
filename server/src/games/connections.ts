import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { scoreConnections } from '../../../shared/src/scoring.ts';
import { randomPuzzle, type ConnPuzzle, type ConnGroup } from '../data/connections.ts';
import { shuffle } from '../../../shared/src/rotation.ts';

const DURATION_MS = 120_000;
const MAX_MISTAKES = 4;

interface Entry {
  found: ConnGroup[];
  mistakes: number;
  finishedAt: number | null;
  raw: number;
}

export class ConnectionsGame extends MiniGame {
  private puzzle!: ConnPuzzle;
  private board: string[] = [];
  private startedAt = 0;
  private entries = new Map<PlayerId, Entry>();

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    this.puzzle = randomPuzzle(this.ctx.rng);
    // stessa griglia, stesso ordine per tutti: nessuno e avvantaggiato
    this.board = shuffle(this.puzzle.groups.flatMap((g) => g.words), this.ctx.rng);
    this.startedAt = Date.now();
    for (const p of this.ctx.players) {
      this.entries.set(p.id, { found: [], mistakes: 0, finishedAt: null, raw: 0 });
    }
    this.ctx.setDeadline(DURATION_MS);
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (type !== 'submit') return;
    const e = this.entries.get(playerId);
    if (!e || e.finishedAt !== null) return;

    const picked = (payload as { words?: string[] })?.words ?? [];
    if (!Array.isArray(picked) || picked.length !== 4) return;

    const set = new Set(picked);
    if (set.size !== 4) return;

    // la selezione deve pescare solo fra le parole ancora sul tavolo
    const remaining = new Set(this.remainingFor(e));
    if (![...set].every((w) => remaining.has(w))) return;

    const hit = this.puzzle.groups.find((g) => g.words.every((w) => set.has(w)));
    if (hit) {
      e.found.push(hit);
      this.ctx.toast(playerId, 'good', `${hit.name} ✓`);
      if (e.found.length === 4) this.finishPlayer(e, playerId);
    } else {
      e.mistakes++;
      const best = Math.max(...this.puzzle.groups.map((g) => g.words.filter((w) => set.has(w)).length));
      this.ctx.toast(playerId, 'bad',
        best === 3 ? 'Manca una parola!' : `Errore ${e.mistakes}/${MAX_MISTAKES}`);
      if (e.mistakes >= MAX_MISTAKES) this.finishPlayer(e, playerId);
    }

    this.ctx.push();
    this.checkAllDone();
  }

  private finishPlayer(e: Entry, _playerId: PlayerId): void {
    e.finishedAt = Date.now();
    e.raw = scoreConnections({
      groupsFound: e.found.length,
      msRemaining: Math.max(0, this.startedAt + DURATION_MS - e.finishedAt),
      msTotal: DURATION_MS,
    });
  }

  private remainingFor(e: Entry): string[] {
    const taken = new Set(e.found.flatMap((g) => g.words));
    return this.board.filter((w) => !taken.has(w));
  }

  private checkAllDone(): void {
    if (this.ctx.players.every((p) => this.entries.get(p.id)?.finishedAt !== null)) this.conclude();
  }

  onDeadline(): void { this.conclude(); }

  onDisconnect(playerId: PlayerId): void {
    const e = this.entries.get(playerId);
    if (e && e.finishedAt === null) this.finishPlayer(e, playerId);
    this.checkAllDone();
  }

  private conclude(): void {
    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};

    for (const p of this.ctx.players) {
      const e = this.entries.get(p.id);
      if (!e) continue;
      // chi e' rimasto senza tempo non ha ancora un punteggio calcolato
      if (e.finishedAt === null) this.finishPlayer(e, p.id);
      raw[p.id] = e.raw;
      const complete = e.found.length === 4;
      detail[p.id] = complete
        ? `Griglia completata con ${e.mistakes} error${e.mistakes === 1 ? 'e' : 'i'}`
        : `${e.found.length}/4 gruppi · ${e.mistakes} error${e.mistakes === 1 ? 'e' : 'i'}`;
    }

    const winners = this.ctx.players
      .filter((p) => this.entries.get(p.id)!.found.length === 4)
      .sort((a, b) => this.entries.get(a.id)!.finishedAt! - this.entries.get(b.id)!.finishedAt!);

    this.ctx.finish({
      raw,
      detail,
      reveal: [
        winners.length ? `${winners[0].name} ha completato per primo` : 'Nessuno ha completato la griglia',
        this.puzzle.groups.map((g) => g.name).join(' · '),
      ],
    });
  }

  publicState() {
    return {
      durationMs: DURATION_MS,
      maxMistakes: MAX_MISTAKES,
      groupNames: this.puzzle.groups.map((g) => ({ name: g.name, level: g.level })),
      progress: this.ctx.players.map((p) => {
        const e = this.entries.get(p.id);
        return {
          playerId: p.id,
          found: e?.found.map((g) => ({ name: g.name, level: g.level })) ?? [],
          mistakes: e?.mistakes ?? 0,
          done: e?.finishedAt != null,
        };
      }),
    };
  }

  privateState(playerId: PlayerId) {
    const e = this.entries.get(playerId);
    if (!e) return null;
    return {
      words: this.remainingFor(e),
      found: e.found,
      mistakes: e.mistakes,
      maxMistakes: MAX_MISTAKES,
      done: e.finishedAt !== null,
      complete: e.found.length === 4,
    };
  }
}
