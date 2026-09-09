import { CATEGORY_LABEL, type Category, type GameId } from '@shared/types.ts';
import { GAMES, isPlayable } from '@shared/catalog.ts';

const CAT_COLOR: Record<Category, string> = {
  timed: 'var(--cyan)',
  untimed: 'var(--gold)',
  team: 'var(--magenta)',
};
const ROUND_OPTIONS = [3, 6, 9, 12, 15];

/** Pannello della lobby: quali minigiochi entrano in partita e quanti round. */
export function Setup({
  playerCount, excluded, rounds, onToggle, onRounds,
}: {
  playerCount: number;
  excluded: GameId[];
  rounds: number;
  onToggle: (id: GameId) => void;
  onRounds: (n: number) => void;
}) {
  return (
    <div className="setup">
      <div className="setup-head">
        <div className="kicker">Round della partita</div>
        <div className="rounds-pick">
          {ROUND_OPTIONS.map((n) => (
            <button key={n} className={n === rounds ? 'on' : ''} onClick={() => onRounds(n)}>{n}</button>
          ))}
        </div>
      </div>

      <div className="setup-cats">
        {(['timed', 'untimed', 'team'] as Category[]).map((cat) => (
          <div key={cat} className="setup-cat">
            <div className="kicker" style={{ color: CAT_COLOR[cat] }}>{CATEGORY_LABEL[cat]}</div>
            <div className="setup-list">
              {GAMES.filter((g) => g.category === cat).map((g) => {
                const available = isPlayable(g, playerCount);
                const on = available && !excluded.includes(g.id);
                const why = !g.ready
                  ? 'non ancora disponibile'
                  : playerCount < g.minPlayers
                    ? `servono almeno ${g.minPlayers} giocatori`
                    : playerCount > g.maxPlayers
                      ? `massimo ${g.maxPlayers} giocatori`
                      : g.minPerTeam && playerCount < g.minPerTeam * 2
                        ? `servono ${g.minPerTeam} giocatori per squadra`
                        : '';
                return (
                  <button
                    key={g.id}
                    className={`game-toggle${on ? ' on' : ''}`}
                    style={{ ['--tc' as string]: CAT_COLOR[cat] }}
                    disabled={!available}
                    title={why || g.tagline}
                    onClick={() => onToggle(g.id)}
                  >
                    <span className="dot" />
                    {g.title}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
