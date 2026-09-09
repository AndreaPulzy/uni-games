import { emit, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';

export interface TeamPriv {
  phase: 'ready' | 'playing' | 'steal' | 'result';
  myTeam: string | null;
  myTurn: boolean;
  isPresenter: boolean;
  canBegin: boolean;
  canScore: boolean;
  canJudgeSteal: boolean;
  scores: Record<string, number>;
  canBuzz?: boolean;
  role?: string;
  partner?: string[];
  isStealer?: boolean;
}

/** Controller comune a Taboo, Intesa Vincente e Mimo. */
export function TeamCardPlay({
  readyText, waitText, card,
}: {
  readyText: string;
  waitText: string;
  /** cosa vede in mano chi presenta */
  card: (priv: TeamPriv) => JSX.Element | null;
}) {
  const priv = usePrivate<TeamPriv>();
  if (!priv) return <WaitingPanel title="Formazione squadre…" />;

  if (priv.phase === 'result') return <WaitingPanel title="Round concluso" />;

  /* --------------------------- il buzzer avversario ----------------------- */
  if (priv.phase === 'playing' && priv.canBuzz) {
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 18 }}>
        <p className="dim center" style={{ textAlign: 'center', margin: 0 }}>
          Sorveglia il suggeritore: se dice una parola vietata, premi.
        </p>
        <button className="buzz-btn" onClick={() => emit('game:action', { type: 'buzz' })}>
          BUZZER
        </button>
      </div>
    );
  }

  /* ------------------------------ furto (Mimo) ---------------------------- */
  if (priv.phase === 'steal') {
    if (priv.canJudgeSteal) {
      return (
        <div className="col grow" style={{ justifyContent: 'center', gap: 16 }}>
          {card(priv)}
          <p className="dim center" style={{ textAlign: 'center', margin: 0 }}>
            Gli avversari hanno una risposta secca. Hanno indovinato?
          </p>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-primary grow btn-lg" onClick={() => emit('game:action', { type: 'stealOk' })}>
              Rubata
            </button>
            <button className="btn btn-hot grow btn-lg" onClick={() => emit('game:action', { type: 'stealNo' })}>
              Sbagliata
            </button>
          </div>
        </div>
      );
    }
    return (
      <WaitingPanel
        title={priv.isStealer ? 'Provate a rubare!' : 'Tempo scaduto'}
        sub={priv.isStealer ? 'Una sola risposta, ditela a voce.' : 'Gli avversari tentano il furto.'}
      />
    );
  }

  /* --------------------------------- attesa ------------------------------- */
  if (!priv.myTurn) {
    return <WaitingPanel title="Tocca agli avversari" sub="Guarda la TV." />;
  }

  if (priv.phase === 'ready') {
    return priv.canBegin ? (
      <div className="col grow" style={{ justifyContent: 'center', gap: 18 }}>
        <div className="col center" style={{ gap: 8 }}>
          <span className="role-pill">{priv.role ?? 'tocca a te'}</span>
          {priv.partner && priv.partner.length > 0 && (
            <p className="dim" style={{ margin: 0 }}>In coppia con {priv.partner.join(', ')}</p>
          )}
        </div>
        <p className="dim center" style={{ textAlign: 'center', margin: 0 }}>{readyText}</p>
        <button className="btn btn-primary btn-block btn-lg" onClick={() => emit('game:action', { type: 'begin' })}>
          Pronti, via!
        </button>
      </div>
    ) : (
      <WaitingPanel title="La tua squadra sta per giocare" sub={waitText} />
    );
  }

  /* ------------------------------- in gioco ------------------------------- */
  if (!priv.canScore) {
    return <WaitingPanel title="Tocca a voi!" sub={waitText} />;
  }

  return (
    <div className="col grow" style={{ justifyContent: 'center', gap: 18 }}>
      {card(priv)}
      <div className="row" style={{ gap: 10 }}>
        <button className="btn grow btn-lg" onClick={() => emit('game:action', { type: 'skip' })}>
          Passo
        </button>
        <button className="btn btn-primary grow btn-lg" onClick={() => emit('game:action', { type: 'correct' })}>
          Indovinata!
        </button>
      </div>
    </div>
  );
}
