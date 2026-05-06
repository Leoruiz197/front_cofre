import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Rules.css";

function Rules() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [erro, setErro] = useState("");

  const currentHour = new Date().getHours();
  const activityNotStarted = currentHour < 14;

  useEffect(() => {
    async function loadDevices() {
      try {
        setErro("");
        setLoadingDevices(true);

        const response = await api.get("/devices/available");
        console.log("DEVICES:", response.data);

        setDevices(response.data);
      } catch (error) {
        console.error(error);
        setErro("Não foi possível carregar os cofres disponíveis.");
      } finally {
        setLoadingDevices(false);
      }
    }

    loadDevices();
  }, []);

  async function handleJoinQueue() {
    setErro("");

    if (activityNotStarted) {
      setErro("A atividade estará disponível somente a partir das 14h.");
      return;
    }

    if (!selectedDevice) {
      setErro("Selecione um cofre antes de entrar na fila.");
      return;
    }

    setLoadingJoin(true);

    try {
      const response = await api.post("/queue/join", {
        deviceId: selectedDevice,
      });

      sessionStorage.setItem("queue", JSON.stringify(response.data));
      sessionStorage.setItem("deviceId", selectedDevice);
      sessionStorage.removeItem("queueDeadline");

      navigate("/queue");
    } catch (error) {
      console.error(error);

      const mensagem =
        error.response?.data?.message ||
        "Não foi possível entrar na fila. Tente novamente.";

      setErro(mensagem);
    } finally {
      setLoadingJoin(false);
    }
  }

  return (
    <main className="rules-page">
      <section className="rules-container">
        <div className="rules-header">
          <div className="rules-tag">ANTES DE COMEÇAR</div>

          <button className="btn-back" onClick={() => navigate("/")}>
            ← Voltar
          </button>
        </div>

        <h1>Regras do desafio</h1>

        <p className="rules-intro">
          Leia as instruções antes de entrar na fila. Quando chegar sua vez,
          você terá um tempo limitado para tentar decifrar o código do cofre.
        </p>

        <div className="rules-alert">
          A atividade estará disponível somente no período da tarde, a partir das 14h.
        </div>

        <div className="rules-list">
          <div className="rule-card">
            <span>01</span>
            <p>Entre na fila e aguarde sua vez para iniciar o desafio.</p>
          </div>

          <div className="rule-card">
            <span>02</span>
            <p>Quando o jogo começar, tente descobrir a combinação correta.</p>
          </div>

          <div className="rule-card">
            <span>03</span>
            <p>Você terá um tempo limitado para enviar suas tentativas.</p>
          </div>

          <div className="rule-card">
            <span>04</span>
            <p>Ao acertar o código, o sistema enviará o comando para o dispositivo.</p>
          </div>

          <div className="rule-card">
            <span>05</span>
            <p>Se sair da página ou abandonar o jogo, sua vez poderá ser encerrada.</p>
          </div>
        </div>

        <div className="device-select-box">
          <label>Escolha o cofre</label>

          <select
            value={selectedDevice}
            onChange={(event) => setSelectedDevice(event.target.value)}
            disabled={loadingDevices || activityNotStarted}
          >
            <option value="">
              {loadingDevices ? "Carregando cofres..." : "Selecione um cofre"}
            </option>

            {devices.map((device, index) => {
              const deviceValue =
                typeof device === "string"
                  ? device
                  : device.deviceId || device._id || device.id;

              const deviceLabel =
                typeof device === "string"
                  ? device
                  : device.nome || device.name || device.deviceId || `Cofre ${index + 1}`;

              return (
                <option key={deviceValue} value={deviceValue}>
                  {deviceLabel}
                </option>
              );
            })}
          </select>
        </div>

        {erro && <p className="rules-error">{erro}</p>}

        <button
          className="rules-button"
          onClick={handleJoinQueue}
          disabled={loadingJoin || loadingDevices || activityNotStarted}
        >
          {activityNotStarted
            ? "Atividade disponível após as 14h"
            : loadingJoin
            ? "Entrando na fila..."
            : "Aceitar regras e entrar na fila"}
        </button>
      </section>
    </main>
  );
}

export default Rules;