import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="app">
      <section className="hero">
        <div className="badge">Crack The C0D3</div>

        <h1>
          Decifre o código.
          <br />
          Abra o cofre.
          <br />
          pegue seu prêmio.
        </h1>

        <p>
          Uma experiência gamificada, unindo jogo, tecnologia e estratégia. Alinhado aos maiores desafios de mercado.
        </p>

        <div className="actions">
          <button className="btn-primary" onClick={() => navigate("/cadastro")}>
            Entrar no jogo
          </button>

        </div>
      </section>
    </main>
  );
}

export default Home;