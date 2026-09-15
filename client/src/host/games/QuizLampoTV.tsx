import type { RoomState } from '@shared/types.ts';

export const QUIZ_SHAPES = ['▲', '◆', '●', '■'];
export const QUIZ_COLORS = ['var(--cyan)', 'var(--magenta)', 'var(--gold)', 'var(--lime)'];

interface Pub {
  phase: 'question' | 'reveal';
  index: number;
  total: number;
  categoria: string;
  domanda: string;
  options: string[];
  answeredIds: string[];
  correct: number | null;
  counts: number[] | null;
  gains: { playerId: string; points: number }[] | null;
}

export function QuizLampoTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;
  const reveal = pub.phase === 'reveal';
  const player = (id: string) => room.players.find((p) => p.id === id);

  return (
    <div className="quiz-stage">
      <div className="quiz-head">
        <span className="chip mono">{pub.index + 1} / {pub.total}</span>
        <span className="chip chip-cat-timed">{pub.categoria}</span>
      </div>

      <div className="quiz-question">{pub.domanda}</div>

      <div className="quiz-options">
        {pub.options.map((option, i) => (
          <div
            key={i}
            className={`quiz-option${!reveal ? '' : i === pub.correct ? ' right' : ' dim'}`}
            style={{ ['--qc' as string]: QUIZ_COLORS[i] }}
          >
            <span className="quiz-shape">{QUIZ_SHAPES[i]}</span>
            <span className="grow">{option}</span>
            {reveal && pub.counts && <span className="mono quiz-count">{pub.counts[i]}</span>}
          </div>
        ))}
      </div>

      <div className="quiz-foot">
        {!reveal ? (
          <div className="row wrap" style={{ gap: 8, justifyContent: 'center' }}>
            <span className="dim">Hanno risposto:</span>
            {room.players.filter((p) => p.connected).map((p) => (
              <span key={p.id} className={`quiz-avatar${pub.answeredIds.includes(p.id) ? ' on' : ''}`} title={p.name}>
                {p.avatar}
              </span>
            ))}
          </div>
        ) : (
          <div className="row wrap" style={{ gap: 10, justifyContent: 'center' }}>
            {(pub.gains ?? []).length === 0 && <span className="dim">Nessuno ha risposto giusto</span>}
            {(pub.gains ?? []).slice(0, 8).map((g) => {
              const p = player(g.playerId);
              return p ? (
                <span key={g.playerId} className="chip">
                  {p.avatar} {p.name} <b className="mono" style={{ color: 'var(--lime)' }}>+{g.points}</b>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
