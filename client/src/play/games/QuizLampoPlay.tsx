import { emit, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';
import { QUIZ_COLORS, QUIZ_SHAPES } from '../../host/games/QuizLampoTV.tsx';

interface Priv {
  phase: 'question' | 'reveal';
  index: number;
  total: number;
  domanda: string;
  options: string[];
  myChoice: number | null;
  correct: number | null;
  gain: number | null;
}

export function QuizLampoPlay() {
  const priv = usePrivate<Priv>();
  if (!priv) return <WaitingPanel title="Arriva la domanda…" />;

  if (priv.phase === 'reveal') {
    const right = priv.myChoice !== null && priv.myChoice === priv.correct;
    return (
      <div className="phone-hero">
        <div className="kicker">Domanda {priv.index + 1} di {priv.total}</div>
        <h2 style={{ color: right ? 'var(--lime)' : 'var(--danger)' }}>
          {priv.myChoice === null ? 'Tempo scaduto' : right ? 'Giusta!' : 'Sbagliata'}
        </h2>
        {right && <div className="big-num" style={{ color: 'var(--lime)' }}>+{priv.gain}</div>}
        {priv.correct !== null && (
          <p className="dim">Risposta giusta: <b>{priv.options[priv.correct]}</b></p>
        )}
      </div>
    );
  }

  const locked = priv.myChoice !== null;
  return (
    <>
      <div className="col center" style={{ gap: 6 }}>
        <div className="kicker">Domanda {priv.index + 1} di {priv.total}</div>
        <p style={{ margin: 0, textAlign: 'center', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.35 }}>
          {priv.domanda}
        </p>
      </div>

      <div className="quiz-pad grow">
        {priv.options.map((option, i) => (
          <button
            key={i}
            className={`quiz-btn${priv.myChoice === i ? ' picked' : ''}${locked && priv.myChoice !== i ? ' faded' : ''}`}
            style={{ ['--qc' as string]: QUIZ_COLORS[i] }}
            disabled={locked}
            onClick={() => emit('game:action', { type: 'answer', payload: { choice: i } })}
          >
            <span className="quiz-shape">{QUIZ_SHAPES[i]}</span>
            <span>{option}</span>
          </button>
        ))}
      </div>

      {locked && (
        <p className="dim" style={{ textAlign: 'center', margin: 0 }}>Risposta inviata, aspetta gli altri</p>
      )}
    </>
  );
}
