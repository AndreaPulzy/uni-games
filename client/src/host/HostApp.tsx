import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { emit, socket, useRoom, useToasts } from '../net.ts';
import { Lobby } from './Lobby.tsx';
import { Intro } from './Intro.tsx';
import { Recap } from './Recap.tsx';
import { Final } from './Final.tsx';
import { Playing } from './Playing.tsx';
import { CATEGORY_LABEL } from '@shared/types.ts';

const KEY = 'uni:hostCode';
let booting = false;

async function bootstrap() {
  if (booting) return;
  booting = true;
  try {
    const saved = sessionStorage.getItem(KEY);
    if (saved) {
      const r = await emit<{ ok: boolean }>('host:attach', { code: saved });
      if (r?.ok) return;
      sessionStorage.removeItem(KEY);
    }
    const { code } = await emit<{ code: string }>('host:create');
    sessionStorage.setItem(KEY, code);
  } finally {
    booting = false;
  }
}

/** L'indirizzo da mettere nel QR.
 *  In locale la pagina gira su "localhost", che dai telefoni non e' raggiungibile:
 *  si usa l'IP di rete che il server conosce. Online invece il dominio della
 *  pagina e' gia' quello giusto e va usato cosi' com'e'. */
function buildJoinUrl(code: string, lanHost: string, publicUrl: string | null): string {
  if (publicUrl) return `${publicUrl.replace(/\/$/, '')}/j/${code}`;

  const { protocol, hostname, port, origin } = window.location;
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  if (!isLocal) return `${origin}/j/${code}`;

  const host = lanHost || hostname;
  return `${protocol}//${host}${port ? `:${port}` : ''}/j/${code}`;
}

export function HostApp() {
  const room = useRoom();
  const toasts = useToasts();
  const [netHost, setNetHost] = useState<string>('');
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  useEffect(() => {
    bootstrap();
    socket.on('connect', bootstrap);
    fetch('/api/net')
      .then((r) => r.json())
      .then((d) => { setNetHost(d.host); setPublicUrl(d.publicUrl ?? null); })
      .catch(() => {});
    return () => { socket.off('connect', bootstrap); };
  }, []);

  if (!room) {
    return (
      <div className="stage center">
        <div className="kicker">Connessione alla regia…</div>
      </div>
    );
  }

  const joinUrl = buildJoinUrl(room.code, netHost, publicUrl);

  return (
    <div className="stage">
      <div className="tv">
        <header className="tv-top">
          <div className="row" style={{ gap: 16 }}>
            <span className="tv-brand grad-text">UNI GAMES</span>
            {room.phase !== 'lobby' && room.phase !== 'final' && (
              <>
                <span className="chip mono">
                  Round {room.roundIndex + 1} / {room.totalRounds}
                </span>
                {room.currentCategory && (
                  <span className={`chip chip-cat-${room.currentCategory}`}>
                    {CATEGORY_LABEL[room.currentCategory]}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="row" style={{ gap: 14 }}>
            {room.phase !== 'lobby' && (
              <span className="chip mono" title="Codice stanza">{room.code}</span>
            )}
            {room.directorId && (
              <span className="chip" style={{ borderColor: 'rgba(255,217,61,.55)', color: 'var(--gold)' }}>
                🎬 {room.players.find((p) => p.id === room.directorId)?.name}
              </span>
            )}
            <span className="chip">{room.players.filter((p) => p.connected).length} 👥</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={room.phase + room.roundIndex}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            {room.phase === 'lobby' && <Lobby room={room} joinUrl={joinUrl} />}
            {room.phase === 'intro' && <Intro room={room} />}
            {room.phase === 'playing' && <Playing room={room} />}
            {room.phase === 'recap' && <Recap room={room} />}
            {room.phase === 'final' && <Final room={room} />}
          </motion.div>
        </AnimatePresence>
      </div>

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
