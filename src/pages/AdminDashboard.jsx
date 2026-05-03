import { useEffect, useState } from "react";
import api from "../api/api";
import "./AdminDashboard.css";

const soundCommands = [
  { label: "Som sucesso", command: "sound_success" },
  { label: "Som erro", command: "sound_error" },
  { label: "Som hacker", command: "sound_hacker" },
  { label: "Parar som", command: "sound_stop" },
];

function AdminDashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function loadDevices() {
    try {
      setErro("");
      const response = await api.get("/devices");
      setDevices(response.data);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os cofres.");
    } finally {
      setLoading(false);
    }
  }

  async function sendCommand(deviceId, command, payload = {}) {
    try {
      await api.post(`/devices/${deviceId}/command`, {
        command,
        payload,
      });

      await loadDevices();
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar comando para o cofre.");
    }
  }

  useEffect(() => {
    loadDevices();

    const interval = setInterval(loadDevices, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div className="admin-tag">ADMIN</div>

        <h1>Dashboard dos cofres</h1>

        <p>
          Gerencie os dispositivos online, visualize filas, senha atual e o
          jogador ativo em cada cofre.
        </p>
      </section>

      {loading && <p className="admin-loading">Carregando cofres...</p>}
      {erro && <p className="admin-error">{erro}</p>}

      <section className="devices-grid">
        {devices.map((device, index) => {
          const deviceId = device.deviceId || device._id || device.id || device;
          const deviceName =
            device.nome || device.name || device.deviceId || `Cofre ${index + 1}`;

          return (
            <DeviceCard
              key={deviceId}
              deviceId={deviceId}
              deviceName={deviceName}
              device={device}
              onCommand={sendCommand}
            />
          );
        })}
      </section>
    </main>
  );
}

function DeviceCard({ deviceId, deviceName, device, onCommand }) {
  const [color, setColor] = useState("#ed145b");
  const [newPassword, setNewPassword] = useState("");

  const queue = device.queue || device.fila || [];
  const currentPlayer =
    device.currentPlayer ||
    device.jogadorAtual ||
    device.currentUser ||
    device.attacker ||
    null;

  const password =
    device.password ||
    device.senha ||
    device.currentPassword ||
    "Não informada";

  const isOpen = device.isOpen || device.open || false;
  const internalLight = device.internalLight || device.luzInterna || false;

  function handleChangePassword() {
    if (!newPassword.trim()) {
      alert("Digite uma nova senha.");
      return;
    }

    onCommand(deviceId, "change_password", {
      password: newPassword,
    });

    setNewPassword("");
  }

  return (
    <article className="device-card">
      <div className="device-card-header">
        <div>
          <span className="device-label">Dispositivo</span>
          <h2>{deviceName}</h2>
        </div>

        <span className={device.online ? "status online" : "status offline"}>
          {device.online ? "Online" : "Offline"}
        </span>
      </div>

      <div className="device-info-grid">
        <div className="info-box">
          <span>Senha atual</span>
          <strong>{password}</strong>
        </div>

        <div className="info-box">
          <span>Jogador atual</span>
          <strong>
            {currentPlayer?.nome_completo ||
              currentPlayer?.name ||
              currentPlayer?.email ||
              "Ninguém jogando"}
          </strong>
        </div>
      </div>

      <div className="toggle-row">
        <span>Cofre</span>

        <button
          className={isOpen ? "toggle active" : "toggle"}
          onClick={() => onCommand(deviceId, isOpen ? "close" : "open")}
        >
          {isOpen ? "Aberto" : "Fechado"}
        </button>
      </div>

      <div className="toggle-row">
        <span>Luz interna</span>

        <button
          className={internalLight ? "toggle active" : "toggle"}
          onClick={() =>
            onCommand(
              deviceId,
              internalLight ? "internal_light_off" : "internal_light_on"
            )
          }
        >
          {internalLight ? "Ligada" : "Desligada"}
        </button>
      </div>

      <div className="actions-grid">
        <button onClick={() => onCommand(deviceId, "open")}>Abrir</button>
        <button onClick={() => onCommand(deviceId, "close")}>Fechar</button>
        <button onClick={() => onCommand(deviceId, "internal_light_on")}>
          Ligar luz interna
        </button>
        <button onClick={() => onCommand(deviceId, "internal_light_off")}>
          Desligar luz interna
        </button>
        <button onClick={() => onCommand(deviceId, "lights_off")}>
          Apagar todas as luzes
        </button>
        <button onClick={() => onCommand(deviceId, "reset")}>
          Resetar cofre
        </button>
      </div>

      <div className="color-control">
        <label>Cor do cofre</label>

        <div className="color-row">
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />

          <button
            onClick={() =>
              onCommand(deviceId, "set_color", {
                color,
              })
            }
          >
            Definir cor
          </button>
        </div>
      </div>

      <div className="password-control">
        <label>Trocar senha</label>

        <div className="password-row">
          <input
            type="text"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Nova senha"
          />

          <button onClick={handleChangePassword}>Trocar</button>
        </div>
      </div>

      <div className="sound-control">
        <label>Controle de som</label>

        <div className="sound-grid">
          {soundCommands.map((item) => (
            <button
              key={item.command}
              onClick={() => onCommand(deviceId, item.command)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="queue-box">
        <label>Pessoas na fila</label>

        {queue.length > 0 ? (
          <ul>
            {queue.map((person, index) => (
              <li key={person._id || person.id || index}>
                <span>{index + 1}º</span>
                {person.nome_completo || person.name || person.email || person}
              </li>
            ))}
          </ul>
        ) : (
          <p>Ninguém na fila.</p>
        )}
      </div>
    </article>
  );
}

export default AdminDashboard;