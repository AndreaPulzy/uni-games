import { motion } from 'framer-motion';
import type { Player, RecapRow } from '@shared/types.ts';

export function Leaderboard({
  players,
  deltas,
  limit,
}: {
  players: Player[];
  deltas?: Map<string, RecapRow>;
  limit?: number;
}) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const shown = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div className="board">
      {shown.map((p, i) => {
        const d = deltas?.get(p.id);
        const move = d ? d.rankBefore - d.rankAfter : 0;
        return (
          <motion.div
            key={p.id}
            layout
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`board-row${i === 0 ? ' top1' : ''}`}
            style={{ borderLeft: `4px solid ${p.color}` }}
          >
            <span className="pos">{i + 1}</span>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{p.avatar}</span>
            <span style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              {p.name}
              {move !== 0 && (
                <span className={`delta ${move > 0 ? 'up' : 'down'}`}>
                  {move > 0 ? `▲${move}` : `▼${-move}`}
                </span>
              )}
              {!p.connected && <span className="faint" style={{ fontSize: '.75rem' }}>offline</span>}
            </span>
            <span className="score">
              {p.score}
              {d && d.points > 0 && (
                <span className="delta up" style={{ marginLeft: 8 }}>+{d.points}</span>
              )}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
