import type { PlayerId } from '../../../shared/src/types.ts';
import type { GameContext } from '../minigame.ts';
import { ImpostorBase } from './impostore-base.ts';
import { randomParola } from '../data/impostore.ts';

const CLUE_MS = 30_000;

interface Clue { playerId: PlayerId; word: string }

/** L'Impostore classico: tutti vedono la stessa parola, uno no.
 *  Un indizio a testa, a turno, poi discussione e votazione. */
export class ImpostoreParolaGame extends ImpostorBase {
  private parola = '';
  private clues: Clue[] = [];
  private turnIdx = 0;
  private order: PlayerId[] = [];

  constructor(ctx: GameContext) { super(ctx); }

  protected startSecret(): void {
    this.parola = randomParola(this.ctx.rng);
    // l'ordine degli indizi e' casuale: parlare per primo o per ultimo cambia il gioco
    this.order = [...this.ctx.players]
      .map((p) => p.id)
      .sort(() => this.ctx.rng() - 0.5);
    this.turnIdx = 0;
    this.ctx.setDeadline(CLUE_MS);
  }

  private get currentId(): PlayerId | null {
    return this.order[this.turnIdx] ?? null;
  }

  protected secretAction(playerId: PlayerId, type: string, payload: unknown): void {
    if (type !== 'clue' || playerId !== this.currentId) return;

    const word = String((payload as { word?: string })?.word ?? '').trim().slice(0, 24);
    if (!word) return this.ctx.toast(playerId, 'bad', 'Scrivi un indizio');
    if (/\s/.test(word)) return this.ctx.toast(playerId, 'bad', 'Una parola sola');
    if (this.isTooRevealing(word))
      return this.ctx.toast(playerId, 'bad', 'Non puoi usare la parola segreta');

    this.clues.push({ playerId, word });
    this.turnIdx++;
    if (!this.secretComplete()) this.ctx.setDeadline(CLUE_MS);
  }

  /** Blocca l'indizio che contiene la parola segreta (o una sua parte lunga). */
  private isTooRevealing(word: string): boolean {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
    const w = norm(word);
    const target = norm(this.parola);
    if (!w || !target) return false;
    if (w.includes(target) || target.includes(w)) return true;
    // parole composte: "sala d attesa" -> blocca anche "attesa" da solo
    return this.parola
      .split(/\s+/)
      .map(norm)
      .filter((part) => part.length >= 4)
      .some((part) => w.includes(part));
  }

  protected secretComplete(): boolean {
    return this.clues.length >= this.order.length;
  }

  protected hasGuessPhase(): boolean { return true; }

  protected checkGuess(answer: string): boolean {
    const norm = (s: string) => s.toLowerCase().trim().replace(/[^a-z]/g, '');
    return norm(answer) === norm(this.parola);
  }

  override onDeadline(): void {
    // durante gli indizi la scadenza vale per il singolo turno, non per la fase
    if (this.phase === 'secret') {
      const id = this.currentId;
      if (id) {
        this.clues.push({ playerId: id, word: '—' });
        this.ctx.toast(id, 'bad', 'Tempo scaduto: nessun indizio');
      }
      this.turnIdx++;
      if (this.secretComplete()) this.toDiscussion();
      else { this.ctx.setDeadline(CLUE_MS); this.ctx.push(); }
      return;
    }
    super.onDeadline();
  }

  protected revealLines(): string[] {
    const impName = this.ctx.player(this.impostorId)?.name ?? '???';
    const esito = !this.impostorFound
      ? `${impName} l ha fatta franca`
      : this.redeemed
        ? `${impName} e stato beccato ma ha indovinato la parola`
        : `${impName} e stato smascherato`;
    return [`La parola era "${this.parola}"`, `L impostore era ${impName} — ${esito}`];
  }

  protected publicExtra() {
    return {
      currentPlayerId: this.phase === 'secret' ? this.currentId : null,
      clues: this.clues.map((c) => ({ playerId: c.playerId, word: c.word })),
      parola: this.phase === 'result' ? this.parola : null,
      guessPhase: this.phase === 'guess',
    };
  }

  protected privateExtra(playerId: PlayerId) {
    const isImp = playerId === this.impostorId;
    return {
      parola: isImp ? null : this.parola,
      myTurn: this.phase === 'secret' && this.currentId === playerId,
      cluesGiven: this.clues.length,
      cluesTotal: this.order.length,
    };
  }
}
