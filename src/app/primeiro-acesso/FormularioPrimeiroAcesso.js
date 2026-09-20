'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconeCadeado, IconeCheck, IconeTesoura, IconeUsuario } from '@/components/Icones';

export default function FormularioPrimeiroAcesso({ minUsuario, minSenha }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const senhaCurta = senha.length > 0 && senha.length < minSenha;
  const diferentes = confirmacao.length > 0 && senha !== confirmacao;

  async function enviar(e) {
    e.preventDefault();
    if (senha !== confirmacao) {
      setErro('As senhas não são iguais.');
      return;
    }
    setErro('');
    setEnviando(true);
    try {
      const resposta = await fetch('/api/primeiro-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha, confirmacao }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || 'Não foi possível criar o acesso.');
        setEnviando(false);
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setErro('Falha de conexão. Tente de novo.');
      setEnviando(false);
    }
  }

  return (
    <div className="login-tela">
      <div className="login-cartao">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div className="logo" style={{ width: 56, height: 56, borderRadius: 19 }}>
            <IconeTesoura size={25} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.038em' }}>Vamos começar</h1>
            <p className="subtitulo">Crie o acesso que você vai usar para entrar no sistema</p>
          </div>
        </div>

        <form onSubmit={enviar} className="pilha" style={{ gap: 14 }}>
          <div className="campo">
            <label className="campo-rotulo" htmlFor="usuario">Nome de usuário</label>
            <div className="busca">
              <IconeUsuario size={18} />
              <input
                id="usuario"
                className="entrada"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value.trim())}
                placeholder="Ex.: maria"
                autoComplete="username"
                autoCapitalize="none"
                minLength={minUsuario}
                autoFocus
                required
              />
            </div>
            <span className="ajuda">Pelo menos {minUsuario} letras. É o que você digita para entrar.</span>
          </div>

          <div className="campo">
            <label className="campo-rotulo" htmlFor="senha">Senha</label>
            <div className="busca">
              <IconeCadeado size={18} />
              <input
                id="senha"
                className={`entrada ${senhaCurta ? 'erro' : ''}`}
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="new-password"
                minLength={minSenha}
                required
              />
            </div>
            <span className={senhaCurta ? 'msg-erro' : 'ajuda'}>
              Pelo menos {minSenha} caracteres.
            </span>
          </div>

          <div className="campo">
            <label className="campo-rotulo" htmlFor="confirmacao">Repita a senha</label>
            <div className="busca">
              {confirmacao.length > 0 && !diferentes ? <IconeCheck size={18} /> : <IconeCadeado size={18} />}
              <input
                id="confirmacao"
                className={`entrada ${diferentes ? 'erro' : ''}`}
                type="password"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            {diferentes ? <span className="msg-erro">As senhas não são iguais.</span> : null}
          </div>

          {erro ? <p className="msg-erro">{erro}</p> : null}

          <button
            type="submit"
            className="btn btn-primario btn-bloco"
            disabled={enviando || senhaCurta || diferentes}
            style={{ padding: '14px 20px', marginTop: 4 }}
          >
            {enviando ? <span className="carregando" /> : 'Criar acesso e entrar'}
          </button>
        </form>

        <div className="login-dica">
          Esta tela só aparece uma vez. Anote a senha — não há como recuperá-la.
        </div>
      </div>
    </div>
  );
}
