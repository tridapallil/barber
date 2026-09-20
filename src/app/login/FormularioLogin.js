'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconeCadeado, IconeTesoura, IconeUsuario } from '@/components/Icones';

export default function FormularioLogin() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const resposta = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || 'Não foi possível entrar.');
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <div className="logo" style={{ width: 56, height: 56, borderRadius: 19 }}>
            <IconeTesoura size={25} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 500, letterSpacing: '-0.038em' }}>Bem-vinda de volta</h1>
            <p className="subtitulo">Entre para ver clientes e atendimentos</p>
          </div>
        </div>

        <form onSubmit={enviar} className="pilha" style={{ gap: 14 }}>
          <div className="campo">
            <label className="campo-rotulo" htmlFor="usuario">Usuário</label>
            <div className="busca">
              <IconeUsuario size={18} />
              <input
                id="usuario"
                className="entrada"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="campo">
            <label className="campo-rotulo" htmlFor="senha">Senha</label>
            <div className="busca">
              <IconeCadeado size={18} />
              <input
                id="senha"
                className="entrada"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {erro ? <p className="msg-erro">{erro}</p> : null}

          <button type="submit" className="btn btn-primario btn-bloco" disabled={enviando} style={{ padding: '14px 20px', marginTop: 4 }}>
            {enviando ? <span className="carregando" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
