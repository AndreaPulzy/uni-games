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
];

export function randomTop10(rng: () => number = Math.random): Top10List {
  return TOP10[Math.floor(rng() * TOP10.length)];
}
