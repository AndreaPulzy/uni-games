import { useEffect, useState } from 'react';
import { emit, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';

interface Priv {
  phase: 'guess' | 'reveal' | 'result';
  titolo: string;
  myTeam: string | null;
  myTurn: boolean;
  scores: Record<string, number>;
  trovati: string[];
}

export function Top10Play() {
  const priv = usePrivate<Priv>();
  const [text, setText] = useState('');

  // svuota il campo appena il turno passa, cosi non resti col testo vecchio
  useEffect(() => { if (!priv?.myTurn) setText(''); }, [priv?.myTurn]);

  if (!priv) return <WaitingPanel title="Estrazione della classifica…" />;
  if (priv.phase === 'reveal') return <WaitingPanel title="Ecco la classifica vera" sub="Guarda la TV." />;
  if (priv.phase === 'result') return <WaitingPanel title="Round concluso" />;

  if (!priv.myTurn) {
    return <WaitingPanel title="Tocca agli avversari" sub="Preparate la prossima risposta." />;
  }

  return (
    <div className="col grow" style={{ justifyContent: 'center', gap: 16 }}>
      <div className="col center" style={{ gap: 6 }}>
        <div className="kicker">Tocca alla tua squadra</div>
        <p className="dim" style={{ margin: 0, textAlign: 'center', fontWeight: 700 }}>{priv.titolo}</p>
      </div>
      <input
        className="field"
        style={{ textAlign: 'center' }}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 40))}
        placeholder="la vostra risposta"
        autoFocus
      />
      <button
        className="btn btn-primary btn-block btn-lg"
        disabled={!text.trim()}
        onClick={() => { emit('game:action', { type: 'guess', payload: { text: text.trim() } }); setText(''); }}
      >
        Rispondi
      </button>
      {priv.trovati.length > 0 && (
        <div className="clue-mini">
          {priv.trovati.map((t, i) => <span key={i}>{t}</span>)}
        </div>
      )}
    </div>
  );
}
