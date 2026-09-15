import { advance, emit, useCountdown } from '../net.ts';
import type { RoomState } from '@shared/types.ts';
import { CATEGORY_LABEL } from '@shared/types.ts';
import { gameDef } from '@shared/catalog.ts';

export function Intro({ room }: { room: RoomState }) {
  const def = room.currentGame ? gameDef(room.currentGame) : null;
  const left = useCountdown(room.deadline, room.serverNow);
  if (!def) return null;

  return (
    <div className="intro">
      <div>
        <div className={`chip chip-cat-${def.category}`} style={{ marginBottom: 18 }}>
          {CATEGORY_LABEL[def.category]}
        </div>
        <h1 className="intro-title grad-text">{def.title}</h1>
        <p className="dim" style={{ fontSize: 'clamp(17px, 1.7vw, 28px)', marginTop: 12 }}>
          {def.tagline}
        </p>
      </div>

      <div className="intro-rules">
        {def.rules.map((r, i) => (
          <div key={i} className="intro-rule">
            <b>{String(i + 1).padStart(2, '0')}</b>
            <span>{r}</span>
          </div>
        ))}
      </div>

      {room.teams && (
        <div className="teams-preview">
          {room.teams.map((t) => (
            <div key={t.id} className="team-col" style={{ ['--tc' as string]: t.color }}>
              <h3>{t.name}</h3>
              <ul>
                {t.members.map((id) => {
                  const p = room.players.find((x) => x.id === id);
                  return p ? <li key={id}><span>{p.avatar}</span>{p.name}</li> : null;
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-primary btn-lg" onClick={() => advance(room)}>
        Si comincia {left > 0 && <span className="mono">· {Math.ceil(left / 1000)}</span>}
      </button>
    </div>
  );
}
