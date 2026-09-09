/** Parole segrete per L'Impostore e coppie di domande per L'Impostore coi Numeri. */

export const PAROLE_SEGRETE: string[] = [
  'Spiaggia', 'Aeroporto', 'Palestra', 'Supermercato', 'Ospedale', 'Biblioteca',
  'Matrimonio', 'Pizzeria', 'Discoteca', 'Ascensore', 'Metropolitana', 'Campeggio',
  'Dentista', 'Parrucchiere', 'Stadio', 'Cinema', 'Montagna', 'Traghetto',
  'Cucina', 'Ufficio', 'Esame', 'Concerto', 'Zoo', 'Museo',
  'Autolavaggio', 'Banca', 'Farmacia', 'Mercato', 'Piscina', 'Aula magna',
  'Capodanno', 'Trasloco', 'Barbiere', 'Sala d attesa', 'Luna park', 'Funerale',
  'Gita scolastica', 'Vigili del fuoco', 'Colloquio di lavoro', 'Pronto soccorso',
  'Autogrill', 'Cantiere', 'Circo', 'Crociera', 'Sauna', 'Tribunale',
  'Lavanderia a gettoni', 'Sala giochi', 'Rifugio alpino', 'Serra',
  'Officina', 'Panetteria', 'Macelleria', 'Pescheria', 'Fioraio', 'Tabaccheria',
  'Caserma', 'Osservatorio astronomico', 'Acquario', 'Planetario',
  'Campo da tennis', 'Pista di pattinaggio', 'Bowling', 'Sala prove',
  'Studio televisivo', 'Redazione di giornale', 'Aula di tribunale', 'Obitorio',
  'Miniera', 'Faro', 'Mulino', 'Vigneto', 'Malga', 'Alveare',
  'Stazione ferroviaria', 'Casello autostradale', 'Traghetto notturno',
  'Ostello', 'Villaggio turistico', 'Terme', 'Centro commerciale',
  'Parco giochi', 'Asilo nido', 'Casa di riposo', 'Canile',
  'Sala operatoria', 'Ambulatorio veterinario', 'Studio di tatuaggi',
  'Palestra di arrampicata', 'Campo di calcetto', 'Spogliatoio',
  'Cabina dell ascensore', 'Sottotetto', 'Cantina', 'Garage',
  'Terrazza condominiale', 'Pianerottolo', 'Portineria', 'Balcone',
  'Roulotte', 'Tenda da campeggio', 'Rifugio antiatomico', 'Bunker',
];

export interface DomandaNumerica {
  /** vista da tutti tranne l'impostore */
  vera: string;
  /** vista solo dall'impostore: diversa, ma con risposte dello stesso ordine di grandezza */
  falsa: string;
}

export const DOMANDE_NUMERICHE: DomandaNumerica[] = [
  { vera: 'Quante volte al mese ordini cibo d asporto?', falsa: 'Quante volte a settimana vai in palestra?' },
  { vera: 'Quante ore al giorno passi sul telefono?', falsa: 'Quante ore dormi in media a notte?' },
  { vera: 'Quanti caffe bevi in un giorno?', falsa: 'Quanti bicchieri d acqua bevi in un giorno?' },
  { vera: 'Quante paia di scarpe possiedi?', falsa: 'Quanti libri hai letto quest anno?' },
  { vera: 'Quante volte a settimana cucini davvero?', falsa: 'Quante volte a settimana fai la spesa?' },
  { vera: 'A che eta hai preso la patente?', falsa: 'A che eta ti sei trasferito per la prima volta?' },
  { vera: 'Quanti minuti impieghi per uscire di casa la mattina?', falsa: 'Quanti minuti dura il tuo tragitto per il lavoro?' },
  { vera: 'Quante serie TV hai iniziato e mai finito?', falsa: 'Quanti hobby hai abbandonato nella vita?' },
  { vera: 'Quante volte hai cambiato numero di telefono?', falsa: 'Quante volte hai cambiato casa?' },
  { vera: 'Quanti messaggi non letti hai adesso?', falsa: 'Quante foto scatti in una settimana?' },
  { vera: 'Quante volte al mese esci la sera?', falsa: 'Quante volte al mese vedi i tuoi parenti?' },
  { vera: 'Quanti anni avevi al tuo primo bacio?', falsa: 'Quanti anni avevi quando hai imparato a nuotare?' },
  { vera: 'Quante lingue sapresti ordinare da mangiare?', falsa: 'Quanti strumenti musicali sai suonare almeno un po?' },
  { vera: 'Quante volte controlli il telefono di notte?', falsa: 'Quante volte suoni la sveglia prima di alzarti?' },
  { vera: 'Quanti paesi stranieri hai visitato?', falsa: 'Quante regioni italiane hai visitato?' },
  { vera: 'Quante volte al mese mangi fuori a cena?', falsa: 'Quante volte al mese prendi un taxi?' },
  { vera: 'Quanti amici inviteresti al tuo compleanno?', falsa: 'Quanti contatti hai salvati con un soprannome?' },
  { vera: 'Quante ore a settimana guardi serie TV?', falsa: 'Quante ore a settimana ascolti musica?' },
  { vera: 'Quanti euro spendi in un mese per il caffe?', falsa: 'Quanti euro spendi in un mese per i trasporti?' },
  { vera: 'Quante volte hai perso il treno o l aereo?', falsa: 'Quante volte hai dimenticato le chiavi dentro casa?' },
  { vera: 'Quante piante hai in casa?', falsa: 'Quanti quadri o poster hai appesi?' },
  { vera: 'Quanti minuti stai sotto la doccia?', falsa: 'Quanti minuti dedichi alla colazione?' },
  { vera: 'Quante volte al mese fai il bucato?', falsa: 'Quante volte al mese pulisci a fondo casa?' },
  { vera: 'Quanti anni avevi quando hai avuto il primo telefono?', falsa: 'Quanti anni avevi alla tua prima vacanza da solo?' },
  { vera: 'Quante password diverse usi davvero?', falsa: 'Quanti abbonamenti stai pagando ora?' },
  { vera: 'Quante volte a settimana metti la sveglia presto?', falsa: 'Quante volte a settimana vai a letto dopo mezzanotte?' },
  { vera: 'Quanti chilometri percorri a piedi in un giorno?', falsa: 'Quanti piani di scale fai in un giorno?' },
  { vera: 'Quante persone conosci che portano il tuo stesso nome?', falsa: 'Quanti cugini hai?' },
  { vera: 'Quante volte hai cambiato taglio di capelli quest anno?', falsa: 'Quante volte sei stato dal dentista quest anno?' },
  { vera: 'Quanti gelati mangi in un mese d estate?', falsa: 'Quante birre bevi in un mese?' },
  { vera: 'Quanti giorni di ferie ti restano?', falsa: 'Quanti giorni sei stato malato quest anno?' },
  { vera: 'Quante app hai sulla schermata principale?', falsa: 'Quante schede tieni aperte nel browser?' },
  { vera: 'Quante volte rimandi la sveglia la mattina?', falsa: 'Quante tazze di te bevi in una settimana?' },
  { vera: 'Quanti anni ha il tuo telefono?', falsa: 'Quanti anni ha il tuo paio di scarpe piu vecchio?' },
  { vera: 'Quante volte al mese guardi una partita?', falsa: 'Quante volte al mese vai al supermercato grande?' },
  { vera: 'Quanti pasti a settimana mangi da solo?', falsa: 'Quante sere a settimana ceni davanti a uno schermo?' },
  { vera: 'Quanti chilometri dista casa tua dal mare?', falsa: 'Quanti minuti dista casa tua dal centro?' },
  { vera: 'Quante volte hai traslocato in vita tua?', falsa: 'Quanti lavori diversi hai fatto?' },
  { vera: 'Quanti biglietti di concerti hai conservato?', falsa: 'Quante magliette hai che non metti piu?' },
  { vera: 'Quante volte a settimana mangi pasta?', falsa: 'Quante volte a settimana mangi verdura?' },
  { vera: 'Quanti minuti aspetti prima di rispondere a un messaggio?', falsa: 'Quanti minuti arrivi in anticipo a un appuntamento?' },
  { vera: 'Quante persone hai nel gruppo di famiglia su WhatsApp?', falsa: 'Quanti follower nuovi hai preso questo mese?' },
  { vera: 'Quanti film hai visto al cinema quest anno?', falsa: 'Quanti libri hai comprato e non ancora aperto?' },
  { vera: 'Quante volte hai dimenticato un compleanno importante?', falsa: 'Quante volte hai perso un ombrello?' },
  { vera: 'Quante ore dura il tuo viaggio piu lungo in auto?', falsa: 'Quante ore dura il tuo volo piu lungo?' },
];

export function randomParola(rng: () => number = Math.random): string {
  return PAROLE_SEGRETE[Math.floor(rng() * PAROLE_SEGRETE.length)];
}
export function randomDomanda(rng: () => number = Math.random): DomandaNumerica {
  return DOMANDE_NUMERICHE[Math.floor(rng() * DOMANDE_NUMERICHE.length)];
}
