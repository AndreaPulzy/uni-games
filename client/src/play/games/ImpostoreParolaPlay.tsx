import { useState } from 'react';
import { emit, usePrivate } from '../../net.ts';
import { VotePanel, WaitingPanel, type Candidate } from './impostore-shared.tsx';

interface Priv {
  phase: 'secret' | 'discussion' | 'vote' | 'guess' | 'result';
  isImpostor: boolean;
  parola: string | null;
  myTurn: boolean;
  canVote: boolean;
  mustGuess: boolean;
  cluesGiven: number;
  cluesTotal: number;
  candidates: Candidate[];
}

export function ImpostoreParolaPlay() {
  const priv = usePrivate<Priv>();
  const [clue, setClue] = useState('');
  const [guess, setGuess] = useState('');

  if (!priv) return <WaitingPanel title="Distribuzione ruoli…" />;

  const roleCard = (
    <div className={`secret-card${priv.isImpostor ? ' impostor' : ''}`}>
      <div className="lbl">{priv.isImpostor ? 'Il tuo ruolo' : 'La parola segreta'}</div>
      <div className="val">{priv.isImpostor ? "SEI L'IMPOSTORE" : priv.parola}</div>
    </div>
  );

  if (priv.phase === 'secret') {
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 18 }}>
        {roleCard}
        {priv.myTurn ? (
          <>
            <div className="kicker center">Tocca a te: una parola sola</div>
            <input
              className="field"
              style={{ textAlign: 'center' }}
              value={clue}
              onChange={(e) => setClue(e.target.value.replace(/\s/g, '').slice(0, 24))}
              placeholder="il tuo indizio"
              autoFocus
            />
            <button
              className="btn btn-primary btn-block btn-lg"
              disabled={!clue.trim()}
              onClick={() => { emit('game:action', { type: 'clue', payload: { word: clue.trim() } }); setClue(''); }}
            >
              Dai l'indizio
            </button>
          </>
        ) : (
          <p className="dim center" style={{ textAlign: 'center' }}>
            Indizi dati: {priv.cluesGiven}/{priv.cluesTotal}. Ascolta e preparati.
          </p>
        )}
      </div>
    );
  }

  if (priv.phase === 'discussion') {
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 18 }}>
        {roleCard}
        <p className="dim center" style={{ textAlign: 'center' }}>
          Discussione libera. {priv.isImpostor ? 'Reggi il bluff.' : "Trova chi non c'entra."}
        </p>
      </div>
    );
  }

  if (priv.phase === 'vote') {
    return priv.canVote
      ? <VotePanel candidates={priv.candidates} />
      : <WaitingPanel title="Voto inviato" sub="Aspetta gli altri." />;
  }

  if (priv.phase === 'guess') {
    return priv.mustGuess ? (
      <div className="phone-hero">
        <div className="kicker">Ti hanno beccato</div>
        <h2>Qual era la parola?</h2>
        <input
          className="field"
          style={{ textAlign: 'center' }}
          value={guess}
          onChange={(e) => setGuess(e.target.value.slice(0, 30))}
          placeholder="la tua ipotesi"
          autoFocus
        />
        <button
          className="btn btn-hot btn-block btn-lg"
          disabled={!guess.trim()}
          onClick={() => emit('game:action', { type: 'guess', payload: { word: guess.trim() } })}
        >
          Gioca il tutto per tutto
        </button>
      </div>
    ) : (
      <WaitingPanel title="L'impostore prova a indovinare" sub="Incrociate le dita." />
    );
  }

  return <WaitingPanel title="Round concluso" />;
}
