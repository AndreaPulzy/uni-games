import { useState } from 'react';
import { emit, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';

interface Priv {
  phase: 'write' | 'vote' | 'result';
  template: { scena: string; art: string; topLabel: string; bottomLabel: string };
  top: string;
  bottom: string;
  submitted: boolean;
  hasVoted: boolean;
  options: { playerId: string; top: string; bottom: string }[] | null;
}

export function FabbricaMemePlay() {
  const priv = usePrivate<Priv>();
  const [top, setTop] = useState<string | null>(null);
  const [bottom, setBottom] = useState<string | null>(null);

  if (!priv) return <WaitingPanel title="Scelta del template…" />;

  const t = top ?? priv.top;
  const b = bottom ?? priv.bottom;

  if (priv.phase === 'write') {
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 14 }}>
        <div className="col center" style={{ gap: 6 }}>
          <div style={{ fontSize: '3rem', lineHeight: 1 }}>{priv.template.art}</div>
          <div className="kicker" style={{ textAlign: 'center' }}>{priv.template.scena}</div>
        </div>

        <div className="ncc-field">
          <label>{priv.template.topLabel}</label>
          <input className="field" value={t} maxLength={70}
                 onChange={(e) => setTop(e.target.value.slice(0, 70))} placeholder="testo sopra" />
        </div>
        <div className="ncc-field">
          <label>{priv.template.bottomLabel}</label>
          <input className="field" value={b} maxLength={70}
                 onChange={(e) => setBottom(e.target.value.slice(0, 70))} placeholder="testo sotto" />
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={!t.trim() && !b.trim()}
          onClick={() => emit('game:action', { type: 'meme', payload: { top: t, bottom: b } })}
        >
          {priv.submitted ? 'Aggiorna il meme' : 'Consegna il meme'}
        </button>
        {priv.submitted && <p className="dim center" style={{ margin: 0, textAlign: 'center' }}>Consegnato ✓</p>}
      </div>
    );
  }

  if (priv.phase === 'vote') {
    if (priv.hasVoted) return <WaitingPanel title="Voto inviato" sub="Aspetta gli altri." />;
    return (
      <>
        <div className="kicker center" style={{ textAlign: 'center' }}>Vota il meme migliore</div>
        <div className="vote-list grow">
          {(priv.options ?? []).map((o) => (
            <button
              key={o.playerId}
              className="choice-btn"
              onClick={() => emit('game:action', { type: 'vote', payload: { playerId: o.playerId } })}
            >
              <div style={{ textTransform: 'uppercase', fontSize: '.9rem' }}>{o.top || '·'}</div>
              <div style={{ fontSize: '1.6rem', textAlign: 'center' }}>{priv.template.art}</div>
              <div style={{ textTransform: 'uppercase', fontSize: '.9rem' }}>{o.bottom || '·'}</div>
            </button>
          ))}
        </div>
      </>
    );
  }

  return <WaitingPanel title="Round concluso" />;
}
