import type { Player, RoomState } from '@shared/types.ts';
import { gameDef } from '@shared/catalog.ts';
import { useCountdown, fmtTime } from '../net.ts';
import { DirectorBar, DirectorLobby } from './DirectorPanel.tsx';
import { WordlePlay } from './games/WordlePlay.tsx';
import { ConnectionsPlay } from './games/ConnectionsPlay.tsx';
import { NerdlePlay } from './games/NerdlePlay.tsx';
import { GhostPlay } from './games/GhostPlay.tsx';
import { ImpostoreParolaPlay } from './games/ImpostoreParolaPlay.tsx';
import { ImpostoreNumeriPlay } from './games/ImpostoreNumeriPlay.tsx';
import { NomiCoseCittaPlay } from './games/NomiCoseCittaPlay.tsx';
import { RispostaBastardaPlay } from './games/RispostaBastardaPlay.tsx';
import { FabbricaMemePlay } from './games/FabbricaMemePlay.tsx';
import { TabooPlay, IntesaVincentePlay, MimoPlay } from './games/TeamGamesPlay.tsx';
import { Top10Play } from './games/Top10Play.tsx';
import { QuizLampoPlay } from './games/QuizLampoPlay.tsx';
import { EmojiFilmPlay } from './games/EmojiFilmPlay.tsx';
import { IndizioSeccoPlay } from './games/IndizioSeccoPlay.tsx';
import { DisegnaPlay } from './games/DisegnaPlay.tsx';

const CONTROLLERS: Partial<Record<string, (p: { room: RoomState; me: Player }) => JSX.Element | null>> = {
  wordle: WordlePlay,
  connections: ConnectionsPlay,
  nerdle: NerdlePlay,
  ghost: GhostPlay,
  'impostore-parola': ImpostoreParolaPlay,
  'impostore-numeri': ImpostoreNumeriPlay,
  'nomi-cose-citta': NomiCoseCittaPlay,
  'risposta-bastarda': RispostaBastardaPlay,
  'fabbrica-meme': FabbricaMemePlay,
  taboo: TabooPlay,
  'intesa-vincente': IntesaVincentePlay,
  mimo: MimoPlay,
  top10: Top10Play,
  'quiz-lampo': QuizLampoPlay,
  'emoji-film': EmojiFilmPlay,
  'indizio-secco': IndizioSeccoPlay,
  disegna: DisegnaPlay,
};

export function Controller({ room, me }: { room: RoomState; me: Player }) {
  const def = room.currentGame ? gameDef(room.currentGame) : null;
  const left = useCountdown(room.deadline, room.serverNow);
  const rank = [...room.players].sort((a, b) => b.score - a.score).findIndex((p) => p.id === me.id) + 1;
  const team = room.teams?.find((t) => t.members.includes(me.id)) ?? null;
  const Ctrl = room.currentGame ? CONTROLLERS[room.currentGame] : undefined;
  const isDirector = room.directorId === me.id;
  const director = room.players.find((p) => p.id === room.directorId) ?? null;

  return (
    <div className="phone">
      <header className="phone-top">
        <div className="phone-me">
          <span className="av">{me.avatar}</span>
          <span>{me.name}</span>
          {isDirector && <span className="chip director-chip">🎬 regista</span>}
          {team && (
            <span className="chip" style={{ borderColor: team.color, color: team.color, padding: '4px 10px', fontSize: '.72rem' }}>
              {team.name}
            </span>
          )}
        </div>
        <div className="score-pill">
          <span className="faint" style={{ fontSize: '.72rem' }}>#{rank}</span>
          {me.score}
        </div>
      </header>

      <div className="phone-body">
        {room.phase === 'lobby' && (
          isDirector ? <DirectorLobby room={room} me={me} /> : (
            <div className="phone-hero">
              <h2>Sei dentro!</h2>
              <p className="dim">
                {director
                  ? `${director.avatar} ${director.name} è il regista: avvierà la partita appena siete tutti.`
                  : 'Guarda la TV. Si parte appena tutti sono pronti.'}
              </p>
              <span className="waiting-dots"><i /><i /><i /></span>
            </div>
          )
        )}

        {room.phase === 'intro' && def && (
          <div className="phone-hero">
            <div className="kicker">Prossimo minigioco</div>
            <h2 className="grad-text">{def.title}</h2>
            <p className="dim">{def.tagline}</p>
            {team && <p style={{ color: team.color, fontWeight: 800 }}>Sei nella {team.name}</p>}
          </div>
        )}

        {room.phase === 'playing' && (
          Ctrl ? <Ctrl room={room} me={me} /> : (
            <div className="phone-hero">
              <h2>Guarda la TV</h2>
              <p className="dim">Questo minigioco si gioca dal vivo.</p>
            </div>
          )
        )}

        {room.phase === 'recap' && room.recap && (
          <div className="phone-hero">
            <div className="kicker">Round concluso</div>
            {(() => {
              const row = room.recap.rows.find((r) => r.playerId === me.id);
              return row ? (
                <>
                  <div className="big-num" style={{ color: 'var(--lime)' }}>+{row.points}</div>
                  <p className="dim">{row.detail}</p>
                </>
              ) : <p className="dim">Non hai partecipato a questo round.</p>;
            })()}
            <div className="score-pill" style={{ fontSize: '1.1rem' }}>Totale {me.score}</div>
          </div>
        )}

        {room.phase === 'final' && (
          <div className="phone-hero">
            <div className="kicker">Fine partita</div>
            <div className="big-num grad-text">#{rank}</div>
            <p className="dim">{me.score} punti</p>
            {!isDirector && director && (
              <p className="faint" style={{ fontSize: '.85rem' }}>{director.name} può far partire una nuova partita.</p>
            )}
          </div>
        )}
      </div>

      {room.phase === 'playing' && room.deadline !== null && (
        <div className="row" style={{ justifyContent: 'center' }}>
          <span className={`mono${left <= 10_000 ? ' timer-low' : ''}`} style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {fmtTime(left)}
          </span>
        </div>
      )}

      {isDirector && room.phase !== 'lobby' && <DirectorBar room={room} />}
    </div>
  );
}
