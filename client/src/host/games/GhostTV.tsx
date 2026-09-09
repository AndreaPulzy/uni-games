import type { RoomState } from '@shared/types.ts';

interface Pub {
  mode: 'letter' | 'defend' | 'vote' | 'break';
  sequence: string;
  currentPlayerId: string | null;
  ghost: string;
  minWord: number;
  players: { playerId: string; letters: number; out: boolean }[];
  challenge: { challenger: string; challenged: string; claimedWord?: string } | null;
  vote: { question: string; received: number; total: number } | null;
  log: string[];
}

export function GhostTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;
  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? '???';

  return (
    <div className="ghost-stage">
      <div className="ghost-main">
        <div className="ghost-seq">{pub.sequence || '···'}</div>

        {pub.mode === 'letter' && pub.currentPlayerId && (
          <div className="ghost-turn">
            Tocca a <span className="grad-text">{nameOf(pub.currentPlayerId)}</span>
          </div>
        )}
        {pub.mode === 'defend' && pub.challenge && (
          <div className="ghost-turn neon-pink">
            {nameOf(pub.challenge.challenger)} contesta {nameOf(pub.challenge.challenged)}
          </div>
        )}
        {pub.mode === 'vote' && pub.vote && (
          <div className="col center" style={{ gap: 10 }}>
            <div className="ghost-turn">{pub.vote.question}</div>
            <div className="mono dim">voti {pub.vote.received}/{pub.vote.total}</div>
          </div>
        )}
        {pub.mode === 'break' && <div className="ghost-turn dim">Nuova manche…</div>}

        <div className="ghost-log">{pub.log.map((l, i) => <div key={i}>{l}</div>)}</div>
      </div>

      <div className="ghost-side">
        {pub.players.map((row) => {
          const p = room.players.find((x) => x.id === row.playerId);
          if (!p) return null;
          const now = pub.currentPlayerId === row.playerId;
          return (
            <div key={row.playerId} className={`ghost-player${now ? ' now' : ''}${row.out ? ' out' : ''}`}>
              <span style={{ fontSize: '1.6rem' }}>{p.avatar}</span>
              <span style={{ fontWeight: 800 }}>{p.name}</span>
              <span className="ghost-ghost">
                {[...pub.ghost].map((c, i) => (
                  <span key={i} className={i < row.letters ? 'on' : ''}>{c}</span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
