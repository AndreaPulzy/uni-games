/** Classifiche per il gioco Top 10.
 *
 *  `volatile: true` marca le classifiche che invecchiano (incassi, turismo,
 *  popolazione): vanno ricontrollate ogni tanto. Le altre sono stabili.
 *  I punti sono ponderati: il primo posto vale quanto la lunghezza della lista.
 */

export interface Top10List {
  id: string;
  titolo: string;
  /** dal 1o posto in giu'; `alias` accetta grafie e sinonimi alternativi */
  voci: { nome: string; alias?: string[] }[];
  volatile?: boolean;
}

export const TOP10: Top10List[] = [
  /* ------------------------------ geografia ------------------------------ */
  {
    id: 'stati-superficie',
    titolo: 'I 10 stati più grandi del mondo per superficie',
    voci: [
      { nome: 'Russia' }, { nome: 'Canada' }, { nome: 'Cina' },
      { nome: 'Stati Uniti', alias: ['USA', 'America'] }, { nome: 'Brasile' },
      { nome: 'Australia' }, { nome: 'India' }, { nome: 'Argentina' },
      { nome: 'Kazakistan' }, { nome: 'Algeria' },
    ],
  },
  {
    id: 'stati-popolosi',
    titolo: 'I 10 paesi più popolosi del mondo',
    volatile: true,
    voci: [
      { nome: 'India' }, { nome: 'Cina' }, { nome: 'Stati Uniti', alias: ['USA', 'America'] },
      { nome: 'Indonesia' }, { nome: 'Pakistan' }, { nome: 'Nigeria' },
      { nome: 'Brasile' }, { nome: 'Bangladesh' }, { nome: 'Russia' }, { nome: 'Etiopia' },
    ],
  },
  {
    id: 'stati-piccoli',
    titolo: 'I 10 stati più piccoli del mondo',
    voci: [
      { nome: 'Vaticano', alias: ['Città del Vaticano'] }, { nome: 'Monaco' },
      { nome: 'Nauru' }, { nome: 'Tuvalu' }, { nome: 'San Marino' },
      { nome: 'Liechtenstein' }, { nome: 'Isole Marshall' },
      { nome: 'Saint Kitts e Nevis', alias: ['Saint Kitts'] }, { nome: 'Maldive' }, { nome: 'Malta' },
    ],
  },
  {
    id: 'montagne',
    titolo: 'Le 10 montagne più alte del mondo',
    voci: [
      { nome: 'Everest' }, { nome: 'K2' }, { nome: 'Kangchenjunga' },
      { nome: 'Lhotse' }, { nome: 'Makalu' }, { nome: 'Cho Oyu' },
      { nome: 'Dhaulagiri' }, { nome: 'Manaslu' }, { nome: 'Nanga Parbat' },
      { nome: 'Annapurna' },
    ],
  },
  {
    id: 'fiumi-mondo',
    titolo: 'I 10 fiumi più lunghi del mondo',
    voci: [
      { nome: 'Nilo' }, { nome: 'Rio delle Amazzoni', alias: ['Amazzoni', 'Amazzonia'] },
      { nome: 'Yangtze', alias: ['Fiume Azzurro'] }, { nome: 'Mississippi' },
      { nome: 'Yenisei' }, { nome: 'Fiume Giallo', alias: ['Huang He'] },
      { nome: 'Ob' }, { nome: 'Parana' }, { nome: 'Congo' }, { nome: 'Amur' },
    ],
  },
  {
    id: 'fiumi-italia',
    titolo: "I 10 fiumi più lunghi d'Italia",
    voci: [
      { nome: 'Po' }, { nome: 'Adige' }, { nome: 'Tevere' }, { nome: 'Adda' },
      { nome: 'Oglio' }, { nome: 'Tanaro' }, { nome: 'Ticino' }, { nome: 'Arno' },
      { nome: 'Piave' }, { nome: 'Reno' },
    ],
  },
  {
    id: 'isole',
    titolo: 'Le 10 isole più grandi del mondo',
    voci: [
      { nome: 'Groenlandia' }, { nome: 'Nuova Guinea' }, { nome: 'Borneo' },
      { nome: 'Madagascar' }, { nome: 'Baffin' }, { nome: 'Sumatra' },
      { nome: 'Honshu' }, { nome: 'Victoria' },
      { nome: 'Gran Bretagna', alias: ['Inghilterra'] }, { nome: 'Ellesmere' },
    ],
  },
  {
    id: 'deserti',
    titolo: 'I 10 deserti più grandi del mondo',
    voci: [
      { nome: 'Antartico' }, { nome: 'Artico' }, { nome: 'Sahara' },
      { nome: 'Arabico' }, { nome: 'Gobi' }, { nome: 'Kalahari' },
      { nome: 'Patagonico' }, { nome: 'Siriano' },
      { nome: 'Great Basin', alias: ['Gran Bacino'] }, { nome: 'Chihuahua' },
    ],
  },
  {
    id: 'oceani',
    titolo: 'I 5 oceani della Terra, dal più grande',
    voci: [
      { nome: 'Pacifico' }, { nome: 'Atlantico' }, { nome: 'Indiano' },
      { nome: 'Antartico', alias: ['Australe'] }, { nome: 'Artico' },
    ],
  },

  /* -------------------------------- Italia -------------------------------- */
  {
    id: 'citta-italiane',
    titolo: 'Le 10 città italiane più popolose',
    voci: [
      { nome: 'Roma' }, { nome: 'Milano' }, { nome: 'Napoli' }, { nome: 'Torino' },
      { nome: 'Palermo' }, { nome: 'Genova' }, { nome: 'Bologna' },
      { nome: 'Firenze' }, { nome: 'Bari' }, { nome: 'Catania' },
    ],
  },
  {
    id: 'regioni-popolose',
    titolo: 'Le 10 regioni italiane più popolose',
    voci: [
      { nome: 'Lombardia' }, { nome: 'Lazio' }, { nome: 'Campania' },
      { nome: 'Sicilia' }, { nome: 'Veneto' }, { nome: 'Emilia-Romagna', alias: ['Emilia Romagna'] },
      { nome: 'Piemonte' }, { nome: 'Puglia' }, { nome: 'Toscana' }, { nome: 'Calabria' },
    ],
  },
  {
    id: 'regioni-estese',
    titolo: 'Le 10 regioni italiane più estese',
    voci: [
      { nome: 'Sicilia' }, { nome: 'Piemonte' }, { nome: 'Sardegna' },
      { nome: 'Lombardia' }, { nome: 'Toscana' }, { nome: 'Emilia-Romagna', alias: ['Emilia Romagna'] },
      { nome: 'Puglia' }, { nome: 'Veneto' }, { nome: 'Lazio' }, { nome: 'Calabria' },
    ],
  },
  {
    id: 'scudetti',
    titolo: 'Le squadre con più scudetti in Serie A',
    voci: [
      { nome: 'Juventus' }, { nome: 'Inter' }, { nome: 'Milan' }, { nome: 'Genoa' },
      { nome: 'Torino' }, { nome: 'Bologna' }, { nome: 'Pro Vercelli' },
      { nome: 'Roma' }, { nome: 'Lazio' }, { nome: 'Napoli' },
    ],
  },
  {
    id: 'vulcani-italia',
    titolo: "I vulcani attivi d'Italia",
    voci: [
      { nome: 'Etna' }, { nome: 'Stromboli' }, { nome: 'Vesuvio' },
      { nome: 'Campi Flegrei' }, { nome: 'Vulcano' }, { nome: 'Pantelleria' },
      { nome: 'Ischia' },
    ],
  },

  /* -------------------------------- sport --------------------------------- */
  {
    id: 'mondiali',
    titolo: 'Le nazionali con più Mondiali di calcio vinti',
    voci: [
      { nome: 'Brasile' }, { nome: 'Germania' }, { nome: 'Italia' },
      { nome: 'Argentina' }, { nome: 'Francia' }, { nome: 'Uruguay' },
      { nome: 'Inghilterra' }, { nome: 'Spagna' },
    ],
  },
  {
    id: 'champions',
    titolo: 'I club con più Coppe dei Campioni / Champions League',
    volatile: true,
    voci: [
      { nome: 'Real Madrid' }, { nome: 'Milan' }, { nome: 'Bayern Monaco', alias: ['Bayern'] },
      { nome: 'Liverpool' }, { nome: 'Barcellona' }, { nome: 'Ajax' },
      { nome: 'Inter' }, { nome: 'Manchester United' }, { nome: 'Juventus' },
      { nome: 'Benfica' },
    ],
  },
  {
    id: 'olimpiadi',
    titolo: 'I paesi con più medaglie olimpiche estive di sempre',
    volatile: true,
    voci: [
      { nome: 'Stati Uniti', alias: ['USA', 'America'] }, { nome: 'Unione Sovietica', alias: ['URSS'] },
      { nome: 'Germania' }, { nome: 'Gran Bretagna', alias: ['Regno Unito', 'Inghilterra'] },
      { nome: 'Francia' }, { nome: 'Italia' }, { nome: 'Cina' },
      { nome: 'Svezia' }, { nome: 'Ungheria' }, { nome: 'Russia' },
    ],
  },

  /* ------------------------------- scienza -------------------------------- */
  {
    id: 'pianeti',
    titolo: 'I pianeti del sistema solare dal più grande al più piccolo',
    voci: [
      { nome: 'Giove' }, { nome: 'Saturno' }, { nome: 'Urano' }, { nome: 'Nettuno' },
      { nome: 'Terra' }, { nome: 'Venere' }, { nome: 'Marte' }, { nome: 'Mercurio' },
    ],
  },
  {
    id: 'elementi-crosta',
    titolo: 'Gli elementi più abbondanti nella crosta terrestre',
    voci: [
      { nome: 'Ossigeno' }, { nome: 'Silicio' }, { nome: 'Alluminio' },
      { nome: 'Ferro' }, { nome: 'Calcio' }, { nome: 'Sodio' },
      { nome: 'Potassio' }, { nome: 'Magnesio' }, { nome: 'Titanio' }, { nome: 'Idrogeno' },
    ],
  },
  {
    id: 'animali-veloci',
    titolo: 'Gli animali terrestri più veloci',
    voci: [
      { nome: 'Ghepardo' }, { nome: 'Antilocapra' }, { nome: 'Springbok' },
      { nome: 'Gnu' }, { nome: 'Leone' }, { nome: 'Gazzella' },
      { nome: 'Levriero' }, { nome: 'Cavallo' }, { nome: 'Alce' }, { nome: 'Coyote' },
    ],
  },

  /* -------------------------------- cultura -------------------------------- */
  {
    id: 'lingue',
    titolo: 'Le 10 lingue con più madrelingua al mondo',
    volatile: true,
    voci: [
      { nome: 'Cinese mandarino', alias: ['Cinese', 'Mandarino'] }, { nome: 'Spagnolo' },
      { nome: 'Inglese' }, { nome: 'Hindi' }, { nome: 'Arabo' },
      { nome: 'Bengali' }, { nome: 'Portoghese' }, { nome: 'Russo' },
      { nome: 'Giapponese' }, { nome: 'Punjabi' },
    ],
  },
  {
    id: 'paesi-visitati',
    titolo: 'I 10 paesi più visitati al mondo',
    volatile: true,
    voci: [
      { nome: 'Francia' }, { nome: 'Spagna' }, { nome: 'Stati Uniti', alias: ['USA', 'America'] },
      { nome: 'Cina' }, { nome: 'Italia' }, { nome: 'Turchia' }, { nome: 'Messico' },
      { nome: 'Thailandia' }, { nome: 'Germania' },
      { nome: 'Regno Unito', alias: ['Inghilterra', 'UK', 'Gran Bretagna'] },
    ],
  },
  {
    id: 'vino',
    titolo: 'I 10 maggiori produttori di vino al mondo',
    volatile: true,
    voci: [
      { nome: 'Italia' }, { nome: 'Francia' }, { nome: 'Spagna' },
      { nome: 'Stati Uniti', alias: ['USA', 'America'] }, { nome: 'Argentina' },
      { nome: 'Australia' }, { nome: 'Cile' }, { nome: 'Sudafrica' },
      { nome: 'Germania' }, { nome: 'Portogallo' },
    ],
  },
  {
    id: 'capitali-europee',
    titolo: 'Le capitali europee più popolose',
    volatile: true,
    voci: [
      { nome: 'Mosca' }, { nome: 'Londra' }, { nome: 'Berlino' },
      { nome: 'Madrid' }, { nome: 'Kiev' }, { nome: 'Roma' },
      { nome: 'Parigi' }, { nome: 'Bucarest' }, { nome: 'Vienna' }, { nome: 'Amburgo' },
    ],
  },

  /* ---------------------------- geografia (altre) ---------------------------- */
  {
    id: 'continenti-superficie',
    titolo: 'I 7 continenti, dal più grande al più piccolo',
    voci: [
      { nome: 'Asia' }, { nome: 'Africa' },
      { nome: 'America del Nord', alias: ['Nord America', 'Nordamerica', 'America settentrionale'] },
      { nome: 'America del Sud', alias: ['Sud America', 'Sudamerica', 'America meridionale'] },
      { nome: 'Antartide', alias: ['Antartico'] }, { nome: 'Europa' },
      { nome: 'Oceania', alias: ['Australia'] },
    ],
  },
  {
    id: 'continenti-popolosi',
    titolo: 'I continenti abitati, dal più popoloso',
    voci: [
      { nome: 'Asia' }, { nome: 'Africa' }, { nome: 'Europa' },
      { nome: 'America del Nord', alias: ['Nord America', 'Nordamerica', 'America settentrionale'] },
      { nome: 'America del Sud', alias: ['Sud America', 'Sudamerica', 'America meridionale'] },
      { nome: 'Oceania', alias: ['Australia'] },
    ],
  },
  {
    id: 'confini-italia',
    titolo: "Gli stati che confinano con l'Italia, dal confine più lungo",
    voci: [
      { nome: 'Svizzera' }, { nome: 'Francia' }, { nome: 'Austria' },
      { nome: 'Slovenia' }, { nome: 'San Marino' },
      { nome: 'Vaticano', alias: ['Città del Vaticano'] },
    ],
  },
  {
    id: 'regioni-piccole',
    titolo: 'Le 8 regioni italiane più piccole, dalla più piccola',
    voci: [
      { nome: "Valle d'Aosta", alias: ["Val d'Aosta", 'Valle Aosta'] }, { nome: 'Molise' },
      { nome: 'Liguria' }, { nome: 'Friuli-Venezia Giulia', alias: ['Friuli', 'Friuli Venezia Giulia'] },
      { nome: 'Umbria' }, { nome: 'Marche' }, { nome: 'Basilicata' }, { nome: 'Abruzzo' },
    ],
  },
  {
    id: 'laghi-italia',
    titolo: "I 5 laghi più grandi d'Italia",
    voci: [
      { nome: 'Garda', alias: ['Lago di Garda', 'Benaco'] },
      { nome: 'Maggiore', alias: ['Lago Maggiore', 'Verbano'] },
      { nome: 'Como', alias: ['Lago di Como', 'Lario'] },
      { nome: 'Trasimeno', alias: ['Lago Trasimeno'] },
      { nome: 'Bolsena', alias: ['Lago di Bolsena'] },
    ],
  },
  {
    id: 'isole-italiane',
    titolo: 'Le 5 isole italiane più grandi',
    voci: [
      { nome: 'Sicilia' }, { nome: 'Sardegna' }, { nome: 'Elba', alias: ["Isola d'Elba"] },
      { nome: "Sant'Antioco", alias: ['Santantioco', 'Sant Antioco'] }, { nome: 'Pantelleria' },
    ],
  },

  /* ---------------------------- storia e cultura ---------------------------- */
  {
    id: 're-di-roma',
    titolo: 'I sette re di Roma, in ordine',
    voci: [
      { nome: 'Romolo' }, { nome: 'Numa Pompilio', alias: ['Numa'] },
      { nome: 'Tullo Ostilio', alias: ['Tullo'] }, { nome: 'Anco Marzio', alias: ['Anco'] },
      { nome: 'Tarquinio Prisco', alias: ['Prisco'] }, { nome: 'Servio Tullio', alias: ['Servio'] },
      { nome: 'Tarquinio il Superbo', alias: ['Tarquinio Superbo', 'Superbo'] },
    ],
  },
  {
    id: 'presidenti-repubblica',
    titolo: 'I primi 10 presidenti della Repubblica Italiana, in ordine',
    voci: [
      { nome: 'Enrico De Nicola', alias: ['De Nicola'] }, { nome: 'Luigi Einaudi', alias: ['Einaudi'] },
      { nome: 'Giovanni Gronchi', alias: ['Gronchi'] }, { nome: 'Antonio Segni', alias: ['Segni'] },
      { nome: 'Giuseppe Saragat', alias: ['Saragat'] }, { nome: 'Giovanni Leone', alias: ['Leone'] },
      { nome: 'Sandro Pertini', alias: ['Pertini'] }, { nome: 'Francesco Cossiga', alias: ['Cossiga'] },
      { nome: 'Oscar Luigi Scalfaro', alias: ['Scalfaro'] },
      { nome: 'Carlo Azeglio Ciampi', alias: ['Ciampi'] },
    ],
  },
  {
    id: 'papi',
    titolo: 'Gli ultimi 8 papi, dal più recente',
    volatile: true,
    voci: [
      { nome: 'Leone XIV', alias: ['Leone 14', 'Prevost'] },
      { nome: 'Francesco', alias: ['Papa Francesco', 'Bergoglio'] },
      { nome: 'Benedetto XVI', alias: ['Benedetto 16', 'Ratzinger'] },
      { nome: 'Giovanni Paolo II', alias: ['Giovanni Paolo 2', 'Wojtyla'] },
      { nome: 'Giovanni Paolo I', alias: ['Giovanni Paolo 1', 'Luciani'] },
      { nome: 'Paolo VI', alias: ['Paolo 6', 'Montini'] },
      { nome: 'Giovanni XXIII', alias: ['Giovanni 23', 'Roncalli'] },
      { nome: 'Pio XII', alias: ['Pio 12', 'Pacelli'] },
    ],
  },
  {
    id: 'alfabeto-greco',
    titolo: "Le prime 10 lettere dell'alfabeto greco, in ordine",
    voci: [
      { nome: 'Alfa', alias: ['Alpha'] }, { nome: 'Beta' }, { nome: 'Gamma' }, { nome: 'Delta' },
      { nome: 'Epsilon' }, { nome: 'Zeta' }, { nome: 'Eta' }, { nome: 'Theta', alias: ['Teta'] },
      { nome: 'Iota' }, { nome: 'Kappa', alias: ['Cappa'] },
    ],
  },
  {
    id: 'zodiaco',
    titolo: "I primi 10 segni dello zodiaco, partendo dall'Ariete",
    voci: [
      { nome: 'Ariete' }, { nome: 'Toro' }, { nome: 'Gemelli' }, { nome: 'Cancro' },
      { nome: 'Leone' }, { nome: 'Vergine' }, { nome: 'Bilancia' }, { nome: 'Scorpione' },
      { nome: 'Sagittario' }, { nome: 'Capricorno' },
    ],
  },
  {
    id: 'arcobaleno',
    titolo: "I 7 colori dell'arcobaleno, dall'esterno all'interno",
    voci: [
      { nome: 'Rosso' }, { nome: 'Arancione', alias: ['Arancio'] }, { nome: 'Giallo' },
      { nome: 'Verde' }, { nome: 'Blu', alias: ['Azzurro'] }, { nome: 'Indaco' },
      { nome: 'Violetto', alias: ['Viola'] },
    ],
  },
  {
    id: 'harry-potter',
    titolo: 'I 7 libri di Harry Potter, in ordine di uscita',
    voci: [
      { nome: 'La pietra filosofale', alias: ['Pietra filosofale'] },
      { nome: 'La camera dei segreti', alias: ['Camera dei segreti'] },
      { nome: 'Il prigioniero di Azkaban', alias: ['Prigioniero di Azkaban', 'Azkaban'] },
      { nome: 'Il calice di fuoco', alias: ['Calice di fuoco'] },
      { nome: "L'Ordine della Fenice", alias: ['Ordine della Fenice', 'Fenice'] },
      { nome: 'Il principe mezzosangue', alias: ['Principe mezzosangue', 'Mezzosangue'] },
      { nome: 'I doni della morte', alias: ['Doni della morte'] },
    ],
  },
  {
    id: 'star-wars',
    titolo: "I 9 episodi della saga di Star Wars, dall'Episodio I",
    voci: [
      { nome: 'La minaccia fantasma', alias: ['Minaccia fantasma'] },
      { nome: "L'attacco dei cloni", alias: ['Attacco dei cloni'] },
      { nome: 'La vendetta dei Sith', alias: ['Vendetta dei Sith'] },
      { nome: 'Una nuova speranza', alias: ['Nuova speranza', 'Guerre stellari'] },
      { nome: "L'Impero colpisce ancora", alias: ['Impero colpisce ancora'] },
      { nome: 'Il ritorno dello Jedi', alias: ['Ritorno dello Jedi'] },
      { nome: 'Il risveglio della Forza', alias: ['Risveglio della Forza'] },
      { nome: 'Gli ultimi Jedi', alias: ['Ultimi Jedi'] },
      { nome: "L'ascesa di Skywalker", alias: ['Ascesa di Skywalker'] },
    ],
  },

  /* ---------------------------- scienza (altre) ---------------------------- */
  {
    id: 'pianeti-distanza',
    titolo: 'I pianeti del sistema solare, dal più vicino al Sole',
    voci: [
      { nome: 'Mercurio' }, { nome: 'Venere' }, { nome: 'Terra' }, { nome: 'Marte' },
      { nome: 'Giove' }, { nome: 'Saturno' }, { nome: 'Urano' }, { nome: 'Nettuno' },
    ],
  },
  {
    id: 'ossa-lunghe',
    titolo: 'Le 6 ossa più lunghe del corpo umano',
    voci: [
      { nome: 'Femore' }, { nome: 'Tibia' }, { nome: 'Perone', alias: ['Fibula'] },
      { nome: 'Omero' }, { nome: 'Ulna' }, { nome: 'Radio' },
    ],
  },
  {
    id: 'numeri-primi',
    titolo: 'I primi 10 numeri primi',
    voci: [
      { nome: 'Due', alias: ['2'] }, { nome: 'Tre', alias: ['3'] }, { nome: 'Cinque', alias: ['5'] },
      { nome: 'Sette', alias: ['7'] }, { nome: 'Undici', alias: ['11'] }, { nome: 'Tredici', alias: ['13'] },
      { nome: 'Diciassette', alias: ['17'] }, { nome: 'Diciannove', alias: ['19'] },
      { nome: 'Ventitré', alias: ['23', 'Ventitre'] }, { nome: 'Ventinove', alias: ['29'] },
    ],
  },
];

export function randomTop10(rng: () => number = Math.random): Top10List {
  return TOP10[Math.floor(rng() * TOP10.length)];
}
