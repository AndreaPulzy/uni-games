import { TeamCardPlay, type TeamPriv } from './TeamCardPlay.tsx';

interface TabooPriv extends TeamPriv { card: { word: string; taboo: string[] } | null }
interface IntesaPriv extends TeamPriv { card: string | null }
interface MimoPriv extends TeamPriv { card: { text: string; tipo: string } | null }

export function TabooPlay() {
  return (
    <TeamCardPlay
      readyText="Fai indovinare la parola senza dire i cinque termini vietati."
      waitText="Ascolta il suggeritore e spara nomi."
      card={(p) => {
        const c = (p as TabooPriv).card;
        if (!c) return null;
        return (
          <div className="card-face">
            <div className="word">{c.word}</div>
            <ul>{c.taboo.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        );
      }}
    />
  );
}

export function IntesaVincentePlay() {
  return (
    <TeamCardPlay
      readyText="Una parola per uno, in alternanza, per costruire la domanda."
      waitText="Ascolta la domanda e dai la risposta."
      card={(p) => {
        const c = (p as IntesaPriv).card;
        if (!c) return null;
        return (
          <div className="card-face">
            <div className="tipo">parola da far indovinare</div>
            <div className="word">{c}</div>
          </div>
        );
      }}
    />
  );
}

export function MimoPlay() {
  return (
    <TeamCardPlay
      readyText="Solo gesti: niente voce, niente labiale, niente indicare oggetti."
      waitText="Guarda il mimo e indovina a voce."
      card={(p) => {
        const c = (p as MimoPriv).card;
        if (!c) return null;
        return (
          <div className="card-face">
            <div className="tipo">{c.tipo}</div>
            <div className="word">{c.text}</div>
          </div>
        );
      }}
    />
  );
}
