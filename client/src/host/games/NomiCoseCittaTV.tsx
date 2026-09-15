import { advance } from '../../net.ts';
import type { RoomState } from '@shared/types.ts';

interface CellView {
  text: string;
  status: 'ok' | 'empty' | 'wrongLetter' | 'voided';
  flags: number;
  suspicious: boolean;
  duplicate: boolean;
}
interface Pub {
  phase: 'fill' | 'review' | 'result';
  letter: string;
  categorie: string[];
  stopperId: string | null;
  threshold: number;
  progress: {
    playerId: string;
    filled: number;
    complete: boolean;
    review: CellView[] | null;
  }[];
}

const CELL_CLASS: Record<CellView['status'], string> = {
  ok: '',
  empty: 'empty',
  wrongLetter: 'bad',
  voided: 'void',
};

export function NomiCoseCittaTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;

  if (pub.phase === 'fill') {
    return (
      <div className="imp-stage">
        <div className="panel imp-banner">
          <div className="kicker">La lettera è</div>
          <div className="ncc-letter">{pub.letter}</div>
          <p className="dim" style={{ margin: 0 }}>
            Il primo che riempie tutte e sei le caselle blocca gli altri.
          </p>
        </div>
        <div className="ncc-progress">
          {pub.progress.map((row) => {
            const p = room.players.find((x) => x.id === row.playerId);
            if (!p) return null;
            return (
              <div key={row.playerId} className="tv-conn-card">
                <div className="mini-head">
                  <span style={{ fontSize: '1.3rem' }}>{p.avatar}</span>
                  <span className="grow">{p.name}</span>
                  <span className="mono faint">{row.filled}/6</span>
                </div>
                <div className="ncc-dot-row">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <i key={i} className={i < row.filled ? 'on' : ''} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const stopper = pub.stopperId ? room.players.find((p) => p.id === pub.stopperId)?.name : null;

  return (
    <div className="imp-stage">
      <div className="row" style={{ justifyContent: 'space-between', gap: 20 }}>
        <div className="row" style={{ gap: 16 }}>
          <span className="chip chip-cat-untimed mono" style={{ fontSize: '1.4rem' }}>{pub.letter}</span>
          <div>
            <div className="kicker">Controllo delle risposte</div>
            <h3 style={{ fontSize: 'clamp(17px,1.7vw,26px)' }}>
              {stopper ? `${stopper} ha detto STOP` : 'Tempo scaduto'}
            </h3>
          </div>
        </div>
        {pub.phase === 'review' && room.directorAction && (
          <button className="btn btn-primary btn-lg" onClick={() => advance(room)}>
            {room.directorAction}
          </button>
        )}
      </div>

      <div className="ncc-table panel panel-tight" style={{ padding: 14 }}>
        <table>
          <thead>
            <tr>
              <th>Giocatore</th>
              {pub.categorie.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {pub.progress.map((row) => {
              const p = room.players.find((x) => x.id === row.playerId);
              if (!p) return null;
              return (
                <tr key={row.playerId}>
                  <td className="who">{p.avatar} {p.name}</td>
                  {(row.review ?? []).map((v, i) => (
                    <td key={i} className={CELL_CLASS[v.status]}>
                      <span className="ncc-ans">{v.text || '—'}</span>
                      {v.suspicious && <span className="ncc-badge warn" title="Non trovata nel dizionario">⚠</span>}
                      {v.duplicate && <span className="ncc-badge dup" title="Scritta da più giocatori">×2</span>}
                      {v.flags > 0 && (
                        <span className={`ncc-badge flag${v.status === 'voided' ? ' hit' : ''}`}>
                          ⚑ {v.flags}/{pub.threshold}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pub.phase === 'review' && (
        <div className="ncc-legend">
          <span>Dal telefono si vota <b>«Non vale»</b> sulle risposte inventate</span>
          <span><span className="ncc-badge flag hit">⚑ {pub.threshold}/{pub.threshold}</span> voti necessari: la risposta vale 0</span>
          <span><span className="ncc-badge warn">⚠</span> non trovata nel dizionario</span>
          <span><span className="ncc-badge dup">×2</span> doppia: vale 5 invece di 10</span>
        </div>
      )}
    </div>
  );
}
