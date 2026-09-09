import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { scoreNomiCoseCitta, NCC_UNIQUE, NCC_DUPLICATE } from '../../../shared/src/scoring.ts';

export const CATEGORIE = ['Nome', 'Cosa', 'Citta', 'Animale', 'Mestiere', 'Cibo'] as const;
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

    const key = `${target}:${index}`;
    const set = this.flags.get(key) ?? new Set<PlayerId>();
    if (set.has(playerId)) set.delete(playerId);
    else set.add(playerId);
    this.flags.set(key, set);

    // serve la meta' degli altri giocatori per annullare una casella
    const others = this.ctx.players.length - 1;
    if (set.size > others / 2) this.voided.add(key);
    else this.voided.delete(key);

    this.ctx.push();
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

  publicState() {
    const showAnswers = this.phase !== 'fill';
    return {
      phase: this.phase,
      letter: this.letter,
      categorie: CATEGORIE,
      stopperId: this.stopperId,
      progress: this.ctx.players.map((p) => {
        const e = this.entries.get(p.id);
        return {
          playerId: p.id,
          filled: e?.cells.filter((c) => this.startsRight(c)).length ?? 0,
          complete: e?.complete ?? false,
          cells: showAnswers ? e?.cells ?? [] : null,
          voided: showAnswers
            ? (e?.cells ?? []).map((_, i) => this.voided.has(`${p.id}:${i}`))
            : null,
        };
      }),
    };
  }

  privateState(playerId: PlayerId) {
    const e = this.entries.get(playerId);
    if (!e) return null;
    return {
      phase: this.phase,
      letter: this.letter,
      categorie: CATEGORIE,
      cells: e.cells,
      complete: e.complete,
      frozen: e.frozen,
      canStop: this.phase === 'fill' && e.complete && !this.stopperId,
      others: this.phase === 'review'
        ? this.ctx.players
            .filter((p) => p.id !== playerId)
            .map((p) => ({
              playerId: p.id,
              name: p.name,
              avatar: p.avatar,
              cells: this.entries.get(p.id)?.cells ?? [],
              flagged: (this.entries.get(p.id)?.cells ?? []).map((_, i) =>
                this.flags.get(`${p.id}:${i}`)?.has(playerId) ?? false),
              voided: (this.entries.get(p.id)?.cells ?? []).map((_, i) =>
                this.voided.has(`${p.id}:${i}`)),
            }))
        : null,
    };
  }
}
