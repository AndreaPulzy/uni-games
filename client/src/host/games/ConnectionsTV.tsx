import type { RoomState } from '@shared/types.ts';

interface Pub {
  maxMistakes: number;
  groupNames: { name: string; level: number }[];
  progress: { playerId: string; found: { name: string; level: number }[]; mistakes: number; done: boolean }[];
}

export function ConnectionsTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;

  return (
    <div className="progress-grid">
      {pub.progress.map((row) => {
        const p = room.players.find((x) => x.id === row.playerId);
        if (!p) return null;
        return (
          <div key={row.playerId} className={`tv-conn-card${row.done ? ' done' : ''}`}>
            <div className="mini-head">
              <span style={{ fontSize: '1.3rem' }}>{p.avatar}</span>
              <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              <span className="mono faint">{row.found.length}/4</span>
            </div>
            <div className="tv-conn-bars">
              {Array.from({ length: 4 }).map((_, i) => {
                const g = row.found[i];
                return <div key={i} className={`tv-conn-bar${g ? ' lv' + g.level : ''}`} />;
              })}
            </div>
            <div className="c-mistakes" style={{ marginTop: 10 }}>
              {Array.from({ length: pub.maxMistakes }).map((_, i) => (
                <i key={i} className={i < row.mistakes ? 'used' : ''} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
