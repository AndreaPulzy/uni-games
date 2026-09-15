import { useState } from 'react';
import { advance, emit } from '../net.ts';
import type { GameId, Player, RoomState } from '@shared/types.ts';
import { MIN_PLAYERS, playableGames } from '@shared/catalog.ts';
import { Setup } from '../host/Setup.tsx';

type Reply = { ok: boolean; error?: string } | undefined;

/** Lobby vista dal regista: con una smart TV senza mouse e' da qui che si
 *  scelgono i giochi e si avvia la partita. */
export function DirectorLobby({ room, me }: { room: RoomState; me: Player }) {
  const [error, setError] = useState('');
  const { excluded, totalRounds } = room.settings;
  const active = room.players.filter((p) => p.connected);
  const pool = playableGames(active.length, excluded);
  const canStart = active.length >= MIN_PLAYERS && pool.length > 0;
  const others = active.filter((p) => p.id !== me.id);

  async function send(event: string, payload?: unknown) {
    setError('');
    const r = await emit<Reply>(event, payload);
    if (!r?.ok) setError(r?.error ?? 'Qualcosa è andato storto');
  }

  // il server accende o spegne il singolo gioco: tocchi rapidi non si sovrascrivono
  const toggle = (id: GameId) => send('host:settings', { settings: { toggle: id } });

  return (
    <div className="director-lobby">
      <div className="director-card">
        <div className="kicker">🎬 Sei il regista</div>
        <p className="dim" style={{ margin: '8px 0 0', lineHeight: 1.5 }}>
          Comandi tu da qui: scegli i giochi, avvii la partita e fai andare avanti le schermate.
          La TV fa solo da schermo.
        </p>
      </div>

      <button className="btn btn-primary btn-lg btn-block" disabled={!canStart} onClick={() => send('host:start', {})}>
        {active.length < MIN_PLAYERS
          ? `Servono ${MIN_PLAYERS} giocatori (ora ${active.length})`
          : pool.length === 0
            ? 'Nessun gioco selezionato'
            : `Inizia la partita · ${active.length} giocatori`}
      </button>
      {error && <div style={{ color: 'var(--danger)', textAlign: 'center', fontWeight: 700 }}>{error}</div>}
      <span className="faint" style={{ textAlign: 'center', fontSize: '.85rem' }}>
        {pool.length} {pool.length === 1 ? 'minigioco' : 'minigiochi'} in gioco · {totalRounds} round
      </span>

      <Setup
        playerCount={active.length}
        excluded={excluded}
        rounds={totalRounds}
        onToggle={toggle}
        onRounds={(n) => send('host:settings', { settings: { totalRounds: n } })}
      />

      {others.length > 0 && (
        <div className="ncc-field">
          <label>Passa la regia a</label>
          <select
            className="field"
            value=""
            onChange={(e) => e.target.value && send('director:transfer', { playerId: e.target.value })}
          >
            <option value="">scegli un giocatore…</option>
            {others.map((p) => <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

/** Durante la partita il regista ha un solo pulsante: quello che serve adesso.
 *  Compare solo quando c'e' davvero qualcosa da far avanzare. */
export function DirectorBar({ room }: { room: RoomState }) {
  const [busy, setBusy] = useState(false);
  const label = room.phase === 'final' ? 'Nuova partita' : room.directorAction;
  if (!label) return null;

  async function go() {
    setBusy(true);
    try {
      if (room.phase === 'final') await emit('host:restart');
      else await advance(room);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="director-bar">
      <div className="kicker">🎬 Regia</div>
      <button className="btn btn-primary btn-block" disabled={busy} onClick={go}>{label}</button>
    </div>
  );
}
