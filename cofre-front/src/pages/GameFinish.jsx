import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GameFinish.css";

function GameFinish() {
  const navigate = useNavigate();

  const result = sessionStorage.getItem("gameResult") || "lost";

  const isWin = result === "win";

  useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.removeItem("gameResult");
      navigate("/", { replace: true });
    }, 30000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="finish-page">
      <section className="finish-container">
        <div className="finish-tag">
          {isWin ? "ACESSO LIBERADO" : "TEMPO ESGOTADO"}
        </div>

        <h1>{isWin ? "Você abriu o cofre" : "Você perdeu o desafio"}</h1>

        <p>
          {isWin
            ? "Parabéns. Você decifrou a senha correta e concluiu o desafio com sucesso. Espere a porta abrir e pegue o seu prêmio!"
            : "O tempo acabou ou as tentativas se esgotaram antes que você conseguisse decifrar a senha do cofre. Tente novamente mais tarde e boa sorte na próxima vez!"}
        </p>

        <button
          className="finish-button"
          onClick={() => {
            sessionStorage.removeItem("gameResult");
            navigate("/", { replace: true });
          }}
        >
          Voltar para o início
        </button>

        <span className="finish-timer">
          Redirecionando automaticamente em 30 segundos...
        </span>
      </section>
    </main>
  );
}

export default GameFinish;