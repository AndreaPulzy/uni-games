/** Confronto tollerante delle risposte scritte (emoji e disegni). */

import { levenshtein, maskTitle, matches, simplify } from '../server/src/games/fuzzy.ts';

let failures = 0;
const check = (label: string, ok: boolean, extra = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
};

/* accettate */
check('titolo identico', matches('Il re leone', ['Il re leone']));
check('senza articolo', matches('re leone', ['Il re leone']));
check('maiuscole e minuscole', matches('IL RE LEONE', ['Il re leone']));
check('un errore di battitura', matches('re leon', ['Il re leone']));
check('due errori su un titolo lungo', matches('casa di cartta', ['La casa di carta']) && matches('stranger tings', ['Stranger Things']));
check('senza accenti', matches('mercoledi', ['Mercoledì']));
check('punteggiatura ignorata', matches("mamma ho perso l'aereo", ["Mamma, ho perso l'aereo"]));
check('trattini e spazi', matches('spiderman', ['Spider-Man']) && matches('spider man', ['Spider-Man']));
check('titolo alternativo', matches('money heist', ['La casa di carta', 'Money Heist']));
check('sigle', matches('et', ['E.T.']));
check('articolo inglese', matches('office', ['The Office']));
check('sinonimo di un disegno', matches('cocomero', ['Anguria', 'cocomero']));

/* rifiutate */
check('parola corta: nessun errore concesso', !matches('cane', ['Coco']) && !matches('upp', ['Up']));
check('solo una parte del titolo', !matches('casa', ['La casa di carta']));
check('titolo diverso ma simile', !matches('batman', ['Superman']));
check('risposta vuota o di una lettera', !matches('', ['Up']) && !matches('a', ['A']));
check('troppi errori', !matches('re lione ee', ['Il re leone']));

/* strumenti */
check('semplificazione', simplify('  The   Office! ') === 'office', simplify('  The   Office! '));
check('distanza di modifica', levenshtein('gatto', 'gatti') === 1 && levenshtein('abc', 'abc') === 0);
check('uscita anticipata oltre il massimo', levenshtein('abcdefgh', 'zzzzzzzz', 2) === 3);
check('suggerimento con le iniziali', maskTitle('Il re leone') === 'I_ r_ l____', maskTitle('Il re leone'));
check('suggerimento con accenti e apostrofi', maskTitle("L'amica geniale") === "L'a____ g______", maskTitle("L'amica geniale"));

console.log(failures === 0 ? '\n  CONFRONTO OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
