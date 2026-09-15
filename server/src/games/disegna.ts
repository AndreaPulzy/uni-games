import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { PAROLE_DISEGNO, type DrawWord } from '../data/disegni.ts';
import { shuffle } from '../../../shared/src/rotation.ts';
import { levenshtein, matches, simplify } from './fuzzy.ts';

const CHOOSE_MS = 15_000;
const DRAW_MS = 60_000;
const REVEAL_MS = 5_000;
const OPTIONS = 3;
const GUESS_BASE = 300;
const GUESS_SPEED = 700;
const DRAWER_PER_GUESS = 200;
/** limiti di sicurezza: un disegno enorme non deve rallentare tutti */
const MAX_STROKES = 600;
const MAX_POINTS = 40_000;
const MAX_CHUNK = 1_000;
const COLOR = /^#[0-9a-f]{6}$/i;

type Phase = 'choose' | 'draw' | 'reveal';

/** coordinate su una lavagna 1000x1000, appiattite: [x0, y0, x1, y1, ...] */
export interface Stroke { id: number; color: string; size: number; points: number[] }

/**
 * A turno ognuno disegna col dito una parola; il disegno arriva in diretta alla
 * TV e gli altri scrivono dal telefono cosa pensano che sia. Chi indovina prima
 * prende piu' punti, chi disegna ne guadagna per ogni persona che ci arriva.
 *
 * I tratti viaggiano come eventi rapidi (ctx.event) invece che dentro lo stato:
 * lo stato completo, con tutti i tratti, arriva comunque ogni secondo e serve a
 * riallineare chi avesse perso qualche evento.
 */
export class DisegnaGame extends MiniGame {
  private phase: Phase = 'choose';
  private order: PlayerId[] = [];
  private turnIdx = -1;
  private options: DrawWord[] = [];
  private word: DrawWord | null = null;
  private used = new Set<string>();
  private strokes = new Map<number, Stroke>();
  private totalPoints = 0;
  private guessed = new Map<PlayerId, number>();
  private feed: { playerId: PlayerId; text: string }[] = [];
  private startedAt = 0;
  private drawerGain = 0;
  private raw = new Map<PlayerId, number>();
  private hits = new Map<PlayerId, number>();
  private fans = new Map<PlayerId, number>();

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    this.order = shuffle(this.ctx.players.map((p) => p.id), this.ctx.rng);
    for (const id of this.order) {
      this.raw.set(id, 0);
      this.hits.set(id, 0);
      this.fans.set(id, 0);
    }
    this.nextTurn();
  }

  private get drawerId(): PlayerId | null {
    return this.order[this.turnIdx] ?? null;
  }

  private isActive(id: PlayerId): boolean {
    return this.ctx.players.some((p) => p.id === id);
  }

  private get guessers(): PlayerId[] {
    return this.ctx.players.map((p) => p.id).filter((id) => id !== this.drawerId);
  }

  private nextTurn(): void {
    do { this.turnIdx++; } while (this.turnIdx < this.order.length && !this.isActive(this.order[this.turnIdx]));
    if (this.turnIdx >= this.order.length) return this.conclude();

    this.phase = 'choose';
    this.word = null;
    this.strokes.clear();
    this.totalPoints = 0;
    this.guessed.clear();
    this.feed = [];
    this.drawerGain = 0;
    const fresh = PAROLE_DISEGNO.filter((w) => !this.used.has(w.parola));
    this.options = shuffle(fresh.length >= OPTIONS ? fresh : PAROLE_DISEGNO, this.ctx.rng).slice(0, OPTIONS);
    this.ctx.event('clear', { turn: this.turnIdx });
    this.ctx.setDeadline(CHOOSE_MS);
    this.ctx.push();
  }

  private startDrawing(w: DrawWord): void {
    this.word = w;
    this.used.add(w.parola);
    this.phase = 'draw';
    this.startedAt = Date.now();
    this.ctx.setDeadline(DRAW_MS);
    this.ctx.push();
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    const p = (payload ?? {}) as Record<string, unknown>;

    if (playerId === this.drawerId) {
      if (this.phase === 'choose' && type === 'choose') {
        const i = Number(p.index);
        if (Number.isInteger(i) && this.options[i]) this.startDrawing(this.options[i]);
        return;
      }
      if (this.phase !== 'draw') return;
      if (type === 'stroke') return this.onStroke(p);
      if (type === 'undo') {
        const id = Number(p.id);
        const s = this.strokes.get(id);
        if (s) {
          this.totalPoints -= s.points.length;
          this.strokes.delete(id);
          this.ctx.event('undo', { turn: this.turnIdx, id });
        }
        return;
      }
      if (type === 'clear') {
        this.strokes.clear();
        this.totalPoints = 0;
        this.ctx.event('clear', { turn: this.turnIdx });
      }
      return;
    }

    if (this.phase === 'draw' && type === 'guess') this.onGuess(playerId, String(p.text ?? ''));
  }

  private onStroke(p: Record<string, unknown>): void {
    const id = Number(p.id);
    const offset = Number(p.offset ?? 0);
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(offset) || offset < 0) return;

    const chunk = Array.isArray(p.points) ? (p.points as unknown[]).slice(0, MAX_CHUNK) : [];
    if (chunk.length % 2 !== 0) chunk.pop();
    const nums = chunk.map((v) => Math.max(0, Math.min(1000, Math.round(Number(v) || 0))));

    let s = this.strokes.get(id);
    if (!s) {
      if (this.strokes.size >= MAX_STROKES) return;
      const color = typeof p.color === 'string' && COLOR.test(p.color) ? p.color : '#111111';
      const size = Math.max(2, Math.min(60, Math.round(Number(p.size) || 8)));
      s = { id, color, size, points: [] };
      this.strokes.set(id, s);
    }

    // l'offset rende idempotente un pezzo arrivato due volte
    const keep = Math.min(s.points.length, offset);
    this.totalPoints -= s.points.length - keep;
    s.points.length = keep;
    if (this.totalPoints + nums.length > MAX_POINTS) return;
    s.points.push(...nums);
    this.totalPoints += nums.length;

    this.ctx.event('stroke', { turn: this.turnIdx, id, color: s.color, size: s.size, offset: keep, points: nums });
  }

  private onGuess(playerId: PlayerId, rawText: string): void {
    if (!this.word || this.guessed.has(playerId)) return;
    const text = rawText.trim().slice(0, 40);
    if (!text) return;

    if (matches(text, [this.word.parola, ...(this.word.alias ?? [])])) {
      const left = Math.max(0, this.startedAt + DRAW_MS - Date.now());
      const gain = GUESS_BASE + Math.round((GUESS_SPEED * left) / DRAW_MS);
      const drawer = this.drawerId!;
      this.guessed.set(playerId, gain);
      this.add(playerId, gain);
      this.hits.set(playerId, (this.hits.get(playerId) ?? 0) + 1);
      this.add(drawer, DRAWER_PER_GUESS);
      this.drawerGain += DRAWER_PER_GUESS;
      this.fans.set(drawer, (this.fans.get(drawer) ?? 0) + 1);
      this.ctx.toast(playerId, 'good', `Indovinato! +${gain}`);
      this.ctx.toast(null, 'info', `${this.ctx.player(playerId)?.name} ha indovinato!`);
      if (this.guessers.every((id) => this.guessed.has(id))) return this.reveal();
      return this.ctx.push();
    }

    // quasi giusto: lo si dice solo a chi l'ha scritto, in chat darebbe la risposta agli altri
    const g = simplify(text);
    const a = simplify(this.word.parola);
    if (a.length >= 5 && levenshtein(g, a, 3) <= 3) {
      this.ctx.toast(playerId, 'info', 'Ci sei quasi!');
      return;
    }

    this.feed.push({ playerId, text });
    if (this.feed.length > 10) this.feed.shift();
    this.ctx.push();
  }

  private add(id: PlayerId, n: number): void {
    this.raw.set(id, (this.raw.get(id) ?? 0) + n);
  }

  private reveal(): void {
    this.phase = 'reveal';
    this.ctx.setDeadline(REVEAL_MS);
    this.ctx.push();
  }

  onDeadline(): void {
    if (this.phase === 'choose') return this.startDrawing(this.options[0]);
    if (this.phase === 'draw') return this.reveal();
    this.nextTurn();
  }

  directorPrompt(): string | null {
    return this.phase === 'draw' ? 'Termina il turno' : this.phase === 'reveal' ? 'Prossimo disegno' : null;
  }

  hostAdvance(): void {
    if (this.phase === 'draw') this.reveal();
    else if (this.phase === 'reveal') this.nextTurn();
  }

  onDisconnect(playerId: PlayerId): void {
    if (playerId === this.drawerId && this.phase !== 'reveal') {
      return this.phase === 'choose' ? this.nextTurn() : this.reveal();
    }
    const everyone = this.guessers.length > 0 && this.guessers.every((id) => this.guessed.has(id));
    if (this.phase === 'draw' && everyone) this.reveal();
    else this.ctx.push();
  }

  private conclude(): void {
    this.ctx.setDeadline(null);
    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};
    for (const p of this.ctx.players) {
      if (!this.raw.has(p.id)) continue;
      raw[p.id] = this.raw.get(p.id) ?? 0;
      const h = this.hits.get(p.id) ?? 0;
      const f = this.fans.get(p.id) ?? 0;
      detail[p.id] = `${h} ${h === 1 ? 'disegno indovinato' : 'disegni indovinati'} · `
        + `${f} ${f === 1 ? 'persona ha' : 'persone hanno'} capito il tuo`;
    }
    const best = [...this.ctx.players].sort((a, b) => (this.fans.get(b.id) ?? 0) - (this.fans.get(a.id) ?? 0))[0];
    this.ctx.finish({
      raw,
      detail,
      reveal: [
        best && (this.fans.get(best.id) ?? 0) > 0 ? `Il disegno più chiaro è di ${best.name}` : 'Nessun disegno indovinato',
        [...this.used].join(' · '),
      ],
    });
  }

  private mask(): string | null {
    return this.phase === 'draw' && this.word ? this.word.parola.replace(/\p{L}/gu, '_') : null;
  }

  publicState() {
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      turn: this.turnIdx,
      turns: this.order.length,
      drawerId: this.drawerId,
      strokes: [...this.strokes.values()],
      guessedIds: [...this.guessed.keys()],
      feed: this.feed,
      mask: this.mask(),
      letters: this.phase === 'draw' && this.word ? this.word.parola.replace(/[^\p{L}]/gu, '').length : null,
      word: reveal && this.word ? this.word.parola : null,
      gains: reveal
        ? [...this.guessed].map(([playerId, points]) => ({ playerId, points })).sort((a, b) => b.points - a.points)
        : null,
      drawerGain: reveal ? this.drawerGain : null,
    };
  }

  privateState(playerId: PlayerId) {
    const isDrawer = playerId === this.drawerId;
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      turn: this.turnIdx,
      turns: this.order.length,
      isDrawer,
      drawerName: this.drawerId ? this.ctx.player(this.drawerId)?.name ?? '' : '',
      options: isDrawer && this.phase === 'choose' ? this.options.map((w) => w.parola) : null,
      word: (isDrawer && this.phase === 'draw') || reveal ? this.word?.parola ?? null : null,
      guessed: this.guessed.has(playerId),
      gain: this.guessed.get(playerId) ?? null,
      mask: this.mask(),
    };
  }
}
