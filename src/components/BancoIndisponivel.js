import { IconeAlerta } from './Icones';

const TEXTOS = {
  'sem-uri': {
    titulo: 'Falta configurar o banco de dados',
    resumo: 'A variável MONGODB_URI não está definida, então o sistema não sabe onde guardar os dados.',
  },
  'sem-conexao': {
    titulo: 'Não consegui falar com o banco de dados',
    resumo: 'A MONGODB_URI está definida, mas a conexão não foi aceita.',
  },
};

export default function BancoIndisponivel({ motivo, detalhe }) {
  const { titulo, resumo } = TEXTOS[motivo] || TEXTOS['sem-conexao'];

  return (
    <div className="login-tela">
      <div className="login-cartao" style={{ maxWidth: 560 }}>
        <div className="linha" style={{ gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
          <span className="btn-circulo escuro" style={{ width: 44, height: 44 }}>
            <IconeAlerta size={19} />
          </span>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 500, letterSpacing: '-0.032em' }}>{titulo}</h1>
            <p className="subtitulo" style={{ marginTop: 6 }}>{resumo}</p>
          </div>
        </div>

        <div className="chip-linha" style={{ display: 'block', padding: '16px 18px', lineHeight: 1.6 }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--tinta-2)', marginBottom: 12 }}>
            Nas variáveis de ambiente da aplicação, confira:
          </p>
          <pre
            style={{
              margin: 0,
              fontSize: '0.8rem',
              color: 'var(--tinta)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >{`MONGODB_URI=mongodb://usuario:senha@host:27017/?authSource=admin
MONGODB_DB=salao`}</pre>
        </div>

        <ul style={{ margin: '16px 0 0', paddingLeft: 20, color: 'var(--tinta-2)', fontSize: '0.88rem', lineHeight: 1.7 }}>
          <li>Use o endereço <strong>interno</strong> do banco, não o público.</li>
          <li>Confirme que o banco está de pé e que usuário e senha conferem.</li>
          <li>
            Se o banco exige autenticação, o <code>?authSource=admin</code> costuma ser necessário.
          </li>
          <li>Depois de alterar as variáveis, faça um novo deploy.</li>
        </ul>

        {detalhe ? (
          <p className="ajuda" style={{ marginTop: 16, wordBreak: 'break-word' }}>
            Resposta do banco: {detalhe}
          </p>
        ) : null}

        <p className="ajuda" style={{ marginTop: 14 }}>
          Nenhum dado é perdido por causa disso — o sistema só volta a funcionar quando alcançar o banco.
        </p>
      </div>
    </div>
  );
}
