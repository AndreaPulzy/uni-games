import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { RoundRecap, Player } from '../../shared/src/types.ts';
import type { Room } from './room.ts';

const DB_PATH = process.env.DB_PATH
  ?? fileURLToPath(new URL('../data/uni-games.db', import.meta.url));

/** Se il disco non e' scrivibile (host in sola lettura, permessi, volume assente)
 *  la partita deve comunque potersi giocare: si ripiega su un database in memoria
 *  e si perde solo l'archivio storico. */
function openDatabase(): { handle: Database.Database; persistent: boolean } {
  try {
    mkdirSync(dirname(DB_PATH), { recursive: true });
    const handle = new Database(DB_PATH);
    handle.pragma('journal_mode = WAL');
    return { handle, persistent: true };
  } catch (e) {
    console.warn(`[db] disco non disponibile (${(e as Error).message}); archivio solo in memoria`);
    return { handle: new Database(':memory:'), persistent: false };
  }
}

const opened = openDatabase();
export const db = opened.handle;
/** false quando l'archivio vive solo in memoria e sparisce al riavvio */
export const isPersistent = opened.persistent;

db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    code        TEXT    NOT NULL,
    started_at  INTEGER NOT NULL,
    ended_at    INTEGER,
    rounds      INTEGER NOT NULL DEFAULT 0,
    schedule    TEXT    NOT NULL DEFAULT '[]',
    completed   INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS match_players (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id  INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    name      TEXT    NOT NULL,
    avatar    TEXT    NOT NULL,
    score     INTEGER NOT NULL,
    position  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS match_rounds (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id     INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    round_index  INTEGER NOT NULL,
    game_id      TEXT    NOT NULL,
    category     TEXT    NOT NULL,
    player_name  TEXT    NOT NULL,
    raw          INTEGER NOT NULL,
    points       INTEGER NOT NULL,
    detail       TEXT    NOT NULL DEFAULT '',
    played_at    INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_players_match ON match_players(match_id);
  CREATE INDEX IF NOT EXISTS idx_players_name  ON match_players(name);
  CREATE INDEX IF NOT EXISTS idx_rounds_match   ON match_rounds(match_id);
  CREATE INDEX IF NOT EXISTS idx_rounds_game    ON match_rounds(game_id);
  CREATE INDEX IF NOT EXISTS idx_rounds_player  ON match_rounds(player_name);
`);

/* ------------------------------- migrazioni -------------------------------- */

/** Nella prima versione la partita veniva salvata solo a fine gioco, quindi
 *  `ended_at` era NOT NULL. Ora la riga nasce all'avvio e si chiude dopo, percio'
 *  la colonna deve accettare NULL: SQLite non sa allentare un vincolo, si
 *  ricostruisce la tabella conservando le partite gia' archiviate. */
function migrateMatches(): void {
  const info = db.prepare(`PRAGMA table_info(matches)`).all() as { name: string; notnull: number }[];
  if (info.length === 0) return;

  const endedAt = info.find((c) => c.name === 'ended_at');
  const hasCompleted = info.some((c) => c.name === 'completed');

  if (endedAt && endedAt.notnull === 1) {
    // better-sqlite3 tiene le foreign key attive: senza spegnerle il DROP
    // cancellerebbe a cascata giocatori e round delle partite archiviate
    db.pragma('foreign_keys = OFF');
    db.exec(`
      BEGIN;
      CREATE TABLE matches_new (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        code        TEXT    NOT NULL,
        started_at  INTEGER NOT NULL,
        ended_at    INTEGER,
        rounds      INTEGER NOT NULL DEFAULT 0,
        schedule    TEXT    NOT NULL DEFAULT '[]',
        completed   INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO matches_new (id, code, started_at, ended_at, rounds, schedule, completed)
        SELECT id, code, started_at, ended_at, rounds, schedule, 1 FROM matches;
      DROP TABLE matches;
      ALTER TABLE matches_new RENAME TO matches;
      COMMIT;
    `);
    db.pragma('foreign_keys = ON');
    console.log('[db] tabella matches migrata: ended_at ora ammette NULL');
    return;
  }

  if (!hasCompleted) {
    db.exec(`ALTER TABLE matches ADD COLUMN completed INTEGER NOT NULL DEFAULT 0`);
    db.exec(`UPDATE matches SET completed = 1 WHERE ended_at IS NOT NULL`);
  }
}
migrateMatches();

/* --------------------------------- query ---------------------------------- */

const qInsertMatch = db.prepare(
  `INSERT INTO matches (code, started_at, rounds, schedule) VALUES (?, ?, ?, ?)`
);
const qFinishMatch = db.prepare(
  `UPDATE matches SET ended_at = ?, completed = 1, rounds = ? WHERE id = ?`
);
const qInsertRound = db.prepare(
  `INSERT INTO match_rounds
     (match_id, round_index, game_id, category, player_name, raw, points, detail, played_at)
   VALUES (@match_id, @round_index, @game_id, @category, @player_name, @raw, @points, @detail, @played_at)`
);
const qInsertPlayer = db.prepare(
  `INSERT INTO match_players (match_id, name, avatar, score, position)
   VALUES (@match_id, @name, @avatar, @score, @position)`
);

/** Crea la riga di partita all'avvio: cosi anche un match abbandonato lascia traccia. */
export function startMatch(room: Room): number {
  const info = qInsertMatch.run(room.code, room.createdAt, room.schedule.length, JSON.stringify(room.schedule));
  return info.lastInsertRowid as number;
}

/** Salva il round appena concluso, subito, senza aspettare la fine partita. */
export function saveRound(matchId: number, roundIndex: number, recap: RoundRecap, players: Player[]): void {
  const byId = new Map(players.map((p) => [p.id, p]));
  const now = Date.now();
  const tx = db.transaction(() => {
    for (const r of recap.rows) {
      const p = byId.get(r.playerId);
      if (!p) continue;
      qInsertRound.run({
        match_id: matchId,
        round_index: roundIndex,
        game_id: recap.gameId,
        category: recap.category,
        player_name: p.name,
        raw: r.raw,
        points: r.points,
        detail: r.detail,
        played_at: now,
      });
    }
  });
  tx();
}

/** Classifica finale e chiusura della partita. */
export function finishMatch(matchId: number, room: Room): void {
  const tx = db.transaction(() => {
    qFinishMatch.run(Date.now(), room.schedule.length, matchId);
    const ranked = [...room.players].sort((a, b) => b.score - a.score);
    ranked.forEach((p, i) => {
      qInsertPlayer.run({
        match_id: matchId,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        position: i + 1,
      });
    });
  });
  tx();
}

/* -------------------------------- statistiche ------------------------------ */

/** Albo d'oro: vittorie e punti per nome giocatore, sulle partite concluse. */
export function hallOfFame(limit = 20) {
  return db.prepare(`
    SELECT name,
           MAX(avatar)                                   AS avatar,
           COUNT(*)                                      AS partite,
           SUM(CASE WHEN position = 1 THEN 1 ELSE 0 END) AS vittorie,
           SUM(score)                                    AS punti_totali,
           ROUND(AVG(score))                             AS punti_medi,
           MAX(score)                                    AS record_punti
    FROM match_players
    GROUP BY name
    ORDER BY vittorie DESC, punti_totali DESC
    LIMIT ?
  `).all(limit);
}

/** Chi va forte in quale minigioco. */
export function bestByGame() {
  return db.prepare(`
    SELECT game_id, category, player_name, ROUND(AVG(points)) AS media, COUNT(*) AS giocate
    FROM match_rounds
    GROUP BY game_id, player_name
    HAVING giocate >= 2
    ORDER BY game_id, media DESC
  `).all();
}

export function recentMatches(limit = 10) {
  return db.prepare(`
    SELECT m.id, m.code, m.started_at, m.ended_at, m.rounds, m.completed,
           (SELECT name  FROM match_players WHERE match_id = m.id AND position = 1) AS vincitore,
           (SELECT score FROM match_players WHERE match_id = m.id AND position = 1) AS punteggio,
           (SELECT COUNT(*) FROM match_players WHERE match_id = m.id)               AS giocatori
    FROM matches m
    WHERE m.completed = 1
    ORDER BY m.started_at DESC
    LIMIT ?
  `).all(limit);
}

export function stats() {
  const m = db.prepare(`SELECT COUNT(*) n FROM matches WHERE completed = 1`).get() as any;
  const r = db.prepare(`SELECT COUNT(DISTINCT match_id || '-' || round_index) n FROM match_rounds`).get() as any;
  const p = db.prepare(`SELECT COUNT(DISTINCT name) n FROM match_players`).get() as any;
  return { partite: m.n, round: r.n, giocatori: p.n };
}
