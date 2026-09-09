import type { RoomState } from '@shared/types.ts';

type Mark = 'correct' | 'present' | 'absent';
interface Pub {
  length: number;
  maxAttempts: number;
  boards: { playerId: string; marks: Mark[][]; solved: boolean; done: boolean }[];
}

export function NerdleTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;

  return (
    <div className="progress-grid">
      {pub.boards.map((b) => {
        const p = room.players.find((x) => x.id === b.playerId);
        if (!p) return null;
        return (
          <div key={b.playerId} className={`mini-board${b.done ? ' done' : ''}`}>
            <div className="mini-head">
              <span style={{ fontSize: '1.3rem' }}>{p.avatar}</span>
              <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              {b.solved && <span style={{ color: 'var(--lime)' }}>✓</span>}
              {b.done && !b.solved && <span style={{ color: 'var(--danger)' }}>✕</span>}
            </div>
            <div className="mini-rows">
              {Array.from({ length: pub.maxAttempts }).map((_, r) => (
                <div key={r} className="tv-n-row">
                  {Array.from({ length: pub.length }).map((__, c) => (
                    <div key={c} className={`tv-n-cell${b.marks[r] ? ' ' + b.marks[r][c] : ''}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
