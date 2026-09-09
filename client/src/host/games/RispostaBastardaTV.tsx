import { emit } from '../../net.ts';
import type { RoomState } from '@shared/types.ts';

interface Option { authorId: string; text: string; votes?: number }
interface Pub {
  phase: 'write' | 'vote' | 'result';
  duelIndex: number;
  duelTotal: number;
  written: number;
  writtenTotal: number;
  duel: { prompt: string; options: Option[]; votesReceived: number; votesTotal: number } | null;
  results: { prompt: string; options: Option[] }[] | null;
}

export function RispostaBastardaTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;

  if (pub.phase === 'write') {
    return (
      <div className="imp-stage">
        <div className="panel imp-banner">
          <div className="kicker">Scrivete sul telefono</div>
          <h2 className="grad-text">Due battute a testa</h2>
          <p className="dim" style={{ margin: 0 }}>
            {pub.written} / {pub.writtenTotal} risposte consegnate
          </p>
          <button className="btn btn-lg" onClick={() => emit('host:next')}>Passa alla votazione</button>
        </div>
      </div>
    );
  }

  if (pub.phase === 'vote' && pub.duel) {
    return (
      <div className="duel-stage">
        <div>
          <div className="kicker center" style={{ textAlign: 'center' }}>
            Duello {pub.duelIndex + 1} di {pub.duelTotal}
          </div>
          <div className="duel-prompt grad-text">{pub.duel.prompt}</div>
        </div>
        <div className="duel-cards">
          {pub.duel.options.map((o, i) => (
            <div key={o.authorId} className={`duel-card ${i === 0 ? 'a' : 'b'}`}>
              <div className="meta">Risposta {i === 0 ? 'A' : 'B'}</div>
              <div className="txt">{o.text}</div>
            </div>
          ))}
        </div>
        <div className="center dim mono">
          voti {pub.duel.votesReceived} / {pub.duel.votesTotal}
        </div>
      </div>
    );
  }

  return (
    <div className="imp-stage">
      <div className="clue-grid">
        {(pub.results ?? []).map((r, i) => {
          const best = Math.max(...r.options.map((o) => o.votes ?? 0));
          return (
            <div key={i} className="clue-card" style={{ ['--pc' as string]: 'var(--violet)' }}>
              <span className="clue-who">{r.prompt}</span>
              {r.options.map((o) => {
                const p = room.players.find((x) => x.id === o.authorId);
                const won = (o.votes ?? 0) === best && best > 0;
                return (
                  <div key={o.authorId} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                    <span className="mono" style={{ color: won ? 'var(--lime)' : 'var(--ink-faint)', fontWeight: 700 }}>
                      {o.votes ?? 0}
                    </span>
                    <span style={{ fontWeight: won ? 800 : 600, color: won ? 'var(--ink)' : 'var(--ink-dim)' }}>
                      {o.text}
                      <span className="faint" style={{ fontSize: '.8rem' }}> — {p?.name ?? '?'}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
