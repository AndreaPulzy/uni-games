import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { emit } from '../net.ts';
import type { GameId, RoomState } from '@shared/types.ts';
import { MIN_PLAYERS, playableGames } from '@shared/catalog.ts';
import { Setup } from './Setup.tsx';

export function Lobby({ room, joinUrl }: { room: RoomState; joinUrl: string }) {
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  // le impostazioni vivono sul server: TV e regista vedono sempre le stesse
  const { excluded, totalRounds } = room.settings;
  const active = room.players.filter((p) => p.connected);
  const pool = playableGames(active.length, excluded);
  const canStart = active.length >= MIN_PLAYERS && pool.length > 0;
  const director = room.players.find((p) => p.id === room.directorId) ?? null;

  useEffect(() => {
    QRCode.toDataURL(joinUrl, {
      margin: 0,
      width: 480,
      color: { dark: '#05041a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setQr).catch(() => setQr(''));
  }, [joinUrl]);

  async function send(event: string, payload?: unknown) {
    setError('');
    const r = await emit<{ ok: boolean; error?: string }>(event, payload);
    if (!r?.ok) setError(r?.error ?? 'Qualcosa è andato storto');
  }

  const toggle = (id: GameId) =>
    send('host:settings', {
      settings: { excluded: excluded.includes(id) ? excluded.filter((x) => x !== id) : [...excluded, id] },
    });

  return (
    <div className="lobby">
      <div className="panel join-card">
        <div className="kicker">Entra con il telefono</div>
        {qr && (
          <div className="qr-frame">
            <img src={qr} alt="QR code per entrare in partita" />
          </div>
        )}
        <div className="room-code">{room.code}</div>
        <div className="join-url">{joinUrl}</div>
      </div>

      <div className="roster">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="kicker">In attesa</div>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 48px)' }}>
              {active.length} giocator{active.length === 1 ? 'e' : 'i'}
            </h2>
            <p className="dim" style={{ margin: '6px 0 0', fontSize: '.9rem' }}>
              {director
                ? <>🎬 <b style={{ color: 'var(--gold)' }}>{director.name}</b> è il regista: può avviare e comandare la partita dal telefono</>
                : 'Il primo che entra diventa il regista e comanda dal telefono'}
            </p>
          </div>
          <div className="col" style={{ alignItems: 'flex-end', gap: 8 }}>
            <button className="btn btn-primary btn-lg" onClick={() => send('host:start', {})} disabled={!canStart}>
              {active.length < MIN_PLAYERS
                ? `Servono ${MIN_PLAYERS} giocatori`
                : pool.length === 0
                  ? 'Nessun gioco selezionato'
                  : 'Inizia la partita'}
            </button>
            <button className="btn" style={{ padding: '8px 16px', fontSize: '.85rem' }}
                    onClick={() => setShowSetup((v) => !v)}>
              {showSetup ? 'Nascondi impostazioni' : 'Scegli i minigiochi'}
            </button>
            <span className="faint" style={{ fontSize: '.85rem' }}>
              {pool.length} {pool.length === 1 ? 'minigioco' : 'minigiochi'} in gioco · {totalRounds} round
            </span>
            {error && <span style={{ color: 'var(--danger)', fontSize: '.85rem' }}>{error}</span>}
          </div>
        </div>

        {showSetup ? (
          <Setup
            playerCount={active.length}
            excluded={excluded}
            rounds={totalRounds}
            onToggle={toggle}
            onRounds={(n) => send('host:settings', { settings: { totalRounds: n } })}
          />
        ) : (
          <div className="roster-grid">
            {room.players.map((p) => {
              const isDirector = p.id === room.directorId;
              return (
                <button
                  key={p.id}
                  className={`player-card${p.connected ? '' : ' off'}${isDirector ? ' director' : ''}`}
                  style={{ ['--pc' as string]: p.color }}
                  title={isDirector ? 'Regista' : 'Clicca per renderlo regista'}
                  onClick={() => !isDirector && p.connected && send('director:transfer', { playerId: p.id })}
                >
                  <span className="av">{p.avatar}</span>
                  <span className="nm">{p.name}</span>
                  {isDirector && <span className="dir-badge">🎬 regista</span>}
                </button>
              );
            })}
            {Array.from({ length: Math.max(0, MIN_PLAYERS - room.players.length) }).map((_, i) => (
              <div key={`slot${i}`} className="empty-slot">posto libero</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
