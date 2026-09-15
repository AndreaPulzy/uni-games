import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { scoreNomiCoseCitta, NCC_UNIQUE, NCC_DUPLICATE } from '../../../shared/src/scoring.ts';
import { isWord } from '../data/dictionary.ts';

export const CATEGORIE = ['Nome', 'Cosa', 'Città', 'Animale', 'Mestiere', 'Cibo'] as const;
/** Niente lettere impraticabili in italiano. */
const LETTERE = 'ABCDEFGILMNOPRSTV';
const FILL_MS = 180_000;
const REVIEW_MS = 90_000;

type Phase = 'fill' | 'review' | 'result';

interface Entry {
  cells: string[];
  complete: boolean;
  frozen: boolean;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z]/g, '');
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
/** Categorie di nomi comuni, dove il dizionario puo' dare un indizio.
 *  Nome e Citta sono nomi propri: li' decide solo il voto del gruppo. */
const HINTED = new Set([1, 3, 4, 5]);

export type CellStatus = 'ok' | 'empty' | 'wrongLetter' | 'voided';

export class NomiCoseCittaGame extends MiniGame {
  private phase: Phase = 'fill';
  private letter = 'A';
  private entries = new Map<PlayerId, Entry>();
  private stopperId: PlayerId | null = null;
  /** chi ha segnalato quale casella come non valida: "playerId:index" -> votanti */
  private flags = new Map<string, Set<PlayerId>>();
  private voided = new Set<string>();

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    this.letter = LETTERE[Math.floor(this.ctx.rng() * LETTERE.length)];
    for (const p of this.ctx.players) {
      this.entries.set(p.id, { cells: Array(CATEGORIE.length).fill(''), complete: false, frozen: false });
    }
    this.ctx.setDeadline(FILL_MS);
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (this.phase === 'fill') {
      if (type === 'fill') return this.onFill(playerId, payload);
      if (type === 'stop') return this.onStop(playerId);
      return;
    }
    if (this.phase === 'review' && type === 'flag') return this.onFlag(playerId, payload);
  }

  private onFill(playerId: PlayerId, payload: unknown): void {
    const e = this.entries.get(playerId);
    if (!e || e.frozen) return;

    const { index, value } = (payload ?? {}) as { index?: number; value?: string };
    if (typeof index !== 'number' || index < 0 || index >= CATEGORIE.length) return;

    e.cells[index] = String(value ?? '').slice(0, 28);
    e.complete = e.cells.every((c) => this.startsRight(c));
    this.ctx.push();
  }

  private startsRight(cell: string): boolean {
    const n = norm(cell);
    return n.length >= 2 && n[0] === this.letter.toLowerCase();
  }

  private onStop(playerId: PlayerId): void {
    const e = this.entries.get(playerId);
    if (!e || !e.complete || this.stopperId) return;

    this.stopperId = playerId;
    for (const entry of this.entries.values()) entry.frozen = true;
    this.ctx.toast(null, 'info', `${this.ctx.player(playerId)?.name} ha bloccato tutti!`);
    this.toReview();
  }

  private toReview(): void {
    this.phase = 'review';
    this.ctx.setDeadline(REVIEW_MS);
    this.ctx.push();
  }

  /** Segnalazione di una risposta ritenuta inventata: decide la maggioranza. */
  private onFlag(playerId: PlayerId, payload: unknown): void {
    const { target, index } = (payload ?? {}) as { target?: string; index?: number };
    if (!target || typeof index !== 'number' || target === playerId) return;
    if (!this.entries.has(target)) return;
    // una casella vuota o con la lettera sbagliata vale gia' zero: niente da votare
    if (!this.startsRight(this.entries.get(target)!.cells[index] ?? '')) return;

    const key = `${target}:${index}`;
    const set = this.flags.get(key) ?? new Set<PlayerId>();
    if (set.has(playerId)) set.delete(playerId);
    else set.add(playerId);
    this.flags.set(key, set);

    // serve la meta' degli altri giocatori per annullare una casella
    this.recomputeVoided();

    this.ctx.push();
  }

  /** etichetta dell'avanti mostrata a TV e regista */
  directorPrompt(): string | null {
    return this.phase === 'review' ? 'Assegna i punti' : null;
  }

  hostAdvance(): void {
    if (this.phase === 'fill') { for (const e of this.entries.values()) e.frozen = true; this.toReview(); }
    else if (this.phase === 'review') this.conclude();
  }

  onDeadline(): void {
    if (this.phase === 'fill') { for (const e of this.entries.values()) e.frozen = true; this.toReview(); }
    else if (this.phase === 'review') this.conclude();
  }

  private conclude(): void {
    this.recomputeVoided();
    this.phase = 'result';
    this.ctx.setDeadline(null);

    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};

    // conteggio occorrenze per capire cosa e' unico e cosa e' stato copiato
    const counts: Record<number, Map<string, number>> = {};
    for (let i = 0; i < CATEGORIE.length; i++) {
      const m = new Map<string, number>();
      for (const p of this.ctx.players) {
        const cell = this.entries.get(p.id)?.cells[i] ?? '';
        if (!this.isCellValid(p.id, i, cell)) continue;
        const n = norm(cell);
        m.set(n, (m.get(n) ?? 0) + 1);
      }
      counts[i] = m;
    }

    for (const p of this.ctx.players) {
      const e = this.entries.get(p.id);
      if (!e) continue;
      let unique = 0, dup = 0, zero = 0;
      const cellScores = e.cells.map((cell, i) => {
        if (!this.isCellValid(p.id, i, cell)) { zero++; return 0; }
        const n = counts[i].get(norm(cell)) ?? 0;
        if (n <= 1) { unique++; return NCC_UNIQUE; }
        dup++; return NCC_DUPLICATE;
      });

      raw[p.id] = scoreNomiCoseCitta({ cells: cellScores, pressedStop: this.stopperId === p.id });
      const conta = (n: number, sing: string, plur: string) => `${n} ${n === 1 ? sing : plur}`;
      detail[p.id] = [
        conta(unique, 'unica', 'uniche'),
        conta(dup, 'duplicata', 'duplicate'),
        conta(zero, 'nulla', 'nulle'),
      ].join(' · ') + (this.stopperId === p.id ? ' · STOP' : '');
    }

    const stopper = this.stopperId ? this.ctx.player(this.stopperId)?.name : null;
    this.ctx.finish({
      raw,
      detail,
      reveal: [
        `Lettera ${this.letter}`,
        stopper ? `${stopper} ha chiuso il gioco` : 'Tempo scaduto senza STOP',
      ],
    });
  }

  private isCellValid(playerId: PlayerId, index: number, cell: string): boolean {
    if (!this.startsRight(cell)) return false;
    return !this.voided.has(`${playerId}:${index}`);
  }

  onDisconnect(): void { this.ctx.push(); }

  /* ------------------------------- revisione ------------------------------- */

  /** Voti "non vale" necessari per annullare una casella: piu' della meta' degli altri. */
  private threshold(): number {
    const others = Math.max(1, this.ctx.players.length - 1);
    return Math.floor(others / 2) + 1;
  }

  /** Contano solo i voti di chi e' ancora collegato. */
  private flagCount(playerId: PlayerId, index: number): number {
    const set = this.flags.get(`${playerId}:${index}`);
    if (!set) return 0;
    const active = new Set(this.ctx.players.map((p) => p.id));
    return [...set].filter((id) => active.has(id)).length;
  }

  private recomputeVoided(): void {
    const need = this.threshold();
    this.voided.clear();
    for (const p of this.ctx.players) {
      for (let i = 0; i < CATEGORIE.length; i++) {
        if (this.flagCount(p.id, i) >= need) this.voided.add(`${p.id}:${i}`);
      }
    }
  }

  /** Indizio per chi vota: una parola della risposta non esiste nel dizionario. */
  private suspicious(cell: string, index: number): boolean {
    if (!HINTED.has(index) || !this.startsRight(cell)) return false;
    const tokens = plain(cell).split(/[^a-z]+/).filter((t) => t.length >= 2);
    return tokens.length > 0 && tokens.some((t) => !isWord(t));
  }

  private cellView(playerId: PlayerId, index: number) {
    const cell = this.entries.get(playerId)?.cells[index] ?? '';
    const status: CellStatus = !cell.trim()
      ? 'empty'
      : !this.startsRight(cell)
        ? 'wrongLetter'
        : this.voided.has(`${playerId}:${index}`) ? 'voided' : 'ok';
    const duplicate = status === 'ok' && this.ctx.players.some((p) => {
      if (p.id === playerId) return false;
      const other = this.entries.get(p.id)?.cells[index] ?? '';
      return this.isCellValid(p.id, index, other) && norm(other) === norm(cell);
    });
    return {
      text: cell,
      status,
      flags: this.flagCount(playerId, index),
      suspicious: this.suspicious(cell, index),
      duplicate,
    };
  }

  publicState() {
    const showAnswers = this.phase !== 'fill';
    return {
      phase: this.phase,
      letter: this.letter,
      categorie: CATEGORIE,
      stopperId: this.stopperId,
      threshold: this.threshold(),
      progress: this.ctx.players.map((p) => {
        const e = this.entries.get(p.id);
        return {
          playerId: p.id,
          filled: e?.cells.filter((c) => this.startsRight(c)).length ?? 0,
          complete: e?.complete ?? false,
          cells: showAnswers ? e?.cells ?? [] : null,
          voided: showAnswers ? CATEGORIE.map((_, i) => this.voided.has(`${p.id}:${i}`)) : null,
          review: showAnswers ? CATEGORIE.map((_, i) => this.cellView(p.id, i)) : null,
        };
      }),
    };
  }

  privateState(playerId: PlayerId) {
    const e = this.entries.get(playerId);
    if (!e) return null;
    const review = this.phase === 'review';
    return {
      phase: this.phase,
      letter: this.letter,
      categorie: CATEGORIE,
      cells: e.cells,
      complete: e.complete,
      frozen: e.frozen,
      canStop: this.phase === 'fill' && e.complete && !this.stopperId,
      threshold: this.threshold(),
      mine: review ? CATEGORIE.map((_, i) => this.cellView(playerId, i)) : null,
      others: review
        ? this.ctx.players
            .filter((p) => p.id !== playerId)
            .map((p) => ({
              playerId: p.id,
              name: p.name,
              avatar: p.avatar,
              cells: this.entries.get(p.id)?.cells ?? [],
              flagged: CATEGORIE.map((_, i) => this.flags.get(`${p.id}:${i}`)?.has(playerId) ?? false),
              voided: CATEGORIE.map((_, i) => this.voided.has(`${p.id}:${i}`)),
              review: CATEGORIE.map((_, i) => this.cellView(p.id, i)),
            }))
        : null,
    };
  }
}
