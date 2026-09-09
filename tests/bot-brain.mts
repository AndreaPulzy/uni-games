/** Logica di gioco dei bot, condivisa da tests/bots.mts e tests/all-games.mts.
 *  Restituisce una mossa sensata per ciascun minigioco a partire dalla vista
 *  privata del giocatore. Serve a provare i giochi senza radunare sei persone. */

import { SOLUTION_LIST } from '../server/src/data/words-it.ts';
import { randomEquation } from '../server/src/games/equation.ts';
import { TOP10 } from '../server/src/data/top10.ts';

export interface BotView { name: string; priv: any }
export type Move = { type: string; payload?: unknown } | null;

/** azioni gia' fatte nel turno corrente, per non macinare carte all'infinito */
const perTurn = new Map<string, number>();
const turnKey = (room: any) => `${room?.game?.phase}:${room?.game?.turnIndex ?? 0}`;
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export function decide(gameId: string, bot: BotView, room: any): Move {
  const g = bot.priv;
  if (!g) return null;

  switch (gameId) {
    case 'wordle':
      return g.done ? null : { type: 'guess', payload: { word: pick(SOLUTION_LIST) } };

    case 'nerdle':
      return g.done ? null : { type: 'guess', payload: { eq: randomEquation() } };

    case 'connections':
      return g.done || g.words.length < 4
        ? null
        : { type: 'submit', payload: { words: g.words.slice(0, 4) } };

    case 'ghost':
      if (g.out) return null;
      if (g.mustDefend) return { type: 'defend', payload: { word: g.sequence + 'ARE' } };
      if (g.mustVote) return { type: 'vote', payload: { yes: Math.random() < 0.5 } };
      if (g.myTurn && g.sequence.length >= 2 && Math.random() < 0.3) return { type: 'challenge' };
      if (g.myTurn) return { type: 'letter', payload: { ch: pick([...'AEIORSTN']) } };
      return null;

    case 'impostore-parola':
      if (g.phase === 'secret' && g.myTurn) return { type: 'clue', payload: { word: 'indizio' + Math.floor(Math.random() * 99) } };
      if (g.phase === 'vote' && g.canVote) return { type: 'vote', payload: { playerId: pick(g.candidates).id } };
      if (g.phase === 'guess' && g.mustGuess) return { type: 'guess', payload: { word: 'boh' } };
      return null;

    case 'impostore-numeri':
      if (g.phase === 'secret' && g.myAnswer === null) return { type: 'answer', payload: { value: 1 + Math.floor(Math.random() * 9) } };
      if (g.phase === 'vote' && g.canVote) return { type: 'vote', payload: { playerId: pick(g.candidates).id } };
      return null;

    case 'nomi-cose-citta': {
      if (g.phase !== 'fill' || g.frozen) return null;
      const i = g.cells.findIndex((c: string) => !c || c[0]?.toUpperCase() !== g.letter);
      if (i >= 0) return { type: 'fill', payload: { index: i, value: g.letter + 'aaa' + i } };
      if (g.canStop) return { type: 'stop' };
      return null;
    }

    case 'risposta-bastarda': {
      if (g.phase === 'write') {
        const todo = (g.assignments ?? []).find((a: any) => !a.text);
        return todo ? { type: 'answer', payload: { index: todo.index, text: 'battuta di ' + bot.name } } : null;
      }
      if (g.phase === 'vote' && g.canVote) return { type: 'vote', payload: { playerId: pick(g.duel.options).authorId } };
      return null;
    }

    case 'fabbrica-meme':
      if (g.phase === 'write' && !g.submitted) return { type: 'meme', payload: { top: 'quando ' + bot.name, bottom: 'ecco qua' } };
      if (g.phase === 'vote' && !g.hasVoted && g.options?.length) return { type: 'vote', payload: { playerId: pick(g.options).playerId } };
      return null;

    case 'taboo':
    case 'intesa-vincente':
    case 'mimo': {
      if (g.canBegin) return { type: 'begin' };
      if (g.canJudgeSteal) return { type: 'stealNo' };
      const k = turnKey(room);
      const done = perTurn.get(k) ?? 0;
      if (done >= 4) return null;                 // poi si lascia scadere il turno
      if (g.canBuzz && Math.random() < 0.2) { perTurn.set(k, done + 1); return { type: 'buzz' }; }
      if (g.canScore) { perTurn.set(k, done + 1); return { type: Math.random() < 0.75 ? 'correct' : 'skip' }; }
      return null;
    }

    case 'top10': {
      if (g.phase !== 'guess' || !g.myTurn) return null;
      const list = TOP10.find((l) => l.titolo === g.titolo);
      const pool = list ? list.voci.map((v) => v.nome) : ['boh'];
      return { type: 'guess', payload: { text: Math.random() < 0.7 ? pick(pool) : 'risposta a caso' } };
    }
  }
  return null;
}
