/** Griglie per Connections. Ogni puzzle ha 4 gruppi da 4 parole.
 *  level 1 = piu immediato, level 4 = piu subdolo (colori come nell'originale). */

export interface ConnGroup {
  name: string;
  level: 1 | 2 | 3 | 4;
  words: [string, string, string, string];
}
export interface ConnPuzzle {
  id: string;
  groups: [ConnGroup, ConnGroup, ConnGroup, ConnGroup];
}

export const CONNECTIONS: ConnPuzzle[] = [
  {
    id: 'pasta',
    groups: [
      { name: 'Formati di pasta', level: 1, words: ['FUSILLI', 'RIGATONI', 'PENNE', 'FARFALLE'] },
      { name: 'Sinonimi di enorme', level: 2, words: ['VASTO', 'IMMENSO', 'COLOSSALE', 'SMISURATO'] },
      { name: 'Fiumi italiani', level: 3, words: ['PO', 'ARNO', 'TEVERE', 'ADIGE'] },
      { name: 'Iniziano con AUTO', level: 4, words: ['BUS', 'GOL', 'RADIO', 'STOP'] },
    ],
  },
  {
    id: 'salsa',
    groups: [
      { name: 'Balli latino-americani', level: 2, words: ['SALSA', 'TANGO', 'RUMBA', 'MAMBO'] },
      { name: 'Condimenti', level: 1, words: ['MAIONESE', 'KETCHUP', 'SENAPE', 'PESTO'] },
      { name: 'Pianeti', level: 1, words: ['MARTE', 'VENERE', 'GIOVE', 'SATURNO'] },
      { name: 'Divinita romane', level: 4, words: ['NETTUNO', 'MERCURIO', 'CERERE', 'VESTA'] },
    ],
  },
  {
    id: 'chitarra',
    groups: [
      { name: 'Parti della chitarra', level: 3, words: ['CORDA', 'PONTE', 'CASSA', 'TASTO'] },
      { name: 'Strumenti a fiato', level: 1, words: ['FLAUTO', 'TROMBA', 'OBOE', 'CLARINETTO'] },
      { name: 'Cose che si attraversano', level: 2, words: ['GUADO', 'TUNNEL', 'VALICO', 'SOGLIA'] },
      { name: 'Sinonimi di battere', level: 4, words: ['PICCHIARE', 'MARTELLARE', 'PULSARE', 'SCONFIGGERE'] },
    ],
  },
  {
    id: 'mare',
    groups: [
      { name: 'Cose in spiaggia', level: 1, words: ['OMBRELLONE', 'LETTINO', 'PATTINO', 'BAGNINO'] },
      { name: 'Pesci', level: 2, words: ['ORATA', 'BRANZINO', 'SOGLIOLA', 'TRIGLIA'] },
      { name: 'Nodi marinari', level: 4, words: ['PARLATO', 'GASSA', 'SAVOIA', 'PIANO'] },
      { name: 'Venti', level: 3, words: ['MAESTRALE', 'SCIROCCO', 'LIBECCIO', 'GRECALE'] },
    ],
  },
  {
    id: 'carte',
    groups: [
      { name: 'Semi delle carte', level: 1, words: ['CUORI', 'PICCHE', 'FIORI', 'QUADRI'] },
      { name: 'Giochi di carte', level: 2, words: ['SCOPA', 'BRISCOLA', 'TRESETTE', 'RAMINO'] },
      { name: 'Attrezzi da pulizia', level: 3, words: ['SECCHIO', 'STRACCIO', 'PALETTA', 'SPUGNA'] },
      { name: 'Opere di Michelangelo', level: 4, words: ['DAVIDE', 'PIETA', 'MOSE', 'GIUDIZIO'] },
    ],
  },
  {
    id: 'tempo',
    groups: [
      { name: 'Unita di tempo', level: 1, words: ['ORA', 'MESE', 'LUSTRO', 'SECOLO'] },
      { name: 'Sinonimi di splendore', level: 3, words: ['FULGORE', 'BAGLIORE', 'SMALTO', 'LUCENTEZZA'] },
      { name: 'Mesi con 30 giorni', level: 2, words: ['APRILE', 'GIUGNO', 'SETTEMBRE', 'NOVEMBRE'] },
      { name: 'Segni zodiacali', level: 4, words: ['ARIETE', 'LEONE', 'SAGITTARIO', 'BILANCIA'] },
    ],
  },
  {
    id: 'calcio',
    groups: [
      { name: 'Ruoli nel calcio', level: 1, words: ['PORTIERE', 'TERZINO', 'MEDIANO', 'ATTACCANTE'] },
      { name: 'Squadre di Milano e Torino', level: 2, words: ['INTER', 'MILAN', 'JUVENTUS', 'TORINO'] },
      { name: 'Cose che si parano', level: 3, words: ['TIRO', 'COLPO', 'CULO', 'RIGORE'] },
      { name: 'Cose tonde', level: 4, words: ['MELONE', 'GOMITOLO', 'SFERA', 'GLOBO'] },
    ],
  },
  {
    id: 'cucina',
    groups: [
      { name: 'Cotture', level: 1, words: ['VAPORE', 'GRIGLIA', 'FORNO', 'FRITTURA'] },
      { name: 'Formaggi italiani', level: 2, words: ['ASIAGO', 'TALEGGIO', 'PECORINO', 'FONTINA'] },
      { name: 'Erbe aromatiche', level: 3, words: ['SALVIA', 'TIMO', 'ORIGANO', 'MAGGIORANA'] },
      { name: 'Sinonimi di sapore', level: 4, words: ['GUSTO', 'AROMA', 'RETROGUSTO', 'SAPIDITA'] },
    ],
  },
  {
    id: 'frutti-auto',
    groups: [
      { name: 'Frutti rossi', level: 1, words: ['FRAGOLA', 'CILIEGIA', 'LAMPONE', 'RIBES'] },
      { name: 'Sfumature di blu', level: 3, words: ['COBALTO', 'INDACO', 'TURCHESE', 'OLTREMARE'] },
      { name: 'Marche di auto italiane', level: 2, words: ['FIAT', 'LANCIA', 'ALFA', 'FERRARI'] },
      { name: 'Armi medievali', level: 4, words: ['SPADA', 'ASCIA', 'BALESTRA', 'MAZZA'] },
    ],
  },
  {
    id: 'misure',
    groups: [
      { name: 'Strumenti di misura', level: 1, words: ['RIGHELLO', 'BILANCIA', 'TERMOMETRO', 'CRONOMETRO'] },
      { name: 'Segni zodiacali', level: 2, words: ['ARIETE', 'TORO', 'GEMELLI', 'CANCRO'] },
      { name: 'Animali da fattoria', level: 3, words: ['MUCCA', 'GALLINA', 'PECORA', 'MAIALE'] },
      { name: 'Costellazioni', level: 4, words: ['ORIONE', 'CASSIOPEA', 'ANDROMEDA', 'PEGASO'] },
    ],
  },
  {
    id: 'corpo-scarpa',
    groups: [
      { name: 'Parti del corpo', level: 1, words: ['SPALLA', 'CAVIGLIA', 'POLSO', 'GOMITO'] },
      { name: 'Parti di una scarpa', level: 2, words: ['SUOLA', 'TACCO', 'LACCIO', 'TOMAIA'] },
      { name: 'Tagli di carne', level: 3, words: ['LOMBATA', 'FILETTO', 'COSTATA', 'GIRELLO'] },
      { name: 'Danze di corte', level: 4, words: ['VALZER', 'POLKA', 'MAZURKA', 'MINUETTO'] },
    ],
  },
  {
    id: 'dolci-isole',
    groups: [
      { name: 'Dolci italiani', level: 1, words: ['TIRAMISU', 'CANNOLO', 'PANNACOTTA', 'ZEPPOLA'] },
      { name: 'Dolci natalizi', level: 2, words: ['PANETTONE', 'PANDORO', 'TORRONE', 'STRUFFOLI'] },
      { name: 'Vulcani', level: 3, words: ['ETNA', 'STROMBOLI', 'VESUVIO', 'KRAKATOA'] },
      { name: 'Isole italiane', level: 4, words: ['ELBA', 'CAPRI', 'ISCHIA', 'PANTELLERIA'] },
    ],
  },
  {
    id: 'giochi-torri',
    groups: [
      { name: 'Giochi da tavolo', level: 1, words: ['MONOPOLI', 'RISIKO', 'CLUEDO', 'SCARABEO'] },
      { name: 'Pezzi degli scacchi', level: 2, words: ['ALFIERE', 'TORRE', 'CAVALLO', 'REGINA'] },
      { name: 'Torri famose', level: 3, words: ['PISA', 'EIFFEL', 'BABELE', 'LONDRA'] },
      { name: 'Cose che si arrampicano', level: 4, words: ['EDERA', 'SCIMMIA', 'ALPINISTA', 'RAMPICANTE'] },
    ],
  },
  {
    id: 'suoni',
    groups: [
      { name: 'Versi di animali', level: 1, words: ['MUGGITO', 'RAGLIO', 'NITRITO', 'BELATO'] },
      { name: 'Percussioni', level: 2, words: ['TAMBURO', 'TIMPANO', 'PIATTI', 'XILOFONO'] },
      { name: 'Parti dell orecchio', level: 3, words: ['MARTELLO', 'INCUDINE', 'STAFFA', 'COCLEA'] },
      { name: 'Cose che si battono', level: 4, words: ['RECORD', 'MONETA', 'CIGLIA', 'BANDIERA'] },
    ],
  },
  {
    id: 'cinema',
    groups: [
      { name: 'Registi italiani', level: 2, words: ['FELLINI', 'SORRENTINO', 'TORNATORE', 'BERTOLUCCI'] },
      { name: 'Premi cinematografici', level: 4, words: ['OSCAR', 'PALMA', 'ORSO', 'LEONE'] },
      { name: 'Animali da circo', level: 3, words: ['TIGRE', 'ELEFANTE', 'FOCA', 'SCIMMIA'] },
      { name: 'In sala cinematografica', level: 1, words: ['SCHERMO', 'POLTRONA', 'POPCORN', 'PROIETTORE'] },
    ],
  },
  {
    id: 'scuola',
    groups: [
      { name: 'Materie scolastiche', level: 1, words: ['STORIA', 'GEOGRAFIA', 'CHIMICA', 'FILOSOFIA'] },
      { name: 'Dentro l astuccio', level: 2, words: ['GOMMA', 'TEMPERINO', 'RIGHELLO', 'EVIDENZIATORE'] },
      { name: 'Parti di un libro', level: 3, words: ['COPERTINA', 'PREFAZIONE', 'APPENDICE', 'RILEGATURA'] },
      { name: 'Dita della mano', level: 4, words: ['POLLICE', 'INDICE', 'MIGNOLO', 'ANULARE'] },
    ],
  },
  {
    id: 'nave-fiori',
    groups: [
      { name: 'Parti di una nave', level: 1, words: ['PRUA', 'POPPA', 'CHIGLIA', 'TIMONE'] },
      { name: 'Nodi marinari', level: 4, words: ['PARLATO', 'GASSA', 'SAVOIA', 'MARGHERITA'] },
      { name: 'Fiori', level: 2, words: ['TULIPANO', 'ORCHIDEA', 'GAROFANO', 'PEONIA'] },
      { name: 'Venti', level: 3, words: ['MAESTRALE', 'SCIROCCO', 'LIBECCIO', 'GRECALE'] },
    ],
  },
  {
    id: 'sport',
    groups: [
      { name: 'Discipline olimpiche', level: 2, words: ['SCHERMA', 'JUDO', 'CANOA', 'TUFFI'] },
      { name: 'Ruoli nella pallavolo', level: 3, words: ['PALLEGGIATORE', 'LIBERO', 'SCHIACCIATORE', 'CENTRALE'] },
      { name: 'Colpi del tennis', level: 1, words: ['DRITTO', 'ROVESCIO', 'SMASH', 'VOLEE'] },
      { name: 'Parti della bicicletta', level: 4, words: ['CATENA', 'PEDALE', 'MANUBRIO', 'SELLA'] },
    ],
  },
  {
    id: 'gastronomia',
    groups: [
      { name: 'Formaggi', level: 1, words: ['GORGONZOLA', 'PROVOLONE', 'RICOTTA', 'STRACCHINO'] },
      { name: 'Salumi', level: 2, words: ['SALAME', 'PROSCIUTTO', 'MORTADELLA', 'BRESAOLA'] },
      { name: 'Verdure a foglia', level: 3, words: ['SPINACI', 'BIETOLA', 'RUCOLA', 'LATTUGA'] },
      { name: 'Spezie', level: 4, words: ['CANNELLA', 'CURCUMA', 'ZAFFERANO', 'PAPRIKA'] },
    ],
  },
  {
    id: 'citta',
    groups: [
      { name: 'Capitali europee', level: 1, words: ['LISBONA', 'VIENNA', 'PRAGA', 'ATENE'] },
      { name: 'Citta degli Stati Uniti', level: 2, words: ['BOSTON', 'DENVER', 'SEATTLE', 'PORTLAND'] },
      { name: 'Citta giapponesi', level: 3, words: ['KYOTO', 'OSAKA', 'NAGOYA', 'SAPPORO'] },
      { name: 'Citta italiane sul mare', level: 4, words: ['GENOVA', 'BARI', 'TRIESTE', 'RIMINI'] },
    ],
  },
  {
    id: 'meteo-casa',
    groups: [
      { name: 'Fenomeni atmosferici', level: 1, words: ['GRANDINE', 'NEBBIA', 'TORNADO', 'BRINA'] },
      { name: 'Tipi di nuvole', level: 4, words: ['CIRRO', 'CUMULO', 'STRATO', 'NEMBO'] },
      { name: 'Unita di misura', level: 3, words: ['METRO', 'LITRO', 'GRAMMO', 'JOULE'] },
      { name: 'Stanze e spazi di casa', level: 2, words: ['SOFFITTA', 'CANTINA', 'SOGGIORNO', 'VERANDA'] },
    ],
  },
  {
    id: 'musica',
    groups: [
      { name: 'Generi musicali', level: 1, words: ['JAZZ', 'BLUES', 'REGGAE', 'PUNK'] },
      { name: 'Strumenti a tastiera', level: 2, words: ['PIANOFORTE', 'ORGANO', 'CLAVICEMBALO', 'FISARMONICA'] },
      { name: 'Opere di Verdi', level: 4, words: ['AIDA', 'OTELLO', 'RIGOLETTO', 'NABUCCO'] },
      { name: 'Voci del coro', level: 3, words: ['SOPRANO', 'CONTRALTO', 'TENORE', 'BASSO'] },
    ],
  },
  {
    id: 'animali',
    groups: [
      { name: 'Animali marini', level: 1, words: ['DELFINO', 'MEDUSA', 'POLPO', 'RICCIO'] },
      { name: 'Animali notturni', level: 3, words: ['GUFO', 'PIPISTRELLO', 'TASSO', 'CIVETTA'] },
      { name: 'Rettili', level: 2, words: ['IGUANA', 'COCCODRILLO', 'CAMALEONTE', 'VIPERA'] },
      { name: 'Insetti', level: 4, words: ['LIBELLULA', 'CAVALLETTA', 'CICALA', 'MANTIDE'] },
    ],
  },
  {
    id: 'ufficio',
    groups: [
      { name: 'Sulla scrivania', level: 1, words: ['GRAFFETTA', 'CUCITRICE', 'AGENDA', 'CALCOLATRICE'] },
      { name: 'Tipi di riunione', level: 3, words: ['BRIEFING', 'ASSEMBLEA', 'CONFERENZA', 'SEMINARIO'] },
      { name: 'Parti di una mail', level: 2, words: ['OGGETTO', 'ALLEGATO', 'FIRMA', 'DESTINATARIO'] },
      { name: 'Cose che si archiviano', level: 4, words: ['PRATICA', 'FASCICOLO', 'DOCUMENTO', 'REGISTRO'] },
    ],
  },
  {
    id: 'natale',
    groups: [
      { name: 'Simboli natalizi', level: 1, words: ['PRESEPE', 'RENNA', 'SLITTA', 'GHIRLANDA'] },
      { name: 'Personaggi del presepe', level: 3, words: ['PASTORE', 'BUE', 'ASINELLO', 'ANGELO'] },
      { name: 'Cose che si accendono', level: 4, words: ['CAMINO', 'CANDELA', 'LUCE', 'SIGARETTA'] },
      { name: 'Sinonimi di regalo', level: 2, words: ['DONO', 'OMAGGIO', 'PRESENTE', 'STRENNA'] },
    ],
  },
];

export function randomPuzzle(rng: () => number = Math.random): ConnPuzzle {
  return CONNECTIONS[Math.floor(rng() * CONNECTIONS.length)];
}
