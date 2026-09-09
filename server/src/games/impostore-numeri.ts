import type { PlayerId } from '../../../shared/src/types.ts';
import type { GameContext } from '../minigame.ts';
import { ImpostorBase } from './impostore-base.ts';
import { randomDomanda, type DomandaNumerica } from '../data/impostore.ts';

const ANSWER_MS = 60_000;

/** L'Impostore coi Numeri: stessa domanda per tutti tranne uno, che ne riceve
 *  una diversa ma dello stesso ordine di grandezza. */
export class ImpostoreNumeriGame extends ImpostorBase {
  private domanda!: DomandaNumerica;
  private answers = new Map<PlayerId, number>();

  constructor(ctx: GameContext) { super(ctx); }

  protected startSecret(): void {
    this.domanda = randomDomanda(this.ctx.rng);
    this.ctx.setDeadline(ANSWER_MS);
  }

  protected secretAction(playerId: PlayerId, type: string, payload: unknown): void {
    if (type !== 'answer' || this.answers.has(playerId)) return;

    const n = Number((payload as { value?: unknown })?.value);
    if (!Number.isFinite(n) || n < 0 || n > 100_000)
      return this.ctx.toast(playerId, 'bad', 'Serve un numero valido');

    this.answers.set(playerId, Math.round(n));
    this.ctx.toast(playerId, 'good', 'Numero inviato');
  }

  protected secretComplete(): boolean {
    return this.answers.size >= this.ctx.players.length;
  }

  protected revealLines(): string[] {
    const impName = this.ctx.player(this.impostorId)?.name ?? '???';
    const esito = this.impostorFound ? `${impName} e stato smascherato` : `${impName} l ha fatta franca`;
    return [
      `L impostore era ${impName} — ${esito}`,
      `A lui era stato chiesto: "${this.domanda.falsa}"`,
    ];
  }

  protected publicExtra() {
    // i numeri restano nascosti finche non hanno risposto tutti
    const show = this.phase !== 'secret';
    return {
      domanda: this.domanda.vera,
      domandaFalsa: this.phase === 'result' ? this.domanda.falsa : null,
      answered: [...this.answers.keys()],
      numeri: show
        ? this.ctx.players
            .filter((p) => this.answers.has(p.id))
            .map((p) => ({ playerId: p.id, value: this.answers.get(p.id)! }))
        : null,
    };
  }

  protected privateExtra(playerId: PlayerId) {
    const isImp = playerId === this.impostorId;
    return {
      domanda: isImp ? this.domanda.falsa : this.domanda.vera,
      myAnswer: this.answers.get(playerId) ?? null,
      answeredCount: this.answers.size,
      answeredTotal: this.ctx.players.length,
    };
  }
}
