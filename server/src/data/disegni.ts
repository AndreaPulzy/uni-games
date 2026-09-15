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

  // altra natura
  w('Foglia'), w('Cometa'), w('Pianeta'), w('Tornado', "tromba d'aria"), w('Cascata'),
  w('Fiocco di neve'), w('Goccia'), w('Palma'), w('Rosa'), w('Girasole'), w('Tulipano'),
  w('Quadrifoglio'), w('Pigna'), w('Conchiglia'), w('Iceberg'),
  // altri animali
  w('Leone'), w('Scimmia'), w('Orso'), w('Topo'), w('Rana'), w('Gufo'), w('Pipistrello'),
  w('Delfino'), w('Medusa'), w('Stella marina'), w('Coccodrillo'), w('Canguro'), w('Zebra'),
  w('Cammello'), w('Pecora'), w('Anatra', 'papera'), w('Pavone'), w('Fenicottero'), w('Riccio'),
  w('Coccinella'), w('Formica'), w('Zanzara'), w('Dinosauro'), w('Unicorno'),
  w('Cavalluccio marino'), w('Scorpione'), w('Verme', 'lombrico'),
  // altro cibo
  w('Patatine fritte', 'patatine'), w('Hot dog'), w('Popcorn'), w('Ciambella', 'donut'),
  w('Cornetto', 'brioche', 'croissant'), w('Lecca-lecca', 'leccalecca'), w('Caramella'),
  w('Fragola'), w('Arancia'), w('Pomodoro'), w('Peperoncino'), w('Broccolo', 'broccoli'),
  w('Sushi'), w('Pannocchia', 'mais'), w('Noce di cocco', 'cocco'), w('Muffin', 'cupcake'),
  w('Avocado'), w('Bottiglia'), w('Tazza'),
  // altri oggetti
  w('Pennello'), w('Secchio'), w('Scopa'), w('Lucchetto'), w('Campana'), w('Sveglia'),
  w('Busta', 'lettera'), w('Francobollo'), w('Calendario'), w('Bilancia'), w('Clessidra'),
  w('Termometro'), w('Siringa'), w('Cerotto'), w('Spazzolino'), w('Pettine'), w('Rossetto'),
  w('Borsa'), w('Portafoglio'), w('Frigorifero', 'frigo'), w('Lavatrice'), w('Padella'),
  w('Pentola'), w('Ventilatore'), w('Chiodo'), w('Cacciavite'), w('Sega'), w('Rastrello'),
  w('Annaffiatoio', 'innaffiatoio'), w('Bomba'), w('Megafono'), w('Macchina fotografica', 'fotocamera'),
  w('Radio'), w('Joystick', 'controller'), w('Mouse'), w('Trofeo', 'coppa'), w('Medaglia'),
  w('Bussola'), w('Mappa', 'cartina'), w('Forziere', 'tesoro'), w('Lanterna'), w('Torcia'),
  w('Fiammifero'), w('Culla'), w('Biberon'), w('Ciuccio'), w('Orsacchiotto', 'peluche'),
  w('Trottola'), w('Yo-yo', 'yoyo'), w('Birillo'), w('Monopattino'), w('Skateboard', 'skate'),
  w('Fischietto'), w('Boomerang'), w('Arco', 'arco e freccia'),
  // altri trasporti
  w('Moto', 'motocicletta', 'motorino'), w('Camion'), w('Tram'), w('Taxi'), w('Ufo', 'disco volante'),
  w('Canoa'), w('Funivia'), w('Carrello della spesa', 'carrello'),
  // altri luoghi
  w('Mulino a vento', 'mulino'), w('Capanna'), w('Pozzo'), w('Fontana'), w('Torre di Pisa'),
  w('Statua della Libertà'), w('Big Ben'), w('Stadio'), w('Scuola'), w('Circo'),
  w('Montagne russe'), w('Ruota panoramica'),
  // altri personaggi
  w('Principessa'), w('Cavaliere'), w('Ninja'), w('Cowboy'), w('Clown', 'pagliaccio'),
  w('Babbo Natale'), w('Angelo'), w('Diavolo'), w('Zombie'), w('Mummia'), w('Fata'), w('Gnomo'),
  w('Poliziotto', 'agente'), w('Dottore', 'medico'), w('Pittore'), w('Ballerina'),
  w('Sub', 'sommozzatore'), w('Spaventapasseri'), w('Befana'), w('Cupido'),
  // altro corpo
  w('Capelli'), w('Baffi'), w('Lingua'), w('Cervello'), w('Impronta'), w('Muscolo', 'bicipite'),
  w('Unghia'), w('Ombelico'),
  // altri simboli e musica
  w('Nota musicale', 'nota'), w('Chiave di violino'), w('Punto interrogativo'), w('Teschio'),
  w('Faccina', 'smile', 'smiley'), w('Wi-Fi', 'wifi'), w('Puzzle'), w('Carte da gioco', 'carte'),
  w('Tavola da surf', 'surf'), w('Violino'), w('Pianoforte', 'piano'), w('Tromba'), w('Arpa'),
  w('Sassofono', 'sax'), w('Maracas'),
];
