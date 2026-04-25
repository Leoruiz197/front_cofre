import "./App.css";

function App() {
  return (
    <main className="app">
      <section className="hero">
        <div className="badge">Crack the C0D3</div>

        <h1>
          Decifre o código.
          <br />
          Vença o desafio.
        </h1>

        <p>
          Uma experiência interativa conectando React, Node.js, WebSocket e ESP32
          em tempo real.
        </p>

        <div className="actions">
          <button className="btn-primary">Entrar no jogo</button>
          <button className="btn-secondary">Ver fila</button>
        </div>
      </section>

      <section className="panel">
        <h2>Status do sistema</h2>

        <div className="status-card">
          <span>Backend</span>
          <strong>Online</strong>
        </div>

        <div className="status-card">
          <span>WebSocket</span>
          <strong>Aguardando conexão</strong>
        </div>

        <div className="status-card">
          <span>Dispositivo</span>
          <strong>ESP32</strong>
        </div>
      </section>
    </main>
  );
}

export default App;