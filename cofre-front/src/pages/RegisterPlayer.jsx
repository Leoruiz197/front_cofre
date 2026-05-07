import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./RegisterPlayer.css";

const formacoes = [
  "Ensino Médio [incompleto]",
  "Ensino Médio [completo]",
  "Graduação [incompleta]",
  "Graduação [completa]",
  "Pós/Especialização e MBA [incompleto]",
  "Pós/Especialização e MBA [completo]",
  "Mestrado [incompleto]",
  "Mestrado [Completo]",
  "Doutorado [incompleto]",
  "Doutorado [Completo]",
];

const areas = [
  "Graduação",
  "Pós Graduação",
  "Alura",
  "PM3",
  "Soluções B2B",
  "Alura Start",
  "Cursos de curta duração",
  "Imprensa",
  "Levar a FIAP para meu evento, cidade ou escola.",
  "Divulgar vagas",
];

function RegisterPlayer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome_completo: "",
    email: "",
    telefone: "",
    formacao_academica: "",
    area_interesse: "",
  });

  const [loginEmail, setLoginEmail] = useState("");
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [aceitouLGPD, setAceitouLGPD] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function validarEmail(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regexEmail.test(email);
}

function validarTelefone(telefone) {
  const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  return regexTelefone.test(telefone);
}

async function handleSubmit(event) {
  event.preventDefault();

  setErroCadastro("");
  setErroLogin("");

  if (!validarEmail(formData.email)) {
    setErroCadastro("Digite um e-mail válido.");
    return;
  }

  if (!validarTelefone(formData.telefone)) {
    setErroCadastro("Digite um telefone válido. Exemplo: (11) 99999-9999.");
    return;
  }

  if (!aceitouLGPD) {
    setErroCadastro("Você precisa aceitar a Política de Privacidade para continuar.");
    return;
  }

  setLoadingCadastro(true);

    try {
      await api.post("/users/register", formData);

    } catch (error) {
    console.error("ERRO NO CADASTRO:", error);

    const mensagem =
      error.response?.data?.message ||
      "Não foi possível realizar o cadastro. Tente novamente.";

    setErroCadastro(mensagem);
    setLoadingCadastro(false);
    return;
  }

  try {
    const loginResponse = await api.post("/users/login", {
      email: formData.email,
    });

    sessionStorage.setItem("token", loginResponse.data.token);
    sessionStorage.setItem("player", JSON.stringify(loginResponse.data.user));

    navigate("/rules");
  } catch (error) {
    console.error("ERRO NO LOGIN AUTOMÁTICO:", error);

    setErroCadastro(
      "Cadastro realizado, mas não foi possível fazer login automático. Use o campo 'Já se cadastrou?' abaixo."
    );
  } finally {
    setLoadingCadastro(false);
  }
}

  async function handleLogin() {
  setErroLogin("");
  setErroCadastro("");

  if (!loginEmail.trim()) {
    setErroLogin("Digite seu e-mail para entrar.");
    return;
  }

  setLoadingLogin(true);

  try {
    const response = await api.post("/users/login", {
      email: loginEmail,
    });

    sessionStorage.setItem("token", response.data.token);
    sessionStorage.setItem("player", JSON.stringify(response.data.user));
    navigate("/rules");
  } catch (err) {
    console.error(err);

    const mensagem =
      err.response?.data?.message ||
      "E-mail não encontrado.";

    setErroLogin(mensagem);
  } finally {
    setLoadingLogin(false);
  }
}

  return (
    <main className="register-page">
      <section className="register-container">
        <div className="register-info">
          <div className="register-tag">Crack The C0D3</div>

          <h1>
            Antes de jogar,
            <br />
            identifique-se.
          </h1>

          <p>
            Preencha seus dados para entrar no desafio. Essas informações serão
            usadas para registrar sua participação antes de acessar a fila.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome completo</label>
            <input
              type="text"
              name="nome_completo"
              value={formData.nome_completo}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
              required
            />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              maxLength="15"
              required
            />
          </div>

          <div className="form-group">
            <label>Formação acadêmica</label>
            <select
              name="formacao_academica"
              value={formData.formacao_academica}
              onChange={handleChange}
              required
            >
              <option value="">Selecione uma opção</option>
              {formacoes.map((formacao) => (
                <option key={formacao} value={formacao}>
                  {formacao}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Área de interesse</label>
            <select
              name="area_interesse"
              value={formData.area_interesse}
              onChange={handleChange}
              required
            >
              <option value="">Selecione uma opção</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          
          <label className="lgpd-checkbox">
            <input
              type="checkbox"
              checked={aceitouLGPD}
              onChange={(e) => setAceitouLGPD(e.target.checked)}
            />

            <span>
              Li e concordo com a{" "}
              <a
                href="https://www.fiap.com.br/privacidade/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Privacidade
              </a>.
            </span>
          </label> 
          {erroCadastro && <p className="form-error">{erroCadastro}</p>}

          <button
            className="register-button"
            type="submit"
            disabled={loadingCadastro || !aceitouLGPD}
          >
            {loadingCadastro ? "Enviando..." : "Continuar para as regras"}
          </button>

          <div className="divider">ou</div>

          <div className="login-alt">
            <p>Já se cadastrou?</p>

            <div className="login-inline">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
              />

              <button
                type="button"
                className="login-button"
                onClick={handleLogin}
                disabled={loadingLogin}
              >
                {loadingLogin ? "Entrando..." : "Entrar"}
              </button>
            </div>

            {erroLogin && <p className="form-error login-error">{erroLogin}</p>}
          </div>
        </form>
      </section>
    </main>
  );
}

export default RegisterPlayer;