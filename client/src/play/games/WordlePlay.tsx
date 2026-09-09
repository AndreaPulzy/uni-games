import { useEffect, useState } from 'react';
import type { Player, RoomState } from '@shared/types.ts';
import { emit, usePrivate } from '../../net.ts';

type Mark = 'correct' | 'present' | 'absent';
interface Priv {
  guesses: string[];
  marks: Mark[][];
  solved: boolean;
  done: boolean;
  maxAttempts: number;
  keyboard: Record<string, Mark>;
}

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

export function WordlePlay({ room, me }: { room: RoomState; me: Player }) {
  const priv = usePrivate<Priv>();
  const [draft, setDraft] = useState('');

  // svuota la riga in composizione appena il server accetta un tentativo
  useEffect(() => { setDraft(''); }, [priv?.guesses.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') submit();
      else if (e.key === 'Backspace') setDraft((d) => d.slice(0, -1));
      else if (/^[a-zA-Z]$/.test(e.key)) setDraft((d) => (d.length < 5 ? d + e.key.toUpperCase() : d));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!priv) return <div className="phone-hero"><span className="waiting-dots"><i /><i /><i /></span></div>;

  function submit() {
    if (draft.length === 5) emit('game:action', { type: 'guess', payload: { word: draft } });
  }

  if (priv.done) {
    return (
      <div className="phone-hero">
        <h2 className={priv.solved ? 'grad-text' : ''}>{priv.solved ? 'Trovata!' : 'Tempo scaduto'}</h2>
        <p className="dim">
          {priv.solved
            ? `Risolta in ${priv.guesses.length} tentativ${priv.guesses.length === 1 ? 'o' : 'i'}`
            : 'Aspetta gli altri, il round si chiude a breve.'}
        </p>
        <span className="waiting-dots"><i /><i /><i /></span>
      </div>
    );
  }

  const rowIndex = priv.guesses.length;

  return (
    <>
      <div className="w-grid grow" style={{ justifyContent: 'center' }}>
        {Array.from({ length: priv.maxAttempts }).map((_, r) => {
          const past = r < rowIndex;
          const word = past ? priv.guesses[r] : r === rowIndex ? draft : '';
          return (
            <div key={r} className="w-row">
              {Array.from({ length: 5 }).map((__, c) => {
                const ch = word[c] ?? '';
                const mark = past ? priv.marks[r][c] : '';
                return (
                  <div key={c} className={`w-cell ${mark} ${ch && !past ? 'filled pop' : ''}`}>{ch}</div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="kbd">
        {ROWS.map((row, i) => (
          <div key={i} className="kbd-row">
            {i === 2 && (
              <button className="key wide" onClick={submit} disabled={draft.length !== 5}>INVIA</button>
            )}
            {[...row].map((k) => (
              <button
                key={k}
                className={`key ${priv.keyboard[k] ?? ''}`}
                onClick={() => setDraft((d) => (d.length < 5 ? d + k : d))}
              >
                {k}
              </button>
            ))}
            {i === 2 && (
              <button className="key wide" onClick={() => setDraft((d) => d.slice(0, -1))}>⌫</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
