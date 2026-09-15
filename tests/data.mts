/** Controlli di integrita sui dati dei minigiochi. */

import { CONNECTIONS } from '../server/src/data/connections.ts';
import { TABOO, INTESA, MIMO } from '../server/src/data/squadre.ts';
import { TOP10 } from '../server/src/data/top10.ts';
import { PAROLE_SEGRETE, DOMANDE_NUMERICHE } from '../server/src/data/impostore.ts';
import { PROMPT_BASTARDI, MEME_TEMPLATES } from '../server/src/data/prompts.ts';
import { QUIZ } from '../server/src/data/quiz.ts';
import { EMOJI_PUZZLES } from '../server/src/data/emoji.ts';
import { INDIZIO_CARDS } from '../server/src/data/indizio.ts';
import { PAROLE_DISEGNO } from '../server/src/data/disegni.ts';
import { SOLUTION_LIST } from '../server/src/data/words-it.ts';
import { WORDS_5, ALL_WORDS, isWord5, isWord, hasPrefix } from '../server/src/data/dictionary.ts';

let failures = 0;
const check = (label: string, ok: boolean, extra = '') => {
  if (!ok) { console.log(` FAIL  ${label}${extra ? ' — ' + extra : ''}`); failures++; }
};

/* ------------------------------- Connections ----------------------------- */

for (const p of CONNECTIONS) {
  check(`${p.id}: 4 gruppi`, p.groups.length === 4);
  const words = p.groups.flatMap((g) => g.words);
  check(`${p.id}: 16 parole`, words.length === 16, `${words.length}`);
  const dupes = words.filter((w, i) => words.indexOf(w) !== i);
  check(`${p.id}: nessuna parola ripetuta`, dupes.length === 0, dupes.join(','));
  check(`${p.id}: ogni gruppo ha 4 parole`, p.groups.every((g) => g.words.length === 4));
  check(`${p.id}: nomi di gruppo non vuoti`, p.groups.every((g) => g.name.trim().length > 2));
  const levels = p.groups.map((g) => g.level).sort();
  check(`${p.id}: livelli fra 1 e 4`, levels.every((l) => l >= 1 && l <= 4));
  check(`${p.id}: parole senza spazi`, words.every((w) => !w.includes(' ')), words.filter((w) => w.includes(' ')).join(','));
}
console.log(`  Connections: ${CONNECTIONS.length} griglie verificate`);

/* --------------------------------- Wordle -------------------------------- */

check('tutte le soluzioni sono da 5 lettere', SOLUTION_LIST.every((w) => w.length === 5));
check('tutte le soluzioni sono accettate come tentativo', SOLUTION_LIST.every((w) => isWord5(w)));
check('nessuna soluzione duplicata', new Set(SOLUTION_LIST).size === SOLUTION_LIST.length);
check('solo lettere A-Z senza accenti', SOLUTION_LIST.every((w) => /^[A-Z]{5}$/.test(w)));
console.log(`  Wordle: ${SOLUTION_LIST.length} soluzioni curate, ${WORDS_5.size} parole accettate come tentativo`);

/* -------------------------------- dizionario ------------------------------ */

check('dizionario ordinato', ALL_WORDS.every((w, i) => i === 0 || ALL_WORDS[i - 1] <= w));
check('parole comuni riconosciute',
  ['casa', 'gatto', 'ombrello', 'spiaggia', 'citta', 'perche'].every((w) => isWord(w)),
  ['casa','gatto','ombrello','spiaggia','citta','perche'].filter((w) => !isWord(w)).join(','));
check('parole inventate rifiutate', !isWord('sbrundolo') && !isWord('qwertyx'));
check('prefissi vivi riconosciuti', hasPrefix('spiag') && hasPrefix('tav'));
check('prefissi morti rifiutati', !hasPrefix('zzzq'));
check('tentativi Wordle: parole italiane comuni accettate',
  ['pesca','fiume','gatto','mango','birra','sedia','verde','tempo'].every((w) => isWord5(w)),
  ['pesca','fiume','gatto','mango','birra','sedia','verde','tempo'].filter((w) => !isWord5(w)).join(','));
console.log(`  Dizionario: ${ALL_WORDS.length} parole italiane`);

/* ---------------------------------- Taboo -------------------------------- */

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
for (const c of TABOO) {
  check(`taboo "${c.word}": 5 parole vietate`, c.taboo.length === 5);
  check(`taboo "${c.word}": nessuna vietata ripetuta`, new Set(c.taboo).size === 5);
  check(`taboo "${c.word}": la parola non compare fra le vietate`,
    !c.taboo.some((t) => norm(t) === norm(c.word)));
}
check('nessuna carta Taboo duplicata', new Set(TABOO.map((c) => norm(c.word))).size === TABOO.length);
console.log(`  Taboo: ${TABOO.length} carte`);

/* --------------------------- Intesa Vincente e Mimo ----------------------- */

check('nessuna parola Intesa duplicata', new Set(INTESA.map(norm)).size === INTESA.length);
check('parole Intesa non vuote', INTESA.every((w) => w.trim().length > 2));
console.log(`  Intesa Vincente: ${INTESA.length} parole`);

check('nessuna carta Mimo duplicata', new Set(MIMO.map((m) => norm(m.text))).size === MIMO.length);
check('ogni carta Mimo ha un tipo valido',
  MIMO.every((m) => ['Film', 'Mestiere', 'Azione', 'Proverbio'].includes(m.tipo)));
const tipi = new Set(MIMO.map((m) => m.tipo));
check('tutte e quattro le categorie del Mimo sono presenti', tipi.size === 4, [...tipi].join(','));
console.log(`  Mimo: ${MIMO.length} carte`);

/* ---------------------------------- Top 10 -------------------------------- */

for (const l of TOP10) {
  check(`top10 "${l.id}": almeno 5 voci`, l.voci.length >= 5, `${l.voci.length}`);
  check(`top10 "${l.id}": massimo 10 voci`, l.voci.length <= 10, `${l.voci.length}`);
  check(`top10 "${l.id}": nessuna voce ripetuta`,
    new Set(l.voci.map((v) => norm(v.nome))).size === l.voci.length);
  check(`top10 "${l.id}": titolo presente`, l.titolo.trim().length > 8);
  // un alias che punta a un'ALTRA voce renderebbe ambigua la risposta
  // (un alias uguale al proprio nome e' solo ridondante, non un problema)
  const aliasCollisi = l.voci.flatMap((v, i) =>
    (v.alias ?? []).filter((a) => l.voci.some((o, j) => j !== i && norm(o.nome) === norm(a))));
  check(`top10 "${l.id}": nessun alias punta a un'altra voce`, aliasCollisi.length === 0, aliasCollisi.join(','));
}
check('id delle classifiche univoci', new Set(TOP10.map((l) => l.id)).size === TOP10.length);
console.log(`  Top 10: ${TOP10.length} classifiche (${TOP10.filter((l) => l.volatile).length} da rivedere nel tempo)`);

/* -------------------------------- Impostore -------------------------------- */

check('nessuna parola segreta duplicata',
  new Set(PAROLE_SEGRETE.map(norm)).size === PAROLE_SEGRETE.length);
for (const d of DOMANDE_NUMERICHE) {
  check(`domanda "${d.vera.slice(0, 28)}…": le due domande sono diverse`, norm(d.vera) !== norm(d.falsa));
  check(`domanda "${d.vera.slice(0, 28)}…": entrambe finiscono col punto interrogativo`,
    d.vera.trim().endsWith('?') && d.falsa.trim().endsWith('?'));
}
console.log(`  Impostore: ${PAROLE_SEGRETE.length} parole, ${DOMANDE_NUMERICHE.length} coppie di domande`);

/* ---------------------- Risposta Bastarda e Fabbrica Meme ------------------ */

check('nessun prompt duplicato', new Set(PROMPT_BASTARDI.map(norm)).size === PROMPT_BASTARDI.length);
check('abbastanza prompt per una partita piena', PROMPT_BASTARDI.length >= 16, `${PROMPT_BASTARDI.length}`);
check('id dei meme univoci', new Set(MEME_TEMPLATES.map((m) => m.id)).size === MEME_TEMPLATES.length);
check('ogni meme ha scena, art ed etichette',
  MEME_TEMPLATES.every((m) => m.scena && m.art && m.topLabel && m.bottomLabel));
console.log(`  Risposta Bastarda: ${PROMPT_BASTARDI.length} prompt · Meme: ${MEME_TEMPLATES.length} template`);

/* ------------------------------ Quiz lampo ------------------------------ */

// NFKD trasforma anche gli indici in cifre: H₂O e H₂O₂ devono restare diverse
const plainNorm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

for (const q of QUIZ) {
  const label = `quiz "${q.domanda.slice(0, 40)}…"`;
  check(`${label}: finisce col punto interrogativo`, q.domanda.trim().endsWith('?'));
  const opts = [q.giusta, ...q.sbagliate].map(plainNorm);
  check(`${label}: quattro risposte tutte diverse`, new Set(opts).size === 4, [q.giusta, ...q.sbagliate].join(' / '));
}
check('nessuna domanda del quiz ripetuta', new Set(QUIZ.map((q) => plainNorm(q.domanda))).size === QUIZ.length);
check('abbastanza domande per molte partite', QUIZ.length >= 60, `${QUIZ.length}`);
console.log(`  Quiz lampo: ${QUIZ.length} domande in ${new Set(QUIZ.map((q) => q.categoria)).size} categorie`);

/* ------------------------------- Emoji ------------------------------- */

for (const e of EMOJI_PUZZLES) {
  check(`emoji "${e.titolo}": sequenza presente`, [...e.emoji].length >= 2);
  check(`emoji "${e.titolo}": tipo valido`, e.tipo === 'Film' || e.tipo === 'Serie TV');
}
const emojiTitles = EMOJI_PUZZLES.map((e) => plainNorm(e.titolo));
check('nessun titolo emoji ripetuto', new Set(emojiTitles).size === emojiTitles.length,
  emojiTitles.filter((t, i) => emojiTitles.indexOf(t) !== i).join(', '));
check('nessuna sequenza emoji ripetuta', new Set(EMOJI_PUZZLES.map((e) => e.emoji)).size === EMOJI_PUZZLES.length);
const emojiAliasClash = EMOJI_PUZZLES.flatMap((e) =>
  (e.alias ?? []).filter((a) => EMOJI_PUZZLES.some((o) => o !== e && plainNorm(o.titolo) === plainNorm(a))));
check('nessun alias emoji punta a un altro titolo', emojiAliasClash.length === 0, emojiAliasClash.join(', '));
console.log(`  Emoji: ${EMOJI_PUZZLES.filter((e) => e.tipo === 'Film').length} film, ${EMOJI_PUZZLES.filter((e) => e.tipo === 'Serie TV').length} serie TV`);

/* ---------------------------- Indizio Secco ---------------------------- */

const indizioWords = INDIZIO_CARDS.map((c) => plainNorm(c.parola));
check('nessuna carta di Indizio Secco ripetuta', new Set(indizioWords).size === indizioWords.length,
  indizioWords.filter((t, i) => indizioWords.indexOf(t) !== i).join(', '));
check('abbastanza carte per Indizio Secco', INDIZIO_CARDS.length >= 80, `${INDIZIO_CARDS.length}`);
console.log(`  Indizio Secco: ${INDIZIO_CARDS.length} carte`);

/* -------------------------- Disegna e indovina -------------------------- */

const drawWords = PAROLE_DISEGNO.map((d) => plainNorm(d.parola));
check('nessuna parola da disegnare ripetuta', new Set(drawWords).size === drawWords.length,
  drawWords.filter((t, i) => drawWords.indexOf(t) !== i).join(', '));
const drawAliasClash = PAROLE_DISEGNO.flatMap((d) =>
  (d.alias ?? []).filter((a) => PAROLE_DISEGNO.some((o) => o !== d && plainNorm(o.parola) === plainNorm(a))));
check('nessun sinonimo di disegno coincide con un altra parola', drawAliasClash.length === 0, drawAliasClash.join(', '));
console.log(`  Disegna e indovina: ${PAROLE_DISEGNO.length} parole`);

console.log(failures === 0 ? '\n  DATI OK\n' : `\n  ${failures} PROBLEMI NEI DATI\n`);
process.exit(failures === 0 ? 0 : 1);
