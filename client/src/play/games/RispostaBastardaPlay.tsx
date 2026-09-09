import { useEffect, useState } from 'react';
import { emit, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';

interface Assignment { index: number; prompt: string; text: string }
interface Priv {
  phase: 'write' | 'vote' | 'result';
  assignments: Assignment[] | null;
  canVote: boolean;
  isAuthor: boolean;
  duel: { prompt: string; options: { authorId: string; text: string }[] } | null;
}

export function RispostaBastardaPlay() {
  const priv = usePrivate<Priv>();
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [voted, setVoted] = useState(false);

  useEffect(() => { setVoted(false); }, [priv?.duel?.prompt]);

  if (!priv) return <WaitingPanel title="Distribuzione dei prompt…" />;

  if (priv.phase === 'write' && priv.assignments) {
    const pending = priv.assignments.filter((a) => !a.text).length;
    return (
      <>
        <div className="col center" style={{ gap: 4 }}>
          <div className="kicker">Due prompt, due battute</div>
          {pending === 0 && <p className="dim" style={{ margin: 0 }}>Consegnate. Aspetta gli altri.</p>}
        </div>
        <div className="vote-list grow">
          {priv.assignments.map((a) => (
            <div key={a.index} className={`prompt-card${a.text ? ' done' : ''}`}>
              <div className="q">{a.prompt}</div>
              <textarea
                className="field"
                value={drafts[a.index] ?? a.text}
                onChange={(e) => setDrafts((d) => ({ ...d, [a.index]: e.target.value.slice(0, 120) }))}
                placeholder="la tua risposta…"
                maxLength={120}
              />
              <button
                className="btn btn-primary"
                disabled={!(drafts[a.index] ?? a.text).trim()}
                onClick={() => emit('game:action', {
                  type: 'answer',
                  payload: { index: a.index, text: (drafts[a.index] ?? a.text).trim() },
                })}
              >
                {a.text ? 'Aggiorna' : 'Invia'}
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (priv.phase === 'vote') {
    if (priv.isAuthor) return <WaitingPanel title="È il tuo duello" sub="Non puoi votare. Guarda la TV." />;
    if (!priv.canVote || voted) return <WaitingPanel title="Voto inviato" sub="Aspetta gli altri." />;

    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 16 }}>
        <div className="kicker center" style={{ textAlign: 'center' }}>{priv.duel?.prompt}</div>
        {priv.duel?.options.map((o, i) => (
          <button
            key={o.authorId}
            className={`choice-btn ${i === 0 ? 'a' : 'b'}`}
            onClick={() => { emit('game:action', { type: 'vote', payload: { playerId: o.authorId } }); setVoted(true); }}
          >
            {o.text}
          </button>
        ))}
      </div>
    );
  }

  return <WaitingPanel title="Round concluso" />;
}
