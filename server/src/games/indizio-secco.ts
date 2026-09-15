import type { PlayerId, TeamId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { INDIZIO_CARDS, type IndizioCard } from '../data/indizio.ts';
import { shuffle } from '../../../shared/src/rotation.ts';
import { simplify } from './fuzzy.ts';

const WORDS = 6;
/** punti per chi indovina, in base a quanti indizi sono serviti */
const POINTS = [10, 8, 6, 5, 4, 3];
const MAX_CLUES = POINTS.length;
const CLUE_MS = 30_000;
const GUESS_MS = 25_000;
const REVEAL_MS = 6_000;
const RAW_PER_POINT = 20;

type Phase = 'clue' | 'guess' | 'reveal';

interface Clue { team: TeamId; giver: PlayerId | null; word: string }

const other = (t: TeamId): TeamId => (t === 'A' ? 'B' : 'A');
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Indizio Secco: stessa parola segreta per le due squadre. Chi da' gli indizi
 * ne dice una sola; se la sua squadra sbaglia, la palla passa agli avversari,
 * che sentono anche gli indizi gia' detti. A giudicare la risposta e' chi da'
 * gli indizi nella squadra avversaria: conosce la parola e non ha interesse a
 * regalare punti.
 */
export class IndizioSeccoGame extends MiniGame {
  private phase: Phase = 'clue';
  private deck: IndizioCard[] = [];
  private wordIdx = 0;
  private clues: Clue[] = [];
  private turnTeam: TeamId = 'A';
  private givers: Record<TeamId, PlayerId | null> = { A: null, B: null };
  private scores: Record<TeamId, number> = { A: 0, B: 0 };
  private outcome: { team: TeamId | null; points: number } | null = null;
  private history: { parola: string; team: TeamId | null; points: number }[] = [];

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    if (!this.ctx.teams || this.ctx.teams.length < 2) {
      return this.ctx.finish({ raw: {}, detail: {}, reveal: ['Squadre non disponibili'] });
    }
    this.deck = shuffle(INDIZIO_CARDS, this.ctx.rng).slice(0, WORDS);
    this.newWord();
  }

  private get card(): IndizioCard {
    return this.deck[this.wordIdx];
  }

  private members(team: TeamId): PlayerId[] {
    const active = new Set(this.ctx.players.map((p) => p.id));
    return (this.ctx.teams?.find((t) => t.id === team)?.members ?? []).filter((id) => active.has(id));
  }

  /** chi da' gli indizi cambia a ogni parola, in entrambe le squadre */
  private assignGivers(): void {
    for (const team of ['A', 'B'] as TeamId[]) {
      const m = this.members(team);
      this.givers[team] = m.length ? m[this.wordIdx % m.length] : null;
    }
  }

  /** se chi da' gli indizi esce, lo sostituisce il prossimo della squadra */
  private repairGivers(): void {
    for (const team of ['A', 'B'] as TeamId[]) {
      const m = this.members(team);
      const cur = this.givers[team];
      if (!cur || !m.includes(cur)) this.givers[team] = m.length ? m[this.wordIdx % m.length] : null;
    }
  }

  private newWord(): void {
    this.clues = [];
    this.outcome = null;
    this.turnTeam = this.wordIdx % 2 === 0 ? 'A' : 'B';
    this.assignGivers();
    this.toClue();
  }

  private toClue(): void {
    this.phase = 'clue';
    this.ctx.setDeadline(CLUE_MS);
    this.ctx.push();
  }

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (this.phase === 'clue' && type === 'clue') return this.onClue(playerId, payload);
    if (this.phase === 'guess' && type === 'judge') return this.onJudge(playerId, payload);
  }

  /** blocca l'indizio che contiene la parola segreta o una sua parte lunga */
  private revealsSecret(word: string): boolean {
    const w = plain(word);
    const secret = plain(this.card.parola);
    if (!w) return false;
    if (w.includes(secret) || (w.length >= 3 && secret.includes(w))) return true;
    return this.card.parola
      .split(/[\s'-]+/)
      .map(plain)
      .filter((part) => part.length >= 4)
      .some((part) => w.includes(part));
  }

  private onClue(playerId: PlayerId, payload: unknown): void {
    if (playerId !== this.givers[this.turnTeam]) return;
    const word = String((payload as { word?: string })?.word ?? '').trim();
    if (!word) return this.ctx.toast(playerId, 'bad', 'Scrivi un indizio');
    if (/\s/.test(word)) return this.ctx.toast(playerId, 'bad', 'Una parola sola');
    if (word.length > 24) return this.ctx.toast(playerId, 'bad', 'Parola troppo lunga');
    if (this.revealsSecret(word)) return this.ctx.toast(playerId, 'bad', 'Non puoi usare la parola segreta');
    if (this.clues.some((c) => simplify(c.word) === simplify(word)))
      return this.ctx.toast(playerId, 'bad', 'Questo indizio è già stato detto');

    this.clues.push({ team: this.turnTeam, giver: playerId, word });
    this.phase = 'guess';
    this.ctx.setDeadline(GUESS_MS);
    this.ctx.push();
  }

  private get judgeId(): PlayerId | null {
    return this.givers[other(this.turnTeam)];
  }

  private onJudge(playerId: PlayerId, payload: unknown): void {
    if (playerId !== this.judgeId) return;
    if ((payload as { correct?: boolean })?.correct === true) {
      const points = POINTS[this.clues.length - 1] ?? 0;
      this.scores[this.turnTeam] += points;
      this.ctx.toast(null, 'good', `${this.teamName(this.turnTeam)} indovina: +${points}`);
      return this.toReveal(this.turnTeam, points);
    }
    this.ctx.toast(null, 'bad', 'Risposta sbagliata');
    this.missed();
  }

  /** risposta sbagliata o tempo scaduto: la palla passa agli avversari */
  private missed(): void {
    if (this.clues.length >= MAX_CLUES) return this.toReveal(null, 0);
    this.turnTeam = other(this.turnTeam);
    this.repairGivers();
    this.toClue();
  }

  private toReveal(team: TeamId | null, points: number): void {
    this.outcome = { team, points };
    this.history.push({ parola: this.card.parola, team, points });
    this.phase = 'reveal';
    this.ctx.setDeadline(REVEAL_MS);
    this.ctx.push();
  }

  private nextWord(): void {
    this.wordIdx++;
    if (this.wordIdx >= this.deck.length) return this.conclude();
    this.newWord();
  }

  onDeadline(): void {
    switch (this.phase) {
      case 'clue':
        // chi doveva suggerire non l'ha fatto: l'indizio si considera bruciato e il turno passa
        this.clues.push({ team: this.turnTeam, giver: null, word: '—' });
        this.ctx.toast(null, 'bad', `${this.teamName(this.turnTeam)} non ha dato l'indizio in tempo`);
        return this.missed();
      case 'guess':
        this.ctx.toast(null, 'bad', 'Tempo scaduto');
        return this.missed();
      case 'reveal':
        return this.nextWord();
    }
  }

  directorPrompt(): string | null {
    return this.phase === 'reveal' ? 'Parola successiva' : null;
  }

  hostAdvance(): void {
    if (this.phase === 'reveal') this.nextWord();
  }

  onDisconnect(): void {
    this.repairGivers();
    this.ctx.push();
  }

  private teamName(t: TeamId): string {
    return this.ctx.teams?.find((x) => x.id === t)?.name ?? `Squadra ${t}`;
  }

  private worth(): number {
    return this.phase === 'guess' ? POINTS[this.clues.length - 1] ?? 0 : POINTS[this.clues.length] ?? 0;
  }

  private conclude(): void {
    this.ctx.setDeadline(null);
    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};
    for (const p of this.ctx.players) {
      const team = this.ctx.teamOf(p.id);
      const pts = team ? this.scores[team.id] : 0;
      raw[p.id] = pts * RAW_PER_POINT;
      detail[p.id] = team ? `${team.name}: ${pts} punti` : 'Fuori squadra';
    }
    const a = this.scores.A;
    const b = this.scores.B;
    this.ctx.finish({
      raw,
      detail,
      reveal: [
        a === b ? `Pareggio ${a} a ${b}` : `${this.teamName(a > b ? 'A' : 'B')} vince ${Math.max(a, b)} a ${Math.min(a, b)}`,
        this.history.map((h) => `${h.parola} ${h.team ? `(+${h.points})` : '(nessuno)'}`).join(' · '),
      ],
    });
  }

  publicState() {
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      wordIndex: this.wordIdx,
      wordTotal: this.deck.length,
      categoria: this.card?.categoria ?? '',
      clues: this.clues.map((c) => ({ team: c.team, word: c.word })),
      turnTeam: this.turnTeam,
      scores: this.scores,
      givers: this.givers,
      judgeId: this.judgeId,
      maxClues: MAX_CLUES,
      worth: this.worth(),
      parola: reveal ? this.card.parola : null,
      outcome: reveal ? this.outcome : null,
    };
  }

  privateState(playerId: PlayerId) {
    const team = this.ctx.teamOf(playerId)?.id ?? null;
    const isGiver = team !== null && this.givers[team] === playerId;
    const reveal = this.phase === 'reveal';
    return {
      phase: this.phase,
      myTeam: team,
      isGiver,
      parola: isGiver || reveal ? this.card?.parola ?? null : null,
      categoria: this.card?.categoria ?? '',
      myTurnToClue: this.phase === 'clue' && this.givers[this.turnTeam] === playerId,
      mustJudge: this.phase === 'guess' && this.judgeId === playerId,
      guessingTeam: this.turnTeam,
      clues: this.clues.map((c) => ({ team: c.team, word: c.word })),
      lastClue: this.clues.length ? this.clues[this.clues.length - 1].word : null,
      worth: this.worth(),
    };
  }
}
