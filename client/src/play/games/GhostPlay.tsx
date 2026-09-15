import { useState } from 'react';
import { emit, usePrivate } from '../../net.ts';

interface Priv {
  out: boolean;
  letters: number;
  sequence: string;
  myTurn: boolean;
  canChallenge: boolean;
  canClaim: boolean;
  mustDefend: boolean;
  mustVote: boolean;
  voteQuestion: string | null;
  sequenceAlive: boolean;
}

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const GHOST = 'GHOST';

export function GhostPlay() {
  const priv = usePrivate<Priv>();
  const [word, setWord] = useState('');

  if (!priv) return <div className="phone-hero"><span className="waiting-dots"><i /><i /><i /></span></div>;

  const letters = (
    <div className="g-letters">
      {[...GHOST].map((c, i) => (
        <span key={i} className={i < priv.letters ? 'on' : ''}>{c}</span>
      ))}
    </div>
  );

  if (priv.out) {
    return (
      <div className="phone-hero">
        <h2>Eliminato</h2>
        {letters}
        <p className="dim">Guarda la TV, il round continua senza di te.</p>
      </div>
    );
  }

  /* --------------------------- devo difendermi --------------------------- */
  if (priv.mustDefend) {
    return (
      <div className="phone-hero">
        <div className="kicker">Sei stato contestato</div>
        <h2>Che parola avevi in mente?</h2>
        <div className="g-seq">{priv.sequence}</div>
        <input
          className="field"
          style={{ textAlign: 'center', textTransform: 'uppercase' }}
          value={word}
          onChange={(e) => setWord(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
          placeholder={`inizia per ${priv.sequence}`}
          autoFocus
        />
        <button
          className="btn btn-primary btn-block btn-lg"
          disabled={!word.startsWith(priv.sequence) || word.length < 4}
          onClick={() => { emit('game:action', { type: 'defend', payload: { word } }); setWord(''); }}
        >
          Dichiara la parola
        </button>
      </div>
    );
  }

  /* ------------------------------ devo votare ---------------------------- */
  if (priv.mustVote) {
    return (
      <div className="phone-hero">
        <div className="kicker">Decidi tu</div>
        <h2>{priv.voteQuestion}</h2>
        <div className="row" style={{ gap: 12, width: '100%' }}>
          <button className="btn btn-primary grow btn-lg" onClick={() => emit('game:action', { type: 'vote', payload: { yes: true } })}>
            Sì, esiste
          </button>
          <button className="btn btn-hot grow btn-lg" onClick={() => emit('game:action', { type: 'vote', payload: { yes: false } })}>
            No, inventata
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------- il mio turno --------------------------- */
  if (priv.myTurn) {
    return (
      <>
        <div className="col center" style={{ gap: 10 }}>
          <div className="kicker">Tocca a te</div>
          <div className="g-seq">{priv.sequence}<span className="caret">_</span></div>
          {letters}
        </div>

        <div className="kbd grow" style={{ justifyContent: 'flex-end' }}>
          {ROWS.map((row, i) => (
            <div key={i} className="kbd-row">
              {[...row].map((k) => (
                <button key={k} className="key" onClick={() => emit('game:action', { type: 'letter', payload: { ch: k } })}>
                  {k}
                </button>
              ))}
            </div>
          ))}
        </div>

        {priv.canChallenge && (
          <div className="g-actions">
            <button className="btn btn-hot" onClick={() => emit('game:action', { type: 'challenge' })}>
              Contesto: bluffa!
            </button>
          </div>
        )}
      </>
    );
  }

  /* ------------------------------- sto guardando -------------------------- */
  return (
    <div className="phone-hero">
      <div className="kicker">Turno di un altro</div>
      <div className="g-seq">{priv.sequence || '—'}</div>
      {letters}
      {priv.canClaim && (
        <button className="btn btn-hot btn-block" onClick={() => emit('game:action', { type: 'claim' })}>
          È già una parola!
        </button>
      )}
      <p className="faint" style={{ fontSize: '.85rem' }}>
        Preparati: quando tocca a te hai pochi secondi.
      </p>
    </div>
  );
}
