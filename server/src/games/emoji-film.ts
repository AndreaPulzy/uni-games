import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { EMOJI_PUZZLES, type EmojiPuzzle } from '../data/emoji.ts';
import { shuffle } from '../../../shared/src/rotation.ts';
import { matches, maskTitle } from './fuzzy.ts';

const PUZZLES = 6;
const PUZZLE_MS = 30_000;
const REVEAL_MS = 4_000;
const HINT_AFTER_MS = 12_000;
const MAX_TRIES = 5;

type Phase = 'guess' | 'reveal';

interface Attempt { tries: number; solvedAt: number | null; gain: number }

/** Sei titoli di film o serie TV raccontati con le emoji. Si scrive il titolo
 *  dal telefono: piu' in fretta lo trovi, piu' punti prendi. */
export class EmojiFilmGame extends MiniGame {
  private phase: Phase = 'guess';
  private puzzles: EmojiPuzzle[] = [];
  private idx = 0;
  private startedAt = 0;
  private hint = false;
  private attempts = new Map<PlayerId, Attempt>();
  private raw = new Map<PlayerId, number>();
  private solved = new Map<PlayerId, number>();

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    this.puzzles = shuffle(EMOJI_PUZZLES, this.ctx.rng).slice(0, PUZZLES);
    for (const p of this.ctx.players) {
      this.raw.set(p.id, 0);
      this.solved.set(p.id, 0);
    }
    this.next();
  }

  private get current(): EmojiPuzzle {
    return this.puzzles[this.idx];
  }

  private next(): void {
    this.phase = 'guess';
    this.hint = false;
    this.startedAt = Date.now();
    this.attempts.clear();
    for (const p of this.ctx.players) this.attempts.set(p.id, { tries: 0, solvedAt: null, gain: 0 });
    this.ctx.setDeadline(PUZZLE_MS);
    this.ctx.push();
  }

  /** a meta' tempo compare l'iniziale di ogni parola del titolo */
  tick(): void {
    if (this.phase === 'guess' && !this.hint && Date.now() - this.startedAt >= HINT_AFTER_MS) {
      this.hint = true;
      this.ctx.push();
    }
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (type !== 'guess' || this.phase !== 'guess') return;
    const a = this.attempts.get(playerId);
    if (!a || a.solvedAt !== null || a.tries >= MAX_TRIES) return;
    const text = String((payload as { text?: string })?.text ?? '').trim().slice(0, 60);
    if (!text) return;

    a.tries++;
    const p = this.current;
    if (matches(text, [p.titolo, ...(p.alias ?? [])])) {
      a.solvedAt = Date.now();
      const left = Math.max(0, this.startedAt + PUZZLE_MS - a.solvedAt);
      a.gain = 400 + Math.round((600 * left) / PUZZLE_MS);
      this.raw.set(playerId, (this.raw.get(playerId) ?? 0) + a.gain);
      this.solved.set(playerId, (this.solved.get(playerId) ?? 0) + 1);
      this.ctx.toast(playerId, 'good', `Giusto! +${a.gain}`);
    } else {
      const left = MAX_TRIES - a.tries;
      this.ctx.toast(playerId, 'bad', left > 0 ? `No, riprova (${left} ${left === 1 ? 'tentativo' : 'tentativi'})` : 'Tentativi finiti');
    }

    if (this.everyoneDone()) this.reveal();
    else this.ctx.push();
  }

  private everyoneDone(): boolean {
    return this.ctx.players.every((p) => {
      const a = this.attempts.get(p.id);
      return !a || a.solvedAt !== null || a.tries >= MAX_TRIES;
    });
  }

  private reveal(): void {
    this.phase = 'reveal';
    this.ctx.setDeadline(REVEAL_MS);
    this.ctx.push();
  }

  onDeadline(): void {
    if (this.phase === 'guess') return this.reveal();
    this.idx++;
    if (this.idx >= this.puzzles.length) return this.conclude();
    this.next();
  }

  onDisconnect(): void {
    if (this.phase === 'guess' && this.everyoneDone()) this.reveal();
  }

  private conclude(): void {
    this.ctx.setDeadline(null);
    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};
    for (const p of this.ctx.players) {
      raw[p.id] = this.raw.get(p.id) ?? 0;
      const n = this.solved.get(p.id) ?? 0;
      detail[p.id] = `${n}/${this.puzzles.length} ${n === 1 ? 'titolo indovinato' : 'titoli indovinati'}`;
    }
    const best = [...this.ctx.players].sort((a, b) => (raw[b.id] ?? 0) - (raw[a.id] ?? 0))[0];
    this.ctx.finish({
      raw,
      detail,
      reveal: [
        best && (raw[best.id] ?? 0) > 0 ? `${best.name} ha l'occhio più allenato` : 'Nessun titolo indovinato',
        this.puzzles.map((p) => `${p.emoji} ${p.titolo}`).join(' · '),
      ],
    });
  }

  private solvers() {
    return [...this.attempts]
      .filter(([, a]) => a.solvedAt !== null)
      .sort((x, y) => x[1].solvedAt! - y[1].solvedAt!)
      .map(([playerId, a]) => ({ playerId, points: a.gain }));
  }

  publicState() {
    const p = this.current;
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      index: this.idx,
      total: this.puzzles.length,
      emoji: p?.emoji ?? '',
      tipo: p?.tipo ?? 'Film',
      hint: !reveal && this.hint && p ? maskTitle(p.titolo) : null,
      solvedIds: this.solvers().map((s) => s.playerId),
      titolo: reveal ? p.titolo : null,
      solvers: reveal ? this.solvers() : null,
    };
  }

  privateState(playerId: PlayerId) {
    const p = this.current;
    const a = this.attempts.get(playerId);
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      index: this.idx,
      total: this.puzzles.length,
      emoji: p?.emoji ?? '',
      tipo: p?.tipo ?? 'Film',
      hint: !reveal && this.hint && p ? maskTitle(p.titolo) : null,
      solved: a?.solvedAt != null,
      tries: a?.tries ?? 0,
      maxTries: MAX_TRIES,
      titolo: reveal ? p.titolo : null,
      gain: reveal ? a?.gain ?? 0 : null,
    };
  }
}
