import type { Registry } from './minigame.ts';
import { WordleGame } from './games/wordle.ts';
import { ConnectionsGame } from './games/connections.ts';
import { NerdleGame } from './games/nerdle.ts';
import { GhostGame } from './games/ghost.ts';
import { ImpostoreParolaGame } from './games/impostore-parola.ts';
import { ImpostoreNumeriGame } from './games/impostore-numeri.ts';
import { NomiCoseCittaGame } from './games/nomi-cose-citta.ts';
import { RispostaBastardaGame } from './games/risposta-bastarda.ts';
import { FabbricaMemeGame } from './games/fabbrica-meme.ts';
import { TabooGame } from './games/taboo.ts';
import { IntesaVincenteGame } from './games/intesa-vincente.ts';
import { MimoGame } from './games/mimo.ts';
import { Top10Game } from './games/top10.ts';

/** Solo i giochi presenti qui entrano davvero in partita.
 *  Il flag `ready` nel catalogo condiviso deve restare allineato a questa mappa. */
export const registry: Registry = {
  wordle: (ctx) => new WordleGame(ctx),
  connections: (ctx) => new ConnectionsGame(ctx),
  nerdle: (ctx) => new NerdleGame(ctx),
  ghost: (ctx) => new GhostGame(ctx),
  'impostore-parola': (ctx) => new ImpostoreParolaGame(ctx),
  'impostore-numeri': (ctx) => new ImpostoreNumeriGame(ctx),
  'nomi-cose-citta': (ctx) => new NomiCoseCittaGame(ctx),
  'risposta-bastarda': (ctx) => new RispostaBastardaGame(ctx),
  'fabbrica-meme': (ctx) => new FabbricaMemeGame(ctx),
  taboo: (ctx) => new TabooGame(ctx),
  'intesa-vincente': (ctx) => new IntesaVincenteGame(ctx),
  mimo: (ctx) => new MimoGame(ctx),
  top10: (ctx) => new Top10Game(ctx),
};
