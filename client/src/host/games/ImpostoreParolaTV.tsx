import { advance, emit } from '../../net.ts';
import type { RoomState } from '@shared/types.ts';
import { VoteTally, ImpBanner } from './impostore-shared.tsx';

interface Pub {
  phase: 'secret' | 'discussion' | 'vote' | 'guess' | 'result';
  currentPlayerId: string | null;
  clues: { playerId: string; word: string }[];
  parola: string | null;
  votesReceived: number;
  votesTotal: number;
  tally: { playerId: string; votes: number }[] | null;
  accusedId: string | null;
  impostorId: string | null;
}

export function ImpostoreParolaTV({ room }: { room: RoomState }) {
  const pub = room.game as Pub | null;
  if (!pub) return null;

  const given = new Map(pub.clues.map((c) => [c.playerId, c.word]));

  return (
    <div className="imp-stage">
      {pub.phase === 'secret' && (
        <ImpBanner
          kicker="Un indizio a testa"
          title={
            pub.currentPlayerId
              ? `Tocca a ${room.players.find((p) => p.id === pub.currentPlayerId)?.name ?? ''}`
              : 'Raccolta indizi'
          }
          sub="Una parola sola, attinente ma non troppo."
        />
      )}

      {pub.phase === 'discussion' && (
        <ImpBanner
          kicker="Discussione libera"
          title="Chi non c entra niente?"
          sub="Parlatene a voce, poi passate alla votazione."
          action={<button className="btn btn-primary btn-lg" onClick={() => advance(room)}>Si vota</button>}
        />
      )}

      {pub.phase === 'guess' && (
        <ImpBanner
          kicker="Ultima chance"
          title="L impostore sta provando a indovinare"
          sub="Se ci azzecca, si riprende una bella fetta di punti."
        />
      )}

      {(pub.phase === 'vote' || pub.phase === 'result') && (
        <VoteTally room={room} pub={pub} />
      )}

      {pub.phase !== 'vote' && (
        <div className="clue-grid">
          {room.players.map((p) => {
            const word = given.get(p.id);
            const now = pub.currentPlayerId === p.id;
            const unmasked = pub.impostorId === p.id;
            return (
              <div
                key={p.id}
                className={`clue-card${word ? '' : ' pending'}${now ? ' now' : ''}`}
                style={{ ['--pc' as string]: unmasked ? 'var(--magenta)' : p.color }}
              >
                <span className="clue-who">
                  <span style={{ fontSize: '1.2rem' }}>{p.avatar}</span>
                  {p.name}
                  {unmasked && <span style={{ color: 'var(--magenta)' }}>· impostore</span>}
                </span>
                <span className="clue-word">{word ?? (now ? '…' : '')}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
