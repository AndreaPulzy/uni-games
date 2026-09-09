import type { Player, PlayerId, Team, GameId } from '../../shared/src/types.ts';

/** Esito di un round, prodotto dal minigioco e consumato dalla Room. */
export interface GameResult {
  /** punteggio grezzo per giocatore (prima della curva di round) */
  raw: Record<PlayerId, number>;
  /** riga di dettaglio mostrata nel recap, es. "Risolto in 4 tentativi" */
  detail: Record<PlayerId, string>;
  /** testo di rivelazione mostrato sulla TV (soluzione, esito, ...) */
  reveal: string[];
}

/** Servizi che la Room mette a disposizione del minigioco in corso. */
export interface GameContext {
  players: Player[];
  teams: Team[] | null;
  rng: () => number;
  /** forza un push dello stato pubblico + viste private a tutti */
  push(): void;
  /** imposta la scadenza del timer server; null lo azzera */
  setDeadline(msFromNow: number | null): void;
  deadline(): number | null;
  /** conclude il round e passa al recap */
  finish(result: GameResult): void;
  /** messaggio effimero: playerId null = tutti */
  toast(playerId: PlayerId | null, kind: 'info' | 'good' | 'bad', text: string): void;
  player(id: PlayerId): Player | undefined;
  teamOf(id: PlayerId): Team | null;
}

/** Base di ogni minigioco. Istanziata una volta per round. */
export abstract class MiniGame {
  constructor(protected ctx: GameContext) {}

  /** invocato quando la fase passa a 'playing' */
  abstract start(): void;

  /** snapshot visibile sulla TV e a tutti i telefoni */
  abstract publicState(): unknown;

  /** vista riservata al singolo giocatore (la sua griglia, il suo ruolo, ...) */
  privateState(_playerId: PlayerId): unknown {
    return null;
  }

  /** azione ricevuta da un telefono */
  action(_playerId: PlayerId, _type: string, _payload: unknown): void {}

  /** l'host preme "avanti" dalla TV: usato dai giochi con fasi di discussione */
  hostAdvance(): void {}

  /** invocato ogni secondo mentre il round e' attivo */
  tick(): void {}

  /** invocato quando scade la deadline impostata con setDeadline */
  onDeadline(): void {}

  /** invocato se un giocatore si disconnette a meta' round */
  onDisconnect(_playerId: PlayerId): void {}
}

export type MiniGameFactory = (ctx: GameContext) => MiniGame;
export type Registry = Partial<Record<GameId, MiniGameFactory>>;
