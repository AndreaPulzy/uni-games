import type { PlayerId } from '../../../shared/src/types.ts';
import { MiniGame, type GameContext } from '../minigame.ts';
import { isWord, hasPrefix, anyWordWithPrefix } from '../data/dictionary.ts';
import { scoreByRank } from '../../../shared/src/scoring.ts';

const TURN_MS = 7_000;
const DEFEND_MS = 15_000;
const VOTE_MS = 20_000;
const BREAK_MS = 3_500;
const MIN_WORD = 4;
const GHOST = 'GHOST';

type Mode = 'letter' | 'defend' | 'vote' | 'break';

interface Challenge {
  challenger: PlayerId;
  challenged: PlayerId;
  claimedWord?: string;
}
interface Vote {
  question: string;
  /** chi perde se il gruppo risponde SI / NO */
  loserIfYes: PlayerId;
  loserIfNo: PlayerId;
  eligible: PlayerId[];
  answers: Map<PlayerId, boolean>;
}

export class GhostGame extends MiniGame {
  private mode: Mode = 'letter';
  private sequence = '';
  private order: PlayerId[] = [];
  private turnIdx = 0;
  private lastLetterBy: PlayerId | null = null;
  private letters = new Map<PlayerId, number>();   // lettere di G-H-O-S-T accumulate
  private out = new Set<PlayerId>();
  private challenge: Challenge | null = null;
  private vote: Vote | null = null;
  private log: string[] = [];
  private handsPlayed = 0;
  private lastLoser: PlayerId | null = null;
  /** in ordine di uscita: serve per la classifica finale del round */
  private eliminated: { id: PlayerId; hand: number; reason: 'lettere' | 'uscito' }[] = [];
  /** l'ultima eliminazione e' avvenuta: dopo la pausa si passa ai punti */
  private decided = false;

  constructor(ctx: GameContext) { super(ctx); }

  start(): void {
    this.order = this.ctx.players.map((p) => p.id);
    for (const id of this.order) this.letters.set(id, 0);
    this.newHand(0);
  }

  /* ------------------------------- manche -------------------------------- */

  private get alive(): PlayerId[] {
    return this.order.filter((id) => !this.out.has(id));
  }

  private newHand(startIdx: number): void {
    this.sequence = '';
    this.lastLetterBy = null;
    this.challenge = null;
    this.vote = null;
    this.mode = 'letter';
    this.turnIdx = this.normalizeIdx(startIdx);
    this.ctx.setDeadline(TURN_MS);
    this.ctx.push();
  }

  private normalizeIdx(i: number): number {
    const n = this.order.length;
    for (let k = 0; k < n; k++) {
      const idx = ((i + k) % n + n) % n;
      if (!this.out.has(this.order[idx])) return idx;
    }
    return 0;
  }

  private get currentId(): PlayerId | null {
    return this.order[this.turnIdx] ?? null;
  }

  private advanceTurn(): void {
    this.turnIdx = this.normalizeIdx(this.turnIdx + 1);
    this.ctx.setDeadline(TURN_MS);
  }

  /* -------------------------------- azioni ------------------------------- */

  action(playerId: PlayerId, type: string, payload: unknown): void {
    if (this.out.has(playerId)) return;

    switch (type) {
      case 'letter':   return this.onLetter(playerId, payload);
      case 'challenge': return this.onChallenge(playerId);
      case 'claim':    return this.onClaim(playerId);
      case 'defend':   return this.onDefend(playerId, payload);
      case 'vote':     return this.onVote(playerId, payload);
    }
  }

  private onLetter(playerId: PlayerId, payload: unknown): void {
    if (this.mode !== 'letter' || playerId !== this.currentId) return;
    const ch = String((payload as { ch?: string })?.ch ?? '').trim().toUpperCase();
    if (!/^[A-Z]$/.test(ch)) return this.ctx.toast(playerId, 'bad', 'Una sola lettera');

    const next = this.sequence + ch;

    // parola compiuta riconosciuta dal dizionario: manche persa senza discussioni
    if (next.length >= MIN_WORD && isWord(next)) {
      this.sequence = next;
      this.lastLetterBy = playerId;
      this.log.push(`${this.nameOf(playerId)} chiude ${next}`);
      return this.loseHand(playerId, `${next} e una parola compiuta`);
    }

    this.sequence = next;
    this.lastLetterBy = playerId;
    this.advanceTurn();
    this.ctx.push();
  }

  private onChallenge(playerId: PlayerId): void {
    if (this.mode !== 'letter' || playerId !== this.currentId) return;
    if (!this.lastLetterBy || this.sequence.length === 0)
      return this.ctx.toast(playerId, 'bad', 'Non c e ancora nulla da contestare');

    this.challenge = { challenger: playerId, challenged: this.lastLetterBy };
    this.mode = 'defend';
    this.ctx.setDeadline(DEFEND_MS);
    this.ctx.toast(null, 'info', `${this.nameOf(playerId)} contesta ${this.nameOf(this.lastLetterBy)}`);
    this.ctx.push();
  }

  /** "Quella e' gia' una parola": lo dichiara chi non ha messo l'ultima lettera. */
  private onClaim(playerId: PlayerId): void {
    if (this.mode !== 'letter') return;
    if (!this.lastLetterBy || playerId === this.lastLetterBy) return;
    if (this.sequence.length < MIN_WORD)
      return this.ctx.toast(playerId, 'bad', `Servono almeno ${MIN_WORD} lettere`);

    if (isWord(this.sequence)) return this.loseHand(this.lastLetterBy, `${this.sequence} e una parola compiuta`);

    this.openVote({
      question: `"${this.sequence}" e una parola italiana compiuta?`,
      loserIfYes: this.lastLetterBy,
      loserIfNo: playerId,
      exclude: [playerId, this.lastLetterBy],
    });
  }

  private onDefend(playerId: PlayerId, payload: unknown): void {
    if (this.mode !== 'defend' || !this.challenge || playerId !== this.challenge.challenged) return;
    const word = String((payload as { word?: string })?.word ?? '').trim().toUpperCase();

    if (!word.startsWith(this.sequence))
      return this.ctx.toast(playerId, 'bad', `Deve iniziare per ${this.sequence}`);
    if (word.length < MIN_WORD)
      return this.ctx.toast(playerId, 'bad', `Almeno ${MIN_WORD} lettere`);

    this.challenge.claimedWord = word;

    // parola nota: il contestatore ha sbagliato a fidarsi del proprio sospetto
    if (isWord(word)) return this.loseHand(this.challenge.challenger, `${word} esiste davvero`);

    this.openVote({
      question: `"${word}" esiste in italiano?`,
      loserIfYes: this.challenge.challenger,
      loserIfNo: this.challenge.challenged,
      exclude: [this.challenge.challenger, this.challenge.challenged],
    });
  }

  private openVote(o: { question: string; loserIfYes: PlayerId; loserIfNo: PlayerId; exclude: PlayerId[] }): void {
    const eligible = this.alive.filter((id) => !o.exclude.includes(id));
    // con pochissimi giocatori nessuno resta a votare: decide il dizionario, gia' consultato
    if (eligible.length === 0) return this.loseHand(o.loserIfNo, 'Nessuno puo votare: vale il dizionario');

    this.vote = { question: o.question, loserIfYes: o.loserIfYes, loserIfNo: o.loserIfNo, eligible, answers: new Map() };
    this.mode = 'vote';
    this.ctx.setDeadline(VOTE_MS);
    this.ctx.push();
  }

  private onVote(playerId: PlayerId, payload: unknown): void {
    if (this.mode !== 'vote' || !this.vote) return;
    if (!this.vote.eligible.includes(playerId)) return;
    this.vote.answers.set(playerId, Boolean((payload as { yes?: boolean })?.yes));
    if (this.vote.answers.size >= this.vote.eligible.length) this.closeVote();
    else this.ctx.push();
  }

  private closeVote(): void {
    if (!this.vote) return;
    const yes = [...this.vote.answers.values()].filter(Boolean).length;
    const no = this.vote.answers.size - yes;
    // in parita' si da ragione a chi difende la parola
    const said = yes >= no;
    const loser = said ? this.vote.loserIfYes : this.vote.loserIfNo;
    const q = this.vote.question;
    this.vote = null;
    this.loseHand(loser, `Il gruppo ha detto ${said ? 'SI' : 'NO'} — ${q}`);
  }

  /* ------------------------------ esito manche ---------------------------- */

  private loseHand(playerId: PlayerId, reason: string): void {
    const n = (this.letters.get(playerId) ?? 0) + 1;
    this.letters.set(playerId, n);
    this.lastLoser = playerId;
    this.handsPlayed++;
    this.log.push(`${this.nameOf(playerId)} prende la ${GHOST[n - 1]} — ${reason}`);
    this.ctx.toast(null, 'bad', `${this.nameOf(playerId)} perde la manche: ${reason}`);

    if (n >= GHOST.length) {
      this.out.add(playerId);
      this.eliminated.push({ id: playerId, hand: this.handsPlayed, reason: 'lettere' });
      this.ctx.toast(null, 'info', `${this.nameOf(playerId)} è eliminato`);
    }

    this.challenge = null;
    this.vote = null;

    // eliminazione pura: si gioca finche' non resta un solo giocatore.
    // Con 3-4 giocatori le manche sono al massimo 14-19, quindi il round finisce sempre.
    if (this.alive.length <= 1) {
      // l'eliminazione decisiva resta a schermo qualche secondo prima dei punti
      this.decided = true;
      this.mode = 'break';
      this.ctx.setDeadline(BREAK_MS);
      this.ctx.push();
      return;
    }

    // pausa per far leggere l'esito, poi si riparte da chi ha perso
    this.mode = 'break';
    this.ctx.setDeadline(BREAK_MS);
    this.ctx.push();
  }

  onDeadline(): void {
    switch (this.mode) {
      case 'letter': {
        const id = this.currentId;
        if (id) this.loseHand(id, 'tempo scaduto');
        break;
      }
      case 'defend': {
        if (this.challenge) this.loseHand(this.challenge.challenged, 'non ha saputo dire la parola');
        break;
      }
      case 'vote':
        this.closeVote();
        break;
      case 'break': {
        if (this.decided) return this.conclude();
        const loserIdx = this.order.findIndex((id) => id === this.lastLoser);
        this.newHand(loserIdx >= 0 ? loserIdx : this.turnIdx);
        break;
      }
    }
  }


  onDisconnect(playerId: PlayerId): void {
    if (this.out.has(playerId)) return;
    this.out.add(playerId);
    this.eliminated.push({ id: playerId, hand: this.handsPlayed, reason: 'uscito' });
    if (this.alive.length <= 1) this.conclude();
    else if (this.mode === 'letter' && this.currentId === playerId) { this.advanceTurn(); this.ctx.push(); }
  }

  private conclude(): void {
    this.ctx.setDeadline(null);

    // classifica: prima chi e' ancora in piedi, poi gli eliminati dall'ultimo al primo
    const inGame = new Set(this.ctx.players.map((p) => p.id));
    const survivors = this.alive.filter((id) => inGame.has(id));
    const fallen = [...this.eliminated].reverse().filter((e) => inGame.has(e.id));
    const ranking = [
      ...survivors.map((id) => ({ id, pos: 1 })),
      ...fallen.map((e, i) => ({ id: e.id, pos: survivors.length + i + 1 })),
    ];

    const raw: Record<PlayerId, number> = {};
    const detail: Record<PlayerId, string> = {};
    for (const r of ranking) {
      raw[r.id] = scoreByRank(r.pos, ranking.length);
      const lettere = this.letters.get(r.id) ?? 0;
      const e = this.eliminated.find((x) => x.id === r.id);
      detail[r.id] = !e
        ? `Ultimo sopravvissuto · ${lettere ? GHOST.slice(0, lettere) : 'nessuna lettera'}`
        : e.reason === 'uscito'
          ? `${r.pos}° posto · uscito dalla partita`
          : `${r.pos}° posto · eliminato alla manche ${e.hand}`;
    }

    const headline = survivors.length === 1
      ? `${this.nameOf(survivors[0])} è l'ultimo sopravvissuto`
      : survivors.length > 1
        ? `Restano in piedi: ${survivors.map((id) => this.nameOf(id)).join(', ')}`
        : 'Nessun sopravvissuto';
    const order = this.eliminated
      .map((e) => `${this.nameOf(e.id)} (manche ${e.hand})`)
      .join(' → ');

    this.ctx.finish({
      raw,
      detail,
      reveal: [headline, order ? `Eliminati: ${order}` : 'Nessuno eliminato'],
    });
  }

  private nameOf(id: PlayerId): string {
    return this.ctx.player(id)?.name ?? '???';
  }

  /* ------------------------------- snapshot ------------------------------- */

  publicState() {
    return {
      mode: this.mode,
      sequence: this.sequence,
      currentPlayerId: this.mode === 'letter' ? this.currentId : null,
      lastLetterBy: this.lastLetterBy,
      minWord: MIN_WORD,
      ghost: GHOST,
      players: this.order.map((id) => ({
        playerId: id,
        letters: this.letters.get(id) ?? 0,
        out: this.out.has(id),
      })),
      challenge: this.challenge
        ? { challenger: this.challenge.challenger, challenged: this.challenge.challenged, claimedWord: this.challenge.claimedWord }
        : null,
      vote: this.vote
        ? { question: this.vote.question, received: this.vote.answers.size, total: this.vote.eligible.length }
        : null,
      log: this.log.slice(-4),
    };
  }

  privateState(playerId: PlayerId) {
    const out = this.out.has(playerId);
    return {
      out,
      letters: this.letters.get(playerId) ?? 0,
      sequence: this.sequence,
      myTurn: this.mode === 'letter' && this.currentId === playerId && !out,
      canChallenge: this.mode === 'letter' && this.currentId === playerId && this.sequence.length > 0,
      canClaim: this.mode === 'letter' && !!this.lastLetterBy && this.lastLetterBy !== playerId
                && this.sequence.length >= MIN_WORD && !out,
      mustDefend: this.mode === 'defend' && this.challenge?.challenged === playerId,
      mustVote: this.mode === 'vote' && !!this.vote?.eligible.includes(playerId) && !this.vote.answers.has(playerId),
      voteQuestion: this.vote?.question ?? null,
      hint: this.mode === 'defend' && this.challenge?.challenged === playerId
        ? anyWordWithPrefix(this.sequence, MIN_WORD) !== null
        : null,
      sequenceAlive: hasPrefix(this.sequence),
    };
  }
}
