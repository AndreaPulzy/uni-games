import type { Category, GameId } from './types.ts';

export interface GameDef {
  id: GameId;
  title: string;
  category: Category;
  /** giocatori connessi minimi/massimi perche' il gioco sia selezionabile */
  minPlayers: number;
  maxPlayers: number;
  /** solo per i giochi a squadre: membri minimi per squadra */
  minPerTeam?: number;
  tagline: string;
  /** 2-4 righe mostrate nella schermata di intro sulla TV */
  rules: string[];
  /** durata indicativa della fase di gioco, in secondi (null = senza timer) */
  durationSec: number | null;
  /** implementato? i non implementati non entrano nel pool */
  ready: boolean;
}

export const GAMES: GameDef[] = [
  /* ------------------------------ A TEMPO ------------------------------ */
  {
    id: 'wordle',
    title: 'Wordle Italiano',
    category: 'timed',
    minPlayers: 2,
    maxPlayers: 16,
    tagline: 'Cinque lettere, novanta secondi',
    rules: [
      'Stessa parola segreta per tutti, 6 tentativi a testa.',
      'Verde: lettera giusta al posto giusto. Giallo: presente altrove.',
      'Piu sei veloce e meno tentativi usi, piu punti prendi.',
    ],
    durationSec: 90,
    ready: true,
  },
  {
    id: 'connections',
    title: 'Connections',
    category: 'timed',
    minPlayers: 2,
    maxPlayers: 16,
    tagline: 'Sedici parole, quattro legami nascosti',
    rules: [
      'Raggruppa le 16 parole in 4 categorie da 4.',
      'Massimo 4 errori, poi sei fuori dal round.',
      'Punti per ogni gruppo trovato, bonus grosso se completi.',
    ],
    durationSec: 120,
    ready: true,
  },
  {
    id: 'nerdle',
    title: 'Equazione Nascosta',
    category: 'timed',
    minPlayers: 2,
    maxPlayers: 16,
    tagline: "Ricostruisci l'uguaglianza",
    rules: [
      'Otto caselle, una equazione valida da indovinare.',
      'Ogni tentativo deve essere matematicamente corretto.',
      'Stesso feedback del Wordle: verde, giallo, grigio.',
    ],
    durationSec: 120,
    ready: true,
  },
  {
    id: 'ghost',
    title: 'Ghost',
    category: 'timed',
    minPlayers: 3,
    maxPlayers: 6,
    tagline: 'Non completare mai la parola',
    rules: [
      'A turno aggiungi una lettera senza chiudere una parola valida.',
      'Hai 7 secondi. Devi avere in mente una parola vera che inizi cosi.',
      'Puoi contestare chi ti precede. Chi perde prende una lettera di G-H-O-S-T.',
    ],
    durationSec: null,
    ready: true,
  },

  /* --------------------- DEDUZIONE & CREATIVITA ----------------------- */
  {
    id: 'impostore-parola',
    title: "L'Impostore",
    category: 'untimed',
    minPlayers: 4,
    maxPlayers: 12,
    tagline: 'Uno di voi non sa di cosa si parla',
    rules: [
      'Tutti ricevono la stessa parola segreta. Tranne uno.',
      'A turno, un solo indizio a testa: preciso ma non troppo.',
      "Poi discussione e votazione. Se beccate l'impostore, lui puo ancora indovinare.",
    ],
    durationSec: null,
    ready: true,
  },
  {
    id: 'impostore-numeri',
    title: "L'Impostore coi Numeri",
    category: 'untimed',
    minPlayers: 4,
    maxPlayers: 12,
    tagline: 'Stessa domanda per tutti. Quasi.',
    rules: [
      "Rispondi con un numero. L'impostore vede una domanda diversa.",
      'I numeri appaiono in TV accanto ai nomi.',
      'Ognuno giustifica il suo a voce, poi si vota.',
    ],
    durationSec: null,
    ready: true,
  },
  {
    id: 'nomi-cose-citta',
    title: 'Nomi Cose Citta',
    category: 'untimed',
    minPlayers: 3,
    maxPlayers: 16,
    tagline: 'Il classico, ma con lo STOP',
    rules: [
      'Una lettera estratta, sei caselle da riempire.',
      'Il primo che finisce preme STOP e blocca tutti.',
      'Risposta unica 10 punti, duplicata 5, vuota o inventata 0.',
    ],
    durationSec: null,
    ready: true,
  },
  {
    id: 'risposta-bastarda',
    title: 'La Risposta Bastarda',
    category: 'untimed',
    minPlayers: 4,
    maxPlayers: 12,
    tagline: 'Vince chi fa piu ridere',
    rules: [
      'Ogni duello: due giocatori, stesso prompt assurdo.',
      'Le due risposte compaiono anonime in TV.',
      'Tutti gli altri votano. Unanimita = bonus PLEIN.',
    ],
    durationSec: null,
    ready: true,
  },
  {
    id: 'fabbrica-meme',
    title: 'Fabbrica di Meme',
    category: 'untimed',
    minPlayers: 3,
    maxPlayers: 16,
    tagline: 'Didascalia perfetta, immagine sbagliata',
    rules: [
      'Un template compare sulla TV.',
      'Scrivi testo sopra e sotto dal telefono.',
      'Galleria e votazione: il meme piu votato vince la manche.',
    ],
    durationSec: null,
    ready: true,
  },

  /* ----------------------------- A SQUADRE ----------------------------- */
  {
    id: 'taboo',
    title: 'Taboo',
    category: 'team',
    minPlayers: 4,
    maxPlayers: 16,
    minPerTeam: 2,
    tagline: 'Falla indovinare senza dirla',
    rules: [
      'Il suggeritore vede la parola e 5 termini vietati.',
      'Un avversario controlla lo schermo alle sue spalle.',
      '60 secondi. Parola vietata pronunciata = carta persa e penalita.',
    ],
    durationSec: 60,
    ready: true,
  },
  {
    id: 'intesa-vincente',
    title: "L'Intesa Vincente",
    category: 'team',
    minPlayers: 6,
    maxPlayers: 12,
    minPerTeam: 3,
    tagline: 'Una parola a testa, in alternanza',
    rules: [
      'Due suggeritori costruiscono una domanda, una parola ciascuno a turno.',
      'Il risolutore ascolta e da la risposta finale.',
      'Due parole di fila o parte della parola segreta = errore.',
    ],
    durationSec: 60,
    ready: true,
  },
  {
    id: 'mimo',
    title: 'Mimo',
    category: 'team',
    minPlayers: 4,
    maxPlayers: 16,
    minPerTeam: 2,
    tagline: 'Solo corpo, zero voce',
    rules: [
      'Film, mestieri, azioni, proverbi. Solo gesti.',
      'Vietato parlare, fare rumori, sillabare o indicare oggetti.',
      'Se scade il tempo, gli avversari possono rubare con una risposta secca.',
    ],
    durationSec: 90,
    ready: true,
  },
  {
    id: 'top10',
    title: 'Top 10',
    category: 'team',
    minPlayers: 4,
    maxPlayers: 16,
    minPerTeam: 2,
    tagline: 'La classifica vera, indovinata a turno',
    rules: [
      'Si svela il tema della classifica ufficiale.',
      'Le squadre propongono un elemento alla volta, a turni alterni.',
      '1o posto = 10 punti, 10o posto = 1 punto. Fuori classifica = 0.',
    ],
    durationSec: null,
    ready: true,
  },
];

export const GAME_BY_ID = new Map(GAMES.map((g) => [g.id, g]));

export function gameDef(id: GameId): GameDef {
  const g = GAME_BY_ID.get(id);
  if (!g) throw new Error(`Gioco sconosciuto: ${id}`);
  return g;
}

/** Un gioco e' giocabile con questo numero di partecipanti? */
export function isPlayable(def: GameDef, playerCount: number): boolean {
  if (!def.ready) return false;
  if (playerCount < def.minPlayers || playerCount > def.maxPlayers) return false;
  if (def.minPerTeam && playerCount < def.minPerTeam * 2) return false;
  return true;
}

export function playableGames(playerCount: number, excluded: GameId[] = []): GameDef[] {
  return GAMES.filter((g) => isPlayable(g, playerCount) && !excluded.includes(g.id));
}

/** Soglie globali della partita: sotto il minimo non si parte. */
export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 16;
export const SWEET_SPOT: [number, number] = [6, 8];
