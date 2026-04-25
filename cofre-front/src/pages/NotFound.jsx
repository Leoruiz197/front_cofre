import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";



function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="notfound-page">
      <section className="notfound-container">
        <div className="notfound-tag">ERRO</div>

        <h1>404</h1>

        <h2>Página não encontrada</h2>

        <p>
          O caminho que você tentou acessar não existe ou foi removido.
          Você será redirecionado automaticamente.
        </p>

        <button
          className="notfound-button"
          onClick={() => navigate("/")}
        >
          Voltar agora
        </button>

        <span className="notfound-timer">
          Redirecionando em 10 segundos...
        </span>
      </section>
    </main>
  );
}

export default NotFound;