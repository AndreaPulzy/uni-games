/** Tipi condivisi tra server e client. Il server e' autoritativo: il client
 *  riceve snapshot pubblici (TV) e viste private (telefono). */

export type PlayerId = string;
export type RoomCode = string;

export type Category = 'timed' | 'untimed' | 'team';

export const CATEGORY_LABEL: Record<Category, string> = {
  timed: 'A Tempo',
  untimed: 'Deduzione & Creativita',
  team: 'A Squadre',
};

export type GameId =
  | 'wordle'
  | 'connections'
  | 'ghost'
  | 'nerdle'
  | 'impostore-parola'
  | 'impostore-numeri'
  | 'nomi-cose-citta'
  | 'risposta-bastarda'
  | 'fabbrica-meme'
  | 'taboo'
  | 'intesa-vincente'
  | 'mimo'
  | 'top10';

export interface Player {
  id: PlayerId;
  name: string;
  avatar: string;      // emoji
  color: string;       // hex, assegnato dalla lobby
  connected: boolean;
  score: number;       // punteggio cumulativo di partita
  isHostDevice?: boolean;
}

export type TeamId = 'A' | 'B';

export interface Team {
  id: TeamId;
  name: string;
  color: string;
  members: PlayerId[];
  score: number;       // punteggio del round corrente
}

export type RoomPhase =
  | 'lobby'
  | 'intro'      // presentazione del prossimo minigioco
  | 'playing'
  | 'recap'      // punti del round + classifica aggiornata
  | 'final';

/** Snapshot pubblico: quello che vede la TV e, in forma ridotta, ogni telefono. */
export interface RoomState {
  code: RoomCode;
  phase: RoomPhase;
  players: Player[];
  teams: Team[] | null;
  settings: RoomSettings;
  /** indice del round corrente, 0-based */
  roundIndex: number;
  totalRounds: number;
  currentGame: GameId | null;
  currentCategory: Category | null;
  /** stato pubblico specifico del minigioco in corso */
  game: unknown;
  /** risultati del round appena concluso, per la schermata di recap */
  recap: RoundRecap | null;
  /** ms epoch di scadenza del timer server, null se nessun timer attivo */
  deadline: number | null;
  serverNow: number;
}

export interface RoomSettings {
  totalRounds: number;
  /** giochi esclusi manualmente dall'host */
  excluded: GameId[];
}

export interface RoundRecap {
  gameId: GameId;
  category: Category;
  /** riga per giocatore, ordinata per punti del round */
  rows: RecapRow[];
  /** testo che spiega la soluzione / esito, mostrato in TV */
  reveal: string[];
}

export interface RecapRow {
  playerId: PlayerId;
  raw: number;        // punteggio grezzo del minigioco
  points: number;     // punti dopo la curva, quelli che entrano in classifica
  detail: string;     // es. "Risolto in 4 tentativi - 38s rimasti"
  rankBefore: number;
  rankAfter: number;
}

/** Vista privata inviata al singolo telefono. */
export interface PrivateView {
  playerId: PlayerId;
  /** payload specifico del minigioco (la tua griglia, il tuo ruolo, ...) */
  game: unknown;
}

/* ------------------------------ protocollo ------------------------------ */

export interface ClientToServer {
  'host:create': (cb: (r: { code: RoomCode }) => void) => void;
  'host:attach': (p: { code: RoomCode }, cb: (r: Ack) => void) => void;
  'host:start': (p: { settings?: Partial<RoomSettings> }, cb: (r: Ack) => void) => void;
  'host:next': (cb: (r: Ack) => void) => void;
  'host:kick': (p: { playerId: PlayerId }, cb: (r: Ack) => void) => void;

  'player:join': (
    p: { code: RoomCode; name: string; token?: string },
    cb: (r: Ack & { playerId?: PlayerId; token?: string }) => void
  ) => void;

  'game:action': (p: { type: string; payload?: unknown }, cb?: (r: Ack) => void) => void;
}

export interface ServerToClient {
  room: (s: RoomState) => void;
  private: (v: PrivateView) => void;
  toast: (t: { kind: 'info' | 'good' | 'bad'; text: string }) => void;
  ended: (r: { reason: string }) => void;
}

export type Ack = { ok: true } | { ok: false; error: string };
