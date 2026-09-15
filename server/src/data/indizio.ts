/** Carte di Indizio Secco: una parola da far indovinare e la sua categoria,
 *  che compare in TV per dare un minimo di orientamento. */

export type IndizioCategoria =
  | 'Personaggio'
  | 'Animale'
  | 'Film'
  | 'Serie TV'
  | 'Cartone animato'
  | 'Luogo famoso';

export interface IndizioCard {
  categoria: IndizioCategoria;
  parola: string;
}

const card = (categoria: IndizioCategoria) => (parola: string): IndizioCard => ({ categoria, parola });

const personaggi = [
  'Harry Potter', 'Darth Vader', 'Shrek', 'Topolino', 'Paperino', 'Pinocchio', 'Cenerentola',
  'Biancaneve', 'Batman', 'Superman', 'Spider-Man', 'Joker', 'Hulk', 'Iron Man', 'Gandalf',
  'Frodo', 'Gollum', 'Yoda', 'Jack Sparrow', 'Indiana Jones', 'Rocky Balboa', 'James Bond',
  'Sherlock Holmes', 'Mary Poppins', 'Peter Pan', 'Capitan Uncino', 'Aladdin', 'Simba',
  'Buzz Lightyear', 'Elsa', 'Hermione', 'Voldemort', 'Dracula', 'Zorro', 'Tarzan',
  'Paperon de\' Paperoni', 'Homer Simpson', 'Walter White', 'Terminator', 'Babbo Natale',
  'Wonder Woman', 'Capitan America', 'Willy Wonka', 'Forrest Gump', 'Il Grinch',
].map(card('Personaggio'));

const animali = [
  'Giraffa', 'Pinguino', 'Canguro', 'Koala', 'Delfino', 'Elefante', 'Camaleonte', 'Pipistrello',
  'Gufo', 'Fenicottero', 'Polpo', 'Squalo', 'Tartaruga', 'Riccio', 'Scoiattolo', 'Lupo', 'Volpe',
  'Orso polare', 'Leone', 'Zebra', 'Ippopotamo', 'Rinoceronte', 'Coccodrillo', 'Ape', 'Formica',
  'Farfalla', 'Lumaca', 'Gallina', 'Mucca', 'Panda', 'Gorilla', 'Cammello', 'Struzzo', 'Pavone',
  'Aquila', 'Pappagallo', 'Medusa', 'Granchio', 'Balena', 'Foca', 'Castoro', 'Talpa', 'Bradipo',
].map(card('Animale'));

const film = [
  'Titanic', 'Avatar', 'Matrix', 'Frozen', 'Il re leone', 'Jurassic Park', 'Il padrino', 'Grease',
  'Top Gun', 'Inception', 'Il gladiatore', 'La vita è bella', 'Nuovo Cinema Paradiso',
  'Ritorno al futuro', 'Pretty Woman', "Mamma, ho perso l'aereo", 'Toy Story', 'Up', 'Coco',
  'Barbie', 'Interstellar', 'Pulp Fiction', 'Lo squalo', 'E.T.',
].map(card('Film'));

const serie = [
  'La casa di carta', 'Stranger Things', 'Il trono di spade', 'Breaking Bad', 'Squid Game',
  'Friends', 'The Office', 'Peaky Blinders', 'Mercoledì', 'Gomorra', 'Mare fuori', 'Lupin',
  'The Crown', 'Bridgerton', 'Lost', 'Don Matteo', 'Il commissario Montalbano', "Grey's Anatomy",
  'The Last of Us', 'Dark', 'Black Mirror', 'Sherlock', 'The Walking Dead', 'Narcos', 'Boris',
].map(card('Serie TV'));

const cartoni = [
  'Pokémon', 'Dragon Ball', 'Holly e Benji', 'Lady Oscar', 'Sailor Moon', 'Doraemon', 'Peppa Pig',
  'SpongeBob', 'Tom e Jerry', 'Scooby-Doo', 'Heidi', 'I Puffi', 'Barbapapà', 'Winx', 'Naruto',
  'One Piece', 'Lupin III', 'Ken il guerriero', 'Masha e Orso', 'I Simpson',
].map(card('Cartone animato'));

const luoghi = [
  'Colosseo', 'Torre di Pisa', 'Torre Eiffel', 'Statua della Libertà', 'Big Ben', 'Piramidi',
  'Muraglia cinese', 'Machu Picchu', 'Stonehenge', 'Sagrada Família', 'Taj Mahal', 'Venezia',
  'Pompei', 'Everest', 'Polo Nord', 'Hollywood', 'Las Vegas', 'Disneyland', 'Cappella Sistina',
  'Vesuvio', 'Sahara', 'Niagara', 'Atlantide',
].map(card('Luogo famoso'));

export const INDIZIO_CARDS: IndizioCard[] = [...personaggi, ...animali, ...film, ...serie, ...cartoni, ...luoghi];
