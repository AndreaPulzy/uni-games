import type { PlayerId, TeamId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';

export type TeamPhase = 'ready' | 'playing' | 'steal' | 'result';

export interface PlayedCard { team: TeamId; label: string; ok: boolean; note?: string }

/** Punti grezzi per carta indovinata: 5 carte valgono il massimo del round. */
export const POINTS_PER_CARD = 200;

/**
 * Struttura comune a Taboo, Intesa Vincente e Mimo: le due squadre si alternano,
 * qualcuno vede la carta e il resto della squadra indovina a voce entro il tempo.
 * Le sottoclassi scelgono le carte, i ruoli e le regole di penalita'.
 */
export abstract class TeamCardGame extends MiniGame {
  protected phase: TeamPhase = 'ready';
  protected order: TeamId[] = ['A', 'B'];
  protected turnIdx = 0;
  protected scores: Record<TeamId, number> = { A: 0, B: 0 };
  protected history: PlayedCard[] = [];
  protected card: unknown = null;
  /** chi vede la carta in questo turno */
  protected presenters: PlayerId[] = [];
  protected turnStartedAt = 0;

  constructor(ctx: GameContext) { super(ctx); }

  /* ------------------------- da definire nel gioco ------------------------ */

  /** durata del turno di una squadra */
  protected abstract turnMs(): number;
  /** quanti membri vedono la carta (1 per Taboo e Mimo, 2 per l'Intesa) */
  protected abstract presenterCount(): number;
  /** pesca una carta nuova */
  protected abstract drawCard(): unknown;
  /** testo della carta usato nel riepilogo */
  protected abstract cardLabel(card: unknown): string;
  /** la squadra avversaria puo' rubare l'ultima carta non indovinata? */
  protected allowSteal(): boolean { return false; }
  /** dati extra per la TV */
  protected publicExtra(): Record<string, unknown> { return {}; }
  /** dati extra per il telefono */
  protected privateExtra(_playerId: PlayerId): Record<string, unknown> { return {}; }

  /* --------------------------------- ciclo -------------------------------- */

  start(): void {
    if (!this.ctx.teams || this.ctx.teams.length < 2) {
      // senza squadre il round non ha senso: si chiude subito senza punti
      return this.ctx.finish({ raw: {}, detail: {}, reveal: ['Squadre non disponibili'] });
    }
    this.toReady();
  }

  protected get currentTeamId(): TeamId {
    return this.order[this.turnIdx];
  }
  protected get opponentTeamId(): TeamId {
    return this.currentTeamId === 'A' ? 'B' : 'A';
  }
  protected membersOf(team: TeamId): PlayerId[] {
    const t = this.ctx.teams?.find((x) => x.id === team);
    const active = new Set(this.ctx.players.map((p) => p.id));
    return (t?.members ?? []).filter((id) => active.has(id));
  }

  /** oltre questo tempo il turno parte da solo: un telefono bloccato non deve
   *  congelare la partita */
  protected readyMs(): number { return 30_000; }

  protected toReady(): void {
    this.phase = 'ready';
    const members = this.membersOf(this.currentTeamId);
    // i presentatori ruotano col numero del turno, cosi non tocca sempre agli stessi
    const n = Math.min(this.presenterCount(), Math.max(1, members.length - 1));
    this.presenters = Array.from({ length: n }, (_, k) => members[(this.turnIdx + k) % members.length])
      .filter((id, i, arr) => arr.indexOf(id) === i);
    this.card = null;
    this.ctx.setDeadline(this.readyMs());
    this.ctx.push();
  }

  protected beginTurn(): void {
    this.phase = 'playing';
    this.card = this.drawCard();
    this.turnStartedAt = Date.now();
    this.ctx.setDeadline(this.turnMs());
    this.ctx.push();
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (this.phase === 'ready') {
      if (type === 'begin' && this.presenters.includes(playerId)) this.beginTurn();
      return;
    }
    if (this.phase === 'playing') {
      if (type === 'correct' && this.presenters.includes(playerId)) return this.onCorrect();
      if (type === 'skip' && this.presenters.includes(playerId)) return this.onSkip();
      return this.extraAction(playerId, type, payload);
    }
    if (this.phase === 'steal') {
      if (!this.presenters.includes(playerId)) return;
      if (type === 'stealOk') return this.resolveSteal(true);
      if (type === 'stealNo') return this.resolveSteal(false);
    }
  }

  /** azioni specifiche del gioco durante il turno (es. il buzzer del Taboo) */
  protected extraAction(_playerId: PlayerId, _type: string, _payload: unknown): void {}

  protected onCorrect(): void {
    this.scores[this.currentTeamId]++;
    this.history.push({ team: this.currentTeamId, label: this.cardLabel(this.card), ok: true });
    this.card = this.drawCard();
    this.ctx.push();
  }

  protected onSkip(): void {
    this.history.push({ team: this.currentTeamId, label: this.cardLabel(this.card), ok: false, note: 'passata' });
    this.card = this.drawCard();
    this.ctx.push();
  }

  hostAdvance(): void {
    if (this.phase === 'ready') this.beginTurn();
    else if (this.phase === 'playing') this.endTurn();
    else if (this.phase === 'steal') this.resolveSteal(false);
  }

  onDeadline(): void {
    if (this.phase === 'ready') this.beginTurn();
    else if (this.phase === 'playing') this.endTurn();
    else if (this.phase === 'steal') this.resolveSteal(false);
  }

  protected endTurn(): void {
    if (this.allowSteal() && this.card) {
      this.phase = 'steal';
      this.ctx.setDeadline(15_000);
      this.ctx.push();
      return;
    }
    this.nextTurn();
  }

  protected resolveSteal(stolen: boolean): void {
    if (stolen) {
      this.scores[this.opponentTeamId]++;
      this.history.push({ team: this.opponentTeamId, label: this.cardLabel(this.card), ok: true, note: 'rubata' });
    } else {
      this.history.push({ team: this.currentTeamId, label: this.cardLabel(this.card), ok: false, note: 'non indovinata' });
    }
    this.nextTurn();
  }

  protected nextTurn(): void {
    this.turnIdx++;
    if (this.turnIdx >= this.order.length) return this.conclude();
    this.toReady();
  }

  onDisconnect(playerId: PlayerId): void {
    if (this.presenters.includes(playerId)) {
      const rest = this.membersOf(this.currentTeamId).filter((id) => !this.presenters.includes(id));
      if (rest.length) this.presenters = [...this.presenters.filter((id) => id !== playerId), rest[0]];
    }
    this.ctx.push();
  }

  /* ------------------------------- punteggio ------------------------------ */

  protected conclude(): void {
    this.phase = 'result';
    this.ctx.setDeadline(null);

    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};

    for (const p of this.ctx.players) {
      const team = this.ctx.teamOf(p.id);
      const pts = team ? Math.max(0, this.scores[team.id]) : 0;
      raw[p.id] = pts * POINTS_PER_CARD;
      detail[p.id] = team
        ? `${team.name}: ${pts} cart${pts === 1 ? 'a' : 'e'}`
        : 'Fuori squadra';
    }

    const a = this.scores.A, b = this.scores.B;
    const nameOf = (id: TeamId) => this.ctx.teams?.find((t) => t.id === id)?.name ?? id;
    this.ctx.finish({
      raw,
      detail,
      reveal: [
        a === b ? `Pareggio ${a} a ${b}` : `${nameOf(a > b ? 'A' : 'B')} vince ${Math.max(a, b)} a ${Math.min(a, b)}`,
        this.history.filter((h) => h.ok).map((h) => h.label).join(' · ') || 'Nessuna carta indovinata',
      ],
    });
  }

  /* -------------------------------- snapshot ------------------------------ */

  publicState() {
    return {
      phase: this.phase,
      currentTeam: this.currentTeamId,
      turnIndex: this.turnIdx,
      turnTotal: this.order.length,
      scores: this.scores,
      presenters: this.presenters,
      history: this.history,
      turnMs: this.turnMs(),
      ...this.publicExtra(),
    };
  }

  privateState(playerId: PlayerId) {
    const team = this.ctx.teamOf(playerId);
    const mine = team?.id === this.currentTeamId;
    const isPresenter = this.presenters.includes(playerId);
    return {
      phase: this.phase,
      myTeam: team?.id ?? null,
      myTurn: mine,
      isPresenter,
      canBegin: this.phase === 'ready' && isPresenter,
      canScore: this.phase === 'playing' && isPresenter,
      canJudgeSteal: this.phase === 'steal' && isPresenter,
      scores: this.scores,
      ...this.privateExtra(playerId),
    };
  }
}
