import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { scoreByVoteShare } from '../../../shared/src/scoring.ts';
import { randomMeme, type MemeTemplate } from '../data/prompts.ts';

const WRITE_MS = 120_000;
const VOTE_MS = 60_000;

type Phase = 'write' | 'vote' | 'result';

interface Meme { top: string; bottom: string; submitted: boolean }

export class FabbricaMemeGame extends MiniGame {
  private phase: Phase = 'write';
  private template!: MemeTemplate;
  private memes = new Map<PlayerId, Meme>();
  private votes = new Map<PlayerId, PlayerId>();

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    this.template = randomMeme(this.ctx.rng);
    for (const p of this.ctx.players) {
      this.memes.set(p.id, { top: '', bottom: '', submitted: false });
    }
    this.ctx.setDeadline(WRITE_MS);
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (this.phase === 'write' && type === 'meme') return this.onMeme(playerId, payload);
    if (this.phase === 'vote' && type === 'vote') return this.onVote(playerId, payload);
  }

  private onMeme(playerId: PlayerId, payload: unknown): void {
    const m = this.memes.get(playerId);
    if (!m) return;
    const { top, bottom } = (payload ?? {}) as { top?: string; bottom?: string };
    m.top = String(top ?? '').trim().slice(0, 70);
    m.bottom = String(bottom ?? '').trim().slice(0, 70);
    if (!m.top && !m.bottom) return this.ctx.toast(playerId, 'bad', 'Scrivi almeno una riga');

    m.submitted = true;
    this.ctx.toast(playerId, 'good', 'Meme inviato');

    if (this.ctx.players.every((p) => this.memes.get(p.id)?.submitted)) this.toVote();
    else this.ctx.push();
  }

  private toVote(): void {
    this.phase = 'vote';
    this.ctx.setDeadline(VOTE_MS);
    this.ctx.push();
  }

  private onVote(playerId: PlayerId, payload: unknown): void {
    const target = String((payload as { playerId?: string })?.playerId ?? '');
    if (target === playerId) return this.ctx.toast(playerId, 'bad', 'Non puoi votare il tuo');
    if (!this.memes.get(target)?.submitted) return;
    if (this.votes.has(playerId)) return;

    this.votes.set(playerId, target);
    // vota solo chi ha consegnato un meme
    const eligible = this.ctx.players.filter((p) => this.memes.get(p.id)?.submitted).length;
    if (this.votes.size >= Math.max(1, eligible)) this.conclude();
    else this.ctx.push();
  }

  hostAdvance(): void {
    if (this.phase === 'write') this.toVote();
    else if (this.phase === 'vote') this.conclude();
  }

  onDeadline(): void {
    if (this.phase === 'write') this.toVote();
    else if (this.phase === 'vote') this.conclude();
  }

  onDisconnect(): void { this.ctx.push(); }

  private tally(): Map<PlayerId, number> {
    const t = new Map<PlayerId, number>();
    for (const target of this.votes.values()) t.set(target, (t.get(target) ?? 0) + 1);
    return t;
  }

  private conclude(): void {
    this.phase = 'result';
    this.ctx.setDeadline(null);

    const tally = this.tally();
    const total = this.votes.size;
    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};

    for (const p of this.ctx.players) {
      const got = tally.get(p.id) ?? 0;
      const submitted = this.memes.get(p.id)?.submitted ?? false;
      raw[p.id] = submitted ? scoreByVoteShare({ votes: got, totalVotes: total }) : 0;
      detail[p.id] = submitted
        ? `${got} vot${got === 1 ? 'o' : 'i'} su ${total}`
        : 'Nessun meme consegnato';
    }

    const best = [...this.ctx.players].sort((a, b) => (tally.get(b.id) ?? 0) - (tally.get(a.id) ?? 0))[0];
    const bestVotes = best ? tally.get(best.id) ?? 0 : 0;

    this.ctx.finish({
      raw,
      detail,
      reveal: [
        bestVotes > 0 ? `Meme dell anno: ${best!.name}` : 'Nessun voto assegnato',
        this.template.scena,
      ],
    });
  }

  publicState() {
    const tally = this.tally();
    const show = this.phase !== 'write';
    return {
      phase: this.phase,
      template: this.template,
      submitted: this.ctx.players.filter((p) => this.memes.get(p.id)?.submitted).length,
      total: this.ctx.players.length,
      votesReceived: this.votes.size,
      /** in galleria i meme restano anonimi finche non si chiude la votazione */
      gallery: show
        ? this.ctx.players
            .filter((p) => this.memes.get(p.id)?.submitted)
            .map((p) => ({
              authorId: this.phase === 'result' ? p.id : null,
              slot: p.id,
              top: this.memes.get(p.id)!.top,
              bottom: this.memes.get(p.id)!.bottom,
              votes: this.phase === 'result' ? tally.get(p.id) ?? 0 : null,
            }))
        : null,
    };
  }

  privateState(playerId: PlayerId) {
    const m = this.memes.get(playerId);
    return {
      phase: this.phase,
      template: this.template,
      top: m?.top ?? '',
      bottom: m?.bottom ?? '',
      submitted: m?.submitted ?? false,
      hasVoted: this.votes.has(playerId),
      options: this.phase === 'vote'
        ? this.ctx.players
            .filter((p) => p.id !== playerId && this.memes.get(p.id)?.submitted)
            .map((p) => ({
              playerId: p.id,
              top: this.memes.get(p.id)!.top,
              bottom: this.memes.get(p.id)!.bottom,
            }))
        : null,
    };
  }
}
