import type { RoomState } from '@shared/types.ts';

interface Pub {
  phase: 'guess' | 'reveal';
  index: number;
  total: number;
  emoji: string;
  tipo: string;
  hint: string | null;
  solvedIds: string[];
  titolo: string | null;
  solvers: { playerId: string; points: number }[] | null;
}

export function EmojiFilmTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;
  const reveal = pub.phase === 'reveal';

  return (
    <div className="emoji-stage">
      <div className="quiz-head">
        <span className="chip mono">{pub.index + 1} / {pub.total}</span>
        <span className="chip chip-cat-timed">{pub.tipo}</span>
      </div>

      <div className="emoji-big">{pub.emoji}</div>

      {reveal ? (
        <div className="emoji-title grad-text">{pub.titolo}</div>
      ) : (
        <div className="emoji-hint mono">{pub.hint ?? 'Scrivete il titolo sul telefono'}</div>
      )}

      <div className="row wrap" style={{ gap: 10, justifyContent: 'center' }}>
        {reveal ? (
          (pub.solvers ?? []).length === 0 ? (
            <span className="dim">Nessuno ci è arrivato</span>
          ) : (
            (pub.solvers ?? []).map((s) => {
              const p = room.players.find((x) => x.id === s.playerId);
              return p ? (
                <span key={s.playerId} className="chip">
                  {p.avatar} {p.name} <b className="mono" style={{ color: 'var(--lime)' }}>+{s.points}</b>
                </span>
              ) : null;
            })
          )
        ) : (
          room.players.filter((p) => p.connected).map((p) => (
            <span key={p.id} className={`quiz-avatar${pub.solvedIds.includes(p.id) ? ' on' : ''}`} title={p.name}>
              {p.avatar}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
