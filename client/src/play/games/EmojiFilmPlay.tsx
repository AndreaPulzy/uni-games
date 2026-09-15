import { useEffect, useState } from 'react';
import { emit, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';

interface Priv {
  phase: 'guess' | 'reveal';
  index: number;
  total: number;
  emoji: string;
  tipo: 'Film' | 'Serie TV';
  hint: string | null;
  solved: boolean;
  tries: number;
  maxTries: number;
  titolo: string | null;
  gain: number | null;
}

export function EmojiFilmPlay() {
  const priv = usePrivate<Priv>();
  const [text, setText] = useState('');

  useEffect(() => { setText(''); }, [priv?.index]);

  if (!priv) return <WaitingPanel title="Arrivano le emoji…" />;

  if (priv.phase === 'reveal') {
    return (
      <div className="phone-hero">
        <div className="emoji-phone">{priv.emoji}</div>
        <div className="kicker">Era</div>
        <h2 className="grad-text">{priv.titolo}</h2>
        {priv.gain
          ? <div className="big-num" style={{ color: 'var(--lime)' }}>+{priv.gain}</div>
          : <p className="dim">Niente punti su questo</p>}
      </div>
    );
  }

  if (priv.solved) return <WaitingPanel title="Indovinato!" sub="Aspetta gli altri." />;

  const left = priv.maxTries - priv.tries;
  if (left <= 0) return <WaitingPanel title="Tentativi finiti" sub="Vediamo se qualcuno ci arriva." />;

  const send = () => {
    const t = text.trim();
    if (!t) return;
    emit('game:action', { type: 'guess', payload: { text: t } });
    setText('');
  };

  return (
    <div className="col grow" style={{ justifyContent: 'center', gap: 14 }}>
      <div className="col center" style={{ gap: 8 }}>
        <span className="chip chip-cat-timed">{priv.tipo} · {priv.index + 1}/{priv.total}</span>
        <div className="emoji-phone">{priv.emoji}</div>
        {priv.hint && <div className="draw-mask" style={{ fontSize: '1.3rem' }}>{priv.hint}</div>}
      </div>

      <form className="col" style={{ gap: 10 }} onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input
          className="field"
          style={{ textAlign: 'center' }}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 60))}
          placeholder={priv.tipo === 'Film' ? 'titolo del film' : 'titolo della serie'}
          autoComplete="off"
          autoFocus
        />
        <button className="btn btn-primary btn-block btn-lg" disabled={!text.trim()}>Prova</button>
      </form>

      <p className="faint" style={{ margin: 0, textAlign: 'center', fontSize: '.85rem' }}>
        {left} {left === 1 ? 'tentativo rimasto' : 'tentativi rimasti'}
      </p>
    </div>
  );
}
