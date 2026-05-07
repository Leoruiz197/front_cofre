import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Game.css";

function Game() {
  const navigate = useNavigate();
  const [deviceId] = useState(() => sessionStorage.getItem("deviceId"));

  const [maxAttempts, setMaxAttempts] = useState(0);

  const [guess, setGuess] = useState("");
  const [bons, setBons] = useState(0);
  const [otimos, setOtimos] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [guesses, setGuesses] = useState([]);
  const finishedRef = useRef(false);

  async function loadGameState() {
    try {
      if (!deviceId) {
        navigate("/", { replace: true });
        return;
      }

      const response = await api.get(`/game/state/${deviceId}`);

      setStatus(response.data.status);
      setAttempts(response.data.attempts || 0);
      setMaxAttempts(response.data.maxAttempts || 0);
      if (response.data.guesses) {
        setGuesses(response.data.guesses);
      }
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar o estado do jogo.");
    }
  }

  async function finishGame(result = "lost") {
    if (finishedRef.current) return;
    finishedRef.current = true;

    let player = null;

    try {
      const raw = sessionStorage.getItem("player");
      player = raw ? JSON.parse(raw) : null;
    } catch {
      // player remains null
    }

    sessionStorage.setItem("gameResult", result);

    try {
      if (deviceId) {
        await api.post("/queue/finish", {
          deviceId,
          userId: player?.id || player?._id,
        });
      }
    } catch (error) {
      console.error("Erro ao finalizar jogo:", error.response?.data || error);
    } finally {
      sessionStorage.removeItem("deviceId");
      sessionStorage.removeItem("queue");
      sessionStorage.removeItem("queueDeadline");
      sessionStorage.removeItem("gameDeadline");

      navigate("/game/finish", { replace: true });
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

      const otimosResult = response.data.otimos || 0;
      const bonsResult = response.data.bons || 0;
      const attemptsResult = response.data.attempts || 0;

      setOtimos(otimosResult);
      setBons(bonsResult);
      setAttempts(attemptsResult);
      setMaxAttempts(response.data.maxAttempts || maxAttempts);
      setGuesses((prev) => [
        ...prev,
        { guess, bons: bonsResult, otimos: otimosResult },
      ]);

      const venceu = response.data.win === true || otimosResult === 4;

      if (venceu) {
        await finishGame("win");
        return;
      }

      const semTentativas =
        response.data.remainingAttempts === 0 ||
        response.data.gameOver === true;

      if (semTentativas) {
        await finishGame("lost");
        return;
      }

      setGuess("");
    } catch (error) {
      const backendError = error.response?.data;

      console.error("ERRO GAME GUESS:", backendError || error);

      const mensagem =
        backendError?.error ||
        backendError?.message ||
        "Não foi possível enviar sua tentativa.";

      if (mensagem.toLowerCase().includes("limite de tentativas")) {
        await finishGame("lost");
        return;
      }

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

    const timer = setTimeout(() => {
      loadGameState();
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, navigate]);

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
        finishGame("lost");
        return;
      }

      setTimeLeft(remaining);
    }

    const initTimer = setTimeout(() => {
      updateTimer();
    }, 0);

    const timer = setInterval(updateTimer, 1000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <main className="game-page">
      <section className="game-container">
        <div className="game-header">
          <div className="game-tag">CRACK THE C0D3</div>

          <button className="game-exit" onClick={() => finishGame("lost")}>
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
            <strong>
              {attempts} / {maxAttempts || "-"}
            </strong>
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

        {guesses.length > 0 && (
          <div className="game-history">
            <h3>Tentativas realizadas</h3>
            <ul>
              {[...guesses].reverse().map((item, idx) => {
                const attemptNumber = guesses.length - idx;
                return (
                  <li key={idx}>
                    <span className="attempt-number">{attemptNumber}</span>
                    <strong>{item.guess}</strong>
                    <span>{item.bons} bons</span>
                    <span>{item.otimos} ótimos</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}

export default Game;