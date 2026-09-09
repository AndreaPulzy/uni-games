import type { PlayerId } from '../../../shared/src/types.ts';
import type { GameContext } from '../minigame.ts';
import { TeamCardGame } from './team-card.ts';
import { MIMO, type MimoCard } from '../data/squadre.ts';
import { shuffle } from '../../../shared/src/rotation.ts';

const TURN_MS = 90_000;

export class MimoGame extends TeamCardGame {
  private deck: MimoCard[] = [];

  constructor(ctx: GameContext) { super(ctx); }

  protected turnMs(): number { return TURN_MS; }
  protected presenterCount(): number { return 1; }
  protected allowSteal(): boolean { return true; }

  protected drawCard(): MimoCard {
    if (this.deck.length === 0) this.deck = shuffle(MIMO, this.ctx.rng);
    return this.deck.pop()!;
  }

  protected cardLabel(card: unknown): string {
    return (card as MimoCard)?.text ?? '—';
  }

  protected publicExtra() {
    const c = this.card as MimoCard | null;
    return {
      // in fase di furto la TV mostra solo la categoria, non la soluzione
      tipo: c?.tipo ?? null,
      stealTeam: this.phase === 'steal' ? this.opponentTeamId : null,
    };
  }

  protected privateExtra(playerId: PlayerId) {
    const isPresenter = this.presenters.includes(playerId);
    const c = this.card as MimoCard | null;
    const team = this.ctx.teamOf(playerId);
    return {
      card: isPresenter && (this.phase === 'playing' || this.phase === 'steal') ? c : null,
      tipo: c?.tipo ?? null,
      isStealer: this.phase === 'steal' && team?.id === this.opponentTeamId,
    };
  }
}
