import { useEffect, useRef, useState } from 'react';
import { emit, socket, usePrivate } from '../../net.ts';
import { WaitingPanel } from './impostore-shared.tsx';
import { paint, type Stroke } from '../../host/games/DisegnaTV.tsx';

interface Priv {
  phase: 'choose' | 'draw' | 'reveal';
  turn: number;
  turns: number;
  isDrawer: boolean;
  drawerName: string;
  options: string[] | null;
  word: string | null;
  guessed: boolean;
  gain: number | null;
  mask: string | null;
}

const PALETTE = ['#111111', '#e63946', '#1d7bff', '#2a9d4b', '#ffb703', '#8e44ad', '#8b5a2b', '#ffffff'];
const SIZES: [number, string][] = [[6, 'fine'], [14, 'medio'], [30, 'grosso']];

/** Lavagna del disegnatore: disegna subito in locale e spedisce i tratti a pezzi,
 *  ogni 70ms, cosi' la TV li vede quasi in tempo reale. */
function DrawPad({ turn }: { turn: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(PALETTE[0]);
  const [size, setSize] = useState(SIZES[0][0]);
  const strokes = useRef<Stroke[]>([]);
  const current = useRef<{ index: number; sent: number } | null>(null);
  const nextId = useRef(1);

  const fit = () => {
    const c = canvasRef.current;
    if (!c) return null;
    const px = Math.max(1, Math.round(c.clientWidth * (window.devicePixelRatio || 1)));
    if (c.width !== px || c.height !== px) { c.width = px; c.height = px; }
    const g = c.getContext('2d');
    return g ? { g, k: px / 1000, px } : null;
  };

  const redraw = () => {
    const f = fit();
    if (!f) return;
    f.g.fillStyle = '#ffffff';
    f.g.fillRect(0, 0, f.px, f.px);
    for (const s of strokes.current) paint(f.g, s, f.k);
  };

  const flush = () => {
    const cur = current.current;
    if (!cur) return;
    const s = strokes.current[cur.index];
    if (!s || s.points.length <= cur.sent) return;
    socket.emit('game:action', {
      type: 'stroke',
      payload: { id: s.id, color: s.color, size: s.size, offset: cur.sent, points: s.points.slice(cur.sent) },
    });
    cur.sent = s.points.length;
  };

  useEffect(() => {
    strokes.current = [];
    current.current = null;
    nextId.current = 1;
    redraw();
  }, [turn]);

  useEffect(() => {
    const timer = setInterval(flush, 70);
    const onResize = () => redraw();
    window.addEventListener('resize', onResize);
    return () => { clearInterval(timer); window.removeEventListener('resize', onResize); };
  }, []);

  const units = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const clamp = (v: number) => Math.max(0, Math.min(1000, Math.round(v)));
    return [clamp(((e.clientX - r.left) / r.width) * 1000), clamp(((e.clientY - r.top) / r.height) * 1000)];
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="draw-pad"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const [x, y] = units(e);
          strokes.current.push({ id: nextId.current++, color, size, points: [x, y] });
          current.current = { index: strokes.current.length - 1, sent: 0 };
          const f = fit();
          if (f) paint(f.g, strokes.current[strokes.current.length - 1], f.k);
        }}
        onPointerMove={(e) => {
          const cur = current.current;
          if (!cur) return;
          const s = strokes.current[cur.index];
          const [x, y] = units(e);
          const n = s.points.length;
          if (Math.abs(x - s.points[n - 2]) + Math.abs(y - s.points[n - 1]) < 5) return;
          s.points.push(x, y);
          const f = fit();
          if (f) paint(f.g, s, f.k, n - 2);
        }}
        onPointerUp={() => { flush(); current.current = null; }}
        onPointerCancel={() => { flush(); current.current = null; }}
      />

      <div className="draw-tools">
        {PALETTE.map((c) => (
          <button
            key={c}
            className={`draw-color${c === color ? ' on' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            aria-label={c === '#ffffff' ? 'gomma' : 'colore'}
          />
        ))}
      </div>

      <div className="draw-tools">
        {SIZES.map(([value, label]) => (
          <button key={value} className={`btn${value === size ? ' btn-primary' : ''}`} onClick={() => setSize(value)}>
            {label}
          </button>
        ))}
        <button
          className="btn"
          onClick={() => {
            const s = strokes.current.pop();
            current.current = null;
            if (s) socket.emit('game:action', { type: 'undo', payload: { id: s.id } });
            redraw();
          }}
        >
          ↶ Annulla
        </button>
        <button
          className="btn"
          onClick={() => {
            strokes.current = [];
            current.current = null;
            socket.emit('game:action', { type: 'clear' });
            redraw();
          }}
        >
          Cancella
        </button>
      </div>
    </>
  );
}

export function DisegnaPlay() {
  const priv = usePrivate<Priv>();
  const [text, setText] = useState('');

  useEffect(() => { setText(''); }, [priv?.turn]);

  if (!priv) return <WaitingPanel title="Si prepara la lavagna…" />;

  if (priv.phase === 'reveal') {
    return (
      <div className="phone-hero">
        <div className="kicker">Era</div>
        <h2 className="grad-text">{priv.word}</h2>
        {priv.gain ? <div className="big-num" style={{ color: 'var(--lime)' }}>+{priv.gain}</div> : null}
      </div>
    );
  }

  if (priv.isDrawer && priv.phase === 'choose') {
    return (
      <div className="col grow" style={{ justifyContent: 'center', gap: 14 }}>
        <div className="kicker" style={{ textAlign: 'center' }}>Tocca a te disegnare: scegli la parola</div>
        {(priv.options ?? []).map((o, i) => (
          <button
            key={o}
            className="choice-btn"
            style={{ textAlign: 'center', fontSize: '1.2rem' }}
            onClick={() => emit('game:action', { type: 'choose', payload: { index: i } })}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }

  if (priv.isDrawer) {
    return (
      <>
        <div className="col center" style={{ gap: 2 }}>
          <div className="kicker">Disegna</div>
          <div style={{ fontWeight: 900, fontSize: '1.5rem' }}>{priv.word}</div>
        </div>
        <DrawPad turn={priv.turn} />
      </>
    );
  }

  if (priv.phase === 'choose') {
    return <WaitingPanel title={`${priv.drawerName} sta scegliendo`} sub="Tra poco si disegna. Guarda la TV." />;
  }

  if (priv.guessed) {
    return <WaitingPanel title="Indovinato!" sub={`+${priv.gain} punti. Aspetta gli altri.`} />;
  }

  const send = () => {
    const t = text.trim();
    if (!t) return;
    emit('game:action', { type: 'guess', payload: { text: t } });
    setText('');
  };

  return (
    <div className="col grow" style={{ justifyContent: 'center', gap: 16 }}>
      <div className="col center" style={{ gap: 4 }}>
        <div className="kicker">Disegna {priv.drawerName}</div>
        <div className="draw-mask" style={{ fontSize: '1.6rem' }}>{priv.mask}</div>
        <p className="dim" style={{ margin: 0 }}>Guarda la TV e scrivi cos'è</p>
      </div>
      <form className="col" style={{ gap: 10 }} onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input
          className="field"
          style={{ textAlign: 'center' }}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 40))}
          placeholder="la tua risposta"
          autoComplete="off"
        />
        <button className="btn btn-primary btn-block btn-lg" disabled={!text.trim()}>Prova</button>
      </form>
    </div>
  );
}
