import type { RoomState } from '@shared/types.ts';
import { gameDef } from '@shared/catalog.ts';
import { useCountdown } from '../net.ts';
import { TimerBar } from '../ui/Timer.tsx';
import { WordleTV } from './games/WordleTV.tsx';
import { ConnectionsTV } from './games/ConnectionsTV.tsx';
import { NerdleTV } from './games/NerdleTV.tsx';
import { GhostTV } from './games/GhostTV.tsx';
import { ImpostoreParolaTV } from './games/ImpostoreParolaTV.tsx';
import { ImpostoreNumeriTV } from './games/ImpostoreNumeriTV.tsx';
import { NomiCoseCittaTV } from './games/NomiCoseCittaTV.tsx';
import { RispostaBastardaTV } from './games/RispostaBastardaTV.tsx';
import { FabbricaMemeTV } from './games/FabbricaMemeTV.tsx';
import { TabooTV, IntesaVincenteTV, MimoTV } from './games/TeamGamesTV.tsx';
import { Top10TV } from './games/Top10TV.tsx';
import { QuizLampoTV } from './games/QuizLampoTV.tsx';
import { EmojiFilmTV } from './games/EmojiFilmTV.tsx';
import { IndizioSeccoTV } from './games/IndizioSeccoTV.tsx';
import { DisegnaTV } from './games/DisegnaTV.tsx';

const SCREENS: Partial<Record<string, (p: { room: RoomState }) => JSX.Element | null>> = {
  wordle: WordleTV,
  connections: ConnectionsTV,
  nerdle: NerdleTV,
  ghost: GhostTV,
  'impostore-parola': ImpostoreParolaTV,
  'impostore-numeri': ImpostoreNumeriTV,
  'nomi-cose-citta': NomiCoseCittaTV,
  'risposta-bastarda': RispostaBastardaTV,
  'fabbrica-meme': FabbricaMemeTV,
  taboo: TabooTV,
  'intesa-vincente': IntesaVincenteTV,
  mimo: MimoTV,
  top10: Top10TV,
  'quiz-lampo': QuizLampoTV,
  'emoji-film': EmojiFilmTV,
  'indizio-secco': IndizioSeccoTV,
  disegna: DisegnaTV,
};

export function Playing({ room }: { room: RoomState }) {
  const def = room.currentGame ? gameDef(room.currentGame) : null;
  const left = useCountdown(room.deadline, room.serverNow);
  // i giochi a turni non hanno una durata fissa: la barra si mostra solo dove ha senso
  const total = (def?.durationSec ?? 0) * 1000;
  const Screen = room.currentGame ? SCREENS[room.currentGame] : undefined;

  return (
    <div className="tv-game">
      <div className="row" style={{ justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div className="kicker">{def?.tagline}</div>
          <h2 style={{ fontSize: 'clamp(24px, 2.8vw, 46px)' }}>{def?.title}</h2>
        </div>
        {room.deadline !== null && (
          <div
            className="mono"
            style={{
              fontSize: 'clamp(34px, 4vw, 72px)',
              fontWeight: 700,
              color: left <= 10_000 ? 'var(--danger)' : 'var(--cyan)',
            }}
          >
            {Math.ceil(left / 1000)}
          </div>
        )}
      </div>

      {total > 0 && <TimerBar ms={left} totalMs={total} />}

      {Screen ? <Screen room={room} /> : (
        <div className="center grow dim">In corso sui telefoni…</div>
      )}
    </div>
  );
}
