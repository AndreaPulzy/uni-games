/** Confronto tollerante delle risposte scritte dal telefono: accenti, maiuscole,
 *  punteggiatura, articolo iniziale e piccoli errori di battitura non contano.
 *  "il re leone", "Re Leone" e "re leon" valgono tutti per "Il re leone". */

const ARTICOLI = new Set(['il', 'lo', 'la', 'i', 'gli', 'le', 'l', 'un', 'uno', 'una', 'the', 'a', 'an']);

export function simplify(s: string): string {
  const words = s
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (words.length > 1 && ARTICOLI.has(words[0])) words.shift();
  return words.join('');
}

/** Distanza di modifica con uscita anticipata oltre `max`. */
export function levenshtein(a: string, b: string, max = Infinity): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Errori concessi: nessuno sulle parole cortissime, uno fino a 8 lettere, due oltre. */
function tolerance(length: number): number {
  return length <= 4 ? 0 : length <= 8 ? 1 : 2;
}

export function matches(guess: string, answers: string[]): boolean {
  const g = simplify(guess);
  if (g.length < 2) return false;
  return answers.some((answer) => {
    const a = simplify(answer);
    if (!a) return false;
    if (g === a) return true;
    const tol = tolerance(a.length);
    return tol > 0 && levenshtein(g, a, tol) <= tol;
  });
}

/** Suggerimento: resta solo l'iniziale di ogni parola. "Il re leone" -> "I_ r_ l____" */
export function maskTitle(title: string): string {
  return title.replace(/[\p{L}\p{N}]+/gu, (w) => w[0] + '_'.repeat(w.length - 1));
}
