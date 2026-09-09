import { useEffect, useState } from 'react';
import { emit, usePrivate } from '../../net.ts';

interface Group { name: string; level: 1 | 2 | 3 | 4; words: string[] }
interface Priv {
  words: string[];
  found: Group[];
  mistakes: number;
  maxMistakes: number;
  done: boolean;
  complete: boolean;
}

export function ConnectionsPlay() {
  const priv = usePrivate<Priv>();
  const [sel, setSel] = useState<string[]>([]);

  // ogni volta che il tavolo cambia (gruppo trovato o errore) la selezione decade
  useEffect(() => { setSel([]); }, [priv?.words.length, priv?.mistakes]);

  if (!priv) return <div className="phone-hero"><span className="waiting-dots"><i /><i /><i /></span></div>;

  if (priv.done) {
    return (
      <div className="phone-hero">
        <h2 className={priv.complete ? 'grad-text' : ''}>
          {priv.complete ? 'Griglia completata!' : 'Round finito'}
        </h2>
        <p className="dim">{priv.found.length}/4 gruppi · {priv.mistakes} errori</p>
        <span className="waiting-dots"><i /><i /><i /></span>
      </div>
    );
  }

  const toggle = (w: string) =>
    setSel((s) => (s.includes(w) ? s.filter((x) => x !== w) : s.length < 4 ? [...s, w] : s));

  return (
    <>
      <div className="c-found">
        {priv.found.map((g) => (
          <div key={g.name} className={`c-found-row lv${g.level}`}>
            {g.name}
            <small>{g.words.join(' · ')}</small>
          </div>
        ))}
      </div>

      <div className="c-grid grow" style={{ alignContent: 'start' }}>
        {priv.words.map((w) => (
          <button key={w} className={`c-word${sel.includes(w) ? ' sel' : ''}`} onClick={() => toggle(w)}>
            {w}
          </button>
        ))}
      </div>

      <div className="c-mistakes">
        <span className="faint" style={{ fontSize: '.8rem', marginRight: 4 }}>errori</span>
        {Array.from({ length: priv.maxMistakes }).map((_, i) => (
          <i key={i} className={i < priv.mistakes ? 'used' : ''} />
        ))}
      </div>

      <div className="row" style={{ gap: 8 }}>
        <button className="btn grow" onClick={() => setSel([])} disabled={sel.length === 0}>
          Deseleziona
        </button>
        <button
          className="btn btn-primary grow"
          disabled={sel.length !== 4}
          onClick={() => emit('game:action', { type: 'submit', payload: { words: sel } })}
        >
          Invia ({sel.length}/4)
        </button>
      </div>
    </>
  );
}
