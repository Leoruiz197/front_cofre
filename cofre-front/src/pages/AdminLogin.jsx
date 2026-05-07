import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setErro("");

    if (!email.trim() || !senha.trim()) {
        setErro("Preencha e-mail e senha.");
        return;
    }

    setLoading(true);

    try {
        const response = await api.post("/admin/login", {
        email,
        senha,
        });

        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("admin", JSON.stringify(response.data.admin));

        navigate("/admin/dashboard");
    } catch (error) {
        console.error("ERRO LOGIN ADMIN:", error);

        const mensagem =
        error.response?.data?.message || "E-mail ou senha inválidos.";

        setErro(mensagem);
    } finally {
        setLoading(false);
    }
}

  return (
    <main className="admin-login-page">
      <section className="admin-login-box">
        <div className="admin-tag">ADMIN</div>

        <h1>Login Administrativo</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <div className="password-field">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
            />

            <button
              type="button"
              className="password-eye"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? "HIDE" : "SHOW"}
            </button>
          </div>

          {erro && <p className="admin-error">{erro}</p>}

          <button className="admin-login-button" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLogin;