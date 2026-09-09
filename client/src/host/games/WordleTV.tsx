import type { RoomState } from '@shared/types.ts';

type Mark = 'correct' | 'present' | 'absent';
interface Board { playerId: string; marks: Mark[][]; solved: boolean; done: boolean; attempts: number }
interface Pub { maxAttempts: number; durationMs: number; boards: Board[] }

/** La TV mostra solo i colori: le lettere restano sul telefono di ciascuno. */
export function WordleTV({ room }: { room: RoomState }) {
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
                <div key={r} className="mini-row">
                  {Array.from({ length: 5 }).map((__, c) => (
                    <div key={c} className={`mini-cell${b.marks[r] ? ' ' + b.marks[r][c] : ''}`} />
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
