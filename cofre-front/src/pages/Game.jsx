import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Game.css";

function Game() {
  const navigate = useNavigate();

  const deviceId = sessionStorage.getItem("deviceId");

  const [guess, setGuess] = useState("");
  const [bons, setBons] = useState(0);
  const [otimos, setOtimos] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  async function loadGameState() {
    try {
      if (!deviceId) {
        navigate("/");
        return;
      }

      const response = await api.get(`/game/state/${deviceId}`);

      setStatus(response.data.status);
      setAttempts(response.data.attempts || 0);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar o estado do jogo.");
    }
  }

  async function finishGame(redirectTo = "/") {
    try {
      if (deviceId) {
        await api.post("/queue/finish", { deviceId });
      }
    } catch (error) {
      console.error("Erro ao finalizar jogo:", error);
    } finally {
      sessionStorage.removeItem("deviceId");
      sessionStorage.removeItem("queue");
      sessionStorage.removeItem("queueDeadline");
      sessionStorage.removeItem("gameDeadline");

      navigate(redirectTo, { replace: true });
    }
  }

  async function handleAttempt(event) {
    event.preventDefault();

    setErro("");

    if (!/^\d{4}$/.test(guess)) {
      setErro("Digite uma senha com exatamente 4 números.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/game/guess", {
        deviceId,
        guess,
      });

      setOtimos(response.data.otimos || 0);
      setBons(response.data.bons || 0);
      setAttempts(response.data.attempts || 0);

      if (response.data.win) {
        await finishGame("/game/win");
        return;
      }

      setGuess("");
    } catch (error) {
      console.error(error);

      const mensagem =
        error.response?.data?.message ||
        "Não foi possível enviar sua tentativa.";

      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!deviceId) {
      navigate("/", { replace: true });
      return;
    }

    loadGameState();
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    let deadline = sessionStorage.getItem("gameDeadline");

    if (!deadline) {
      deadline = String(Date.now() + 180 * 1000);
      sessionStorage.setItem("gameDeadline", deadline);
    }

    function updateTimer() {
      const remaining = Math.ceil((Number(deadline) - Date.now()) / 1000);

      if (remaining <= 0) {
        setTimeLeft(0);
        finishGame("/");
        return;
      }

      setTimeLeft(remaining);
    }

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <main className="game-page">
      <section className="game-container">
        <div className="game-header">
          <div className="game-tag">CRACK THE C0D3</div>

          <button className="game-exit" onClick={() => finishGame("/")}>
            Sair
          </button>
        </div>

        <h1>Decifre o cofre</h1>

        <p className="game-intro">
          Digite uma senha de 4 números. A cada tentativa, o sistema mostrará
          quantos números estão bons e quantos estão ótimos.
        </p>

        <div className="game-stats">
          <div className="stat-card">
            <span>Tempo restante</span>
            <strong>
              {minutes}:{seconds}
            </strong>
          </div>

          <div className="stat-card">
            <span>Tentativas</span>
            <strong>{attempts}</strong>
          </div>

          <div className="stat-card">
            <span>Bons</span>
            <strong>{bons}</strong>
          </div>

          <div className="stat-card">
            <span>Ótimos</span>
            <strong>{otimos}</strong>
          </div>
        </div>

        <form className="game-form" onSubmit={handleAttempt}>
          <label>Sua tentativa</label>

          <div className="guess-row">
            <input
              type="text"
              inputMode="numeric"
              maxLength="4"
              value={guess}
              onChange={(event) => {
                const onlyNumbers = event.target.value.replace(/\D/g, "");
                setGuess(onlyNumbers);
              }}
              placeholder="0000"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Tentar"}
            </button>
          </div>
        </form>

        {erro && <p className="game-error">{erro}</p>}

        <div className="game-status">
          <span>Status do cofre</span>
          <strong>{status || "Carregando..."}</strong>
        </div>
      </section>
    </main>
  );
}

export default Game;