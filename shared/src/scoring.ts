import type { PlayerId } from './types.ts';

/** Punti garantiti a chi ha partecipato al round, anche con grezzo 0. */
export const PARTICIPATION_FLOOR = 100;
/** Punti del migliore di ogni round, dopo la curva. */
export const ROUND_TOP = 1000;

/**
 * Curva di round: il grezzo migliore viene scalato a ROUND_TOP, gli altri in
 * proporzione, con un pavimento di partecipazione. Serve a evitare che un
 * minigioco mal calibrato (o troppo facile) pesi il doppio degli altri.
 *
 * raw: grezzo per giocatore. Chi non compare nella mappa non ha partecipato
 * e prende 0.
 */
export function curveRound(raw: Record<PlayerId, number>): Record<PlayerId, number> {
  const ids = Object.keys(raw);
  const out: Record<PlayerId, number> = {};
  if (ids.length === 0) return out;

  const best = Math.max(...ids.map((id) => raw[id]));
  for (const id of ids) {
    if (best <= 0) {
      out[id] = PARTICIPATION_FLOOR;
    } else {
      const share = Math.max(0, raw[id]) / best;
      out[id] = Math.round(PARTICIPATION_FLOOR + (ROUND_TOP - PARTICIPATION_FLOOR) * share);
    }
  }
  return out;
}

/* ------------------- formule grezze dei singoli giochi ------------------- */

/** Wordle / Nerdle: completamento + efficienza + velocita. Max 1000. */
export function scoreWordleLike(opts: {
  solved: boolean;
  attemptsUsed: number;      // 1..maxAttempts
  maxAttempts: number;
  msRemaining: number;
  msTotal: number;
}): number {
  if (!opts.solved) return 0;
  const completion = 500;
  const efficiency = Math.max(0, opts.maxAttempts + 1 - opts.attemptsUsed) * (300 / opts.maxAttempts);
  const speed = 200 * clamp01(opts.msRemaining / opts.msTotal);
  return Math.round(completion + efficiency + speed);
}

/** Connections: 150 per gruppo, 200 se completi, 200 di velocita. Max 1000. */
export function scoreConnections(opts: {
  groupsFound: number;       // 0..4
  msRemaining: number;
  msTotal: number;
}): number {
  const base = 150 * opts.groupsFound;
  const complete = opts.groupsFound === 4 ? 200 : 0;
  const speed = opts.groupsFound === 4 ? 200 * clamp01(opts.msRemaining / opts.msTotal) : 0;
  return Math.round(base + complete + speed);
}

/** Piazzamento generico: 1o = 1000, ultimo = 0, lineare. */
export function scoreByRank(rank: number, total: number): number {
  if (total <= 1) return ROUND_TOP;
  return Math.round(ROUND_TOP * (1 - (rank - 1) / (total - 1)));
}

/** Nomi Cose Citta: 10 unica / 5 duplicata / 0 nulla, su 6 caselle. */
export const NCC_UNIQUE = 10;
export const NCC_DUPLICATE = 5;
export const NCC_STOP_BONUS = 1; // in "unita casella", convertito sotto

export function scoreNomiCoseCitta(opts: { cells: number[]; pressedStop: boolean }): number {
  const sum = opts.cells.reduce((a, b) => a + b, 0);            // max 60
  const bonus = opts.pressedStop ? 6 : 0;
  return Math.round(((sum + bonus) / 66) * 1000);
}

/** Quote di voto -> punti. Usato da Risposta Bastarda e Fabbrica di Meme. */
export function scoreByVoteShare(opts: {
  votes: number;
  totalVotes: number;
  plein?: boolean;
}): number {
  if (opts.totalVotes <= 0) return 0;
  const base = 1000 * (opts.votes / opts.totalVotes);
  return Math.round(Math.min(1000, base + (opts.plein ? 100 : 0)));
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
