import type { PlayerId, TeamId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { randomTop10, type Top10List } from '../data/top10.ts';

const GUESS_MS = 30_000;
/** pausa per leggere la classifica completa prima del recap punti */
const REVEAL_MS = 15_000;
/** turni di grazia oltre al numero di voci, cosi si puo' sbagliare qualcosa */
const EXTRA_TURNS = 4;

type Phase = 'guess' | 'reveal' | 'result';

const norm = (s: string) =>
  s.toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

export class Top10Game extends MiniGame {
  private phase: Phase = 'guess';
  private list!: Top10List;
  private found = new Map<number, { team: TeamId; guess: string }>();
  private misses: { team: TeamId; guess: string }[] = [];
  private scores: Record<TeamId, number> = { A: 0, B: 0 };
  private turnIdx = 0;
  private maxTurns = 0;

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    if (!this.ctx.teams || this.ctx.teams.length < 2) {
      return this.ctx.finish({ raw: {}, detail: {}, reveal: ['Squadre non disponibili'] });
    }
    this.list = randomTop10(this.ctx.rng);
    this.maxTurns = this.list.voci.length + EXTRA_TURNS;
    this.ctx.setDeadline(GUESS_MS);
    this.ctx.push();
  }

  private get currentTeam(): TeamId {
    return this.turnIdx % 2 === 0 ? 'A' : 'B';
  }

  /** Punti pesati: il primo posto vale quanto la lunghezza della classifica. */
  private pointsFor(index: number): number {
    return this.list.voci.length - index;
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (this.phase !== 'guess' || type !== 'guess') return;
    const team = this.ctx.teamOf(playerId);
    if (!team || team.id !== this.currentTeam) return;

    const guess = String((payload as { text?: string })?.text ?? '').trim().slice(0, 40);
    if (!guess) return this.ctx.toast(playerId, 'bad', 'Scrivi una risposta');

    const g = norm(guess);
    const matches = (v: { nome: string; alias?: string[] }) =>
      norm(v.nome) === g || (v.alias ?? []).some((a) => norm(a) === g);

    const index = this.list.voci.findIndex((v, i) => !this.found.has(i) && matches(v));

    if (index >= 0) {
      const pts = this.pointsFor(index);
      this.scores[team.id] += pts;
      this.found.set(index, { team: team.id, guess });
      this.ctx.toast(null, 'good', `${guess}: ${index + 1}o posto, +${pts} punti`);
    } else {
      // distinguere "gia presa" da "non c'e" evita di far sembrare l'una l'altra
      const already = this.list.voci.findIndex((v, i) => this.found.has(i) && matches(v));
      if (already >= 0) {
        this.ctx.toast(null, 'bad', `${guess} era gia stata trovata`);
      } else {
        this.misses.push({ team: team.id, guess });
        this.ctx.toast(null, 'bad', `${guess} non e in classifica`);
      }
    }

    this.nextTurn();
  }

  private nextTurn(): void {
    this.turnIdx++;
    if (this.found.size >= this.list.voci.length || this.turnIdx >= this.maxTurns) return this.toReveal();
    this.ctx.setDeadline(GUESS_MS);
    this.ctx.push();
  }

  /** La classifica intera resta a schermo: e' meta' del divertimento. */
  private toReveal(): void {
    this.phase = 'reveal';
    this.ctx.setDeadline(REVEAL_MS);
    this.ctx.push();
  }

  hostAdvance(): void {
    if (this.phase === 'guess') this.nextTurn();
    else if (this.phase === 'reveal') this.conclude();
  }

  onDeadline(): void {
    if (this.phase === 'guess') this.nextTurn();
    else if (this.phase === 'reveal') this.conclude();
  }
  onDisconnect(): void { this.ctx.push(); }

  private conclude(): void {
    this.phase = 'result';
    this.ctx.setDeadline(null);

    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};
    for (const p of this.ctx.players) {
      const team = this.ctx.teamOf(p.id);
      const pts = team ? this.scores[team.id] : 0;
      raw[p.id] = pts;
      detail[p.id] = team ? `${team.name}: ${pts} punti ponderati` : 'Fuori squadra';
    }

    const nameOf = (id: TeamId) => this.ctx.teams?.find((t) => t.id === id)?.name ?? id;
    const a = this.scores.A, b = this.scores.B;
    const mancanti = this.list.voci
      .map((v, i) => (this.found.has(i) ? null : `${i + 1}. ${v.nome}`))
      .filter(Boolean);

    this.ctx.finish({
      raw,
      detail,
      reveal: [
        a === b ? `Pareggio ${a} a ${b}` : `${nameOf(a > b ? 'A' : 'B')} vince ${Math.max(a, b)} a ${Math.min(a, b)}`,
        mancanti.length ? `Non trovati: ${mancanti.join(' · ')}` : 'Classifica completata!',
      ],
    });
  }

  publicState() {
    const reveal = this.phase !== 'guess';
    return {
      phase: this.phase,
      titolo: this.list.titolo,
      currentTeam: this.currentTeam,
      turnIndex: this.turnIdx,
      maxTurns: this.maxTurns,
      scores: this.scores,
      misses: this.misses,
      voci: this.list.voci.map((v, i) => {
        const hit = this.found.get(i);
        return {
          posizione: i + 1,
          punti: this.pointsFor(i),
          nome: hit || reveal ? v.nome : null,
          team: hit?.team ?? null,
        };
      }),
    };
  }

  privateState(playerId: PlayerId) {
    const team = this.ctx.teamOf(playerId);
    return {
      phase: this.phase,
      titolo: this.list.titolo,
      myTeam: team?.id ?? null,
      myTurn: this.phase === 'guess' && team?.id === this.currentTeam,
      scores: this.scores,
      trovati: [...this.found.values()].map((f) => f.guess),
    };
  }
}
