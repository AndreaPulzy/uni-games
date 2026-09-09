export function Landing() {
  return (
    <div className="stage center">
      <div className="col center" style={{ gap: 34, padding: 24, textAlign: 'center' }}>
        <div>
          <div className="kicker" style={{ marginBottom: 10 }}>Party Game</div>
          <h1 className="grad-text" style={{ fontSize: 'clamp(48px, 12vw, 120px)' }}>
            UNI GAMES
          </h1>
        </div>
        <p className="dim" style={{ maxWidth: 460, fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
          Tredici minigiochi, una classifica sola. Apri la partita sulla TV,
          entra col telefono, e che vinca il migliore.
        </p>
        <div className="col" style={{ gap: 12, width: 'min(92vw, 340px)' }}>
          <a className="btn btn-primary btn-lg btn-block" href="/host" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Apri sulla TV
          </a>
          <a className="btn btn-lg btn-block" href="/play" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Entra come giocatore
          </a>
        </div>
      </div>
    </div>
  );
}
