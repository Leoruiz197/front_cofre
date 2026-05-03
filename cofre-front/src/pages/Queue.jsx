import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Queue.css";

function Queue() {
  const navigate = useNavigate();

  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [erro, setErro] = useState("");
  const [countdown, setCountdown] = useState(60);

  const deviceId = sessionStorage.getItem("deviceId");

  async function loadPosition() {
    try {
      if (!deviceId) {
        navigate("/");
        return;
      }

      const response = await api.get(`/queue/position/${deviceId}`);

      setPosition(response.data.position);
      setErro("");
    } catch (error) {
      console.error(error);

      const mensagem =
        error.response?.data?.message ||
        "Não foi possível atualizar sua posição na fila.";

      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }

  async function leaveQueueAndLogout() {
    try {
      if (deviceId) {
        await api.post("/queue/leave", { deviceId });
      }
    } catch (error) {
      console.error("Erro ao sair da fila:", error);
    } finally {
      sessionStorage.clear();
      navigate("/");
    }
  }

  async function handleStartGame() {
    setStarting(true);
    setErro("");

    try {
      await api.post("/queue/start", { deviceId });

      sessionStorage.removeItem("queueDeadline");

      navigate("/game");
    } catch (error) {
      console.error(error);

      const reason = error.response?.data?.reason;

      if (reason === "SAFE_OPENED") {
        sessionStorage.clear();

        setErro("O cofre já foi aberto. A fila foi encerrada.");

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 5000);

        return;
      }

      const mensagem =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Não foi possível iniciar o jogo.";

      setErro(mensagem);
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    loadPosition();

    const interval = setInterval(() => {
        loadPosition();
    }, 3000);

    return () => clearInterval(interval);
    }, [deviceId]);

  useEffect(() => {
    if (position === null) {
        return;
    }

    const currentPosition = Number(position);

    if (currentPosition !== 1) {
        sessionStorage.removeItem("queueDeadline");
        setCountdown(60);
        return;
    }

    let deadline = sessionStorage.getItem("queueDeadline");

    if (!deadline) {
        deadline = String(Date.now() + 60 * 1000);
        sessionStorage.setItem("queueDeadline", deadline);
    }

    function updateCountdown() {
        const remaining = Math.ceil((Number(deadline) - Date.now()) / 1000);

        if (remaining <= 0) {
        setCountdown(0);
        sessionStorage.removeItem("queueDeadline");
        leaveQueueAndLogout();
        return;
        }

        setCountdown(remaining);
    }

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
    }, [position]);

  return (
    <main className="queue-page">
      <section className="queue-container">
        <div className="queue-header">
          <div className="queue-tag">FILA DO COFRE</div>

          <button className="queue-exit" onClick={leaveQueueAndLogout}>
            Sair da fila
          </button>
        </div>

        <h1>Aguarde sua vez</h1>

        <p className="queue-intro">
          Sua posição será atualizada automaticamente. Quando você for o primeiro
          da fila, terá 1 minuto para entrar no jogo.
        </p>

        <div className="queue-card">
          {loading ? (
            <p className="queue-loading">Carregando posição...</p>
          ) : (
            <>
              <span className="queue-label">Sua posição atual</span>

              <strong className="queue-position">
                {position ? `${position}º` : "-"}
              </strong>

              {position === 1 ? (
                <p className="queue-ready">
                  Sua vez chegou. Entre no jogo antes que o tempo acabe.
                </p>
              ) : (
                <p className="queue-waiting">
                  Aguarde. Sua vez está se aproximando.
                </p>
              )}
            </>
          )}
        </div>

        {position === 1 && (
          <div className="queue-action-box">
            <div className="queue-countdown">
              <span>Tempo para entrar</span>
              <strong>{countdown}s</strong>
            </div>

            <button
              className="queue-button"
              onClick={handleStartGame}
              disabled={starting}
            >
              {starting ? "Iniciando..." : "Entrar no jogo"}
            </button>
          </div>
        )}

        {erro && <p className="queue-error">{erro}</p>}
      </section>
    </main>
  );
}

export default Queue;