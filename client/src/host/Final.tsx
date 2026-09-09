import { motion } from 'framer-motion';
import type { RoomState } from '@shared/types.ts';
import { Leaderboard } from '../ui/Leaderboard.tsx';

const ORDER = [1, 0, 2]; // 2o, 1o, 3o
const HEIGHTS = ['46%', '68%', '34%'];

export function Final({ room }: { room: RoomState }) {
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  const podium = ranked.slice(0, 3);

  return (
    <div className="col" style={{ flex: 1, gap: 'clamp(18px, 2.4vw, 40px)', minHeight: 0 }}>
      <div className="center col" style={{ gap: 6 }}>
        <div className="kicker">Partita conclusa</div>
        <h1 className="grad-text" style={{ fontSize: 'clamp(40px, 6vw, 96px)' }}>CLASSIFICA FINALE</h1>
      </div>

      <div className="podium" style={{ height: 'clamp(220px, 30vh, 380px)' }}>
        {ORDER.map((idx, slot) => {
          const p = podium[idx];
          if (!p) return null;
          return (
            <motion.div
              key={p.id}
              className="podium-step"
              style={{ height: '100%', justifyContent: 'flex-end' }}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 * slot + 0.15, type: 'spring', stiffness: 180, damping: 20 }}
            >
              <span className="podium-av">{p.avatar}</span>
              <span className="podium-name">{p.name}</span>
              <span className="podium-score mono">{p.score}</span>
              <div
                className="podium-block"
                style={{ ['--pc' as string]: p.color, height: HEIGHTS[slot] }}
              >
                {idx + 1}
              </div>
            </motion.div>
          );
        })}
      </div>

      {ranked.length > 3 && (
        <div className="col" style={{ gap: 12, minHeight: 0, maxWidth: 760, width: '100%', margin: '0 auto' }}>
          <div className="kicker">Gli altri</div>
          <div className="board">
            {ranked.slice(3).map((p, i) => (
              <div key={p.id} className="board-row">
                <span className="pos">{i + 4}</span>
                <span style={{ fontSize: '1.4rem' }}>{p.avatar}</span>
                <span style={{ fontWeight: 800 }}>{p.name}</span>
                <span className="score">{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
