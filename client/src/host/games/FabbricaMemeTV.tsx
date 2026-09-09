import { emit } from '../../net.ts';
import type { RoomState } from '@shared/types.ts';

interface Pub {
  phase: 'write' | 'vote' | 'result';
  template: { scena: string; art: string; topLabel: string; bottomLabel: string };
  submitted: number;
  total: number;
  votesReceived: number;
  gallery: { authorId: string | null; slot: string; top: string; bottom: string; votes: number | null }[] | null;
}

export function FabbricaMemeTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;

  if (pub.phase === 'write') {
    return (
      <div className="imp-stage">
        <div className="panel imp-banner">
          <div className="kicker">Il template di oggi</div>
          <div className="meme-art">{pub.template.art}</div>
          <h2 className="grad-text" style={{ maxWidth: '20ch' }}>{pub.template.scena}</h2>
          <p className="dim" style={{ margin: 0 }}>{pub.submitted} / {pub.total} meme consegnati</p>
          <button className="btn btn-lg" onClick={() => emit('host:next')}>Passa alla galleria</button>
        </div>
      </div>
    );
  }

  const best = Math.max(0, ...(pub.gallery ?? []).map((g) => g.votes ?? 0));

  return (
    <div className="imp-stage">
      <div className="row" style={{ justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div className="kicker">{pub.template.scena}</div>
          <h3 style={{ fontSize: 'clamp(17px,1.8vw,28px)' }}>
            {pub.phase === 'vote' ? 'Votate il migliore dal telefono' : 'Verdetto'}
          </h3>
        </div>
        {pub.phase === 'vote' && (
          <div className="row" style={{ gap: 14 }}>
            <span className="mono dim">voti {pub.votesReceived}</span>
            <button className="btn btn-primary" onClick={() => emit('host:next')}>Chiudi il voto</button>
          </div>
        )}
      </div>

      <div className="meme-gallery">
        {(pub.gallery ?? []).map((g) => {
          const p = g.authorId ? room.players.find((x) => x.id === g.authorId) : null;
          const won = pub.phase === 'result' && (g.votes ?? 0) === best && best > 0;
          return (
            <div
              key={g.slot}
              className="meme-frame"
              style={won ? { borderColor: 'var(--lime)', boxShadow: '0 0 40px -16px var(--lime)' } : undefined}
            >
              <div className="meme-text">{g.top || '·'}</div>
              <div className="meme-art">{pub.template.art}</div>
              <div className="meme-text">{g.bottom || '·'}</div>
              {pub.phase === 'result' && (
                <div className="row" style={{ gap: 8 }}>
                  <span className="meme-votes">{g.votes ?? 0}</span>
                  <span className="faint">{p ? `${p.avatar} ${p.name}` : ''}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
