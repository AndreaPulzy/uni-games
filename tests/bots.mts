/** Bot per provare l'app senza amici: entrano nella stanza indicata e giocano
 *  a ritmo umano, un po' a caso e un po' con giudizio (a volte azzeccano il
 *  quiz o il titolo, scrivono parole vere in Nomi Cose Città, scarabocchiano).
 *  Se la regia finisce a un bot, la passano subito al primo giocatore umano.
 *
 *  Uso:  npx tsx tests/bots.mts <CODICE> [quanti]
 *  Di default si collegano al sito online; per il server locale:
 *        BASE=http://localhost:3000 npx tsx tests/bots.mts <CODICE> */

import { io, type Socket } from 'socket.io-client';
import { decide, type Move } from './bot-brain.mts';
import { QUIZ } from '../server/src/data/quiz.ts';
import { EMOJI_PUZZLES } from '../server/src/data/emoji.ts';
import { PAROLE_DISEGNO } from '../server/src/data/disegni.ts';
import { PAROLE_SEGRETE } from '../server/src/data/impostore.ts';
import { ALL_WORDS } from '../server/src/data/dictionary.ts';

const BASE = process.env.BASE ?? 'https://uni-games.onrender.com';
const code = (process.argv[2] ?? '').toUpperCase();
const howMany = Number(process.argv[3] ?? 3);

if (!/^[A-Z]{4}$/.test(code)) {
  console.error('Uso: npx tsx tests/bots.mts <CODICE> [quanti]');
  process.exit(1);
}

const POOL = ['Giulia', 'Marco', 'Sara', 'Luca', 'Chiara', 'Dario', 'Elisa', 'Fabio'];
const BATTUTE = [
  'Mia suocera', 'Un piccione con la patente', 'Il wifi del vicino', 'Tre gatti in un impermeabile',
  'La lavatrice alle tre di notte', 'Un cornetto scaduto', 'Mio cugino che fa crypto',
  'Il navigatore offeso', 'Una riunione che poteva essere una mail', 'Il karaoke di Capodanno',
  'Un criceto in carriera', 'La nonna su TikTok', 'Il parcheggio in doppia fila',
];
const MEME = [
  ['Quando dico "cinque minuti"', 'Due ore dopo'], ['Io il lunedì', 'Io il venerdì'],
  ['Quando arriva la pizza', 'La dieta'], ['Il mio piano', 'La realtà'],
  ['Quando il capo scrive "hai un minuto?"', 'Io'], ['Io che studio', 'Il telefono'],
];
const INDIZI: Record<string, string> = {
  Personaggio: 'famoso', Animale: 'zampe', Film: 'cinema', 'Serie TV': 'episodi',
  'Cartone animato': 'disegni', 'Luogo famoso': 'viaggio',
};
const COLORS = ['#111111', '#e63946', '#1d4ed8', '#16a34a', '#f59e0b', '#9333ea'];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const between = (a: number, b: number) => a + Math.random() * (b - a);
const chance = (p: number) => Math.random() < p;

const byLetter = new Map<string, string[]>();
/** una parola italiana vera che inizia con la lettera, con la maiuscola */
function wordWith(letter: string): string {
  const l = letter.toLowerCase();
  if (!byLetter.has(l)) byLetter.set(l, ALL_WORDS.filter((w) => w.startsWith(l) && w.length >= 4 && w.length <= 9));
  const w = byLetter.get(l)!.length ? pick(byLetter.get(l)!) : l + 'aaa';
  return w[0].toUpperCase() + w.slice(1);
}
const randomWord = () => wordWith(pick([...'abcdefgilmnoprstv']));

/** pausa tra una mossa e l'altra, perché un bot che fa Wordle in otto secondi non diverte */
function gapFor(gameId: string): number {
  switch (gameId) {
    case 'wordle': case 'nerdle': return between(6000, 12000);
    case 'connections': return between(8000, 15000);
    case 'ghost': case 'top10': return between(2500, 6000);
    default: return between(800, 2500);
  }
}

const botIds = new Set<string>();

for (let i = 0; i < howMany; i++) {
  const name = POOL[i % POOL.length];
  const socket: Socket = io(BASE, { transports: ['websocket'] });
  const me = { id: '', token: '', name, priv: null as any };
  let room: any = null;
  let busy = false;
  let nextMoveAt = 0;
  let lastTransfer = 0;
  // memoria per situazione: da quando la vede, quante mosse ha fatto, quando riprovare
  const mem = new Map<string, { since: number; count: number; next: number; wait: number }>();
  const seen = (key: string) => {
    if (!mem.has(key)) mem.set(key, { since: Date.now(), count: 0, next: 0, wait: between(2000, 11000) });
    return mem.get(key)!;
  };

  socket.on('connect', () => {
    // col token un bot che si ricollega riprende il suo posto invece di entrare doppio
    socket.emit('player:join', { code, name, token: me.token || undefined }, (r: any) => {
      if (!r?.ok) return console.log(`${name}: ${r?.error ?? 'errore'}`);
      me.id = r.playerId;
      me.token = r.token;
      botIds.add(r.playerId);
      console.log(`${name} è nella stanza ${code}`);
    });
  });
  socket.on('disconnect', () => console.log(`${name} si è disconnesso, riprovo…`));
  socket.on('private', (v: any) => { me.priv = v.game; });
  socket.on('room', (s: any) => {
    room = s;
    // finché non sono entrati tutti, un bot appena arrivato sembrerebbe un umano
    if (s?.directorId && s.directorId === me.id && botIds.size === howMany && Date.now() - lastTransfer > 3000) {
      const human = s.players.find((p: any) => p.connected && !botIds.has(p.id));
      if (human) {
        lastTransfer = Date.now();
        socket.emit('director:transfer', { playerId: human.id }, () => console.log(`${name} passa la regia a ${human.name}`));
      }
    }
  });

  /** mosse più credibili per i giochi dove il cervello dei test gioca da macchina;
   *  `undefined` vuol dire "decidi come nei test" */
  function smarter(gameId: string): Move | undefined {
    const g = me.priv;
    const pub = room.game;
    if (!g || !pub) return null;
    const now = Date.now();

    switch (gameId) {
      case 'quiz-lampo': {
        if (pub.phase !== 'question' || g.myChoice !== null) return null;
        const m = seen(`quiz:${pub.index}`);
        if (now - m.since < m.wait) return null;
        const q = QUIZ.find((x) => x.domanda === pub.domanda);
        const right = q ? pub.options.indexOf(q.giusta) : -1;
        const wrong = [0, 1, 2, 3].filter((x) => x !== right);
        return { type: 'answer', payload: { choice: right >= 0 && chance(0.55) ? right : pick(wrong) } };
      }

      case 'emoji-film': {
        if (pub.phase !== 'guess' || g.solved || g.tries >= g.maxTries) return null;
        const m = seen(`emoji:${pub.index}`);
        if (now < m.next || now - m.since < 6000) return null;
        m.next = now + between(5000, 10000);
        const puzzle = EMOJI_PUZZLES.find((e) => e.emoji === pub.emoji);
        const text = puzzle && chance(0.35) ? puzzle.titolo : pick(EMOJI_PUZZLES).titolo;
        return { type: 'guess', payload: { text } };
      }

      case 'disegna': {
        if (g.isDrawer) {
          if (pub.phase === 'choose') {
            const m = seen(`scelta:${pub.turn}`);
            return now - m.since > 3000 ? { type: 'choose', payload: { index: Math.floor(Math.random() * 3) } } : null;
          }
          if (pub.phase !== 'draw') return null;
          const m = seen(`tratti:${pub.turn}`);
          if (m.count >= 7 || now < m.next) return null;
          m.count++;
          m.next = now + between(3000, 7000);
          const points: number[] = [];
          let x = between(200, 800), y = between(200, 800);
          for (let k = 0; k < 12; k++) {
            x = Math.min(950, Math.max(50, x + between(-120, 120)));
            y = Math.min(950, Math.max(50, y + between(-120, 120)));
            points.push(Math.round(x), Math.round(y));
          }
          return { type: 'stroke', payload: { id: m.count, color: pick(COLORS), size: 10, offset: 0, points } };
        }
        if (pub.phase !== 'draw' || g.guessed || !pub.mask) return null;
        const m = seen(`indovina:${pub.turn}`);
        if (m.count >= 5 || now < m.next || now - m.since < 12000) return null;
        m.count++;
        m.next = now + between(6000, 10000);
        const candidates = PAROLE_DISEGNO.filter((d) => d.parola.replace(/\p{L}/gu, '_') === pub.mask);
        return { type: 'guess', payload: { text: candidates.length ? pick(candidates).parola : randomWord() } };
      }

      case 'nomi-cose-citta': {
        if (g.phase !== 'fill' || g.frozen) return null;
        const m = seen(`ncc:${g.letter}`);
        if (now < m.next) return null;
        m.next = now + between(3000, 8000);
        const i = g.cells.findIndex((c: string) => !c || c[0]?.toUpperCase() !== g.letter);
        if (i >= 0) return { type: 'fill', payload: { index: i, value: wordWith(g.letter) } };
        return g.canStop && now - m.since > 60000 && chance(0.3) ? { type: 'stop' } : null;
      }

      case 'risposta-bastarda': {
        if (g.phase !== 'write') return undefined;
        const todo = (g.assignments ?? []).find((a: any) => !a.text);
        if (!todo) return null;
        const m = seen(`battuta:${todo.index}`);
        return now - m.since > m.wait + 6000 ? { type: 'answer', payload: { index: todo.index, text: pick(BATTUTE) } } : null;
      }

      case 'fabbrica-meme': {
        if (g.phase !== 'write' || g.submitted) return undefined;
        const m = seen('meme');
        if (now - m.since < m.wait + 10000) return null;
        const [top, bottom] = pick(MEME);
        return { type: 'meme', payload: { top, bottom } };
      }

      case 'impostore-parola':
        if (g.phase === 'secret' && g.myTurn) return { type: 'clue', payload: { word: randomWord() } };
        if (g.phase === 'guess' && g.mustGuess) return { type: 'guess', payload: { word: pick(PAROLE_SEGRETE) } };
        return undefined;

      case 'indizio-secco': {
        if (!g.myTurnToClue) return undefined;
        const m = seen(`indizio:${pub.wordIndex}:${(pub.clues ?? []).length}`);
        if (now - m.since < 5000) return null;
        const first = (pub.clues ?? []).length === 0 && INDIZI[pub.categoria];
        return { type: 'clue', payload: { word: first || randomWord() } };
      }
    }
    return undefined;
  }

  setInterval(async () => {
    if (busy || !room || room.phase !== 'playing' || !room.currentGame || Date.now() < nextMoveAt) return;
    const gameId = room.currentGame;
    let move = smarter(gameId);
    if (move === undefined) move = decide(gameId, me, room);
    if (!move) return;
    busy = true;
    await sleep(between(500, 1500));
    socket.emit('game:action', move);
    nextMoveAt = Date.now() + gapFor(gameId);
    busy = false;
  }, 700);
}

console.log(`${howMany} bot in arrivo nella stanza ${code} su ${BASE}. Ctrl+C per fermarli.`);
