import { fmtTime } from '../net.ts';

export function TimerRing({ ms, totalMs, size = 88 }: { ms: number; totalMs: number; size?: number }) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const pct = totalMs > 0 ? Math.max(0, Math.min(1, ms / totalMs)) : 0;
  const low = ms <= 10_000;

  return (
    <div className="timer-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={low ? 'var(--danger)' : 'var(--cyan)'}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset .25s linear' }}
        />
      </svg>
      <span className={`t${low ? ' timer-low' : ''}`}>{fmtTime(ms)}</span>
    </div>
  );
}

export function TimerBar({ ms, totalMs }: { ms: number; totalMs: number }) {
  const pct = totalMs > 0 ? Math.max(0, Math.min(1, ms / totalMs)) : 0;
  return (
    <div className={`timer-bar${ms <= 10_000 ? ' low' : ''}`}>
      <i style={{ width: `${pct * 100}%` }} />
    </div>
  );
}
