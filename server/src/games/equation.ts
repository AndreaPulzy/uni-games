/** Generazione e validazione di equazioni per il Nerdle.
 *  Nessun eval: tokenizer + valutazione con precedenza, solo interi. */

export const EQ_LENGTH = 8;
const OPS = ['+', '-', '*', '/'] as const;

export function isValidEquationShape(s: string): string | null {
  if (s.length !== EQ_LENGTH) return `Servono ${EQ_LENGTH} caselle`;
  if (!/^[0-9+\-*/=]+$/.test(s)) return 'Solo cifre e + - * / =';
  const parts = s.split('=');
  if (parts.length !== 2) return 'Serve un solo segno =';
  const [lhs, rhs] = parts;
  if (!lhs || !rhs) return 'I due lati non possono essere vuoti';
  if (/[+\-*/]/.test(rhs)) return 'A destra dell = va solo un numero';
  if (/^0\d/.test(rhs)) return 'Niente zeri iniziali';
  return null;
}

/** Valuta il lato sinistro. Ritorna null se non e' un'espressione ben formata. */
export function evalExpr(expr: string): number | null {
  const tokens = expr.match(/\d+|[+\-*/]/g);
  if (!tokens || tokens.join('') !== expr) return null;
  if (tokens.length % 2 === 0) return null;               // deve alternare num op num

  for (let i = 0; i < tokens.length; i++) {
    const isNum = i % 2 === 0;
    if (isNum !== /^\d+$/.test(tokens[i])) return null;
    if (isNum && tokens[i].length > 1 && tokens[i][0] === '0') return null;
  }

  // prima * e /, poi + e -
  const stack: (number | string)[] = [Number(tokens[0])];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const n = Number(tokens[i + 1]);
    if (op === '*' || op === '/') {
      const prev = stack.pop() as number;
      if (op === '/') {
        if (n === 0 || prev % n !== 0) return null;        // solo divisioni esatte
        stack.push(prev / n);
      } else stack.push(prev * n);
    } else {
      stack.push(op, n);
    }
  }

  let acc = stack[0] as number;
  for (let i = 1; i < stack.length; i += 2) {
    const op = stack[i] as string;
    const n = stack[i + 1] as number;
    acc = op === '+' ? acc + n : acc - n;
  }
  return acc;
}

/** L'equazione e' matematicamente corretta? */
export function isCorrectEquation(s: string): boolean {
  if (isValidEquationShape(s) !== null) return false;
  const [lhs, rhs] = s.split('=');
  const left = evalExpr(lhs);
  return left !== null && left >= 0 && String(left) === rhs;
}

/** Estrae un'equazione segreta valida di 8 caratteri.
 *  Per la divisione si campionano divisore e risultato e si ricava il dividendo:
 *  partendo dal dividendo, `a/b=c` non arriverebbe mai a 8 caratteri. */
export function randomEquation(rng: () => number = Math.random): string {
  const ri = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));

  for (let attempt = 0; attempt < 4000; attempt++) {
    const op = OPS[Math.floor(rng() * OPS.length)];
    let a: number, b: number, res: number;

    switch (op) {
      case '+':
        a = ri(0, 999); b = ri(0, 999); res = a + b;
        break;
      case '-':
        a = ri(0, 999); b = ri(0, a); res = a - b;
        break;
      case '*':
        a = ri(2, 99); b = ri(2, 99); res = a * b;
        break;
      default:
        b = ri(2, 60); res = ri(2, 60); a = b * res;
        break;
    }

    const s = `${a}${op}${b}=${res}`;
    if (s.length === EQ_LENGTH && isCorrectEquation(s)) return s;
  }
  return '12+34=46';   // rete di sicurezza: valida e lunga 8
}
