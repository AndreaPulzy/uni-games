import { useEffect, useRef, useState } from 'react';
import { emit, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';

interface CellView {
  text: string;
  status: 'ok' | 'empty' | 'wrongLetter' | 'voided';
  flags: number;
  suspicious: boolean;
  duplicate: boolean;
}
interface Other {
  playerId: string;
  name: string;
  avatar: string;
  flagged: boolean[];
  review: CellView[];
}
interface Priv {
  phase: 'fill' | 'review' | 'result';
  letter: string;
  categorie: string[];
  cells: string[];
  complete: boolean;
  frozen: boolean;
  canStop: boolean;
  threshold: number;
  mine: CellView[] | null;
  others: Other[] | null;
}

/** Testo della casella con i segnali che aiutano a decidere il voto. */
function Answer({ v, threshold }: { v: CellView; threshold: number }) {
  const cls = v.status === 'voided' ? ' void' : v.status === 'wrongLetter' || v.status === 'empty' ? ' bad' : '';
  return (
    <span className="grow" style={{ minWidth: 0 }}>
      <span className={`ans${cls}`}>{v.text || '—'}</span>
      {v.status === 'wrongLetter' && <span className="ncc-badge">lettera sbagliata</span>}
      {v.suspicious && <span className="ncc-badge warn">⚠</span>}
      {v.duplicate && <span className="ncc-badge dup">×2</span>}
      {v.flags > 0 && (
        <span className={`ncc-badge flag${v.status === 'voided' ? ' hit' : ''}`}>⚑ {v.flags}/{threshold}</span>
      )}
    </span>
  );
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
    const votes = priv.threshold === 1 ? '1 voto' : `${priv.threshold} voti`;
    return (
      <>
        <div className="ncc-rule">
          <div className="kicker">Controllo delle risposte</div>
          <p>
            Tocca <b>Non vale</b> sulle risposte inventate o fuori categoria.
            Con <b>{votes}</b> la risposta vale 0 punti. Puoi cambiare idea.
          </p>
          <p className="faint">
            <span className="ncc-badge warn">⚠</span> non trovata nel dizionario ·{' '}
            <span className="ncc-badge dup">×2</span> scritta anche da altri: vale 5 invece di 10
          </p>
        </div>

        <div className="vote-list grow">
          {priv.mine && (
            <div className="review-card mine">
              <div className="who">Le tue risposte</div>
              {priv.mine.map((v, i) => (
                <div key={i} className="review-row">
                  <span className="cat">{priv.categorie[i]}</span>
                  <Answer v={v} threshold={priv.threshold} />
                </div>
              ))}
            </div>
          )}

          {priv.others.map((o) => (
            <div key={o.playerId} className="review-card">
              <div className="who"><span>{o.avatar}</span>{o.name}</div>
              {o.review.map((v, i) => (
                <div key={i} className="review-row">
                  <span className="cat">{priv.categorie[i]}</span>
                  <Answer v={v} threshold={priv.threshold} />
                  {(v.status === 'ok' || v.status === 'voided') && (
                    <button
                      className={`flag-btn${o.flagged[i] ? ' on' : ''}`}
                      onClick={() => emit('game:action', { type: 'flag', payload: { target: o.playerId, index: i } })}
                    >
                      {o.flagged[i] ? 'Annulla' : 'Non vale'}
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
