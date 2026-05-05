import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.clear();
    navigate("/admin/login", { replace: true });
  }

  async function loadDevices() {
    try {
      setErro("");

      const devicesResponse = await api.get("/devices");

      const devicesWithQueue = await Promise.all(
        devicesResponse.data.map(async (device) => {
          try {
            const queueResponse = await api.get(`/queue/${device.deviceId}`);

            return {
              ...device,
              queue: Array.isArray(queueResponse.data)
                ? queueResponse.data
                : queueResponse.data?.queue || [],
            };
          } catch (error) {
            console.error(`Erro ao carregar fila do ${device.deviceId}:`, error);
            return { ...device, queue: [] };
          }
        })
      );

      setDevices(devicesWithQueue);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os cofres.");
    } finally {
      setLoading(false);
    }
  }

  async function updateDeviceStatus(deviceId, status) {
    try {
      await api.patch("/devices/updateStatus", {
        deviceId,
        status,
      });

      await loadDevices();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Erro ao atualizar status do cofre."
      );
    }
  }

  async function sendCommand(deviceId, command, payload = {}) {
    try {
      let commands = [];

      switch (command) {

        case "set_servo_angles":
          commands = [
            {
              command: "SET_SERVO",
              open: payload.open,
              close: payload.close,
            },
          ];
          break;

        case "open":
          commands = [{ command: "LOCK", value: "OPEN" }];
          break;

        case "close":
          commands = [{ command: "LOCK", value: "CLOSE" }];
          break;

        case "servo_angle":
          commands = [{ command: "LOCK", value: payload.angle }];
          break;

        case "internal_light_on":
          commands = [{ command: "LED_INTERNAL", value: true }];
          break;

        case "internal_light_off":
          commands = [{ command: "LED_INTERNAL", value: false }];
          break;

        case "smoke_on":
          commands = [{ command: "SMOKE", value: true }];
          break;

        case "smoke_off":
          commands = [{ command: "SMOKE", value: false }];
          break;

        case "lights_off":
          commands = [{ command: "LEDS_OFF", value: true }];
          break;

        case "reset":
          commands = [{ command: "RESET", value: true }];
          break;

        case "set_color": {
          const hex = payload.color.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);

          commands = [{ command: "LED", target: "STRIP1", r, g, b }];
          break;
        }

        case "volume":
          commands = [
            {
              command: "SOUND",
              action: "SET_VOLUME",
              value: payload.value,
            },
          ];
          break;

        case "sound_success":
          commands = [{ command: "SOUND", action: "PLAY", track: 1 }];
          break;

        case "sound_error":
          commands = [{ command: "SOUND", action: "PLAY", track: 2 }];
          break;

        case "sound_hacker":
          commands = [{ command: "SOUND", action: "PLAY", track: 3 }];
          break;

        case "sound_stop":
          commands = [{ command: "SOUND", action: "STOP" }];
          break;

        case "sound_play_track":
          commands = [
            {
              command: "SOUND",
              action: "PLAY",
              track: payload.track,
            },
          ];
          break;

        default:
          console.warn("Comando desconhecido:", command);
          return;
      }

      await api.post("/commands", {
        deviceId,
        commands,
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
        <div className="admin-header-top">
          <div className="admin-tag">ADMIN</div>

          <button className="admin-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>

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
          const deviceId = device.deviceId || device._id || device.id;
          const deviceName =
            device.nome || device.name || device.deviceId || `Cofre ${index + 1}`;

          return (
            <DeviceCard
              key={deviceId}
              deviceId={deviceId}
              deviceName={deviceName}
              device={device}
              onCommand={sendCommand}
              onStatusChange={updateDeviceStatus}
            />
          );
        })}
      </section>
    </main>
  );
}

function DeviceCard({ deviceId, deviceName, device, onCommand, onStatusChange }) {
  const [color, setColor] = useState("#ed145b");
  const [newPassword, setNewPassword] = useState("");
  const [queueUsers, setQueueUsers] = useState([]);
  const [volume, setVolume] = useState(20);
  const [selectedTrack, setSelectedTrack] = useState(1);

  const [openAngle, setOpenAngle] = useState(30);
  const [closeAngle, setCloseAngle] = useState(160);
  const [testAngle, setTestAngle] = useState(45);

  const queue = Array.isArray(device.queue) ? device.queue : [];
  const currentPlayer = queue.find((person) => person.status === "active");

  const password = device.secret || "Não informada";
  const isOpen =
    device.hardware?.door?.open ||
    device.status === "unlocked" ||
    device.status === "open";

  const internalLight =
    device.hardware?.internalLight?.active || false;

  const smokeActive =
    device.hardware?.smoke?.active || false;
  const isOnline = String(device.state).toLowerCase() === "online";

  useEffect(() => {
    async function loadQueueUsers() {
      if (queue.length === 0) {
        setQueueUsers([]);
        return;
      }

      const users = await Promise.all(
        queue.map(async (person) => {
          if (!person.userId) {
            return { ...person, nome: "Usuário sem identificação" };
          }

          try {
            const response = await api.get(`/users/${person.userId}`);

            return {
              ...person,
              nome: response.data.nome || response.data.email || person.userId,
            };
          } catch (error) {
            console.error(`Erro ao buscar usuário ${person.userId}:`, error);
            return { ...person, nome: "Usuário não encontrado" };
          }
        })
      );

      setQueueUsers(users);
    }

    loadQueueUsers();
  }, [queue]);

  function handleVolumeChange(newVolume) {
    if (newVolume < 0 || newVolume > 50) {
      alert("Volume deve estar entre 0 e 50");
      return;
    }

    setVolume(newVolume);

    onCommand(deviceId, "volume", {
      value: newVolume,
    });
  }

  async function handleChangePassword() {
    const password = newPassword.trim();

    if (!password) {
      alert("Digite uma nova senha.");
      return;
    }

    if (!/^\d{4}$/.test(password)) {
      alert("A senha deve conter exatamente 4 números.");
      return;
    }

    if (new Set(password).size !== password.length) {
      alert("A senha não pode repetir números.");
      return;
    }

    try {
      await api.patch("/devices/changePass", {
        deviceId,
        secret: password,
      });

      setNewPassword("");
      alert("Senha alterada com sucesso.");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Erro ao trocar senha do cofre.");
    }
  }

  function generatePassword() {
    const numbers = [];

    while (numbers.length < 4) {
      const n = Math.floor(Math.random() * 10).toString();

      if (!numbers.includes(n)) {
        numbers.push(n);
      }
    }

    setNewPassword(numbers.join(""));
  }

  return (
    <article className="device-card">
      <div className="device-card-header">
        <div>
          <span className="device-label">Dispositivo</span>
          <h2>{deviceName}</h2>
        </div>

        <span className={isOnline ? "status online" : "status offline"}>
          {isOnline ? "Online" : "Offline"}
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
            {currentPlayer
              ? queueUsers.find((user) => user._id === currentPlayer._id)?.nome ||
                currentPlayer.userId
              : "Ninguém jogando"}
          </strong>
        </div>

        <div className="info-box">
          <span>Status do cofre</span>

          <select
            className="device-status-select"
            value={device.status || "locked"}
            onChange={(event) => onStatusChange(deviceId, event.target.value)}
          >
            <option value="locked">Locked</option>
            <option value="blocked">Blocked</option>
            <option value="unlocked">Unlocked</option>
          </select>
        </div>
      </div>

      <div className="toggles-panel">
        <div className="toggle-item">
          <span>Cofre</span>

          <div className="toggle-status">
            <strong>{isOpen ? "Aberto" : "Fechado"}</strong>

            <button
              className={`switch ${isOpen ? "active" : ""}`}
              onClick={() => onCommand(deviceId, isOpen ? "close" : "open")}
              type="button"
            >
              <span></span>
            </button>
          </div>
        </div>

        <div className="toggle-item">
          <span>Luz interna</span>

          <div className="toggle-status">
            <strong>{internalLight ? "Ligada" : "Desligada"}</strong>

            <button
              className={`switch ${internalLight ? "active" : ""}`}
              onClick={() =>
                onCommand(
                  deviceId,
                  internalLight ? "internal_light_off" : "internal_light_on"
                )
              }
              type="button"
            >
              <span></span>
            </button>
          </div>
        </div>

        <div className="toggle-item">
          <span>Fumaça</span>

          <div className="toggle-status">
            <strong>{smokeActive ? "Ligada" : "Desligada"}</strong>

            <button
              className={`switch ${smokeActive ? "active" : ""}`}
              onClick={() =>
                onCommand(deviceId, smokeActive ? "smoke_off" : "smoke_on")
              }
              type="button"
            >
              <span></span>
            </button>
          </div>
        </div>
      </div>

      <div className="servo-control">
        <label>Ajuste fino da porta</label>

        <div className="servo-row">
          <input
            type="number"
            min="0"
            max="180"
            value={openAngle}
            onChange={(e) => setOpenAngle(Number(e.target.value))}
            placeholder="Aberto"
          />

          <input
            type="number"
            min="0"
            max="180"
            value={closeAngle}
            onChange={(e) => setCloseAngle(Number(e.target.value))}
            placeholder="Fechado"
          />

          <button
            type="button"
            onClick={() =>
              onCommand(deviceId, "set_servo_angles", {
                open: openAngle,
                close: closeAngle,
              })
            }
          >
            Salvar
          </button>
        </div>

        <div className="servo-row">
          <input
            type="number"
            min="0"
            max="180"
            value={testAngle}
            onChange={(e) => setTestAngle(Number(e.target.value))}
            placeholder="Ângulo teste"
          />

          <button
            type="button"
            onClick={() =>
              onCommand(deviceId, "servo_angle", {
                angle: testAngle,
              })
            }
          >
            Testar ângulo
          </button>
        </div>
      </div>

      <div className="volume-control">
        <label>Volume do som</label>

        <div className="volume-row">
          <button
            onClick={() =>
              handleVolumeChange(Math.max(volume - 1, 0))
            }
          >
            -
          </button>

          <input
            type="number"
            min="0"
            max="30"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />

          <button
            onClick={() =>
              handleVolumeChange(Math.min(volume + 1, 30))
            }
          >
            +
          </button>

          <button
            className="btn-set"
            onClick={() => handleVolumeChange(volume)}
          >
            SET
          </button>
        </div>
      </div>

      <div className="actions-grid">
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
            inputMode="numeric"
            maxLength="4"
            value={newPassword}
            onChange={(event) => {
              const onlyNumbers = event.target.value.replace(/\D/g, "");
              setNewPassword(onlyNumbers);
            }}
            placeholder="Nova senha"
          />

          <button onClick={handleChangePassword}>Trocar</button>

          <button type="button" onClick={generatePassword} className="btn-secondary">
            Gerar
          </button>
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
      <div className="sound-track-control">

        <label>Selecionar faixa</label>

        <div className="sound-track-row">
          <select
            value={selectedTrack}
            onChange={(event) => setSelectedTrack(Number(event.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((track) => (
              <option key={track} value={track}>
                Faixa {track}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              onCommand(deviceId, "sound_play_track", {
                track: selectedTrack,
              })
            }
          >
            Play
          </button>
        </div>
      </div>

      <div className="queue-box">
        <label>Pessoas na fila</label>

        {queueUsers.length > 0 ? (
          <ul>
            {queueUsers.map((person, index) => (
              <li key={person._id || person.userId || index}>
                <span>{index + 1}º</span>
                {person.nome} — {person.status}
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