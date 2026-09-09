import { useEffect, useState } from 'react';
import { emit, usePrivate } from '../../net.ts';

type Mark = 'correct' | 'present' | 'absent';
interface Priv {
  guesses: string[];
  marks: Mark[][];
  solved: boolean;
  done: boolean;
  maxAttempts: number;
  length: number;
  keyboard: Record<string, Mark>;
}

const PAD = ['1','2','3','4','5','6','7','8','9','0','+','-','*','/','='];

export function NerdlePlay() {
  const priv = usePrivate<Priv>();
  const [draft, setDraft] = useState('');

  useEffect(() => { setDraft(''); }, [priv?.guesses.length]);

  if (!priv) return <div className="phone-hero"><span className="waiting-dots"><i /><i /><i /></span></div>;

  if (priv.done) {
    return (
      <div className="phone-hero">
        <h2 className={priv.solved ? 'grad-text' : ''}>{priv.solved ? 'Trovata!' : 'Round finito'}</h2>
        <p className="dim">
          {priv.solved ? `Risolta in ${priv.guesses.length} tentativi` : 'Aspetta gli altri.'}
        </p>
        <span className="waiting-dots"><i /><i /><i /></span>
      </div>
    );
  }

  const rowIndex = priv.guesses.length;
  const submit = () => {
    if (draft.length === priv.length) emit('game:action', { type: 'guess', payload: { eq: draft } });
  };

  return (
    <>
      <div className="w-grid grow" style={{ justifyContent: 'center' }}>
        {Array.from({ length: priv.maxAttempts }).map((_, r) => {
          const past = r < rowIndex;
          const eq = past ? priv.guesses[r] : r === rowIndex ? draft : '';
          return (
            <div key={r} className="n-row">
              {Array.from({ length: priv.length }).map((__, c) => {
                const ch = eq[c] ?? '';
                const mark = past ? priv.marks[r][c] : '';
                return <div key={c} className={`n-cell ${mark} ${ch && !past ? 'filled' : ''}`}>{ch}</div>;
              })}
            </div>
          );
        })}
      </div>

      <div className="n-pad">
        {PAD.map((k) => (
          <button
            key={k}
            className={`key ${priv.keyboard[k] ?? ''}`}
            onClick={() => setDraft((d) => (d.length < priv.length ? d + k : d))}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="row" style={{ gap: 8 }}>
        <button className="btn grow" onClick={() => setDraft((d) => d.slice(0, -1))} disabled={!draft}>⌫</button>
        <button className="btn btn-primary grow" onClick={submit} disabled={draft.length !== priv.length}>
          Invia
        </button>
      </div>
    </>
  );
}
