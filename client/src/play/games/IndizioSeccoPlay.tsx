import { useEffect, useState } from 'react';
import type { Player, RoomState, TeamId } from '@shared/types.ts';
import { emit, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';

interface Priv {
  phase: 'clue' | 'guess' | 'reveal';
  myTeam: TeamId | null;
  isGiver: boolean;
  parola: string | null;
  categoria: string;
  myTurnToClue: boolean;
  mustJudge: boolean;
  guessingTeam: TeamId;
  clues: { team: TeamId; word: string }[];
  lastClue: string | null;
  worth: number;
}

export function IndizioSeccoPlay({ room }: { room: RoomState; me: Player }) {
  const priv = usePrivate<Priv>();
  const [word, setWord] = useState('');

  useEffect(() => { setWord(''); }, [priv?.clues.length, priv?.parola]);

  if (!priv) return <WaitingPanel title="Si mescolano le carte…" />;

  const teamOf = (id: TeamId) => room.teams?.find((t) => t.id === id);
  const guessing = teamOf(priv.guessingTeam);

  const chain = priv.clues.length > 0 && (
    <div className="clue-mini">
      {priv.clues.map((c, i) => (
        <span key={i} style={{ borderColor: teamOf(c.team)?.color }}>{c.word}</span>
      ))}
    </div>
  );
  const secret = priv.parola && (
    <div className="card-face">
      <div className="tipo">{priv.categoria}</div>
      <div className="word">{priv.parola}</div>
    </div>
  );

  if (priv.phase === 'reveal') {
    return (
      <div className="phone-hero">
        <div className="kicker">La parola era</div>
        <h2 className="grad-text">{priv.parola}</h2>
        {chain}
      </div>
    );
  }

  if (priv.myTurnToClue) {
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 14 }}>
        {secret}
        <div className="kicker" style={{ textAlign: 'center' }}>Tocca a te · una parola sola · vale {priv.worth} punti</div>
        {chain}
        <input
          className="field"
          style={{ textAlign: 'center', fontSize: '1.2rem' }}
          value={word}
          onChange={(e) => setWord(e.target.value.replace(/\s/g, '').slice(0, 24))}
          placeholder="il tuo indizio"
          autoComplete="off"
          autoFocus
        />
        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={!word}
          onClick={() => emit('game:action', { type: 'clue', payload: { word } })}
        >
          Dai l'indizio
        </button>
      </div>
    );
  }

  if (priv.mustJudge) {
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 14 }}>
        {secret}
        <p className="dim" style={{ textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          Indizio: <b>{priv.lastClue}</b>. La <b style={{ color: guessing?.color }}>{guessing?.name}</b> risponde a voce.
          Ha indovinato?
        </p>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-primary grow btn-lg"
                  onClick={() => emit('game:action', { type: 'judge', payload: { correct: true } })}>
            Indovinata
          </button>
          <button className="btn btn-hot grow btn-lg"
                  onClick={() => emit('game:action', { type: 'judge', payload: { correct: false } })}>
            Sbagliata
          </button>
        </div>
      </div>
    );
  }

  if (priv.isGiver) {
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 14 }}>
        {secret}
        <p className="dim" style={{ textAlign: 'center', margin: 0 }}>
          {priv.phase === 'guess' && priv.myTeam === priv.guessingTeam
            ? 'La tua squadra sta rispondendo: non suggerire a voce!'
            : 'Aspetta il tuo turno per dare un indizio.'}
        </p>
        {chain}
      </div>
    );
  }

  if (priv.phase === 'guess' && priv.myTeam === priv.guessingTeam) {
    return (
      <div className="phone-hero">
        <div className="kicker">Tocca a voi · vale {priv.worth} punti</div>
        <h2 className="grad-text">{priv.lastClue}</h2>
        <p className="dim">Rispondete a voce. Valgono tutti gli indizi:</p>
        {chain}
      </div>
    );
  }

  return (
    <div className="phone-hero">
      <div className="kicker">{priv.categoria}</div>
      <h2>{priv.phase === 'clue' ? 'Arriva un indizio…' : `Risponde la ${guessing?.name ?? ''}`}</h2>
      {chain}
    </div>
  );
}
