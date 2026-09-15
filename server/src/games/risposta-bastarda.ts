import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { randomPrompts } from '../data/prompts.ts';
import { shuffle } from '../../../shared/src/rotation.ts';

const WRITE_MS = 120_000;
const DUEL_VOTE_MS = 30_000;
const POINTS_PER_DUEL = 500;
const PLEIN_BONUS = 100;

type Phase = 'write' | 'vote' | 'result';

interface Duel {
  prompt: string;
  authors: [PlayerId, PlayerId];
  answers: Map<PlayerId, string>;
  votes: Map<PlayerId, PlayerId>;   // votante -> autore scelto
}

/** Ogni giocatore compare in due duelli: sfida chi lo segue e chi lo precede. */
export class RispostaBastardaGame extends MiniGame {
  private phase: Phase = 'write';
  private duels: Duel[] = [];
  private current = 0;
  private plein = new Set<PlayerId>();

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    const ids = shuffle(this.ctx.players.map((p) => p.id), this.ctx.rng);
    const prompts = randomPrompts(ids.length, this.ctx.rng);

    this.duels = ids.map((id, i) => ({
      prompt: prompts[i % prompts.length],
      authors: [id, ids[(i + 1) % ids.length]] as [PlayerId, PlayerId],
      answers: new Map(),
      votes: new Map(),
    }));

    this.ctx.setDeadline(WRITE_MS);
  }

  /** I due duelli che riguardano un giocatore, con il testo gia' scritto. */
  private assignmentsFor(playerId: PlayerId) {
    return this.duels
      .map((d, i) => ({ index: i, duel: d }))
      .filter(({ duel }) => duel.authors.includes(playerId));
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (this.phase === 'write' && type === 'answer') return this.onAnswer(playerId, payload);
    if (this.phase === 'vote' && type === 'vote') return this.onVote(playerId, payload);
  }

  private onAnswer(playerId: PlayerId, payload: unknown): void {
    const { index, text } = (payload ?? {}) as { index?: number; text?: string };
    const duel = typeof index === 'number' ? this.duels[index] : undefined;
    if (!duel || !duel.authors.includes(playerId)) return;

    const clean = String(text ?? '').trim().slice(0, 120);
    if (!clean) return this.ctx.toast(playerId, 'bad', 'Scrivi qualcosa');

    duel.answers.set(playerId, clean);
    this.ctx.toast(playerId, 'good', 'Risposta salvata');

    if (this.writeComplete()) this.toVote();
    else this.ctx.push();
  }

  private writeComplete(): boolean {
    const active = new Set(this.ctx.players.map((p) => p.id));
    return this.duels.every((d) =>
      d.authors.every((a) => !active.has(a) || d.answers.has(a)));
  }

  private toVote(): void {
    this.phase = 'vote';
    this.current = 0;
    this.ctx.setDeadline(DUEL_VOTE_MS);
    this.ctx.push();
  }

  private onVote(playerId: PlayerId, payload: unknown): void {
    const duel = this.duels[this.current];
    if (!duel || duel.authors.includes(playerId) || duel.votes.has(playerId)) return;

    const target = String((payload as { playerId?: string })?.playerId ?? '');
    if (!duel.authors.includes(target)) return;

    duel.votes.set(playerId, target);
    if (duel.votes.size >= this.votersFor(duel).length) this.nextDuel();
    else this.ctx.push();
  }

  private votersFor(duel: Duel): PlayerId[] {
    return this.ctx.players.map((p) => p.id).filter((id) => !duel.authors.includes(id));
  }

  private nextDuel(): void {
    this.current++;
    if (this.current >= this.duels.length) return this.conclude();
    this.ctx.setDeadline(DUEL_VOTE_MS);
    this.ctx.push();
  }

  /** etichetta dell'avanti mostrata a TV e regista */
  directorPrompt(): string | null {
    return this.phase === 'write' ? 'Passa alla votazione' : null;
  }

  hostAdvance(): void {
    if (this.phase === 'write') this.toVote();
    else if (this.phase === 'vote') this.nextDuel();
  }

  onDeadline(): void {
    if (this.phase === 'write') this.toVote();
    else if (this.phase === 'vote') this.nextDuel();
  }

  onDisconnect(): void {
    if (this.phase === 'write' && this.writeComplete()) this.toVote();
    else if (this.phase === 'vote') {
      const duel = this.duels[this.current];
      if (duel && duel.votes.size >= this.votersFor(duel).length) this.nextDuel();
    }
  }

  private conclude(): void {
    this.phase = 'result';
    this.ctx.setDeadline(null);

    const raw: Record<PlayerId, number> = {};
    const wins: Record<PlayerId, number> = {};
    for (const p of this.ctx.players) { raw[p.id] = 0; wins[p.id] = 0; }

    for (const duel of this.duels) {
      const total = duel.votes.size;
      if (total === 0) continue;
      const tally = new Map<PlayerId, number>();
      for (const target of duel.votes.values()) tally.set(target, (tally.get(target) ?? 0) + 1);

      for (const author of duel.authors) {
        const got = tally.get(author) ?? 0;
        if (raw[author] === undefined) continue;
        raw[author] += Math.round(POINTS_PER_DUEL * (got / total));
        if (got > total / 2) wins[author]++;
        if (got === total && total > 1) { raw[author] += PLEIN_BONUS; this.plein.add(author); }
      }
    }

    const detail: Record<PlayerId, string> = {};
    for (const p of this.ctx.players) {
      const w = wins[p.id] ?? 0;
      detail[p.id] = `${w}/2 duelli vinti` + (this.plein.has(p.id) ? ' · PLEIN!' : '');
    }

    const best = [...this.ctx.players].sort((a, b) => (raw[b.id] ?? 0) - (raw[a.id] ?? 0))[0];
    this.ctx.finish({
      raw,
      detail,
      reveal: [
        best ? `${best.name} ha fatto ridere di piu` : 'Nessun vincitore',
        this.plein.size ? `PLEIN per ${[...this.plein].map((id) => this.ctx.player(id)?.name).join(', ')}` : '',
      ].filter(Boolean),
    });
  }

  publicState() {
    const duel = this.duels[this.current];
    return {
      phase: this.phase,
      duelIndex: this.current,
      duelTotal: this.duels.length,
      written: this.duels.reduce((n, d) => n + d.answers.size, 0),
      writtenTotal: this.duels.length * 2,
      /** in votazione le risposte sono anonime: niente nomi accanto al testo */
      duel: this.phase === 'vote' && duel
        ? {
            prompt: duel.prompt,
            options: duel.authors.map((a) => ({ authorId: a, text: duel.answers.get(a) ?? '(nessuna risposta)' })),
            votesReceived: duel.votes.size,
            votesTotal: this.votersFor(duel).length,
          }
        : null,
      results: this.phase === 'result'
        ? this.duels.map((d) => ({
            prompt: d.prompt,
            options: d.authors.map((a) => ({
              authorId: a,
              text: d.answers.get(a) ?? '—',
              votes: [...d.votes.values()].filter((v) => v === a).length,
            })),
          }))
        : null,
    };
  }

  privateState(playerId: PlayerId) {
    const duel = this.duels[this.current];
    return {
      phase: this.phase,
      assignments: this.phase === 'write'
        ? this.assignmentsFor(playerId).map(({ index, duel: d }) => ({
            index,
            prompt: d.prompt,
            text: d.answers.get(playerId) ?? '',
          }))
        : null,
      canVote: this.phase === 'vote' && !!duel && !duel.authors.includes(playerId) && !duel.votes.has(playerId),
      isAuthor: this.phase === 'vote' && !!duel && duel.authors.includes(playerId),
      duel: this.phase === 'vote' && duel
        ? { prompt: duel.prompt, options: duel.authors.map((a) => ({ authorId: a, text: duel.answers.get(a) ?? '(nessuna risposta)' })) }
        : null,
    };
  }
}
