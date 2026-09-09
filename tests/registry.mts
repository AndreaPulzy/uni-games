/** Il catalogo e il registry devono restare allineati: un gioco marcato `ready`
 *  ma non registrato manderebbe la partita a vuoto su quel round. */
import { GAMES } from '../shared/src/catalog.ts';
import { registry } from '../server/src/registry.ts';

let failures = 0;
for (const g of GAMES) {
  const registered = Boolean(registry[g.id]);
  if (g.ready !== registered) {
    console.log(` FAIL  ${g.id}: catalogo ready=${g.ready}, registry=${registered}`);
    failures++;
  }
}
const ready = GAMES.filter((g) => g.ready);
console.log(`  ${ready.length}/${GAMES.length} minigiochi implementati: ${ready.map((g) => g.id).join(', ')}`);
console.log(failures === 0 ? '\n  ALLINEATI\n' : `\n  ${failures} DISALLINEAMENTI\n`);
process.exit(failures === 0 ? 0 : 1);
