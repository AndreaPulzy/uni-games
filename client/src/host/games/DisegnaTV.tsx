import { useEffect, useRef } from 'react';
import type { RoomState } from '@shared/types.ts';
import { useGameEvent } from '../../net.ts';

/** coordinate su una lavagna 1000x1000, appiattite: [x0, y0, x1, y1, ...] */
export interface Stroke { id: number; color: string; size: number; points: number[] }

/** Disegna un tratto; con `from` ridisegna solo l'ultimo pezzo, per il tratto in corso. */
export function paint(g: CanvasRenderingContext2D, s: Stroke, k: number, from = 0) {
  const pts = s.points;
  if (pts.length < 2) return;
  g.strokeStyle = s.color;
  g.fillStyle = s.color;
  g.lineWidth = s.size * k;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (pts.length === 2) {
    g.beginPath();
    g.arc(pts[0] * k, pts[1] * k, Math.max(1, (s.size * k) / 2), 0, Math.PI * 2);
    g.fill();
    return;
  }
  const start = Math.max(0, from - 2);
  g.beginPath();
  g.moveTo(pts[start] * k, pts[start + 1] * k);
  for (let i = start + 2; i < pts.length; i += 2) g.lineTo(pts[i] * k, pts[i + 1] * k);
  g.stroke();
}

/** Lavagna della TV: riceve i tratti in diretta come eventi e si riallinea con lo
 *  stato completo che arriva ogni secondo, cosi' un evento perso non lascia buchi. */
export function DrawingBoard({ turn, strokes }: { turn: number; strokes: Stroke[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const board = useRef(new Map<number, Stroke>());
  const turnRef = useRef(turn);
  const frame = useRef(0);

  const redraw = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const c = canvasRef.current;
      if (!c) return;
      const px = Math.max(1, Math.round(c.clientWidth * (window.devicePixelRatio || 1)));
      if (c.width !== px || c.height !== px) { c.width = px; c.height = px; }
      const g = c.getContext('2d');
      if (!g) return;
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, px, px);
      const k = px / 1000;
      for (const s of [...board.current.values()].sort((a, b) => a.id - b.id)) paint(g, s, k);
    });
  };

  useEffect(() => {
    if (turn !== turnRef.current) { turnRef.current = turn; board.current.clear(); }
    // i tratti che lo stato non ha piu' sono stati annullati; quelli piu' recenti
    // dell'ultimo tratto noto possono essere arrivati solo come evento
    const ids = new Set(strokes.map((s) => s.id));
    const maxId = strokes.reduce((m, s) => Math.max(m, s.id), 0);
    for (const id of [...board.current.keys()]) if (id <= maxId && !ids.has(id)) board.current.delete(id);
    for (const s of strokes) {
      const cur = board.current.get(s.id);
      if (!cur || cur.points.length < s.points.length) board.current.set(s.id, { ...s, points: [...s.points] });
    }
    redraw();
  }, [turn, strokes]);

  useGameEvent((e) => {
    const d = e.data ?? {};
    if (typeof d.turn !== 'number' || d.turn < turnRef.current) return;
    if (d.turn > turnRef.current) { turnRef.current = d.turn; board.current.clear(); }
    if (e.name === 'clear') board.current.clear();
    else if (e.name === 'undo') board.current.delete(d.id);
    else if (e.name === 'stroke') {
      const cur: Stroke = board.current.get(d.id) ?? { id: d.id, color: d.color, size: d.size, points: [] };
      cur.points.length = Math.min(cur.points.length, d.offset);
      cur.points.push(...d.points);
      board.current.set(d.id, cur);
    } else return;
    redraw();
  });

  useEffect(() => {
    const onResize = () => redraw();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(frame.current); };
  }, []);

  return <canvas ref={canvasRef} className="draw-board" />;
}

interface Pub {
  phase: 'choose' | 'draw' | 'reveal';
  turn: number;
  turns: number;
  drawerId: string | null;
  strokes: Stroke[];
  guessedIds: string[];
  feed: { playerId: string; text: string }[];
  mask: string | null;
  letters: number | null;
  word: string | null;
  gains: { playerId: string; points: number }[] | null;
  drawerGain: number | null;
}

export function DisegnaTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;
  const player = (id: string) => room.players.find((p) => p.id === id);
  const drawer = pub.drawerId ? player(pub.drawerId) : undefined;

  return (
    <div className="draw-stage">
      <div className="draw-board-wrap">
        <DrawingBoard turn={pub.turn} strokes={pub.strokes} />
      </div>

      <div className="draw-side">
        <div className="panel imp-banner" style={{ padding: 18 }}>
          <div className="kicker">Disegno {pub.turn + 1} di {pub.turns}</div>
          <h2 style={{ fontSize: 'clamp(20px, 2.2vw, 36px)' }}>{drawer ? `${drawer.avatar} ${drawer.name}` : ''}</h2>
          {pub.phase === 'choose' && <p className="dim" style={{ margin: 0 }}>sta scegliendo cosa disegnare…</p>}
          {pub.phase === 'draw' && pub.mask && <div className="draw-mask">{pub.mask}</div>}
          {pub.phase === 'draw' && (
            <p className="faint" style={{ margin: 0 }}>{pub.letters} lettere · scrivete la risposta sul telefono</p>
          )}
          {pub.phase === 'reveal' && (
            <>
              <div className="kicker">Era</div>
              <div className="emoji-title grad-text" style={{ fontSize: 'clamp(28px, 3.4vw, 56px)' }}>{pub.word}</div>
            </>
          )}
        </div>

        {pub.phase === 'reveal' ? (
          <div className="draw-feed">
            {(pub.gains ?? []).length === 0 && <div className="dim">Nessuno l'ha indovinato</div>}
            {(pub.gains ?? []).map((g) => {
              const p = player(g.playerId);
              return p ? (
                <div key={g.playerId}>{p.avatar} {p.name} <b style={{ color: 'var(--lime)' }}>+{g.points}</b></div>
              ) : null;
            })}
            {drawer && (pub.drawerGain ?? 0) > 0 && (
              <div>🎨 {drawer.name} <b style={{ color: 'var(--lime)' }}>+{pub.drawerGain}</b></div>
            )}
          </div>
        ) : (
          <>
            <div className="row wrap" style={{ gap: 8 }}>
              {room.players.filter((p) => p.connected && p.id !== pub.drawerId).map((p) => (
                <span key={p.id} className={`quiz-avatar${pub.guessedIds.includes(p.id) ? ' on' : ''}`} title={p.name}>
                  {p.avatar}
                </span>
              ))}
            </div>
            <div className="draw-feed">
              {[...pub.feed].reverse().map((f, i) => {
                const p = player(f.playerId);
                return <div key={i}><span className="faint">{p?.avatar} {p?.name}:</span> {f.text}</div>;
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
