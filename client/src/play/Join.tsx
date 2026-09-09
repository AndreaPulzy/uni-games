import { useState } from 'react';
import { emit } from '../net.ts';

export function Join({
  initialCode,
  busy,
  onJoined,
}: {
  initialCode: string;
  busy: boolean;
  onJoined: (playerId: string, token: string, name: string, code: string) => void;
}) {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState(localStorage.getItem('uni:name') ?? '');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);
    const clean = code.trim().toUpperCase();
    const r = await emit<{ ok: boolean; error?: string; playerId?: string; token?: string }>(
      'player:join',
      { code: clean, name: name.trim(), token: localStorage.getItem('uni:token') ?? undefined }
    );
    setSending(false);
    if (r.ok && r.playerId && r.token) onJoined(r.playerId, r.token, name.trim(), clean);
    else setError(r.error ?? 'Errore di connessione');
  }

  if (busy) {
    return (
      <div className="phone center">
        <span className="waiting-dots"><i /><i /><i /></span>
      </div>
    );
  }

  return (
    <div className="phone">
      <div className="phone-hero">
        <div>
          <div className="kicker" style={{ marginBottom: 8 }}>Party Game</div>
          <h1 className="grad-text" style={{ fontSize: 'clamp(38px, 13vw, 62px)' }}>UNI GAMES</h1>
        </div>

        <form className="col" style={{ gap: 12, width: '100%' }} onSubmit={submit}>
          <input
            className="field mono"
            style={{ textAlign: 'center', fontSize: '1.7rem', letterSpacing: '.3em', textTransform: 'uppercase' }}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
            placeholder="CODE"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={4}
            required
          />
          <input
            className="field"
            style={{ textAlign: 'center' }}
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 14))}
            placeholder="Il tuo nome"
            autoComplete="nickname"
            maxLength={14}
            required
          />
          <button className="btn btn-primary btn-lg btn-block" disabled={sending || code.length !== 4 || !name.trim()}>
            {sending ? 'Entro…' : 'Entra in partita'}
          </button>
          {error && <div style={{ color: 'var(--danger)', textAlign: 'center', fontWeight: 700 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
