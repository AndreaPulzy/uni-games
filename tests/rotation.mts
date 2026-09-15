/** Test di logica pura: rotazione delle categorie, vincoli sul numero di
 *  giocatori e curva di punteggio. Non richiede il server acceso. */

import { GAMES, playableGames, isPlayable, gameDef, MIN_PLAYERS } from '../shared/src/catalog.ts';
import { buildSchedule, drawTeams } from '../shared/src/rotation.ts';
import { curveRound, scoreWordleLike, scoreConnections } from '../shared/src/scoring.ts';
import type { Category } from '../shared/src/types.ts';

let failures = 0;
const check = (label: string, ok: boolean, extra = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
};

/* ---------------------- vincoli per numero di giocatori ------------------- */

const table: Record<number, string[]> = {};
for (let n = 2; n <= 16; n++) {
  table[n] = GAMES.filter((g) => n >= g.minPlayers && n <= g.maxPlayers &&
    (!g.minPerTeam || n >= g.minPerTeam * 2)).map((g) => g.id);
}

console.log('\n  giochi disponibili per numero di giocatori');
for (let n = 3; n <= 12; n++) console.log(`   ${String(n).padStart(2)}  ${table[n].length} giochi`);

check('con 5 giocatori Intesa Vincente non e proponibile', !table[5].includes('intesa-vincente'));
check('con 6 giocatori Intesa Vincente si sblocca', table[6].includes('intesa-vincente'));
check('Ghost e un gioco da 3-4 giocatori', table[3].includes('ghost') && table[4].includes('ghost') && !table[5].includes('ghost'));
check('Impostore richiede almeno 4', !table[3].includes('impostore-parola') && table[4].includes('impostore-parola'));
check('i giochi a squadre richiedono almeno 4', !table[3].some((id) => gameDef(id as any).category === 'team'));

/* --------------------------- alternanza categorie ------------------------- */
/* buildSchedule filtra su `ready`, quindi qui usiamo un pool finto completo   */

const allReady = GAMES.map((g) => ({ ...g, ready: true }));
const origReady = GAMES.map((g) => g.ready);
GAMES.forEach((g, i) => (g.ready = allReady[i].ready));

const sched = buildSchedule({ playerCount: 8, rounds: 9 });
const cats = sched.map((id) => gameDef(id).category);
console.log('\n  scaletta con 8 giocatori:', sched.join(' → '));
console.log('  categorie:', cats.join(' → '));

check('9 round generati', sched.length === 9);
check('le categorie si alternano a rotazione',
  cats.every((c, i) => c === (['timed', 'untimed', 'team'] as Category[])[i % 3]), cats.join(','));

const timedUsed = sched.filter((_, i) => i % 3 === 0);
check('nessun gioco a tempo ripetuto nel primo giro', new Set(timedUsed).size === timedUsed.length, timedUsed.join(','));

const sched5 = buildSchedule({ playerCount: 5, rounds: 6 });
check('con 5 giocatori niente Intesa Vincente in scaletta', !sched5.includes('intesa-vincente'), sched5.join(','));

GAMES.forEach((g, i) => (g.ready = origReady[i]));

/* --------------------------------- squadre -------------------------------- */

for (const n of [4, 5, 7, 9]) {
  const ids = Array.from({ length: n }, (_, i) => `p${i}`);
  const [a, b] = drawTeams(ids);
  check(`squadre bilanciate con ${n} giocatori`,
    a.length + b.length === n && Math.abs(a.length - b.length) <= 1, `${a.length} vs ${b.length}`);
}

/* -------------------------------- punteggio ------------------------------- */

const fast = scoreWordleLike({ solved: true, attemptsUsed: 2, maxAttempts: 6, msRemaining: 70_000, msTotal: 90_000 });
const slow = scoreWordleLike({ solved: true, attemptsUsed: 5, maxAttempts: 6, msRemaining: 5_000, msTotal: 90_000 });
const none = scoreWordleLike({ solved: false, attemptsUsed: 6, maxAttempts: 6, msRemaining: 0, msTotal: 90_000 });
check('chi risolve prima e con meno tentativi prende di piu', fast > slow && slow > none, `${fast} > ${slow} > ${none}`);
check('chi non risolve prende 0 grezzo', none === 0);
check('il massimo grezzo non supera 1000', scoreWordleLike({ solved: true, attemptsUsed: 1, maxAttempts: 6, msRemaining: 90_000, msTotal: 90_000 }) <= 1000);
check('Connections completo batte 3 gruppi',
  scoreConnections({ groupsFound: 4, msRemaining: 60_000, msTotal: 120_000 }) >
  scoreConnections({ groupsFound: 3, msRemaining: 60_000, msTotal: 120_000 }));

const curved = curveRound({ a: 950, b: 400, c: 0 });
check('il migliore del round vale 1000', curved.a === 1000, JSON.stringify(curved));
check('chi fa zero prende il pavimento', curved.c === 100);
check('i punti intermedi sono proporzionali', curved.b > 100 && curved.b < 1000, `${curved.b}`);

const allZero = curveRound({ a: 0, b: 0 });
check('round senza vincitori: tutti al pavimento', allZero.a === 100 && allZero.b === 100);

console.log(failures === 0 ? '\n  TUTTO OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
