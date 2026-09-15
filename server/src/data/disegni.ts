/** Parole per Disegna e indovina: cose che si riconoscono con pochi tratti.
 *  `alias` accetta sinonimi comuni, cosi' "palla" vale anche per "pallone". */

export interface DrawWord {
  parola: string;
  alias?: string[];
}

const w = (parola: string, ...alias: string[]): DrawWord => (alias.length ? { parola, alias } : { parola });

export const PAROLE_DISEGNO: DrawWord[] = [
  // natura e cielo
  w('Sole'), w('Luna'), w('Stella'), w('Nuvola'), w('Pioggia'), w('Arcobaleno'), w('Fulmine', 'saetta'),
  w('Albero'), w('Fiore'), w('Montagna', 'monte'), w('Vulcano'), w('Isola'), w('Cactus'), w('Fungo'),
  w('Fuoco', 'fiamma'), w('Onda'), w('Deserto'), w('Tempesta'),
  // animali
  w('Gatto'), w('Cane'), w('Pesce'), w('Uccello'), w('Ragno'), w('Serpente'), w('Farfalla'),
  w('Lumaca'), w('Tartaruga'), w('Elefante'), w('Giraffa'), w('Coniglio'), w('Pinguino'),
  w('Balena'), w('Polpo', 'piovra'), w('Granchio'), w('Cavallo'), w('Mucca'), w('Maiale'),
  w('Gallina'), w('Ape'), w('Squalo'),
  // cibo
  w('Pizza'), w('Gelato'), w('Torta'), w('Banana'), w('Mela'), w('Uovo'), w('Pane'),
  w('Hamburger', 'panino'), w('Caffè', 'tazzina'), w('Zucca'), w('Carota'), w('Ananas'),
  w('Anguria', 'cocomero'), w('Uva'), w('Ciliegia', 'ciliegie'), w('Limone'), w('Pera'),
  w('Spaghetti', 'pasta'), w('Formaggio'), w('Biscotto'),
  // casa e oggetti
  w('Casa'), w('Letto'), w('Sedia'), w('Tavolo'), w('Divano'), w('Finestra'), w('Porta'),
  w('Scala'), w('Lampada'), w('Forbici'), w('Martello'), w('Matita'), w('Libro'), w('Zaino'),
  w('Valigia'), w('Ombrello'), w('Occhiali'), w('Cappello'), w('Scarpa'), w('Chiave'),
  w('Lampadina'), w('Orologio'), w('Telefono', 'cellulare'), w('Televisione', 'tv', 'televisore'),
  w('Candela'), w('Regalo', 'pacco'), w('Palloncino'), w('Bicchiere'), w('Forchetta'),
  w('Cucchiaio'), w('Calzino'), w('Maglietta'), w('Guanto'), w('Sciarpa'), w('Cravatta'),
  w('Anello'), w('Diamante'), w('Moneta'), w('Salvadanaio'), w('Specchio'), w('Vasca'),
  // trasporti
  w('Barca'), w('Aereo'), w('Macchina', 'auto', 'automobile'), w('Bicicletta', 'bici'), w('Treno'),
  w('Razzo'), w('Autobus', 'pullman'), w('Nave'), w('Elicottero'), w('Mongolfiera'),
  w('Sottomarino'), w('Trattore'), w('Ambulanza'), w('Semaforo'), w('Paracadute'),
  // luoghi e costruzioni
  w('Castello'), w('Ponte'), w('Faro'), w('Tenda'), w('Igloo'), w('Piramide'), w('Chiesa'),
  w('Grattacielo'), w('Torre Eiffel'), w('Colosseo'), w('Spiaggia'), w('Piscina'),
  // personaggi e fantasia
  w('Pupazzo di neve'), w('Drago'), w('Fantasma'), w('Robot'), w('Alieno', 'marziano'),
  w('Sirena'), w('Pirata'), w('Re'), w('Strega'), w('Mago'), w('Astronauta'), w('Pompiere'),
  w('Cuoco', 'chef'), w('Scheletro'), w('Vampiro'), w('Supereroe'),
  // corpo
  w('Occhio'), w('Naso'), w('Bocca'), w('Mano'), w('Piede'), w('Dente'), w('Orecchio'), w('Cuore'),
  // simboli, sport e svago
  w('Corona'), w('Spada'), w('Scudo'), w('Bandiera'), w('Freccia'), w('Ancora'),
  w('Pallone', 'palla'), w('Canestro'), w('Racchetta'), w('Sci'), w('Aquilone'), w('Altalena'),
  w('Scivolo'), w('Dado'), w('Scacchi'), w('Chitarra'), w('Tamburo'), w('Microfono'),
  w('Cuffie'), w('Computer', 'pc'), w('Telescopio'), w('Calamita'), w('Batteria'),
];
