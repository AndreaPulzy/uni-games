import type { RoomState } from '@shared/types.ts';

/** Intestazione grande usata dalle fasi dei due Impostori. */
export function ImpBanner({
  kicker, title, sub, action,
}: { kicker: string; title: string; sub?: string; action?: JSX.Element }) {
  return (
    <div className="panel imp-banner">
      <div className="kicker">{kicker}</div>
      <h2 className="grad-text">{title}</h2>
      {sub && <p className="dim" style={{ margin: 0, fontSize: 'clamp(14px, 1.3vw, 21px)' }}>{sub}</p>}
      {action}
    </div>
  );
}

interface TallyPub {
  phase: string;
  votesReceived: number;
  votesTotal: number;
  tally: { playerId: string; votes: number }[] | null;
  accusedId: string | null;
  impostorId: string | null;
}

/** Conteggio voti: durante il voto mostra solo quanti hanno votato, poi il dettaglio. */
export function VoteTally({ room, pub }: { room: RoomState; pub: TallyPub }) {
  const voting = pub.phase === 'vote';
  const max = Math.max(1, ...(pub.tally ?? []).map((t) => t.votes));

  return (
    <>
      <div className="panel imp-banner">
        <div className="kicker">{voting ? 'Votazione in corso' : 'Verdetto'}</div>
        <h2 className="grad-text">
          {voting ? `${pub.votesReceived} / ${pub.votesTotal} hanno votato` : 'I voti'}
        </h2>
      </div>

      {!voting && pub.tally && (
        <div className="tally-rows">
          {pub.tally.map((t) => {
            const p = room.players.find((x) => x.id === t.playerId);
            if (!p) return null;
            return (
              <div key={t.playerId} className={`tally-row${pub.accusedId === t.playerId ? ' accused' : ''}`}>
                <span style={{ fontSize: '1.4rem' }}>{p.avatar}</span>
                <span className="row" style={{ gap: 12 }}>
                  <b>{p.name}</b>
                  {pub.impostorId === t.playerId && (
                    <span className="chip chip-cat-team">impostore</span>
                  )}
                  <span className="tally-bar" style={{ width: `${(t.votes / max) * 45}%` }} />
                </span>
                <span className="mono" style={{ fontWeight: 700 }}>{t.votes}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
