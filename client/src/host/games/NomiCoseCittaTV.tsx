import { emit } from '../../net.ts';
import type { RoomState } from '@shared/types.ts';

interface Pub {
  phase: 'fill' | 'review' | 'result';
  letter: string;
  categorie: string[];
  stopperId: string | null;
  progress: {
    playerId: string;
    filled: number;
    complete: boolean;
    cells: string[] | null;
    voided: boolean[] | null;
  }[];
}

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
            <div className="kicker">Revisione</div>
            <h3 style={{ fontSize: 'clamp(17px,1.7vw,26px)' }}>
              {stopper ? `${stopper} ha detto STOP` : 'Tempo scaduto'}
            </h3>
          </div>
        </div>
        {pub.phase === 'review' && (
          <button className="btn btn-primary btn-lg" onClick={() => emit('host:next')}>
            Assegna i punti
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
                  {(row.cells ?? []).map((cell, i) => {
                    const void_ = row.voided?.[i];
                    return (
                      <td key={i} className={void_ ? 'void' : cell ? '' : 'empty'}>
                        {cell || '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pub.phase === 'review' && (
        <p className="faint center" style={{ fontSize: '.9rem' }}>
          Dal telefono potete segnalare le risposte inventate: se lo fa la maggioranza, valgono zero.
        </p>
      )}
    </div>
  );
}
