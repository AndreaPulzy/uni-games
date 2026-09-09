import { useEffect, useRef, useState } from 'react';
import { emit, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';

interface Other {
  playerId: string; name: string; avatar: string;
  cells: string[]; flagged: boolean[]; voided: boolean[];
}
interface Priv {
  phase: 'fill' | 'review' | 'result';
  letter: string;
  categorie: string[];
  cells: string[];
  complete: boolean;
  frozen: boolean;
  canStop: boolean;
  others: Other[] | null;
}

export function NomiCoseCittaPlay() {
  const priv = usePrivate<Priv>();
  const [local, setLocal] = useState<string[]>([]);
  const seeded = useRef(false);

  // il server e' la fonte di verita, ma mentre digiti comanda il testo locale
  useEffect(() => {
    if (priv && !seeded.current) { setLocal(priv.cells); seeded.current = true; }
  }, [priv]);

  if (!priv) return <WaitingPanel title="Estrazione della lettera…" />;

  if (priv.phase === 'fill') {
    const ok = (v: string) => v.trim().length >= 2 && v.trim()[0].toUpperCase() === priv.letter;
    return (
      <>
        <div className="col center" style={{ gap: 2 }}>
          <div className="kicker">Lettera</div>
          <div className="big-num" style={{ color: 'var(--gold)' }}>{priv.letter}</div>
        </div>

        <div className="ncc-fields grow">
          {priv.categorie.map((cat, i) => (
            <div key={cat} className="ncc-field">
              <label>{cat}</label>
              <input
                className={`field${ok(local[i] ?? '') ? ' ok' : ''}`}
                value={local[i] ?? ''}
                disabled={priv.frozen}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 28);
                  setLocal((l) => { const n = [...l]; n[i] = v; return n; });
                  emit('game:action', { type: 'fill', payload: { index: i, value: v } });
                }}
                placeholder={`${cat} con la ${priv.letter}`}
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        <button
          className="btn btn-hot btn-block btn-lg"
          disabled={!priv.canStop}
          onClick={() => emit('game:action', { type: 'stop' })}
        >
          {priv.frozen ? 'Bloccato!' : priv.canStop ? 'STOP — blocca tutti' : 'Riempi tutte e sei'}
        </button>
      </>
    );
  }

  if (priv.phase === 'review' && priv.others) {
    return (
      <>
        <div className="col center" style={{ gap: 4 }}>
          <div className="kicker">Revisione</div>
          <p className="faint" style={{ margin: 0, fontSize: '.82rem', textAlign: 'center' }}>
            Segnala le risposte che ritieni inventate.
          </p>
        </div>
        <div className="vote-list grow">
          {priv.others.map((o) => (
            <div key={o.playerId} className="review-card">
              <div className="who"><span>{o.avatar}</span>{o.name}</div>
              {o.cells.map((cell, i) => (
                <div key={i} className="review-row">
                  <span className="cat">{priv.categorie[i]}</span>
                  <span className={`ans${o.voided[i] ? ' void' : ''}`}>{cell || '—'}</span>
                  {cell && (
                    <button
                      className={`flag-btn${o.flagged[i] ? ' on' : ''}`}
                      onClick={() => emit('game:action', { type: 'flag', payload: { target: o.playerId, index: i } })}
                    >
                      {o.flagged[i] ? 'segnalata' : 'dubbia'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  }

  return <WaitingPanel title="Round concluso" />;
}
