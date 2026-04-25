import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="app">
      <section className="hero">
        <div className="badge">COFRE GAME</div>

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

          <button
            className="btn-secondary"
            onClick={() => navigate("/rules")}
          >
            Ver fila
          </button>
        </div>
      </section>
    </main>
  );
}

export default Home;