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
      { name: 'Opere di Michelangelo', level: 4, words: ['DAVIDE', 'PIETÀ', 'MOSÈ', 'GIUDIZIO'] },
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
      { name: 'Sinonimi di sapore', level: 4, words: ['GUSTO', 'AROMA', 'RETROGUSTO', 'SAPIDITÀ'] },
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
      { name: 'Dolci italiani', level: 1, words: ['TIRAMISÙ', 'CANNOLO', 'PANNACOTTA', 'ZEPPOLA'] },
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
      { name: "Parti dell'orecchio", level: 3, words: ['MARTELLO', 'INCUDINE', 'STAFFA', 'COCLEA'] },
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
      { name: "Dentro l'astuccio", level: 2, words: ['GOMMA', 'TEMPERINO', 'RIGHELLO', 'EVIDENZIATORE'] },
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
      { name: 'Città degli Stati Uniti', level: 2, words: ['BOSTON', 'DENVER', 'SEATTLE', 'PORTLAND'] },
      { name: 'Città giapponesi', level: 3, words: ['KYOTO', 'OSAKA', 'NAGOYA', 'SAPPORO'] },
      { name: 'Città italiane sul mare', level: 4, words: ['GENOVA', 'BARI', 'TRIESTE', 'RIMINI'] },
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
  {
    id: 'cani',
    groups: [
      { name: 'Colori', level: 1, words: ['ROSSO', 'VERDE', 'GIALLO', 'BLU'] },
      { name: 'Razze di cani', level: 2, words: ['BARBONCINO', 'BASSOTTO', 'DOBERMANN', 'CHIHUAHUA'] },
      { name: "Parti dell'automobile", level: 3, words: ['VOLANTE', 'FRIZIONE', 'CRUSCOTTO', 'MARMITTA'] },
      { name: 'Cani dei cartoni', level: 4, words: ['PLUTO', 'BOLT', 'LILLI', 'SCOOBY'] },
    ],
  },
  {
    id: 'colazione',
    groups: [
      { name: 'A colazione', level: 1, words: ['CORNETTO', 'BISCOTTI', 'MARMELLATA', 'CEREALI'] },
      { name: 'Monete', level: 2, words: ['EURO', 'DOLLARO', 'STERLINA', 'YEN'] },
      { name: 'Cose con i tasti', level: 3, words: ['TELECOMANDO', 'PIANOFORTE', 'CALCOLATRICE', 'TASTIERA'] },
      { name: 'Colli di Roma', level: 4, words: ['PALATINO', 'AVENTINO', 'CAMPIDOGLIO', 'QUIRINALE'] },
    ],
  },
  {
    id: 'dei',
    groups: [
      { name: 'Supereroi Marvel', level: 1, words: ['THOR', 'HULK', 'WOLVERINE', 'DEADPOOL'] },
      { name: 'Dei greci', level: 2, words: ['ZEUS', 'ATENA', 'APOLLO', 'POSEIDONE'] },
      { name: 'Hanno le ali', level: 3, words: ['AEREO', 'ANGELO', 'FARFALLA', 'PIPISTRELLO'] },
      { name: 'Pianeti nani', level: 4, words: ['PLUTONE', 'CERERE', 'ERIS', 'MAKEMAKE'] },
    ],
  },
  {
    id: 'mestieri',
    groups: [
      { name: 'Mestieri', level: 1, words: ['IDRAULICO', 'ELETTRICISTA', 'FALEGNAME', 'MURATORE'] },
      { name: 'Attrezzi', level: 2, words: ['CACCIAVITE', 'TENAGLIA', 'SEGA', 'LIVELLA'] },
      { name: 'Altri nomi delle chiacchiere di Carnevale', level: 3, words: ['FRAPPE', 'BUGIE', 'CENCI', 'GALANI'] },
      { name: 'Nascondono un animale', level: 4, words: ['MOSCATO', 'CANESTRO', 'APERITIVO', 'GALLONE'] },
    ],
  },
  {
    id: 'punteggiatura',
    groups: [
      { name: 'Segni di punteggiatura', level: 1, words: ['VIRGOLA', 'PUNTO', 'TRATTINO', 'PARENTESI'] },
      { name: 'Figure geometriche', level: 2, words: ['TRIANGOLO', 'ROMBO', 'TRAPEZIO', 'CERCHIO'] },
      { name: 'Balli', level: 3, words: ['TARANTELLA', 'SAMBA', 'FLAMENCO', 'CHARLESTON'] },
      { name: 'Parole inglesi del tennis', level: 4, words: ['SET', 'GAME', 'ACE', 'SMASH'] },
    ],
  },
  {
    id: 'fiabe',
    groups: [
      { name: 'Fiabe', level: 1, words: ['CENERENTOLA', 'BIANCANEVE', 'RAPERONZOLO', 'POLLICINO'] },
      { name: 'Sinonimi di arrabbiato', level: 2, words: ['FURIOSO', 'IRATO', 'INFURIATO', 'STIZZITO'] },
      { name: 'Nani di Biancaneve', level: 3, words: ['BRONTOLO', 'PISOLO', 'MAMMOLO', 'CUCCIOLO'] },
      { name: 'Nascondono un numero', level: 4, words: ['TRENO', 'DUELLO', 'NOVELLA', 'OTTOBRE'] },
    ],
  },
  {
    id: 'bar',
    groups: [
      { name: 'Al bar', level: 1, words: ['CAPPUCCINO', 'SPREMUTA', 'APERITIVO', 'TRAMEZZINO'] },
      { name: 'Pasta ripiena', level: 2, words: ['TORTELLINI', 'RAVIOLI', 'AGNOLOTTI', 'CAPPELLETTI'] },
      { name: "Capitali dell'America Latina", level: 3, words: ['LIMA', 'QUITO', 'BOGOTÀ', 'SANTIAGO'] },
      { name: 'Ordini religiosi', level: 4, words: ['FRANCESCANI', 'DOMENICANI', 'BENEDETTINI', 'GESUITI'] },
    ],
  },
  {
    id: 'germania',
    groups: [
      { name: 'Auto tedesche', level: 1, words: ['AUDI', 'OPEL', 'PORSCHE', 'VOLKSWAGEN'] },
      { name: 'Città tedesche', level: 2, words: ['MONACO', 'AMBURGO', 'COLONIA', 'FRANCOFORTE'] },
      { name: 'Compositori tedeschi', level: 3, words: ['BACH', 'BEETHOVEN', 'BRAHMS', 'WAGNER'] },
      { name: 'Filosofi tedeschi', level: 4, words: ['KANT', 'HEGEL', 'NIETZSCHE', 'MARX'] },
    ],
  },
  {
    id: 'estate',
    groups: [
      { name: 'Gusti di gelato', level: 1, words: ['PISTACCHIO', 'STRACCIATELLA', 'NOCCIOLA', 'FIORDILATTE'] },
      { name: 'Cocktail', level: 2, words: ['MOJITO', 'SPRITZ', 'NEGRONI', 'DAIQUIRI'] },
      { name: 'Vette delle Alpi italiane', level: 3, words: ['CERVINO', 'MARMOLADA', 'ADAMELLO', 'ORTLES'] },
      { name: 'Isole greche', level: 4, words: ['CRETA', 'RODI', 'CORFÙ', 'MYKONOS'] },
    ],
  },
  {
    id: 'cantautori',
    groups: [
      { name: 'Strumenti ad arco', level: 1, words: ['VIOLINO', 'VIOLA', 'VIOLONCELLO', 'CONTRABBASSO'] },
      { name: 'Cantautori italiani', level: 2, words: ['DALLA', 'BATTISTI', 'GUCCINI', 'VENDITTI'] },
      { name: 'Preposizioni articolate', level: 3, words: ['DELLA', 'NELLA', 'SULLA', 'ALLA'] },
      { name: 'Indicazioni di tempo musicale', level: 4, words: ['ADAGIO', 'ALLEGRO', 'ANDANTE', 'PRESTO'] },
    ],
  },
  {
    id: 'social',
    groups: [
      { name: 'Parti del computer', level: 1, words: ['MOUSE', 'MONITOR', 'TASTIERA', 'STAMPANTE'] },
      { name: 'Social network', level: 2, words: ['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'SNAPCHAT'] },
      { name: 'Pietre preziose', level: 3, words: ['RUBINO', 'ZAFFIRO', 'SMERALDO', 'TOPAZIO'] },
      { name: 'Linguaggi di programmazione', level: 4, words: ['PYTHON', 'JAVA', 'RUBY', 'SWIFT'] },
    ],
  },
  {
    id: 'pinocchio',
    groups: [
      { name: 'Animali della savana', level: 1, words: ['LEONE', 'ZEBRA', 'GIRAFFA', 'GNU'] },
      { name: 'Cuccioli', level: 2, words: ['PULCINO', 'VITELLO', 'AGNELLO', 'PULEDRO'] },
      { name: 'Personaggi di Pinocchio', level: 3, words: ['GEPPETTO', 'MANGIAFUOCO', 'LUCIGNOLO', 'GRILLO'] },
      { name: 'Parti della moka', level: 4, words: ['CALDAIA', 'FILTRO', 'GUARNIZIONE', 'VALVOLA'] },
    ],
  },
  {
    id: 'viaggio',
    groups: [
      { name: 'In aeroporto', level: 1, words: ['GATE', 'IMBARCO', 'BAGAGLIO', 'PASSAPORTO'] },
      { name: 'Capitali asiatiche', level: 2, words: ['TOKYO', 'SEUL', 'BANGKOK', 'HANOI'] },
      { name: 'Fiumi europei', level: 3, words: ['DANUBIO', 'VOLGA', 'SENNA', 'TAMIGI'] },
      { name: 'Iniziano con una nota musicale', level: 4, words: ['DOMINO', 'REMO', 'FATA', 'LAMPO'] },
    ],
  },
  {
    id: 'racchette',
    groups: [
      { name: 'Sport con la racchetta', level: 1, words: ['TENNIS', 'PADEL', 'BADMINTON', 'SQUASH'] },
      { name: 'Sinonimi di pazzo', level: 2, words: ['FOLLE', 'SVITATO', 'PICCHIATELLO', 'SQUILIBRATO'] },
      { name: 'Termini degli scacchi', level: 3, words: ['ARROCCO', 'SCACCO', 'MATTO', 'STALLO'] },
      { name: 'Sul campo di calcio', level: 4, words: ['AREA', 'DISCHETTO', 'BANDIERINA', 'TRAVERSA'] },
    ],
  },
  {
    id: 'sughi',
    groups: [
      { name: 'Utensili da cucina', level: 1, words: ['MESTOLO', 'COLINO', 'GRATTUGIA', 'SCHIUMAROLA'] },
      { name: 'Salse', level: 2, words: ['BESCIAMELLA', 'TZATZIKI', 'AIOLI', 'GUACAMOLE'] },
      { name: 'Primi della cucina romana', level: 3, words: ['CARBONARA', 'AMATRICIANA', 'GRICIA', 'ARRABBIATA'] },
      { name: 'Vini rossi piemontesi', level: 4, words: ['BAROLO', 'BARBARESCO', 'BARBERA', 'DOLCETTO'] },
    ],
  },
];

export function randomPuzzle(rng: () => number = Math.random): ConnPuzzle {
  return CONNECTIONS[Math.floor(rng() * CONNECTIONS.length)];
}
