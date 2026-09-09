/** Verifica che la migrazione dello schema legacy non perda dati.
 *  Costruisce un database con lo schema della prima versione, lo popola,
 *  poi lo apre col modulo aggiornato e controlla che tutto sia ancora li. */

import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let failures = 0;
const check = (label: string, ok: boolean, extra = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
};

const dir = mkdtempSync(join(tmpdir(), 'unigames-mig-'));
const path = join(dir, 'legacy.db');

/* schema della prima versione: ended_at NOT NULL e nessuna colonna completed */
const legacy = new Database(path);
legacy.exec(`
  CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER NOT NULL,
    rounds INTEGER NOT NULL,
    schedule TEXT NOT NULL
  );
  CREATE TABLE match_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    name TEXT NOT NULL, avatar TEXT NOT NULL,
    score INTEGER NOT NULL, position INTEGER NOT NULL
  );
`);
legacy.prepare(`INSERT INTO matches (code, started_at, ended_at, rounds, schedule) VALUES ('ABCD', 1, 2, 9, '[]')`).run();
for (const [i, n] of ['Andrea', 'Giulia', 'Marco'].entries()) {
  legacy.prepare(`INSERT INTO match_players (match_id, name, avatar, score, position) VALUES (1, ?, '🦊', ?, ?)`)
    .run(n, 1000 - i * 100, i + 1);
}
legacy.close();

process.env.DB_PATH = path;
const m = await import('../server/src/db.ts');

const info = m.db.prepare(`PRAGMA table_info(matches)`).all() as any[];
const endedAt = info.find((c) => c.name === 'ended_at');
check('ended_at ora ammette NULL', endedAt.notnull === 0);
check('colonna completed aggiunta', info.some((c) => c.name === 'completed'));
check('la partita legacy e conservata', (m.db.prepare(`SELECT COUNT(*) n FROM matches`).get() as any).n === 1);
check('i giocatori NON sono stati cancellati dal cascade',
  (m.db.prepare(`SELECT COUNT(*) n FROM match_players`).get() as any).n === 3,
  `${(m.db.prepare(`SELECT COUNT(*) n FROM match_players`).get() as any).n} righe`);
check('la partita legacy risulta completata', (m.db.prepare(`SELECT completed FROM matches WHERE id = 1`).get() as any).completed === 1);
check('albo d oro legge i dati migrati', (m.hallOfFame(5) as any[]).length === 3);

// una nuova partita deve poter nascere senza ended_at
const id = m.db.prepare(`INSERT INTO matches (code, started_at, rounds, schedule) VALUES ('WXYZ', ?, 3, '[]')`).run(Date.now());
check('nuova partita inseribile senza ended_at', id.changes === 1);

m.db.close();
rmSync(dir, { recursive: true, force: true });
console.log(failures === 0 ? '\n  MIGRAZIONE OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
