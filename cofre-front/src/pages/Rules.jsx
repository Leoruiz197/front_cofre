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

  // =========================
  // CONTROLE DE HORÁRIO
  // =========================

  const ENABLE_TIME_LOCK =
    import.meta.env.VITE_ENABLE_TIME_LOCK === "true";

  const START_HOUR = Number(
    import.meta.env.VITE_ACTIVITY_START_HOUR || 16
  );

  const currentHour = new Date().getHours();

  const activityNotStarted =
    ENABLE_TIME_LOCK && currentHour < START_HOUR;

  // =========================
  // CARREGAR COFRES
  // =========================

  useEffect(() => {
    async function loadDevices() {
      try {
        setErro("");
        setLoadingDevices(true);

        const response = await api.get("/devices/available");

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

  // =========================
  // ENTRAR NA FILA
  // =========================

  async function handleJoinQueue() {
    setErro("");

    if (activityNotStarted) {
      setErro(
        `A atividade estará disponível somente a partir das ${START_HOUR}h.`
      );

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

      sessionStorage.setItem(
        "queue",
        JSON.stringify(response.data)
      );

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

        {/* HEADER */}
        <div className="rules-header">
          <div className="rules-tag">
            ANTES DE COMEÇAR
          </div>

          <button
            className="btn-back"
            onClick={() => navigate("/")}
          >
            ← Voltar
          </button>
        </div>

        {/* TÍTULO */}
        <h1>Regras do desafio</h1>

        {/* INTRO */}
        <p className="rules-intro">
          Leia as instruções antes de entrar na fila.
          Quando chegar sua vez, você terá um tempo
          limitado para tentar decifrar o código do cofre.
        </p>

        {/* ALERTA HORÁRIO */}
        {ENABLE_TIME_LOCK && (
          <div className="rules-alert">
            A atividade estará disponível somente no período
            da tarde, a partir das {START_HOUR}h.
          </div>
        )}

        {/* REGRAS */}
        <div className="rules-list">

          <div className="rule-card">
            <span>01</span>
            <p>
              Entre na fila e aguarde sua vez para iniciar
              o desafio.
            </p>
          </div>

          <div className="rule-card">
            <span>02</span>
            <p>
              Quando o jogo começar, tente descobrir a
              combinação correta.
            </p>
          </div>

          <div className="rule-card">
            <span>03</span>
            <p>
              Você terá um tempo limitado para enviar suas
              tentativas.
            </p>
          </div>

          <div className="rule-card">
            <span>04</span>
            <p>
              Números bons são números presentes na senha, porém na posição errada, basta trocá-los de posição até virarem números ótimos.
            </p>
          </div>

          <div className="rule-card">
            <span>05</span>
            <p>
              Números ótimos são números que estão presentes na senha e na posição correta. 
              Agora, concentre-se em achar os demais números.
            </p>
          </div>

          <div className="rule-card">
            <span>06</span>
            <p>
              Ao acertar o código, o sistema enviará o
              comando para o dispositivo.
            </p>
          </div>

          <div className="rule-card">
            <span>07</span>
            <p>
              Se sair da página ou abandonar o jogo, sua vez
              poderá ser encerrada.
            </p>
          </div>
        </div>

        {/* SELECT */}
        <div className="device-select-box">
          <label>Escolha o cofre</label>

          <select
            value={selectedDevice}
            onChange={(event) =>
              setSelectedDevice(event.target.value)
            }
            disabled={
              loadingDevices || activityNotStarted
            }
          >
            <option value="">
              {loadingDevices
                ? "Carregando cofres..."
                : "Selecione um cofre"}
            </option>

            {devices.map((device, index) => {
              const deviceValue =
                typeof device === "string"
                  ? device
                  : device.deviceId ||
                    device._id ||
                    device.id;

              const deviceLabel =
                typeof device === "string"
                  ? device
                  : device.nome ||
                    device.name ||
                    device.deviceId ||
                    `Cofre ${index + 1}`;

              return (
                <option
                  key={deviceValue}
                  value={deviceValue}
                >
                  {deviceLabel}
                </option>
              );
            })}
          </select>
        </div>

        {/* ERRO */}
        {erro && (
          <p className="rules-error">
            {erro}
          </p>
        )}

        {/* BOTÃO */}
        <button
          className="rules-button"
          onClick={handleJoinQueue}
          disabled={
            loadingJoin ||
            loadingDevices ||
            activityNotStarted
          }
        >
          {activityNotStarted
            ? `Atividade disponível após as ${START_HOUR}h`
            : loadingJoin
            ? "Entrando na fila..."
            : "Aceitar regras e entrar na fila"}
        </button>

      </section>
    </main>
  );
}

export default Rules;