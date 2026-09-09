import type { PlayerId } from '../../../shared/src/types.ts';
import type { GameContext } from '../minigame.ts';
import { TeamCardGame } from './team-card.ts';
import { TABOO, type TabooCard } from '../data/squadre.ts';
import { shuffle } from '../../../shared/src/rotation.ts';

const TURN_MS = 60_000;

export class TabooGame extends TeamCardGame {
  private deck: TabooCard[] = [];
  private buzzed = 0;

  constructor(ctx: GameContext) { super(ctx); }

  protected turnMs(): number { return TURN_MS; }
  protected presenterCount(): number { return 1; }

  protected drawCard(): TabooCard {
    if (this.deck.length === 0) this.deck = shuffle(TABOO, this.ctx.rng);
    return this.deck.pop()!;
  }

  protected cardLabel(card: unknown): string {
    return (card as TabooCard)?.word ?? '—';
  }

  /** Il buzzer degli avversari: carta bruciata e un punto di penalita'. */
  protected extraAction(playerId: PlayerId, type: string): void {
    if (type !== 'buzz') return;
    const team = this.ctx.teamOf(playerId);
    if (!team || team.id !== this.opponentTeamId) return;

    this.scores[this.currentTeamId]--;
    this.buzzed++;
    this.history.push({
      team: this.currentTeamId,
      label: this.cardLabel(this.card),
      ok: false,
      note: 'parola vietata',
    });
    this.ctx.toast(null, 'bad', `Buzzer! ${this.cardLabel(this.card)} annullata`);
    this.card = this.drawCard();
    this.ctx.push();
  }

  protected publicExtra() {
    return { buzzed: this.buzzed };
  }

  protected privateExtra(playerId: PlayerId) {
    const showCard = this.presenters.includes(playerId) && this.phase === 'playing';
    const team = this.ctx.teamOf(playerId);
    return {
      card: showCard ? (this.card as TabooCard) : null,
      canBuzz: this.phase === 'playing' && team?.id === this.opponentTeamId,
    };
  }
}
