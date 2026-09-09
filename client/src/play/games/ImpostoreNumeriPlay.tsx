import { useState } from 'react';
import { emit, usePrivate } from '../../net.ts';
import { VotePanel, WaitingPanel, type Candidate } from './impostore-shared.tsx';

interface Priv {
  phase: 'secret' | 'discussion' | 'vote' | 'guess' | 'result';
  isImpostor: boolean;
  domanda: string;
  myAnswer: number | null;
  answeredCount: number;
  answeredTotal: number;
  canVote: boolean;
  candidates: Candidate[];
}

export function ImpostoreNumeriPlay() {
  const priv = usePrivate<Priv>();
  const [value, setValue] = useState('');

  if (!priv) return <WaitingPanel title="Distribuzione domande…" />;

  if (priv.phase === 'secret') {
    if (priv.myAnswer !== null) {
      return (
        <WaitingPanel
          title={`Hai risposto ${priv.myAnswer}`}
          sub={`${priv.answeredCount}/${priv.answeredTotal} hanno inviato il numero.`}
        />
      );
    }
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 18 }}>
        <div className="secret-card">
          <div className="lbl">La tua domanda</div>
          <div className="val" style={{ fontSize: 'clamp(19px, 5.5vw, 26px)' }}>{priv.domanda}</div>
        </div>
        <input
          className="field mono"
          style={{ textAlign: 'center', fontSize: '2rem' }}
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          placeholder="0"
          autoFocus
        />
        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={value === ''}
          onClick={() => emit('game:action', { type: 'answer', payload: { value: Number(value) } })}
        >
          Invia il numero
        </button>
      </div>
    );
  }

  if (priv.phase === 'discussion') {
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 18 }}>
        <div className="secret-card">
          <div className="lbl">La tua domanda era</div>
          <div className="val" style={{ fontSize: 'clamp(17px, 5vw, 23px)' }}>{priv.domanda}</div>
        </div>
        <p className="dim center" style={{ textAlign: 'center' }}>
          Spiega il tuo numero a voce. Guarda la TV per i numeri degli altri.
        </p>
      </div>
    );
  }

  if (priv.phase === 'vote') {
    return priv.canVote
      ? <VotePanel candidates={priv.candidates} />
      : <WaitingPanel title="Voto inviato" sub="Aspetta gli altri." />;
  }

  return <WaitingPanel title="Round concluso" />;
}
