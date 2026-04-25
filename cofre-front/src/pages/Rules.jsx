import "./Rules.css";

function Rules() {
  function handleAcceptRules() {
    // depois vamos trocar isso para navegar para /queue
    console.log("Regras aceitas");
  }

  return (
    <main className="rules-page">
      <section className="rules-container">
        <div className="rules-tag">ANTES DE COMEÇAR</div>

        <h1>Regras do desafio</h1>

        <p className="rules-intro">
          Leia as instruções antes de entrar na fila. Quando chegar sua vez,
          você terá um tempo limitado para tentar decifrar o código do cofre.
        </p>

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

        <button className="rules-button" onClick={handleAcceptRules}>
          Aceitar regras e entrar na fila
        </button>
      </section>
    </main>
  );
}

export default Rules;