/** Carte di Indizio Secco: una parola da far indovinare e la sua categoria,
 *  che compare in TV per dare un minimo di orientamento.
 *  Niente parole segrete di due o tre lettere: il controllo sugli indizi
 *  rifiuterebbe ogni parola che le contiene ("letto" per "E.T."). */

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
  'Luke Skywalker', 'Chewbacca', 'Thanos', 'Deadpool', 'Wolverine', 'Catwoman', 'Thor',
  'Robin Hood', 'Re Artù', 'Merlino', 'Cappuccetto Rosso', 'Cruella', 'Malefica', 'Ursula',
  'Ariel', 'Pocahontas', 'Olaf', 'Woody', 'Dory', 'Stitch', 'Pikachu', 'Super Mario', 'Sonic',
  'Lara Croft', 'Hannibal Lecter', 'Rambo', 'Mr. Bean', 'Fantozzi', 'Sandokan', 'Hercule Poirot',
  'Frankenstein', 'La Befana', 'Cupido', 'Ulisse', 'Ercole', 'Cleopatra', 'Napoleone',
  'Giulio Cesare', 'Leonardo da Vinci', 'Albert Einstein', 'Marco Polo', 'Mozart', 'Minnie',
  'Pippo', 'Topo Gigio', 'Bugs Bunny', 'Geronimo Stilton', 'Il Gatto con gli Stivali',
].map(card('Personaggio'));

const animali = [
  'Giraffa', 'Pinguino', 'Canguro', 'Koala', 'Delfino', 'Elefante', 'Camaleonte', 'Pipistrello',
  'Gufo', 'Fenicottero', 'Polpo', 'Squalo', 'Tartaruga', 'Riccio', 'Scoiattolo', 'Lupo', 'Volpe',
  'Orso polare', 'Leone', 'Zebra', 'Ippopotamo', 'Rinoceronte', 'Coccodrillo', 'Calabrone', 'Formica',
  'Farfalla', 'Lumaca', 'Gallina', 'Mucca', 'Panda', 'Gorilla', 'Cammello', 'Struzzo', 'Pavone',
  'Aquila', 'Pappagallo', 'Medusa', 'Granchio', 'Balena', 'Foca', 'Castoro', 'Talpa', 'Bradipo',
  'Tigre', 'Leopardo', 'Ghepardo', 'Lince', 'Cervo', 'Renna', 'Cinghiale', 'Lontra', 'Procione',
  'Puzzola', 'Armadillo', 'Formichiere', 'Ornitorinco', 'Tucano', 'Colibrì', 'Cigno', 'Picchio',
  'Corvo', 'Cicogna', 'Avvoltoio', 'Pellicano', 'Tricheco', 'Stella marina', 'Cavalluccio marino',
  'Aragosta', 'Scorpione', 'Coccinella', 'Lucciola', 'Zanzara', 'Rana', 'Cobra', 'Scimpanzé',
  'Orangotango', 'Suricato', 'Iena', 'Lama', 'Criceto', 'Asino', 'Tacchino',
].map(card('Animale'));

const film = [
  'Titanic', 'Avatar', 'Matrix', 'Frozen', 'Il re leone', 'Jurassic Park', 'Il padrino', 'Grease',
  'Top Gun', 'Inception', 'Il gladiatore', 'La vita è bella', 'Nuovo Cinema Paradiso',
  'Ritorno al futuro', 'Pretty Woman', "Mamma, ho perso l'aereo", 'Toy Story', 'Coco',
  'Barbie', 'Interstellar', 'Pulp Fiction', 'Lo squalo',
  'Star Wars', 'Il signore degli anelli', 'Ghostbusters', 'Alien', 'Il mago di Oz', 'La sirenetta',
  'La bella e la bestia', 'Madagascar', 'Cars', 'Ratatouille', 'Gli Incredibili', 'Inside Out',
  'Kung Fu Panda', "L'era glaciale", 'Il diavolo veste Prada', 'La La Land', 'Dirty Dancing',
  'Karate Kid', 'Rain Man', 'Jumanji', 'Fast & Furious', 'Mission: Impossible', 'Men in Black',
  'Hunger Games', 'Il Codice da Vinci', 'Shining', 'Psycho', 'King Kong', 'Godzilla', 'Oppenheimer',
  'Quo vado?', 'Perfetti sconosciuti', 'Benvenuti al Sud', 'La grande bellezza', 'Vacanze di Natale',
  'Il sesto senso', 'Mamma mia!', 'Notting Hill',
].map(card('Film'));

const serie = [
  'La casa di carta', 'Stranger Things', 'Il trono di spade', 'Breaking Bad', 'Squid Game',
  'Friends', 'The Office', 'Peaky Blinders', 'Mercoledì', 'Gomorra', 'Mare fuori', 'Lupin',
  'The Crown', 'Bridgerton', 'Lost', 'Don Matteo', 'Il commissario Montalbano', "Grey's Anatomy",
  'The Last of Us', 'Dark', 'Black Mirror', 'Sherlock', 'The Walking Dead', 'Narcos', 'Boris',
  'Dr. House', 'The Big Bang Theory', 'Prison Break', 'Vikings', 'Chernobyl', 'The Witcher',
  'House of Cards', 'I Soprano', 'Sex and the City', 'How I Met Your Mother', 'Modern Family',
  'Suits', 'The Boys', 'Élite', 'Tredici', 'Star Trek', 'X-Files', 'Westworld', 'The Mandalorian',
  'La regina degli scacchi', "L'amica geniale", 'Un medico in famiglia', 'Un posto al sole',
  'Doc - Nelle tue mani', 'Romanzo criminale', 'Emily in Paris', 'Il paradiso delle signore',
].map(card('Serie TV'));

const cartoni = [
  'Pokémon', 'Dragon Ball', 'Holly e Benji', 'Lady Oscar', 'Sailor Moon', 'Doraemon', 'Peppa Pig',
  'SpongeBob', 'Tom e Jerry', 'Scooby-Doo', 'Heidi', 'I Puffi', 'Barbapapà', 'Winx', 'Naruto',
  'One Piece', 'Lupin III', 'Ken il guerriero', 'Masha e Orso', 'I Simpson',
  'I Griffin', 'Futurama', 'Rick and Morty', 'Winnie the Pooh', 'Bluey', 'Paw Patrol', 'Gli Snorky',
  'Candy Candy', 'Mila e Shiro', 'Occhi di gatto', 'Capitan Harlock', 'Goldrake', "L'ape Maia",
  'Lupo Alberto', 'La Pimpa', 'Calimero', 'Gli Antenati', 'Braccio di Ferro', 'Ben 10',
  'Detective Conan', 'Hello Kitty', 'Kiss Me Licia', 'Hamtaro', 'Yu-Gi-Oh!', 'Digimon',
  'Totally Spies', 'Rugrats',
].map(card('Cartone animato'));

const luoghi = [
  'Colosseo', 'Torre di Pisa', 'Torre Eiffel', 'Statua della Libertà', 'Big Ben', 'Piramidi',
  'Muraglia cinese', 'Machu Picchu', 'Stonehenge', 'Sagrada Família', 'Taj Mahal', 'Venezia',
  'Pompei', 'Everest', 'Polo Nord', 'Hollywood', 'Las Vegas', 'Disneyland', 'Cappella Sistina',
  'Vesuvio', 'Sahara', 'Niagara', 'Atlantide',
  'Duomo di Milano', 'Fontana di Trevi', 'Ponte di Rialto', 'Arena di Verona', 'Cinque Terre',
  'Costiera Amalfitana', 'Dolomiti', 'Monte Bianco', 'Capri', 'Etna', 'Grand Canyon',
  'Times Square', 'Golden Gate', 'Cristo Redentore', 'Opera House di Sydney', 'Acropoli', 'Petra',
  'Angkor Wat', 'Monte Fuji', 'Cremlino', 'Buckingham Palace', 'Louvre', 'Versailles', 'Alhambra',
  'Burj Khalifa', 'Isola di Pasqua', 'Grande barriera corallina', 'Amazzonia', 'Antartide',
  'Mar Morto', 'Santorini', 'Chichén Itzá', 'Area 51', 'Transilvania', 'Loch Ness',
  'Triangolo delle Bermuda', 'Hogwarts', 'Narnia',
].map(card('Luogo famoso'));

export const INDIZIO_CARDS: IndizioCard[] = [...personaggi, ...animali, ...film, ...serie, ...cartoni, ...luoghi];
