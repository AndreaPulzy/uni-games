# Uni Games

Party game da salotto: la partita sta sulla TV, ogni giocatore usa il proprio
telefono come controller. Diciassette minigiochi divisi in tre categorie che si
alternano, e una classifica sola.

```
┌─ TV / PC        /host    QR code, avanzamento, classifica
├─ Telefoni       /j/CODE  il controller di ogni giocatore
└─ Server Node             stato di gioco autoritativo + WebSocket
```

Il server tiene **tutto** lo stato: parola segreta, timer, punteggi. I telefoni
mandano solo intenti (`guess`, `vote`, `stop`). Nessuno può barare guardando il
codice della pagina, e il cronometro è uno solo per tutti.

## Avvio in locale

```bash
npm install
npm run dev
```

Poi apri `http://localhost:5173/host` sulla TV. Il QR mostrato punta all'IP di
rete, così i telefoni sulla stessa WiFi possono entrare.

## I minigiochi

| Minigioco | Categoria | Giocatori | Note |
|---|:--:|:--:|---|
| Wordle Italiano | a tempo | 2–16 | 90s, dizionario italiano completo |
| Connections | a tempo | 2–16 | 120s, 4 errori |
| Equazione Nascosta | a tempo | 2–16 | 120s, stile Nerdle |
| Ghost | a tempo | 3–4 | a turni, eliminazione: vince l'ultimo in piedi |
| Quiz lampo | a tempo | 2–16 | 8 domande da 15 secondi, conta la velocità |
| Indovina dalle emoji | a tempo | 2–16 | film e serie TV, suggerimento a metà tempo |
| L'Impostore | deduzione | 4–12 | indizi, discussione, voto |
| L'Impostore coi Numeri | deduzione | 4–12 | domanda diversa per uno solo |
| Nomi Cose Città | deduzione | 3–16 | con STOP e revisione di gruppo |
| La Risposta Bastarda | deduzione | 4–12 | due duelli a testa |
| Fabbrica di Meme | deduzione | 3–16 | didascalie e votazione |
| Disegna e indovina | deduzione | 3–8 | si disegna col dito, il disegno va in diretta sulla TV |
| Taboo | squadre | 4–16 | 60s, buzzer avversario |
| L'Intesa Vincente | squadre | 6–12 | serve almeno 3 per squadra |
| Mimo | squadre | 4–16 | 90s, furto finale |
| Top 10 | squadre | 4–16 | punti ponderati 10→1 |
| Indizio Secco | squadre | 4–16 | un indizio di una parola; se sbagli, la palla passa |

Minimo **4 giocatori**, ideale **6–8**, massimo **16**. Il motore propone solo i
giochi compatibili col numero di presenti: con 5 persone l'Intesa Vincente non
esce mai, con 5 sparisce Ghost. Dalla lobby si può anche scegliere a mano quali
minigiochi mettere in partita e quanti round giocare.

## Il regista

Il primo giocatore che entra diventa il **regista** e comanda la partita dal
telefono: sceglie i minigiochi e i round, avvia, fa andare avanti le schermate
e lancia una nuova partita a fine classifica. Serve quando la TV è una smart TV
senza mouse: in quel caso la TV fa solo da schermo.

- La regia si passa a un altro giocatore dal telefono del regista, oppure
  cliccando un giocatore nella lobby della TV.
- Se il telefono del regista si blocca, la regia resta sua per 20 secondi;
  se non rientra passa al primo giocatore collegato.
- TV e regista possono premere "avanti" insieme: il server scarta il secondo
  tocco, quindi nessuna schermata viene saltata.

## Suoni

La TV ha effetti sonori generati dal browser, senza file audio: presentazione
dei giochi, ultimi secondi del timer, risposte giuste e sbagliate, podio.
I browser tengono l'audio spento finché non si tocca la pagina, quindi in alto
compare **Attiva i suoni**: ha già il focus, così su una smart TV basta il
tasto OK del telecomando. Poi lo stesso pulsante silenzia e riattiva.

## Come si contano i punti

Ogni minigioco produce un **punteggio grezzo** con una formula sua (velocità,
tentativi, voti ricevuti, carte indovinate…). Poi si applica la **curva di
round**: il migliore del round viene scalato a **1000**, gli altri in
proporzione, con un pavimento di **100 punti** per chi ha partecipato.

Serve a evitare che un round mal calibrato pesi il doppio degli altri, e tiene
tutti in corsa fino alla fine. Tutte e tre le categorie pesano uguale.

Le squadre si sorteggiano a caso a ogni gioco di gruppo.

## Dati

| File | Contenuto |
|---|---|
| `server/src/data/dict/parole-it.txt` | 277.765 parole italiane |
| `server/src/data/dict/parole-5.txt` | 6.696 parole da 5 lettere (tentativi Wordle) |
| `server/src/data/words-it.ts` | 295 parole segrete curate del Wordle |
| `server/src/data/connections.ts` | 25 griglie |
| `server/src/data/squadre.ts` | 80 carte Taboo, 109 parole Intesa, 80 carte Mimo |
| `server/src/data/top10.ts` | 24 classifiche |
| `server/src/data/impostore.ts` | 103 parole segrete, 45 coppie di domande |
| `server/src/data/prompts.ts` | 80 prompt comici, 20 template meme |
| `server/src/data/quiz.ts` | 93 domande in 10 categorie |
| `server/src/data/emoji.ts` | 99 film e serie TV in emoji, scritti da noi |
| `server/src/data/indizio.ts` | 180 carte per Indizio Secco |
| `server/src/data/disegni.ts` | 175 parole da disegnare |

Il dizionario viene da [napolux/paroleitaliane](https://github.com/napolux/paroleitaliane)
(MIT). Il Wordle accetta come tentativo **qualunque** parola italiana di cinque
lettere; le parole segrete restano invece un elenco curato di parole comuni.

Le classifiche Top 10 marcate `volatile: true` (incassi, turismo, popolazione)
invecchiano: vanno ricontrollate ogni tanto.

## Archivio partite

SQLite in `server/data/uni-games.db`, con partite, round e classifiche finali.
Se il disco non è scrivibile il gioco continua comunque, tenendo l'archivio solo
in memoria.

- `GET /api/albo` — albo d'oro e statistiche
- `GET /api/partite` — ultime partite
- `GET /api/statistiche-giochi` — chi va forte in quale minigioco

## Test

```bash
npm run test:logic   # rotazione, punteggi, dati, migrazioni — non serve il server
npm run test:live    # partite vere via WebSocket — richiede npm run dev
```

`test:live` gioca davvero tutti e diciassette i minigiochi fino al recap.

Per provare un gioco da solo, senza radunare sei persone:

```bash
npx tsx tests/bots.mts <CODICE> 5
```

I bot entrano nella stanza e giocano a qualsiasi minigioco.

## Mettere il gioco online

Serve un host che tenga **vivo un processo Node**: il gioco vive su connessioni
WebSocket aperte e su timer lato server. Le funzioni serverless (Vercel incluso)
non possono farlo.

Il `Dockerfile` costruisce l'immagine completa — un solo processo serve pagina,
API e WebSocket. Sono pronti `render.yaml` (Render) e `fly.toml` (Fly.io).

Il QR code usa da solo il dominio della pagina, quindi online non serve
configurare nulla. La variabile `PUBLIC_URL` va impostata solo dietro un dominio
personalizzato o un proxy che cambia l'host visto dal browser.

Sul piano gratuito di Render il servizio si addormenta dopo 15 minuti di
inattività: la prima apertura richiede una cinquantina di secondi, poi resta
sveglio finché ci sono giocatori collegati. Conviene aprire la TV un minuto
prima di iniziare.

Per conservare l'archivio partite tra un deploy e l'altro serve un volume
montato su `/app/server/data`.
