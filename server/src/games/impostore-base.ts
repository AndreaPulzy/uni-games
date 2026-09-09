import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';

/** Punteggi grezzi dei due Impostori. Tenuti qui per poterli tarare in un posto solo. */
export const IMP_SCORES = {
  /** l'impostore non prende la maggioranza dei voti */
  impostoreLibero: 1000,
  /** innocenti quando l'impostore la fa franca */
  innocentiSconfitti: 0,
  /** l'impostore viene beccato */
  impostoreBeccato: 0,
  innocenteCheHaVotatoBene: 900,
  innocenteCheHaSbagliatoVoto: 400,
  /** beccato ma indovina la parola segreta (solo Impostore classico) */
  impostoreRiscattato: 600,
  riscattoInnocenteCheHaVotatoBene: 500,
  riscattoInnocenteCheHaSbagliato: 250,
} as const;

export const VOTE_MS = 45_000;
export const DISCUSSION_MS = 150_000;
export const GUESS_MS = 30_000;

export type ImpPhase = 'secret' | 'discussion' | 'vote' | 'guess' | 'result';

/**
 * Struttura condivisa dai due Impostori: si sceglie un infiltrato, si raccoglie
 * qualcosa in segreto (indizi o numeri), si discute, si vota, si assegna.
 * Le sottoclassi decidono cosa succede nella fase 'secret' e cosa mostrare.
 */
export abstract class ImpostorBase extends MiniGame {
  protected impostorId: PlayerId = '';
  protected phase: ImpPhase = 'secret';
  protected votes = new Map<PlayerId, PlayerId>();
  protected accusedId: PlayerId | null = null;
  protected impostorFound = false;
  protected redeemed = false;

  constructor(ctx: GameContext) { super(ctx); }

  /* ------------------------- da definire nel gioco ------------------------ */

  /** preparazione della fase segreta (assegnazione parola/domanda, timer) */
  protected abstract startSecret(): void;
  /** azioni ammesse durante la fase segreta */
  protected abstract secretAction(playerId: PlayerId, type: string, payload: unknown): void;
  /** la fase segreta e' completa? (tutti hanno dato indizio / risposto) */
  protected abstract secretComplete(): boolean;
  /** righe di rivelazione mostrate sulla TV a fine round */
  protected abstract revealLines(): string[];
  /** stato pubblico specifico del gioco */
  protected abstract publicExtra(): Record<string, unknown>;
  /** stato privato specifico del gioco */
  protected abstract privateExtra(playerId: PlayerId): Record<string, unknown>;
  /** true se dopo la cattura l'impostore ha una chance di indovinare */
  protected hasGuessPhase(): boolean { return false; }
  /** l'impostore ha indovinato? (solo se hasGuessPhase) */
  protected checkGuess(_answer: string): boolean { return false; }

  /* ------------------------------- ciclo ---------------------------------- */

  start(): void {
    const players = this.ctx.players;
    this.impostorId = players[Math.floor(this.ctx.rng() * players.length)].id;
    this.phase = 'secret';
    this.startSecret();
    this.ctx.push();
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    switch (this.phase) {
      case 'secret':
        this.secretAction(playerId, type, payload);
        if (this.secretComplete()) this.toDiscussion();
        else this.ctx.push();
        return;

      case 'vote':
        if (type !== 'vote') return;
        this.onVote(playerId, payload);
        return;

      case 'guess':
        if (type !== 'guess' || playerId !== this.impostorId) return;
        this.resolveGuess(String((payload as { word?: string })?.word ?? ''));
        return;
    }
  }

  /** la TV fa avanzare dalla discussione alla votazione */
  hostAdvance(): void {
    if (this.phase === 'discussion') this.toVote();
    else if (this.phase === 'secret' && this.secretComplete()) this.toDiscussion();
  }

  protected toDiscussion(): void {
    this.phase = 'discussion';
    this.ctx.setDeadline(DISCUSSION_MS);
    this.ctx.push();
  }

  protected toVote(): void {
    this.phase = 'vote';
    this.votes.clear();
    this.ctx.setDeadline(VOTE_MS);
    this.ctx.push();
  }

  protected onVote(playerId: PlayerId, payload: unknown): void {
    const target = String((payload as { playerId?: string })?.playerId ?? '');
    if (!this.ctx.players.some((p) => p.id === target)) return;
    if (target === playerId) return this.ctx.toast(playerId, 'bad', 'Non puoi votare te stesso');

    this.votes.set(playerId, target);
    if (this.votes.size >= this.ctx.players.length) this.tally();
    else this.ctx.push();
  }

  /** Chi ha preso piu voti. In caso di parita nessuno viene accusato. */
  protected tally(): void {
    const counts = new Map<PlayerId, number>();
    for (const target of this.votes.values()) counts.set(target, (counts.get(target) ?? 0) + 1);

    let best: PlayerId | null = null;
    let bestN = 0;
    let tied = false;
    for (const [id, n] of counts) {
      if (n > bestN) { best = id; bestN = n; tied = false; }
      else if (n === bestN) tied = true;
    }

    this.accusedId = tied ? null : best;
    this.impostorFound = this.accusedId === this.impostorId;

    if (this.impostorFound && this.hasGuessPhase()) {
      this.phase = 'guess';
      this.ctx.setDeadline(GUESS_MS);
      this.ctx.push();
      return;
    }
    this.conclude();
  }

  private resolveGuess(answer: string): void {
    this.redeemed = this.checkGuess(answer);
    this.conclude();
  }

  onDeadline(): void {
    switch (this.phase) {
      case 'secret':      this.toDiscussion(); break;
      case 'discussion':  this.toVote(); break;
      case 'vote':        this.tally(); break;
      case 'guess':       this.redeemed = false; this.conclude(); break;
    }
  }

  onDisconnect(playerId: PlayerId): void {
    if (this.phase === 'vote' && this.votes.size >= this.ctx.players.length) this.tally();
    else if (this.phase === 'secret' && this.secretComplete()) this.toDiscussion();
    else this.ctx.push();
  }

  /* ------------------------------ punteggio -------------------------------- */

  protected conclude(): void {
    this.phase = 'result';
    this.ctx.setDeadline(null);

    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};
    const S = IMP_SCORES;

    for (const p of this.ctx.players) {
      const isImp = p.id === this.impostorId;
      const votedRight = this.votes.get(p.id) === this.impostorId;

      if (!this.impostorFound) {
        raw[p.id] = isImp ? S.impostoreLibero : S.innocentiSconfitti;
        detail[p.id] = isImp
          ? 'Impostore mai scoperto'
          : votedRight ? 'Aveva capito, ma il gruppo no' : 'Ingannato dall impostore';
      } else if (this.redeemed) {
        raw[p.id] = isImp ? S.impostoreRiscattato
          : votedRight ? S.riscattoInnocenteCheHaVotatoBene : S.riscattoInnocenteCheHaSbagliato;
        detail[p.id] = isImp
          ? 'Beccato, ma ha indovinato la parola'
          : votedRight ? 'Ha smascherato l impostore' : 'Ha votato la persona sbagliata';
      } else {
        raw[p.id] = isImp ? S.impostoreBeccato
          : votedRight ? S.innocenteCheHaVotatoBene : S.innocenteCheHaSbagliatoVoto;
        detail[p.id] = isImp
          ? 'Smascherato'
          : votedRight ? 'Ha smascherato l impostore' : 'Ha votato la persona sbagliata';
      }
    }

    this.ctx.finish({ raw, detail, reveal: this.revealLines() });
  }

  /* ------------------------------- snapshot -------------------------------- */

  protected voteTally(): { playerId: PlayerId; votes: number }[] {
    const counts = new Map<PlayerId, number>();
    for (const t of this.votes.values()) counts.set(t, (counts.get(t) ?? 0) + 1);
    return this.ctx.players
      .map((p) => ({ playerId: p.id, votes: counts.get(p.id) ?? 0 }))
      .sort((a, b) => b.votes - a.votes);
  }

  publicState() {
    return {
      phase: this.phase,
      votesReceived: this.votes.size,
      votesTotal: this.ctx.players.length,
      tally: this.phase === 'vote' || this.phase === 'result' ? this.voteTally() : null,
      accusedId: this.accusedId,
      impostorId: this.phase === 'result' ? this.impostorId : null,
      ...this.publicExtra(),
    };
  }

  privateState(playerId: PlayerId) {
    return {
      phase: this.phase,
      isImpostor: playerId === this.impostorId,
      hasVoted: this.votes.has(playerId),
      canVote: this.phase === 'vote' && !this.votes.has(playerId),
      mustGuess: this.phase === 'guess' && playerId === this.impostorId,
      candidates: this.ctx.players
        .filter((p) => p.id !== playerId)
        .map((p) => ({ id: p.id, name: p.name, avatar: p.avatar })),
      ...this.privateExtra(playerId),
    };
  }
}
