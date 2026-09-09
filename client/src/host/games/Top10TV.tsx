import { emit } from '../../net.ts';
import type { RoomState, TeamId } from '@shared/types.ts';

interface Pub {
  phase: 'guess' | 'reveal' | 'result';
  titolo: string;
  currentTeam: TeamId;
  turnIndex: number;
  maxTurns: number;
  scores: Record<TeamId, number>;
  misses: { team: TeamId; guess: string }[];
  voci: { posizione: number; punti: number; nome: string | null; team: TeamId | null }[];
}

export function Top10TV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub || !room.teams) return null;
  const colorOf = (id: TeamId | null) => room.teams!.find((t) => t.id === id)?.color ?? 'var(--stroke)';
  const team = room.teams.find((t) => t.id === pub.currentTeam);

  return (
    <div className="team-stage">
      <div className="team-score">
        {room.teams.map((t, i) => (
          <div
            key={t.id}
            className={`side${pub.currentTeam === t.id && pub.phase === 'guess' ? ' active' : ''}`}
            style={{ ['--tc' as string]: t.color, order: i === 0 ? 0 : 2 }}
          >
            <div className="nm">{t.name}</div>
            <div className="pt">{pub.scores[t.id]}</div>
          </div>
        ))}
        <div className="vs" style={{ order: 1 }}>
          tentativo {Math.min(pub.turnIndex + 1, pub.maxTurns)}/{pub.maxTurns}
        </div>
      </div>

      <div className="col center" style={{ gap: 6 }}>
        <div className="kicker">Classifica</div>
        <h2 className="grad-text" style={{ fontSize: 'clamp(20px, 2.4vw, 42px)', textAlign: 'center' }}>
          {pub.titolo}
        </h2>
        {pub.phase === 'guess' && (
          <p className="dim" style={{ margin: 0, color: team?.color, fontWeight: 800 }}>
            Tocca a {team?.name}
          </p>
        )}
        {pub.phase === 'reveal' && (
          <div className="row" style={{ gap: 16 }}>
            <span className="chip chip-cat-team">Classifica completa</span>
            <button className="btn btn-primary" onClick={() => emit('host:next')}>Vai ai punti</button>
          </div>
        )}
      </div>

      <div className="top10-board">
        {pub.voci.map((v) => (
          <div
            key={v.posizione}
            className={`top10-row${v.team ? ' found' : ''}`}
            style={{ ['--tc' as string]: colorOf(v.team) }}
          >
            <span className="pos">{v.posizione}</span>
            <span
              className={`nm${v.nome ? '' : ' hidden'}`}
              style={!v.team && v.nome ? { color: 'var(--ink-dim)' } : undefined}
            >
              {v.nome ?? '· · · · ·'}
            </span>
            <span className="pt">{v.punti}</span>
          </div>
        ))}
      </div>

      {pub.misses.length > 0 && (
        <div className="top10-miss">
          {pub.misses.slice(-8).map((m, i) => <span key={i}>{m.guess}</span>)}
        </div>
      )}
    </div>
  );
}
