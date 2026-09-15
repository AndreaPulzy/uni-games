import { useEffect, useRef, useState } from 'react';
import type { RoomState } from '@shared/types.ts';
import type { ToastMsg } from '../net.ts';
import { audioReady, isMuted, setMuted, sfx, unlockAudio } from '../ui/sound.ts';

/** Collega i suoni della TV a quello che succede nella stanza. */
export function useSounds(room: RoomState | null, toasts: ToastMsg[]) {
  // cambi di schermata
  const phaseKey = room ? `${room.phase}:${room.roundIndex}` : '';
  const lastPhase = useRef('');
  useEffect(() => {
    if (!room || phaseKey === lastPhase.current) return;
    lastPhase.current = phaseKey;
    if (room.phase === 'intro') sfx.intro();
    else if (room.phase === 'recap') sfx.recap();
    else if (room.phase === 'final') sfx.podium();
  }, [phaseKey]);

  // qualcuno entra in lobby
  const connected = room?.players.filter((p) => p.connected).length ?? 0;
  const lastCount = useRef(0);
  useEffect(() => {
    if (room?.phase === 'lobby' && connected > lastCount.current) sfx.join();
    lastCount.current = connected;
  }, [connected]);

  // esiti annunciati a tutta la stanza
  const lastToast = useRef(0);
  useEffect(() => {
    const t = toasts[toasts.length - 1];
    if (!t || t.id <= lastToast.current) return;
    lastToast.current = t.id;
    if (t.kind === 'good') sfx.correct();
    else if (t.kind === 'bad') sfx.wrong();
  }, [toasts]);

  // ultimi secondi del timer: solo sui timer lunghi, i turni da 7 secondi di Ghost
  // ticchetterebbero di continuo
  const offset = useRef(0);
  useEffect(() => { if (room) offset.current = room.serverNow - Date.now(); }, [room?.serverNow]);
  const deadline = room?.phase === 'playing' ? room.deadline : null;
  useEffect(() => {
    if (!deadline) return;
    const total = deadline - (Date.now() + offset.current);
    if (total < 12_000) return;
    let lastSecond: number | null = null;
    const timer = setInterval(() => {
      const second = Math.ceil((deadline - (Date.now() + offset.current)) / 1000);
      if (second === lastSecond) return;
      lastSecond = second;
      if (second <= 0) { sfx.timeUp(); clearInterval(timer); }
      else if (second <= 5) sfx.tick();
    }, 100);
    return () => clearInterval(timer);
  }, [deadline]);
}

/** I browser tengono l'audio spento finche' non si tocca la pagina: questo
 *  pulsante prende il focus da solo, cosi' sulle smart TV basta il tasto OK. */
export function SoundButton() {
  const [ready, setReady] = useState(audioReady());
  const [muted, setMutedState] = useState(isMuted());

  if (!ready) {
    return (
      <button
        className="chip sound-btn"
        autoFocus
        onClick={() => {
          if (!unlockAudio()) return;
          setReady(true);
          setMuted(false);
          setMutedState(false);
          window.setTimeout(() => sfx.join(), 150);
        }}
      >
        🔇 Attiva i suoni
      </button>
    );
  }

  return (
    <button
      className="chip sound-btn"
      title={muted ? 'Riattiva i suoni' : 'Silenzia'}
      onClick={() => { setMuted(!muted); setMutedState(!muted); }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
