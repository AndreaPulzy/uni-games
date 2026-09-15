import { advance, emit } from '../net.ts';
import type { RoomState } from '@shared/types.ts';
import { gameDef } from '@shared/catalog.ts';
import { Leaderboard } from '../ui/Leaderboard.tsx';

export function Recap({ room }: { room: RoomState }) {
  const recap = room.recap;
  if (!recap) return null;
  const def = gameDef(recap.gameId);
  const deltas = new Map(recap.rows.map((r) => [r.playerId, r]));
  const last = room.roundIndex + 1 >= room.totalRounds;

  return (
    <>
      <div className="recap">
        <div className="col" style={{ gap: 18, minHeight: 0 }}>
          <div className="panel reveal-box">
            <div className="kicker">{def.title}</div>
            {recap.reveal.map((line, i) => (
              <div key={i} className={i === 0 ? 'reveal-main grad-text' : 'reveal-sub'}>{line}</div>
            ))}
          </div>
          <div className="round-rows">
            {recap.rows.map((r) => {
              const p = room.players.find((x) => x.id === r.playerId);
              if (!p) return null;
              return (
                <div key={r.playerId} className="round-row" style={{ ['--pc' as string]: p.color }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{p.avatar}</span>
                  <span className="col">
                    <b>{p.name}</b>
                    <span className="detail">{r.detail}</span>
                  </span>
                  <span className="pts">+{r.points}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col" style={{ gap: 16, minHeight: 0 }}>
          <div className="kicker">Classifica generale</div>
          <Leaderboard players={room.players} deltas={deltas} />
        </div>
      </div>

      <div className="center" style={{ paddingTop: 20 }}>
        <button className="btn btn-primary btn-lg" onClick={() => advance(room)}>
          {last ? 'Vai alla classifica finale' : 'Prossimo minigioco'}
        </button>
      </div>
    </>
  );
}
