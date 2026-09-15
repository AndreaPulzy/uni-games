import { advance, emit } from '../../net.ts';
import type { RoomState } from '@shared/types.ts';
import { VoteTally, ImpBanner } from './impostore-shared.tsx';

interface Pub {
  phase: 'secret' | 'discussion' | 'vote' | 'guess' | 'result';
  domanda: string;
  domandaFalsa: string | null;
  answered: string[];
  numeri: { playerId: string; value: number }[] | null;
  votesReceived: number;
  votesTotal: number;
  tally: { playerId: string; votes: number }[] | null;
  accusedId: string | null;
  impostorId: string | null;
}

export function ImpostoreNumeriTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;
  const byId = new Map((pub.numeri ?? []).map((n) => [n.playerId, n.value]));

  return (
    <div className="imp-stage">
      {pub.phase === 'secret' && (
        <div className="panel imp-banner">
          <div className="kicker">Rispondete sul telefono</div>
          <div className="question-big grad-text">{pub.domanda}</div>
          <p className="dim" style={{ margin: 0 }}>
            {pub.answered.length} / {room.players.filter((p) => p.connected).length} hanno risposto
          </p>
        </div>
      )}

      {pub.phase === 'discussion' && (
        <ImpBanner
          kicker="Giustificate il vostro numero"
          title="Chi sta improvvisando?"
          sub={`Domanda: ${pub.domanda}`}
          action={<button className="btn btn-primary btn-lg" onClick={() => advance(room)}>Si vota</button>}
        />
      )}

      {(pub.phase === 'vote' || pub.phase === 'result') && <VoteTally room={room} pub={pub} />}

      {pub.phase === 'result' && pub.domandaFalsa && (
        <div className="panel imp-banner">
          <div className="kicker">All'impostore era stato chiesto</div>
          <div className="question-big neon-pink">{pub.domandaFalsa}</div>
        </div>
      )}

      {pub.phase !== 'vote' && (
        <div className="num-grid">
          {room.players.filter((p) => p.connected).map((p) => {
            const val = byId.get(p.id);
            const answered = pub.answered.includes(p.id);
            const unmasked = pub.impostorId === p.id;
            return (
              <div
                key={p.id}
                className={`num-card${val === undefined ? ' waiting' : ''}`}
                style={{ ['--pc' as string]: unmasked ? 'var(--magenta)' : p.color }}
              >
                <div className="val">{val !== undefined ? val : answered ? '✓' : '…'}</div>
                <div className="who">
                  {p.avatar} {p.name}
                  {unmasked && <div style={{ color: 'var(--magenta)', fontSize: '.8rem' }}>impostore</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
