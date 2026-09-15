import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { QUIZ, type QuizQuestion } from '../data/quiz.ts';
import { shuffle } from '../../../shared/src/rotation.ts';

const QUESTIONS = 8;
const QUESTION_MS = 15_000;
const REVEAL_MS = 4_500;

type Phase = 'question' | 'reveal';

interface Round {
  q: QuizQuestion;
  options: string[];
  correct: number;
  startedAt: number;
}

/** Otto domande a risposta multipla: chi risponde giusto prende 500 punti,
 *  piu' fino ad altri 500 in base a quanto e' stato veloce. */
export class QuizLampoGame extends MiniGame {
  private phase: Phase = 'question';
  private rounds: Round[] = [];
  private idx = 0;
  private answers = new Map<PlayerId, { choice: number; at: number }>();
  private raw = new Map<PlayerId, number>();
  private right = new Map<PlayerId, number>();
  private lastGain = new Map<PlayerId, number>();

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    // le quattro opzioni vengono rimescolate: la giusta non e' mai sempre nello stesso posto
    this.rounds = shuffle(QUIZ, this.ctx.rng).slice(0, QUESTIONS).map((q) => {
      const options = shuffle([q.giusta, ...q.sbagliate], this.ctx.rng);
      return { q, options, correct: options.indexOf(q.giusta), startedAt: 0 };
    });
    for (const p of this.ctx.players) {
      this.raw.set(p.id, 0);
      this.right.set(p.id, 0);
    }
    this.ask();
  }

  private get current(): Round {
    return this.rounds[this.idx];
  }

  private ask(): void {
    this.phase = 'question';
    this.answers.clear();
    this.lastGain.clear();
    this.current.startedAt = Date.now();
    this.ctx.setDeadline(QUESTION_MS);
    this.ctx.push();
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (type !== 'answer' || this.phase !== 'question') return;
    if (!this.raw.has(playerId) || this.answers.has(playerId)) return;
    const choice = Number((payload as { choice?: number })?.choice);
    if (!Number.isInteger(choice) || choice < 0 || choice >= this.current.options.length) return;

    this.answers.set(playerId, { choice, at: Date.now() });
    if (this.everyoneAnswered()) this.reveal();
    else this.ctx.push();
  }

  private everyoneAnswered(): boolean {
    return this.ctx.players.every((p) => this.answers.has(p.id));
  }

  private reveal(): void {
    this.phase = 'reveal';
    const r = this.current;
    for (const [pid, a] of this.answers) {
      if (a.choice !== r.correct) { this.lastGain.set(pid, 0); continue; }
      const left = Math.max(0, r.startedAt + QUESTION_MS - a.at);
      const gain = 500 + Math.round((500 * left) / QUESTION_MS);
      this.lastGain.set(pid, gain);
      this.raw.set(pid, (this.raw.get(pid) ?? 0) + gain);
      this.right.set(pid, (this.right.get(pid) ?? 0) + 1);
    }
    this.ctx.setDeadline(REVEAL_MS);
    this.ctx.push();
  }

  onDeadline(): void {
    if (this.phase === 'question') return this.reveal();
    this.idx++;
    if (this.idx >= this.rounds.length) return this.conclude();
    this.ask();
  }

  onDisconnect(): void {
    if (this.phase === 'question' && this.everyoneAnswered()) this.reveal();
  }

  private conclude(): void {
    this.ctx.setDeadline(null);
    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};
    for (const p of this.ctx.players) {
      raw[p.id] = this.raw.get(p.id) ?? 0;
      detail[p.id] = `${this.right.get(p.id) ?? 0}/${this.rounds.length} risposte giuste`;
    }
    const best = [...this.ctx.players].sort((a, b) => (raw[b.id] ?? 0) - (raw[a.id] ?? 0))[0];
    const perfect = this.ctx.players
      .filter((p) => (this.right.get(p.id) ?? 0) === this.rounds.length)
      .map((p) => p.name);

    this.ctx.finish({
      raw,
      detail,
      reveal: [
        best && (raw[best.id] ?? 0) > 0 ? `${best.name} vince il quiz` : 'Nessuna risposta giusta',
        perfect.length ? `Tutte giuste: ${perfect.join(', ')}` : 'Nessuno le ha azzeccate tutte',
      ],
    });
  }

  publicState() {
    const r = this.current;
    const reveal = this.phase === 'reveal';
    const counts = [0, 0, 0, 0];
    for (const a of this.answers.values()) counts[a.choice]++;
    return {
      phase: this.phase,
      index: this.idx,
      total: this.rounds.length,
      categoria: r?.q.categoria ?? '',
      domanda: r?.q.domanda ?? '',
      options: r?.options ?? [],
      answeredIds: [...this.answers.keys()],
      correct: reveal ? r.correct : null,
      counts: reveal ? counts : null,
      gains: reveal
        ? [...this.lastGain].filter(([, g]) => g > 0).sort((a, b) => b[1] - a[1])
            .map(([playerId, points]) => ({ playerId, points }))
        : null,
    };
  }

  privateState(playerId: PlayerId) {
    const r = this.current;
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      index: this.idx,
      total: this.rounds.length,
      domanda: r?.q.domanda ?? '',
      options: r?.options ?? [],
      myChoice: this.answers.get(playerId)?.choice ?? null,
      correct: reveal ? r.correct : null,
      gain: reveal ? this.lastGain.get(playerId) ?? 0 : null,
      score: this.raw.get(playerId) ?? 0,
    };
  }
}
