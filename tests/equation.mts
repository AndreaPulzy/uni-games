import { randomEquation, isCorrectEquation, isValidEquationShape, evalExpr, EQ_LENGTH } from '../server/src/games/equation.ts';

let failures = 0;
const check = (label: string, ok: boolean, extra = '') => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${extra ? ' — ' + extra : ''}`);
  if (!ok) failures++;
};

check('12+34=46 e corretta', isCorrectEquation('12+34=46'));
check('precedenza: 2+3*4=14', isCorrectEquation('2+3*4=14'));
check('2+3*4=20 e sbagliata (precedenza)', !isCorrectEquation('2+3*4=20'));
check('divisione esatta 48/6=8', isCorrectEquation('48/6=08') === false, 'zero iniziale rifiutato');
check('divisione non intera rifiutata', evalExpr('7/2') === null);
check('divisione per zero rifiutata', evalExpr('7/0') === null);
check('zeri iniziali rifiutati', evalExpr('05+1') === null);
check('doppio = rifiutato', isValidEquationShape('1+1=2=2') !== null);
check('lunghezza sbagliata rifiutata', isValidEquationShape('1+1=2') !== null);
check('operatore a destra rifiutato', isValidEquationShape('12=34-22') !== null);
check('caratteri estranei rifiutati', isValidEquationShape('12+3a=15') !== null);
check('operatori consecutivi rifiutati', evalExpr('12++3') === null);
check('espressione che finisce con operatore', evalExpr('12+') === null);
check('risultato negativo non e una soluzione', !isCorrectEquation('12-34=-22'));

const seen = new Set<string>();
for (let i = 0; i < 4000; i++) {
  const eq = randomEquation();
  if (eq.length !== EQ_LENGTH) { check('lunghezza generata', false, eq); break; }
  if (!isCorrectEquation(eq)) { check('equazione generata valida', false, eq); break; }
  seen.add(eq);
}
check('4000 equazioni generate tutte valide e lunghe 8', true);
check('buona varieta di equazioni', seen.size > 500, `${seen.size} equazioni distinte`);
const ops = ['+', '-', '*', '/'].filter((o) => [...seen].some((e) => e.split('=')[0].includes(o)));
check('tutti e quattro gli operatori compaiono', ops.length === 4, ops.join(''));

console.log(failures === 0 ? '\n  TUTTO OK\n' : `\n  ${failures} CONTROLLI FALLITI\n`);
process.exit(failures === 0 ? 0 : 1);
