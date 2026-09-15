import { advance } from '../../net.ts';
import type { RoomState, TeamId } from '@shared/types.ts';

interface Pub {
  phase: 'clue' | 'guess' | 'reveal';
  wordIndex: number;
  wordTotal: number;
  categoria: string;
  clues: { team: TeamId; word: string }[];
  turnTeam: TeamId;
  scores: Record<TeamId, number>;
  givers: Record<TeamId, string | null>;
  judgeId: string | null;
  maxClues: number;
  worth: number;
  parola: string | null;
  outcome: { team: TeamId | null; points: number } | null;
}

export function IndizioSeccoTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub || !room.teams) return null;

  const team = (id: TeamId) => room.teams!.find((t) => t.id === id)!;
  const nameOf = (id: string | null) => room.players.find((p) => p.id === id)?.name ?? '—';
  const current = team(pub.turnTeam);
  const lastClue = pub.clues.length ? pub.clues[pub.clues.length - 1].word : '';

  return (
    <div className="team-stage">
      <div className="team-score">
        {room.teams.map((t, i) => (
          <div
            key={t.id}
            className={`side${pub.turnTeam === t.id && pub.phase !== 'reveal' ? ' active' : ''}`}
            style={{ ['--tc' as string]: t.color, order: i === 0 ? 0 : 2 }}
          >
            <div className="nm">{t.name}</div>
            <div className="pt">{pub.scores[t.id]}</div>
          </div>
        ))}
        <div className="vs" style={{ order: 1 }}>parola {pub.wordIndex + 1}/{pub.wordTotal}</div>
      </div>

      <div className="team-call">
        <div className="chip chip-cat-team">{pub.categoria}</div>

        {pub.phase === 'clue' && (
          <>
            <div className="kicker">Indizio {pub.clues.length + 1} di {pub.maxClues} · vale {pub.worth} punti</div>
            <h2 style={{ color: current.color }}>{nameOf(pub.givers[pub.turnTeam])} sta scegliendo la parola</h2>
            <div className="who">Suggerisce per la <b>{current.name}</b></div>
          </>
        )}

        {pub.phase === 'guess' && (
          <>
            <div className="kicker">Indizio</div>
            <h2 className="grad-text" style={{ fontSize: 'clamp(40px, 6vw, 110px)' }}>{lastClue}</h2>
            <div className="who">
              Risponde a voce la <b style={{ color: current.color }}>{current.name}</b> · vale <b>{pub.worth}</b> punti
              · giudica {nameOf(pub.judgeId)}
            </div>
          </>
        )}

        {pub.phase === 'reveal' && (
          <>
            <div className="kicker">La parola era</div>
            <h2 className="grad-text" style={{ fontSize: 'clamp(36px, 5vw, 90px)' }}>{pub.parola}</h2>
            <div className="who">
              {pub.outcome?.team
                ? <>La <b style={{ color: team(pub.outcome.team).color }}>{team(pub.outcome.team).name}</b> indovina: +{pub.outcome.points}</>
                : 'Nessuno ci è arrivato'}
            </div>
            {room.directorAction && (
              <button className="btn btn-primary" onClick={() => advance(room)}>{room.directorAction}</button>
            )}
          </>
        )}

        {pub.clues.length > 0 && (
          <div className="indizio-chain">
            {pub.clues.map((c, i) => (
              <span key={i} className="indizio-clue" style={{ ['--tc' as string]: team(c.team).color }}>{c.word}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
