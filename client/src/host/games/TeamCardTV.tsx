import { emit } from '../../net.ts';
import type { RoomState, TeamId } from '@shared/types.ts';

export interface TeamPub {
  phase: 'ready' | 'playing' | 'steal' | 'result';
  currentTeam: TeamId;
  turnIndex: number;
  turnTotal: number;
  scores: Record<TeamId, number>;
  presenters: string[];
  history: { team: TeamId; label: string; ok: boolean; note?: string }[];
  tipo?: string | null;
  solvers?: string[];
  buzzed?: number;
}

/** Tabellone comune a Taboo, Intesa Vincente e Mimo. */
export function TeamCardTV({
  room, presenterLabel, solverLabel, extra,
}: {
  room: RoomState;
  presenterLabel: string;
  solverLabel: string;
  extra?: (pub: TeamPub) => JSX.Element | null;
}) {
  const pub = room.game as TeamPub | null;
  if (!pub || !room.teams) return null;

  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? '?';
  const team = room.teams.find((t) => t.id === pub.currentTeam);
  const presenters = pub.presenters.map(nameOf).join(' e ');
  const solvers = (pub.solvers ?? room.teams.find((t) => t.id === pub.currentTeam)?.members
    .filter((id) => !pub.presenters.includes(id)) ?? []).map(nameOf).join(', ');

  return (
    <div className="team-stage">
      <div className="team-score">
        {room.teams.map((t, i) => (
          <div
            key={t.id}
            className={`side${pub.currentTeam === t.id && pub.phase !== 'result' ? ' active' : ''}`}
            style={{ ['--tc' as string]: t.color, order: i === 0 ? 0 : 2 }}
          >
            <div className="nm">{t.name}</div>
            <div className="pt">{pub.scores[t.id]}</div>
          </div>
        ))}
        <div className="vs" style={{ order: 1 }}>
          turno {Math.min(pub.turnIndex + 1, pub.turnTotal)}/{pub.turnTotal}
        </div>
      </div>

      <div className="team-call">
        {pub.phase === 'ready' && (
          <>
            <div className="kicker">Si prepara</div>
            <h2 className="grad-text" style={{ color: team?.color }}>{team?.name}</h2>
            <div className="who">
              {presenterLabel}: <b>{presenters}</b>
              {solvers && <><br />{solverLabel}: <b>{solvers}</b></>}
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => emit('host:next')}>Via!</button>
          </>
        )}

        {pub.phase === 'playing' && (
          <>
            <div className="kicker">In gioco</div>
            <h2 style={{ color: team?.color }}>{team?.name}</h2>
            {pub.tipo && <div className="chip chip-cat-team">{pub.tipo}</div>}
            <div className="who">{presenterLabel}: <b>{presenters}</b></div>
            {extra?.(pub)}
          </>
        )}

        {pub.phase === 'steal' && (
          <>
            <div className="kicker neon-pink">Tempo scaduto</div>
            <h2 className="grad-text">Gli avversari possono rubare</h2>
            <div className="who">Una sola risposta secca, poi si chiude.</div>
          </>
        )}

        <div className="card-history">
          {pub.history.slice(-10).map((h, i) => (
            <span key={i} className={h.ok ? 'ok' : 'no'}>
              {h.label}{h.note ? ` · ${h.note}` : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
