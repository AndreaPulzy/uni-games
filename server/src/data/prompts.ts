/** Prompt comici per La Risposta Bastarda e template per la Fabbrica di Meme. */

export const PROMPT_BASTARDI: string[] = [
  'La peggiore frase da sussurrare al controllore sul treno',
  'Un titolo alternativo per il telegiornale delle 20',
  'Il modo peggiore per iniziare un discorso di matrimonio',
  'Cosa NON dire durante un colloquio di lavoro',
  'Il nome peggiore per una nuova app di incontri',
  'Una scusa credibile per non essere andato al compleanno',
  'Lo slogan peggiore per una compagnia aerea',
  'Cosa scrivere su un biglietto di condoglianze per sbaglio',
  'Il gusto di gelato che non venderesti mai',
  'Una frase che rovina istantaneamente una prima cena',
  'Il consiglio peggiore da dare a un neopatentato',
  'Come si chiamerebbe il tuo reality show',
  'La materia peggiore da insegnare alle elementari',
  'Cosa trovi nel frigo di un supercattivo',
  'Il peggior nome per un ristorante di pesce',
  'Una regola assurda da introdurre nel calcio',
  'La peggiore risposta a "ti amo"',
  'Cosa direbbe il tuo cane se potesse parlare per un minuto',
  'Il peggior superpotere possibile',
  'Un motto che non metteresti mai sulla tua tomba',
  'Come convincere qualcuno a traslocare gratis',
  'La peggiore idea per un primo appuntamento',
  'Cosa NON fare durante un volo intercontinentale',
  'Il peggior nome per un profumo di lusso',
  'Il titolo del film sulla tua vita',
  'Una nuova festa nazionale che proporresti',
  'Il peggior regalo di Natale mai concepito',
  'Cosa scrivi nella recensione a una stella di un ristorante stellato',
  'Il peggior nome per una band heavy metal',
  'Una materia inutile che meriterebbe la maturita',
  'Cosa dice il tuo vicino di casa attraverso il muro',
  'Il peggior modo per svegliare qualcuno',
  'La frase più inquietante da leggere in ascensore',
  'Il peggior nome per un cavallo da corsa',
  'Una nuova voce da aggiungere al menu di McDonald s',
  'Cosa non vorresti sentire dal tuo dentista',
  'Il peggior nome per una crociera di lusso',
  'Una scusa per uscire prima da una festa',
  'Cosa trovi nel cassetto più disordinato di casa tua',
  'Il peggior consiglio da dare a un neogenitore',
  'Come si chiama il tuo prossimo profumo dozzinale',
  'La peggiore frase da dire a un arbitro',
  'Il peggior nome per un asilo nido',
  'Cosa scrivi nel bigliettino di un mazzo di fiori di scuse',
  'Una nuova disciplina olimpica assolutamente ridicola',
  'Il peggior modo per chiedere un aumento',
  'Cosa direbbe il tuo frigorifero se potesse giudicarti',
  'Il peggior nome per un supereroe italiano',
  'Una domanda da NON fare a un matrimonio',
  'Il titolo del manuale che nessuno leggera mai',
  'Il peggior nome per un canale YouTube di cucina',
  'Cosa dici quando ti scoprono a rubare il wifi',
  'Il peggior travestimento per Halloween',
  'Una nuova voce da inserire nel CV per fare colpo',
  'Il peggior nome per un profilo social professionale',
  'Cosa non dire mai a chi ha appena tagliato i capelli',
  'La peggiore frase di apertura per un messaggio',
  'Il peggior nome per una gelateria artigianale',
  'Una nuova regola per la fila alle poste',
  'Cosa direbbe il tuo router se potesse lamentarsi',
  'Il peggior nome per un negozio di animali',
  'Una scusa assurda per un ritardo di due ore',
  'Il peggior modo di finire una email di lavoro',
  'Cosa trovi nella borsa di un turista sfortunato',
  'Il peggior nome per un vino pregiato',
  'Una nuova materia da aggiungere alla patente',
  'Cosa direbbe il tuo divano dopo dieci anni con te',
  'Il peggior nome per una palestra',
  'La frase peggiore da dire durante un funerale',
  'Un nuovo emoji che manca disperatamente',
  'Il peggior nome per un cocktail estivo',
  'Cosa scrivi sul cartello del tuo posto auto',
  'Il peggior modo per presentarsi ai suoceri',
  'Una nuova voce nel regolamento condominiale',
  'Il peggior nome per un albergo a cinque stelle',
  'Cosa non vorresti trovare scritto sul tuo scontrino',
  'Il peggior nome per una compagnia di assicurazioni',
  'Una nuova tradizione da inventare per il Ferragosto',
  'Cosa dice il navigatore quando ha perso la pazienza',
  'Il peggior nome per un corso di sopravvivenza',
];

export interface MemeTemplate {
  id: string;
  /** descrizione della scena mostrata sulla TV */
  scena: string;
  /** emoji che fanno da illustrazione finche non ci sono immagini vere */
  art: string;
  topLabel: string;
  bottomLabel: string;
}

export const MEME_TEMPLATES: MemeTemplate[] = [
  { id: 'cane-fuoco', scena: 'Un cane seduto in una stanza in fiamme, sereno', art: '🐕🔥', topLabel: 'Cosa pensa il cane', bottomLabel: 'Cosa dice il cane' },
  { id: 'due-bottoni', scena: 'Un uomo che suda davanti a due bottoni identici', art: '😰🔴🔵', topLabel: 'Bottone 1', bottomLabel: 'Bottone 2' },
  { id: 'fidanzato-distratto', scena: "Un ragazzo si volta a guardare un'altra persona mentre la fidanzata lo fulmina", art: '👦👀👧', topLabel: 'Lui', bottomLabel: 'Lei' },
  { id: 'gatto-tavola', scena: 'Un gatto bianco furioso seduto a tavola davanti a un piatto di insalata', art: '😾🥗', topLabel: 'Chi accusa', bottomLabel: 'Cosa risponde il gatto' },
  { id: 'scheletro-panchina', scena: 'Uno scheletro seduto su una panchina che aspetta da anni', art: '💀🪑', topLabel: 'Sto aspettando', bottomLabel: 'Da quanto' },
  { id: 'nave-iceberg', scena: 'Una nave enorme che punta dritta verso un iceberg', art: '🚢🧊', topLabel: 'La nave', bottomLabel: "L'iceberg" },
  { id: 'bimbo-pugno', scena: 'Un bambino in spiaggia che stringe il pugno con aria trionfante', art: '👶✊', topLabel: 'Quando finalmente', bottomLabel: 'Risultato' },
  { id: 'tizio-ombrello', scena: "Una persona con l'ombrello sotto un cielo perfettamente sereno", art: '🌞☂️', topLabel: 'Gli altri', bottomLabel: 'Io' },
  { id: 'cervello-galattico', scena: 'Un cervello che si illumina sempre di più a ogni livello di genialata', art: '🧠✨', topLabel: 'Idea normale', bottomLabel: 'Idea da cervello galattico' },
  { id: 'porta-chiusa', scena: 'Qualcuno che spinge una porta con scritto "tirare"', art: '🚪🤦', topLabel: 'La porta', bottomLabel: 'Io' },
  { id: 'tre-spiderman', scena: 'Tre persone identiche che si puntano a vicenda accusandosi', art: '🕷️👉👉', topLabel: 'Chi accusa chi', bottomLabel: 'Di cosa' },
  { id: 'casa-crollata', scena: 'Una casa perfettamente in ordine con una sola stanza distrutta', art: '🏠💥', topLabel: 'La casa', bottomLabel: 'Quella stanza' },
  { id: 'nonno-simpson', scena: 'Un vecchio che entra in un locale, si guarda intorno e se ne va subito', art: '👴🚶', topLabel: 'Entra', bottomLabel: 'Esce perché' },
  { id: 'cavallo-disegnato', scena: 'Un disegno di cavallo perfetto davanti e disastroso dietro', art: '🐴✏️', topLabel: "L'inizio del progetto", bottomLabel: 'La consegna' },
  { id: 'gatto-tastiera', scena: 'Un gatto seduto sulla tastiera mentre qualcuno prova a lavorare', art: '🐈‍⬛⌨️', topLabel: 'Io che lavoro', bottomLabel: 'Il gatto' },
  { id: 'pompiere-benzina', scena: 'Un pompiere che spegne un incendio versandoci sopra della benzina', art: '👨‍🚒⛽', topLabel: 'Il problema', bottomLabel: 'La mia soluzione' },
  { id: 'due-strade', scena: "Un'auto che sterza all'ultimo verso l'uscita sbagliata", art: '🚗🛣️', topLabel: 'La scelta giusta', bottomLabel: 'Dove vado io' },
  { id: 'sudore-freddo', scena: 'Una persona che sorride mentre tutto intorno va a fuoco', art: '🙂🔥', topLabel: 'La situazione', bottomLabel: 'Io' },
  { id: 'trofeo-partecipazione', scena: 'Una premiazione dove il terzo classificato sembra il più felice', art: '🥉🎉', topLabel: 'Il vincitore', bottomLabel: 'Il terzo' },
  { id: 'ombra-lunga', scena: "Una persona minuscola con un'ombra gigantesca e minacciosa", art: '🧍👤', topLabel: 'Come mi vedono', bottomLabel: 'Come mi vedo io' },
];

export function randomPrompts(n: number, rng: () => number = Math.random): string[] {
  const pool = [...PROMPT_BASTARDI];
  const out: string[] = [];
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}
export function randomMeme(rng: () => number = Math.random): MemeTemplate {
  return MEME_TEMPLATES[Math.floor(rng() * MEME_TEMPLATES.length)];
}
