import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { socket, useRoom, useToasts, emit } from '../net.ts';
import { Join } from './Join.tsx';
import { Controller } from './Controller.tsx';

const TOKEN_KEY = 'uni:token';
const NAME_KEY = 'uni:name';

export function PlayApp() {
  const room = useRoom();
  const toasts = useToasts();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);

  const codeFromUrl = (() => {
    const m = window.location.pathname.match(/^\/j\/([A-Za-z]{4})/);
    return m ? m[1].toUpperCase() : '';
  })();

  /** Riprova il rientro automatico con il token salvato. */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const name = localStorage.getItem(NAME_KEY);
    const code = codeFromUrl || sessionStorage.getItem('uni:code') || '';

    async function rejoin() {
      if (!token || !name || !code) { setJoining(false); return; }
      const r = await emit<{ ok: boolean; playerId?: string; token?: string }>('player:join', { code, name, token });
      if (r.ok && r.playerId) setPlayerId(r.playerId);
      setJoining(false);
    }
    rejoin();
    socket.on('connect', rejoin);
    return () => { socket.off('connect', rejoin); };
  }, [codeFromUrl]);

  const me = room?.players.find((p) => p.id === playerId) ?? null;

  return (
    <div className="stage">
      {!playerId || !room || !me ? (
        <Join
          initialCode={codeFromUrl}
          busy={joining}
          onJoined={(id, token, name, code) => {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(NAME_KEY, name);
            sessionStorage.setItem('uni:code', code);
            setPlayerId(id);
          }}
        />
      ) : (
        <Controller room={room} me={me} />
      )}

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
