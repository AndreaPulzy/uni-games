import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { socket, useConnected, useRoom, useToasts, emit } from '../net.ts';
import { Join } from './Join.tsx';
import { Controller } from './Controller.tsx';

const TOKEN_KEY = 'uni:token';
const NAME_KEY = 'uni:name';
const CODE_KEY = 'uni:code';

export function PlayApp() {
  const room = useRoom();
  const toasts = useToasts();
  const online = useConnected();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);

  const codeFromUrl = (() => {
    const m = window.location.pathname.match(/^\/j\/([A-Za-z]{4})/);
    return m ? m[1].toUpperCase() : '';
  })();

  /** Rientro automatico col token salvato, all'avvio e a ogni riconnessione.
   *  Codice, nome e token si leggono al momento del rientro e non all'apertura
   *  della pagina: chi è entrato dal modulo deve poter rientrare lo stesso. */
  useEffect(() => {
    async function rejoin() {
      const token = localStorage.getItem(TOKEN_KEY);
      const name = localStorage.getItem(NAME_KEY);
      const code = codeFromUrl || localStorage.getItem(CODE_KEY) || '';
      if (!token || !name || !code) { setJoining(false); return; }
      const r = await emit<{ ok: boolean; playerId?: string; error?: string }>('player:join', { code, name, token });
      if (r.ok && r.playerId) {
        setPlayerId(r.playerId);
      } else {
        // stanza chiusa o partita a cui non si partecipava: si torna al modulo
        if (r.error === 'Codice stanza non valido') localStorage.removeItem(CODE_KEY);
        setPlayerId(null);
      }
      setJoining(false);
    }
    if (socket.connected) rejoin();
    socket.on('connect', rejoin);
    return () => { socket.off('connect', rejoin); };
  }, [codeFromUrl]);

  const me = room?.players.find((p) => p.id === playerId) ?? null;

  return (
    <div className="stage">
      {!playerId || !room || !me ? (
        <Join
          initialCode={codeFromUrl || localStorage.getItem(CODE_KEY) || ''}
          busy={joining}
          onJoined={(id, token, name, code) => {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(NAME_KEY, name);
            localStorage.setItem(CODE_KEY, code);
            setPlayerId(id);
          }}
        />
      ) : (
        <Controller room={room} me={me} />
      )}

      {playerId && !online && <div className="conn-banner">Connessione persa, mi ricollego…</div>}

      <div className="toast-host">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast toast-${t.kind}`}
              initial={{ opacity: 0, y: 16, scale: .95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: .95 }}
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
