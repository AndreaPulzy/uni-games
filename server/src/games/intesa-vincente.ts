import type { PlayerId } from '../../../shared/src/types.ts';
import type { GameContext } from '../minigame.ts';
import { TeamCardGame } from './team-card.ts';
import { INTESA } from '../data/squadre.ts';
import { shuffle } from '../../../shared/src/rotation.ts';

const TURN_MS = 60_000;

/** Due suggeritori costruiscono la domanda una parola per uno, il terzo risolve. */
export class IntesaVincenteGame extends TeamCardGame {
  private deck: string[] = [];

  constructor(ctx: GameContext) { super(ctx); }

  protected turnMs(): number { return TURN_MS; }
  protected presenterCount(): number { return 2; }

  protected drawCard(): string {
    if (this.deck.length === 0) this.deck = shuffle(INTESA, this.ctx.rng);
    return this.deck.pop()!;
  }

  protected cardLabel(card: unknown): string {
    return String(card ?? '—');
  }

  protected publicExtra() {
    const solvers = this.membersOf(this.currentTeamId).filter((id) => !this.presenters.includes(id));
    return { solvers };
  }

  protected privateExtra(playerId: PlayerId) {
    const isPresenter = this.presenters.includes(playerId);
    const team = this.ctx.teamOf(playerId);
    const mine = team?.id === this.currentTeamId;
    return {
      // il risolutore non deve mai vedere la parola
      card: isPresenter && this.phase === 'playing' ? this.cardLabel(this.card) : null,
      role: !mine ? 'avversario' : isPresenter ? 'suggeritore' : 'risolutore',
      partner: isPresenter
        ? this.presenters.filter((id) => id !== playerId).map((id) => this.ctx.player(id)?.name ?? '')
        : [],
    };
  }
}
