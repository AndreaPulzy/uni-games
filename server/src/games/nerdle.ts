import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { scoreWordleLike } from '../../../shared/src/scoring.ts';
import { evaluate, type Mark } from './wordle.ts';
import { EQ_LENGTH, isCorrectEquation, isValidEquationShape, randomEquation } from './equation.ts';

const DURATION_MS = 120_000;
const MAX_ATTEMPTS = 6;

interface Entry {
  guesses: string[];
  marks: Mark[][];
  solved: boolean;
  finishedAt: number | null;
  raw: number;
}

export class NerdleGame extends MiniGame {
  private target = '';
  private startedAt = 0;
  private entries = new Map<PlayerId, Entry>();

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    this.target = randomEquation(this.ctx.rng);
    this.startedAt = Date.now();
    for (const p of this.ctx.players) {
      this.entries.set(p.id, { guesses: [], marks: [], solved: false, finishedAt: null, raw: 0 });
    }
    this.ctx.setDeadline(DURATION_MS);
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (type !== 'guess') return;
    const e = this.entries.get(playerId);
    if (!e || e.finishedAt !== null) return;

    const guess = String((payload as { eq?: string })?.eq ?? '').trim();
    const shapeError = isValidEquationShape(guess);
    if (shapeError) return this.ctx.toast(playerId, 'bad', shapeError);
    if (!isCorrectEquation(guess)) return this.ctx.toast(playerId, 'bad', 'Equazione non corretta');

    e.guesses.push(guess);
    e.marks.push(evaluate(guess, this.target));

    if (guess === this.target) {
      e.solved = true;
      e.finishedAt = Date.now();
      e.raw = scoreWordleLike({
        solved: true,
        attemptsUsed: e.guesses.length,
        maxAttempts: MAX_ATTEMPTS,
        msRemaining: Math.max(0, this.startedAt + DURATION_MS - e.finishedAt),
        msTotal: DURATION_MS,
      });
      this.ctx.toast(playerId, 'good', `Trovata! +${e.raw} punti grezzi`);
    } else if (e.guesses.length >= MAX_ATTEMPTS) {
      e.finishedAt = Date.now();
      this.ctx.toast(playerId, 'bad', 'Tentativi esauriti');
    }

    this.ctx.push();
    if (this.ctx.players.every((p) => this.entries.get(p.id)?.finishedAt !== null)) this.conclude();
  }

  onDeadline(): void { this.conclude(); }

  onDisconnect(playerId: PlayerId): void {
    const e = this.entries.get(playerId);
    if (e && e.finishedAt === null) { e.finishedAt = Date.now(); e.raw = 0; }
    if (this.ctx.players.every((p) => this.entries.get(p.id)?.finishedAt !== null)) this.conclude();
  }

  private conclude(): void {
    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};
    for (const p of this.ctx.players) {
      const e = this.entries.get(p.id);
      if (!e) continue;
      raw[p.id] = e.raw;
      detail[p.id] = e.solved
        ? `Trovata in ${e.guesses.length} tentativ${e.guesses.length === 1 ? 'o' : 'i'} · ${Math.round((e.finishedAt! - this.startedAt) / 1000)}s`
        : e.guesses.length ? `Non trovata (${e.guesses.length} tentativi)` : 'Nessun tentativo';
    }
    const winners = this.ctx.players
      .filter((p) => this.entries.get(p.id)?.solved)
      .sort((a, b) => this.entries.get(a.id)!.finishedAt! - this.entries.get(b.id)!.finishedAt!);

    this.ctx.finish({
      raw,
      detail,
      reveal: [
        `L'equazione era ${this.target}`,
        winners.length ? `Primo a trovarla: ${winners[0].name}` : 'Nessuno ci e arrivato',
      ],
    });
  }

  publicState() {
    return {
      length: EQ_LENGTH,
      maxAttempts: MAX_ATTEMPTS,
      durationMs: DURATION_MS,
      boards: this.ctx.players.map((p) => {
        const e = this.entries.get(p.id);
        return {
          playerId: p.id,
          marks: e?.marks ?? [],
          solved: e?.solved ?? false,
          done: e?.finishedAt != null,
        };
      }),
    };
  }

  privateState(playerId: PlayerId) {
    const e = this.entries.get(playerId);
    if (!e) return null;
    const rank: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };
    const keys: Record<string, Mark> = {};
    e.guesses.forEach((g, gi) => [...g].forEach((c, i) => {
      const m = e.marks[gi][i];
      if (!keys[c] || rank[m] > rank[keys[c]]) keys[c] = m;
    }));
    return {
      guesses: e.guesses,
      marks: e.marks,
      solved: e.solved,
      done: e.finishedAt !== null,
      maxAttempts: MAX_ATTEMPTS,
      length: EQ_LENGTH,
      keyboard: keys,
    };
  }
}
