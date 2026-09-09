import type { Category, GameId } from './types.ts';
import { playableGames, type GameDef } from './catalog.ts';

export const CATEGORY_ORDER: Category[] = ['timed', 'untimed', 'team'];

/**
 * Costruisce la scaletta della partita alternando le categorie e senza
 * ripetere un gioco finche' la sua categoria non e' esaurita.
 * Se una categoria non ha giochi disponibili per quel numero di giocatori,
 * viene semplicemente saltata nel ciclo.
 */
export function buildSchedule(opts: {
  playerCount: number;
  rounds: number;
  excluded?: GameId[];
  rng?: () => number;
}): GameId[] {
  const rng = opts.rng ?? Math.random;
  const pool = playableGames(opts.playerCount, opts.excluded ?? []);

  const byCat = new Map<Category, GameDef[]>();
  for (const c of CATEGORY_ORDER) {
    byCat.set(c, shuffle(pool.filter((g) => g.category === c), rng));
  }

  const available = CATEGORY_ORDER.filter((c) => (byCat.get(c) ?? []).length > 0);
  if (available.length === 0) return [];

  const cursor = new Map<Category, number>(available.map((c) => [c, 0]));
  const schedule: GameId[] = [];

  for (let i = 0; i < opts.rounds; i++) {
    const cat = available[i % available.length];
    const list = byCat.get(cat)!;
    let idx = cursor.get(cat)!;
    if (idx >= list.length) {
      // categoria esaurita: rimescola e riparti, cosi le partite lunghe funzionano
      byCat.set(cat, shuffle(list, rng));
      idx = 0;
    }
    schedule.push(byCat.get(cat)![idx].id);
    cursor.set(cat, idx + 1);
  }
  return schedule;
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sorteggio squadre: random puro, dimensioni bilanciate. */
export function drawTeams<T>(ids: T[], rng: () => number = Math.random): [T[], T[]] {
  const s = shuffle(ids, rng);
  const half = Math.ceil(s.length / 2);
  return [s.slice(0, half), s.slice(half)];
}
