/** Effetti sonori generati con Web Audio: niente file da scaricare o licenze.
 *  Suonano solo sulla TV. I browser li bloccano finche' non c'e' un tocco o un
 *  clic sulla pagina, quindi la TV mostra un pulsante "Attiva i suoni"
 *  (sulle smart TV basta il tasto OK del telecomando). */

const MUTE_KEY = 'uni:muted';

let ctx: AudioContext | null = null;
let muted = (() => {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
})();

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try { localStorage.setItem(MUTE_KEY, value ? '1' : '0'); } catch { /* storage non disponibile */ }
}

/** Da chiamare dentro un gestore di clic: sblocca l'audio del browser. */
export function unlockAudio(): boolean {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return true;
  } catch {
    return false;
  }
}

export function audioReady(): boolean {
  return !!ctx && ctx.state === 'running';
}

interface Note {
  freq: number;
  at?: number;        // secondi dall'inizio
  dur?: number;       // durata in secondi
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;   // frequenza finale, per glissati
}

function play(notes: Note[]): void {
  if (muted || !ctx || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  for (const n of notes) {
    const start = now + (n.at ?? 0);
    const dur = n.dur ?? 0.15;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.setValueAtTime(n.freq, start);
    if (n.slideTo) osc.frequency.exponentialRampToValueAtTime(n.slideTo, start + dur);
    const peak = n.gain ?? 0.12;
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(peak, start + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}

const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, A4 = 440, F5 = 698.46;

export const sfx = {
  /** un giocatore entra in stanza */
  join: () => play([{ freq: G5, dur: 0.08, type: 'triangle' }, { freq: C6, at: 0.07, dur: 0.12, type: 'triangle' }]),
  /** presentazione del minigioco */
  intro: () => play([C5, E5, G5, C6].map((freq, i) => ({ freq, at: i * 0.09, dur: 0.22, type: 'square' as OscillatorType, gain: 0.06 }))),
  /** ultimi secondi del timer */
  tick: () => play([{ freq: 1400, dur: 0.035, type: 'square', gain: 0.05 }]),
  /** tempo scaduto */
  timeUp: () => play([{ freq: 220, dur: 0.45, type: 'sawtooth', gain: 0.08, slideTo: 110 }]),
  correct: () => play([{ freq: E5, dur: 0.1, type: 'triangle' }, { freq: C6, at: 0.09, dur: 0.18, type: 'triangle' }]),
  wrong: () => play([{ freq: 300, dur: 0.12, type: 'square', gain: 0.06 }, { freq: 200, at: 0.1, dur: 0.22, type: 'square', gain: 0.06 }]),
  /** punti del round */
  recap: () => play([G5, C6].map((freq, i) => ({ freq, at: i * 0.12, dur: 0.3, type: 'triangle' as OscillatorType }))),
  /** classifica finale */
  podium: () => play([
    { freq: C5, dur: 0.18, type: 'square', gain: 0.07 }, { freq: C5, at: 0.2, dur: 0.12, type: 'square', gain: 0.07 },
    { freq: F5, at: 0.34, dur: 0.18, type: 'square', gain: 0.07 }, { freq: A4 * 2, at: 0.54, dur: 0.18, type: 'square', gain: 0.07 },
    { freq: C6, at: 0.74, dur: 0.6, type: 'square', gain: 0.08 },
  ]),
};
