/** Domande del Quiz lampo. La risposta giusta sta sempre in `giusta`:
 *  l'ordine delle quattro opzioni viene mescolato a ogni partita. */

export interface QuizQuestion {
  categoria: 'Geografia' | 'Storia' | 'Scienza' | 'Cinema e TV' | 'Musica' | 'Sport' | 'Cucina' | 'Lingua e libri' | 'Arte' | 'Varie';
  domanda: string;
  giusta: string;
  sbagliate: [string, string, string];
}

export const QUIZ: QuizQuestion[] = [
  /* ------------------------------ geografia ------------------------------ */
  { categoria: 'Geografia', domanda: "Qual è la capitale dell'Australia?", giusta: 'Canberra', sbagliate: ['Sydney', 'Melbourne', 'Perth'] },
  { categoria: 'Geografia', domanda: "Qual è il fiume più lungo d'Italia?", giusta: 'Po', sbagliate: ['Tevere', 'Adige', 'Arno'] },
  { categoria: 'Geografia', domanda: 'In quale regione si trova Matera?', giusta: 'Basilicata', sbagliate: ['Puglia', 'Calabria', 'Campania'] },
  { categoria: 'Geografia', domanda: 'Qual è la montagna più alta delle Alpi?', giusta: 'Monte Bianco', sbagliate: ['Monte Rosa', 'Cervino', 'Gran Paradiso'] },
  { categoria: 'Geografia', domanda: 'Qual è la capitale del Canada?', giusta: 'Ottawa', sbagliate: ['Toronto', 'Vancouver', 'Montréal'] },
  { categoria: 'Geografia', domanda: "Qual è il lago più grande d'Italia?", giusta: 'Lago di Garda', sbagliate: ['Lago Maggiore', 'Lago di Como', 'Lago Trasimeno'] },
  { categoria: 'Geografia', domanda: 'In quale città si trova la Mole Antonelliana?', giusta: 'Torino', sbagliate: ['Milano', 'Genova', 'Bologna'] },
  { categoria: 'Geografia', domanda: "Qual è lo stato più grande dell'Africa per superficie?", giusta: 'Algeria', sbagliate: ['Egitto', 'Sudan', 'Nigeria'] },
  { categoria: 'Geografia', domanda: 'Qual è la capitale del Portogallo?', giusta: 'Lisbona', sbagliate: ['Porto', 'Coimbra', 'Faro'] },
  { categoria: 'Geografia', domanda: 'Quale oceano bagna le coste del Brasile?', giusta: 'Atlantico', sbagliate: ['Pacifico', 'Indiano', 'Artico'] },
  { categoria: 'Geografia', domanda: 'Qual è il capoluogo della Sardegna?', giusta: 'Cagliari', sbagliate: ['Sassari', 'Olbia', 'Nuoro'] },
  { categoria: 'Geografia', domanda: 'Come si chiama lo stretto tra Sicilia e Calabria?', giusta: 'Stretto di Messina', sbagliate: ['Stretto di Gibilterra', 'Bocche di Bonifacio', "Canale d'Otranto"] },
  { categoria: 'Geografia', domanda: "Qual è il paese più popoloso dell'Unione Europea?", giusta: 'Germania', sbagliate: ['Francia', 'Italia', 'Spagna'] },
  { categoria: 'Geografia', domanda: 'Qual è la capitale della Norvegia?', giusta: 'Oslo', sbagliate: ['Stoccolma', 'Helsinki', 'Copenaghen'] },
  { categoria: 'Geografia', domanda: 'In quale regione si trova il Lago Trasimeno?', giusta: 'Umbria', sbagliate: ['Toscana', 'Lazio', 'Marche'] },

  /* -------------------------------- storia -------------------------------- */
  { categoria: 'Storia', domanda: 'In che anno è caduto il Muro di Berlino?', giusta: '1989', sbagliate: ['1991', '1985', '1979'] },
  { categoria: 'Storia', domanda: "Chi guidò la spedizione che raggiunse l'America nel 1492?", giusta: 'Cristoforo Colombo', sbagliate: ['Amerigo Vespucci', 'Ferdinando Magellano', 'Marco Polo'] },
  { categoria: 'Storia', domanda: 'In che anno gli italiani scelsero la Repubblica con un referendum?', giusta: '1946', sbagliate: ['1945', '1948', '1861'] },
  { categoria: 'Storia', domanda: 'Chi fu il primo presidente degli Stati Uniti?', giusta: 'George Washington', sbagliate: ['Abraham Lincoln', 'Thomas Jefferson', 'John Adams'] },
  { categoria: 'Storia', domanda: "In che anno fu proclamato il Regno d'Italia?", giusta: '1861', sbagliate: ['1870', '1848', '1915'] },
  { categoria: 'Storia', domanda: "In che anno l'uomo mise piede per la prima volta sulla Luna?", giusta: '1969', sbagliate: ['1967', '1971', '1965'] },
  { categoria: 'Storia', domanda: 'Chi fu il primo imperatore romano?', giusta: 'Augusto', sbagliate: ['Giulio Cesare', 'Nerone', 'Traiano'] },
  { categoria: 'Storia', domanda: 'In che anno iniziò la Prima guerra mondiale?', giusta: '1914', sbagliate: ['1915', '1912', '1918'] },
  { categoria: 'Storia', domanda: "Quale città fu distrutta dall'eruzione del Vesuvio nel 79 d.C.?", giusta: 'Pompei', sbagliate: ['Paestum', 'Ostia', 'Cuma'] },
  { categoria: 'Storia', domanda: 'Chi guidò la Spedizione dei Mille?', giusta: 'Giuseppe Garibaldi', sbagliate: ['Camillo Benso di Cavour', 'Giuseppe Mazzini', 'Vittorio Emanuele II'] },
  { categoria: 'Storia', domanda: 'In che anno è terminata la Seconda guerra mondiale?', giusta: '1945', sbagliate: ['1944', '1946', '1943'] },

  /* -------------------------------- scienza -------------------------------- */
  { categoria: 'Scienza', domanda: "Qual è il simbolo chimico dell'oro?", giusta: 'Au', sbagliate: ['Ag', 'Or', 'Go'] },
  { categoria: 'Scienza', domanda: 'Qual è il pianeta più vicino al Sole?', giusta: 'Mercurio', sbagliate: ['Venere', 'Marte', 'Terra'] },
  { categoria: 'Scienza', domanda: 'Quante ossa ha il corpo umano adulto?', giusta: '206', sbagliate: ['186', '212', '230'] },
  { categoria: 'Scienza', domanda: "Qual è il gas più abbondante nell'aria che respiriamo?", giusta: 'Azoto', sbagliate: ['Ossigeno', 'Anidride carbonica', 'Argon'] },
  { categoria: 'Scienza', domanda: 'Chi ha formulato la teoria della relatività?', giusta: 'Albert Einstein', sbagliate: ['Isaac Newton', 'Galileo Galilei', 'Niels Bohr'] },
  { categoria: 'Scienza', domanda: "Quale organo produce l'insulina?", giusta: 'Pancreas', sbagliate: ['Fegato', 'Reni', 'Milza'] },
  { categoria: 'Scienza', domanda: 'Quanto vale circa la velocità della luce?', giusta: '300.000 km al secondo', sbagliate: ['30.000 km al secondo', '3 milioni di km al secondo', '150.000 km al secondo'] },
  { categoria: 'Scienza', domanda: 'Qual è il simbolo chimico del ferro?', giusta: 'Fe', sbagliate: ['Fr', 'Ir', 'F'] },
  { categoria: 'Scienza', domanda: 'Quanti cromosomi ha una normale cellula umana?', giusta: '46', sbagliate: ['23', '44', '48'] },
  { categoria: 'Scienza', domanda: "Qual è l'organo più esteso del corpo umano?", giusta: 'La pelle', sbagliate: ['Il fegato', 'I polmoni', "L'intestino"] },
  { categoria: 'Scienza', domanda: 'Qual è il pianeta più grande del sistema solare?', giusta: 'Giove', sbagliate: ['Saturno', 'Nettuno', 'Urano'] },
  { categoria: 'Scienza', domanda: "Qual è la formula chimica dell'acqua?", giusta: 'H₂O', sbagliate: ['CO₂', 'O₂', 'H₂O₂'] },
  { categoria: 'Scienza', domanda: 'Quante zampe ha un ragno?', giusta: '8', sbagliate: ['6', '10', '12'] },
  { categoria: 'Scienza', domanda: 'Qual è il mammifero più grande del mondo?', giusta: 'Balenottera azzurra', sbagliate: ['Elefante africano', 'Capodoglio', 'Orca'] },

  /* ------------------------------ cinema e tv ------------------------------ */
  { categoria: 'Cinema e TV', domanda: 'Chi ha diretto "La vita è bella"?', giusta: 'Roberto Benigni', sbagliate: ['Giuseppe Tornatore', 'Federico Fellini', 'Paolo Sorrentino'] },
  { categoria: 'Cinema e TV', domanda: "Con quale film Leonardo DiCaprio ha vinto l'Oscar come miglior attore?", giusta: 'Revenant', sbagliate: ['Titanic', 'Inception', 'The Wolf of Wall Street'] },
  { categoria: 'Cinema e TV', domanda: 'Come si chiama il leoncino protagonista del "Re Leone"?', giusta: 'Simba', sbagliate: ['Mufasa', 'Nala', 'Kovu'] },
  { categoria: 'Cinema e TV', domanda: 'Chi interpreta Jack Sparrow in "Pirati dei Caraibi"?', giusta: 'Johnny Depp', sbagliate: ['Orlando Bloom', 'Brad Pitt', 'Tom Hanks'] },
  { categoria: 'Cinema e TV', domanda: 'Come si chiama la scuola di magia di Harry Potter?', giusta: 'Hogwarts', sbagliate: ['Durmstrang', 'Beauxbatons', 'Grifondoro'] },
  { categoria: 'Cinema e TV', domanda: 'Chi ha diretto "Pulp Fiction"?', giusta: 'Quentin Tarantino', sbagliate: ['Martin Scorsese', 'Steven Spielberg', 'Francis Ford Coppola'] },
  { categoria: 'Cinema e TV', domanda: 'In quale serie TV si trova la cittadina di Hawkins?', giusta: 'Stranger Things', sbagliate: ['Dark', 'Twin Peaks', 'The Walking Dead'] },
  { categoria: 'Cinema e TV', domanda: 'Come chiamano il capo della banda nella "Casa di carta"?', giusta: 'Il Professore', sbagliate: ['Berlino', 'Tokyo', 'Nairobi'] },
  { categoria: 'Cinema e TV', domanda: 'In quale città è ambientato "La grande bellezza"?', giusta: 'Roma', sbagliate: ['Napoli', 'Milano', 'Venezia'] },
  { categoria: 'Cinema e TV', domanda: 'Chi ha composto le musiche di "C\'era una volta il West"?', giusta: 'Ennio Morricone', sbagliate: ['Nino Rota', 'Nicola Piovani', 'Ludovico Einaudi'] },
  { categoria: 'Cinema e TV', domanda: 'Come si chiama il pupazzo di neve di "Frozen"?', giusta: 'Olaf', sbagliate: ['Sven', 'Kristoff', 'Hans'] },
  { categoria: 'Cinema e TV', domanda: 'In quale città vive la famiglia dei Simpson?', giusta: 'Springfield', sbagliate: ['Quahog', 'South Park', 'Hawkins'] },

  /* -------------------------------- musica -------------------------------- */
  { categoria: 'Musica', domanda: 'Quale band cantava "Bohemian Rhapsody"?', giusta: 'Queen', sbagliate: ['The Beatles', 'The Rolling Stones', 'Pink Floyd'] },
  { categoria: 'Musica', domanda: 'In quale città si svolge il Festival della canzone italiana?', giusta: 'Sanremo', sbagliate: ['Venezia', 'Napoli', 'Milano'] },
  { categoria: 'Musica', domanda: 'Chi ha composto "Le quattro stagioni"?', giusta: 'Antonio Vivaldi', sbagliate: ['Wolfgang Amadeus Mozart', 'Giuseppe Verdi', 'Gioachino Rossini'] },
  { categoria: 'Musica', domanda: 'Quante corde ha una chitarra classica?', giusta: '6', sbagliate: ['4', '7', '12'] },
  { categoria: 'Musica', domanda: "Quale gruppo italiano ha vinto l'Eurovision nel 2021?", giusta: 'Måneskin', sbagliate: ['Il Volo', 'Negramaro', 'Pinguini Tattici Nucleari'] },
  { categoria: 'Musica', domanda: 'Di quale opera fa parte l\'aria "Nessun dorma"?', giusta: 'Turandot', sbagliate: ['La traviata', 'Tosca', 'Rigoletto'] },
  { categoria: 'Musica', domanda: 'Quale compositore scrisse "Il barbiere di Siviglia"?', giusta: 'Gioachino Rossini', sbagliate: ['Giuseppe Verdi', 'Giacomo Puccini', 'Gaetano Donizetti'] },

  /* --------------------------------- sport --------------------------------- */
  { categoria: 'Sport', domanda: 'Quanti giocatori per squadra sono in campo in una partita di calcio?', giusta: '11', sbagliate: ['10', '9', '12'] },
  { categoria: 'Sport', domanda: 'Ogni quanti anni si svolgono le Olimpiadi estive?', giusta: '4', sbagliate: ['2', '3', '5'] },
  { categoria: 'Sport', domanda: 'Con quale città Cortina ospita le Olimpiadi invernali del 2026?', giusta: 'Milano', sbagliate: ['Torino', 'Bormio', 'Trento'] },
  { categoria: 'Sport', domanda: "Di che colore è la maglia del primo in classifica al Giro d'Italia?", giusta: 'Rosa', sbagliate: ['Gialla', 'Verde', 'Azzurra'] },
  { categoria: 'Sport', domanda: 'In quale sport si disputa la Ryder Cup?', giusta: 'Golf', sbagliate: ['Tennis', 'Vela', 'Polo'] },
  { categoria: 'Sport', domanda: 'Quanti set deve vincere un uomo per aggiudicarsi una partita di un torneo del Grande Slam?', giusta: '3', sbagliate: ['2', '4', '5'] },
  { categoria: 'Sport', domanda: 'Quanti giocatori per squadra sono in campo nella pallavolo?', giusta: '6', sbagliate: ['5', '7', '8'] },

  /* --------------------------------- cucina --------------------------------- */
  { categoria: 'Cucina', domanda: 'Qual è la verdura principale del pesto alla genovese?', giusta: 'Basilico', sbagliate: ['Prezzemolo', 'Rucola', 'Menta'] },
  { categoria: 'Cucina', domanda: 'Il Parmigiano Reggiano prende il nome da Parma e da quale altra città?', giusta: 'Reggio Emilia', sbagliate: ['Modena', 'Piacenza', 'Mantova'] },
  { categoria: 'Cucina', domanda: 'In quale città è nata, secondo la tradizione, la pizza Margherita?', giusta: 'Napoli', sbagliate: ['Roma', 'Palermo', 'Salerno'] },
  { categoria: 'Cucina', domanda: 'Qual è l\'ingrediente principale del "guacamole"?', giusta: 'Avocado', sbagliate: ['Pomodoro', 'Peperone', 'Cetriolo'] },
  { categoria: 'Cucina', domanda: 'Con quale formaggio si prepara tradizionalmente la cacio e pepe?', giusta: 'Pecorino romano', sbagliate: ['Parmigiano', 'Grana Padano', 'Provolone'] },
  { categoria: 'Cucina', domanda: 'Di quale regione è tipico il canederlo?', giusta: 'Trentino-Alto Adige', sbagliate: ['Liguria', 'Sicilia', 'Marche'] },

  /* ----------------------------- lingua e libri ----------------------------- */
  { categoria: 'Lingua e libri', domanda: 'Qual è il plurale di "uovo"?', giusta: 'Uova', sbagliate: ['Uovi', 'Ovi', 'Uove'] },
  { categoria: 'Lingua e libri', domanda: 'Quante lettere ha l\'alfabeto italiano?', giusta: '21', sbagliate: ['26', '22', '24'] },
  { categoria: 'Lingua e libri', domanda: 'Chi ha scritto la "Divina Commedia"?', giusta: 'Dante Alighieri', sbagliate: ['Francesco Petrarca', 'Giovanni Boccaccio', 'Alessandro Manzoni'] },
  { categoria: 'Lingua e libri', domanda: 'Chi ha scritto "I promessi sposi"?', giusta: 'Alessandro Manzoni', sbagliate: ['Giovanni Verga', 'Giacomo Leopardi', 'Ugo Foscolo'] },
  { categoria: 'Lingua e libri', domanda: 'Chi ha scritto "Il nome della rosa"?', giusta: 'Umberto Eco', sbagliate: ['Italo Calvino', 'Dino Buzzati', 'Pier Paolo Pasolini'] },
  { categoria: 'Lingua e libri', domanda: 'Chi ha scritto "Le avventure di Pinocchio"?', giusta: 'Carlo Collodi', sbagliate: ['Gianni Rodari', 'Edmondo De Amicis', 'Emilio Salgari'] },
  { categoria: 'Lingua e libri', domanda: 'Chi ha scritto "Il Piccolo Principe"?', giusta: 'Antoine de Saint-Exupéry', sbagliate: ['Jules Verne', 'Victor Hugo', 'Albert Camus'] },
  { categoria: 'Lingua e libri', domanda: 'Qual è il contrario di "concavo"?', giusta: 'Convesso', sbagliate: ['Cavo', 'Piatto', 'Obliquo'] },

  /* ---------------------------------- arte ---------------------------------- */
  { categoria: 'Arte', domanda: 'Chi ha dipinto la "Gioconda"?', giusta: 'Leonardo da Vinci', sbagliate: ['Michelangelo', 'Raffaello', 'Sandro Botticelli'] },
  { categoria: 'Arte', domanda: 'Chi ha affrescato la volta della Cappella Sistina?', giusta: 'Michelangelo', sbagliate: ['Raffaello', 'Giotto', 'Caravaggio'] },
  { categoria: 'Arte', domanda: 'Chi ha dipinto "La Primavera"?', giusta: 'Sandro Botticelli', sbagliate: ['Raffaello', 'Tiziano', 'Caravaggio'] },
  { categoria: 'Arte', domanda: 'In quale città si trova la Galleria degli Uffizi?', giusta: 'Firenze', sbagliate: ['Roma', 'Milano', 'Venezia'] },
  { categoria: 'Arte', domanda: 'Chi ha dipinto "La notte stellata"?', giusta: 'Vincent van Gogh', sbagliate: ['Claude Monet', 'Pablo Picasso', 'Paul Cézanne'] },

  /* ---------------------------------- varie ---------------------------------- */
  { categoria: 'Varie', domanda: 'Quanti minuti ci sono in un giorno?', giusta: '1440', sbagliate: ['1240', '1640', '1400'] },
  { categoria: 'Varie', domanda: 'Quanti giorni ha un anno bisestile?', giusta: '366', sbagliate: ['365', '364', '367'] },
  { categoria: 'Varie', domanda: 'Qual è la moneta del Regno Unito?', giusta: 'Sterlina', sbagliate: ['Euro', 'Dollaro', 'Franco'] },
  { categoria: 'Varie', domanda: 'Quanto vale il numero romano L?', giusta: '50', sbagliate: ['100', '5', '500'] },
  { categoria: 'Varie', domanda: 'Quanto fa 7 × 8?', giusta: '56', sbagliate: ['54', '58', '48'] },
  { categoria: 'Varie', domanda: 'Qual è la radice quadrata di 144?', giusta: '12', sbagliate: ['14', '11', '16'] },
  { categoria: 'Varie', domanda: 'Di cosa si nutre soprattutto il panda gigante?', giusta: 'Bambù', sbagliate: ['Eucalipto', 'Frutta', 'Pesce'] },
  { categoria: 'Varie', domanda: 'Quanti lati ha un esagono?', giusta: '6', sbagliate: ['5', '7', '8'] },
];
