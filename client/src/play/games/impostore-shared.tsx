import { useState } from 'react';
import { emit } from '../../net.ts';

export interface Candidate { id: string; name: string; avatar: string }

/** Schermata di voto condivisa dai due Impostori. */
export function VotePanel({ candidates }: { candidates: Candidate[] }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="phone-hero">
        <h2>Voto inviato</h2>
        <p className="dim">Aspetta gli altri.</p>
        <span className="waiting-dots"><i /><i /><i /></span>
      </div>
    );
  }

  return (
    <>
      <div className="col center" style={{ gap: 4 }}>
        <div className="kicker">Chi è l'impostore?</div>
      </div>
      <div className="vote-list grow">
        {candidates.map((c) => (
          <button
            key={c.id}
            className={`vote-btn${picked === c.id ? ' picked' : ''}`}
            onClick={() => setPicked(c.id)}
          >
            <span className="av">{c.avatar}</span>
            {c.name}
          </button>
        ))}
      </div>
      <button
        className="btn btn-hot btn-block btn-lg"
        disabled={!picked}
        onClick={() => { emit('game:action', { type: 'vote', payload: { playerId: picked } }); setSent(true); }}
      >
        Conferma il voto
      </button>
    </>
  );
}

export function WaitingPanel({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="phone-hero">
      <h2>{title}</h2>
      {sub && <p className="dim">{sub}</p>}
      <span className="waiting-dots"><i /><i /><i /></span>
    </div>
  );
}
