import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { scoreWordleLike } from '../../../shared/src/scoring.ts';
import { randomSolution } from '../data/words-it.ts';
import { isWord5 } from '../data/dictionary.ts';

const DURATION_MS = 90_000;
const MAX_ATTEMPTS = 6;

export type Mark = 'correct' | 'present' | 'absent';

interface Entry {
  guesses: string[];
  marks: Mark[][];
  solved: boolean;
  finishedAt: number | null;   // ms epoch
  raw: number;
}

/** Feedback stile Wordle, con gestione corretta delle lettere ripetute. */
export function evaluate(guess: string, target: string): Mark[] {
  const marks: Mark[] = Array(guess.length).fill('absent');
  const pool: Record<string, number> = {};

  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) marks[i] = 'correct';
    else pool[target[i]] = (pool[target[i]] ?? 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (marks[i] === 'correct') continue;
    const c = guess[i];
    if ((pool[c] ?? 0) > 0) { marks[i] = 'present'; pool[c]--; }
  }
  return marks;
}

export class WordleGame extends MiniGame {
  private target = '';
  private startedAt = 0;
  private entries = new Map<PlayerId, Entry>();

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    this.target = randomSolution(this.ctx.rng);
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

    const guess = String((payload as { word?: string })?.word ?? '').trim().toUpperCase();
    if (guess.length !== 5) {
      return this.ctx.toast(playerId, 'bad', 'Servono 5 lettere');
    }
    if (!/^[A-Z]{5}$/.test(guess)) {
      return this.ctx.toast(playerId, 'bad', 'Solo lettere, niente accenti');
    }
    if (!isWord5(guess)) {
      return this.ctx.toast(playerId, 'bad', `"${guess}" non e una parola italiana`);
    }

    const marks = evaluate(guess, this.target);
    e.guesses.push(guess);
    e.marks.push(marks);

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
      e.raw = 0;
      this.ctx.toast(playerId, 'bad', 'Tentativi esauriti');
    }

    this.ctx.push();
    this.checkAllDone();
  }

  private checkAllDone(): void {
    const done = this.ctx.players.every((p) => this.entries.get(p.id)?.finishedAt !== null);
    if (done) this.conclude();
  }

  onDeadline(): void { this.conclude(); }

  onDisconnect(playerId: PlayerId): void {
    const e = this.entries.get(playerId);
    if (e && e.finishedAt === null) { e.finishedAt = Date.now(); e.raw = 0; }
    this.checkAllDone();
  }

  private conclude(): void {
    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};

    for (const p of this.ctx.players) {
      const e = this.entries.get(p.id);
      if (!e) continue;
      raw[p.id] = e.raw;
      if (e.solved) {
        const secs = Math.round((e.finishedAt! - this.startedAt) / 1000);
        detail[p.id] = `Risolta in ${e.guesses.length} tentativ${e.guesses.length === 1 ? 'o' : 'i'} - ${secs}s`;
      } else {
        detail[p.id] = e.guesses.length ? `Non trovata (${e.guesses.length} tentativi)` : 'Nessun tentativo';
      }
    }

    const winners = this.ctx.players
      .filter((p) => this.entries.get(p.id)?.solved)
      .sort((a, b) => this.entries.get(a.id)!.finishedAt! - this.entries.get(b.id)!.finishedAt!);

    this.ctx.finish({
      raw,
      detail,
      reveal: [
        `La parola era ${this.target}`,
        winners.length
          ? `Primo a trovarla: ${winners[0].name}`
          : 'Nessuno ha indovinato',
      ],
    });
  }

  /** In TV mostriamo solo i pattern colorati, mai le lettere altrui. */
  publicState() {
    return {
      maxAttempts: MAX_ATTEMPTS,
      durationMs: DURATION_MS,
      boards: this.ctx.players.map((p) => {
        const e = this.entries.get(p.id);
        return {
          playerId: p.id,
          marks: e?.marks ?? [],
          solved: e?.solved ?? false,
          done: e?.finishedAt !== null && e?.finishedAt !== undefined,
          attempts: e?.guesses.length ?? 0,
        };
      }),
    };
  }

  privateState(playerId: PlayerId) {
    const e = this.entries.get(playerId);
    if (!e) return null;
    return {
      guesses: e.guesses,
      marks: e.marks,
      solved: e.solved,
      done: e.finishedAt !== null,
      maxAttempts: MAX_ATTEMPTS,
      /** tastiera: stato migliore raggiunto per ogni lettera */
      keyboard: this.keyboardState(e),
    };
  }

  private keyboardState(e: Entry): Record<string, Mark> {
    const rank: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };
    const kb: Record<string, Mark> = {};
    e.guesses.forEach((g, gi) => {
      [...g].forEach((c, i) => {
        const m = e.marks[gi][i];
        if (!kb[c] || rank[m] > rank[kb[c]]) kb[c] = m;
      });
    });
    return kb;
  }
}
