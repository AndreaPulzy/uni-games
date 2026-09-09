/** Dizionario italiano completo, caricato da file al primo utilizzo.
 *
 *  Fonte: napolux/paroleitaliane (MIT) — 280.000 parole italiane, qui filtrate
 *  alle sole forme A-Z (le accentate entrano anche senza accento: "citta").
 *
 *  L'elenco e' tenuto ordinato e interrogato per bisezione: un Set con tutti i
 *  prefissi costerebbe centinaia di MB, mentre cosi' restano ~4 MB.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const load = (file: string): string[] =>
  readFileSync(fileURLToPath(new URL(`./dict/${file}`, import.meta.url)), 'utf8')
    .split('\n')
    .map((w) => w.trim())
    .filter(Boolean);

/** Tutte le parole, ordinate: la bisezione ne dipende. */
export const ALL_WORDS: string[] = load('parole-it.txt');
/** Sottoinsieme da 5 lettere: e' il dizionario dei tentativi del Wordle. */
export const WORDS_5: Set<string> = new Set(load('parole-5.txt'));

const norm = (w: string) => w.trim().toLowerCase();

/** Indice della prima parola >= target. */
function lowerBound(target: string): number {
  let lo = 0, hi = ALL_WORDS.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (ALL_WORDS[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function isWord(w: string): boolean {
  const n = norm(w);
  if (!n) return false;
  const i = lowerBound(n);
  return i < ALL_WORDS.length && ALL_WORDS[i] === n;
}

/** Esiste almeno una parola che inizia con questa sequenza? */
export function hasPrefix(p: string): boolean {
  const n = norm(p);
  if (!n) return true;
  const i = lowerBound(n);
  return i < ALL_WORDS.length && ALL_WORDS[i].startsWith(n);
}

/** Una parola che inizia con la sequenza e ha almeno `minLength` lettere. */
export function anyWordWithPrefix(p: string, minLength = 4): string | null {
  const n = norm(p);
  for (let i = lowerBound(n); i < ALL_WORDS.length; i++) {
    const w = ALL_WORDS[i];
    if (!w.startsWith(n)) return null;
    if (w.length >= minLength) return w;
  }
  return null;
}

/** Tentativo valido per il Wordle: qualunque parola italiana di 5 lettere. */
export function isWord5(w: string): boolean {
  return WORDS_5.has(norm(w));
}
