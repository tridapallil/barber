'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatarTelefone, iniciais, normalizar, somenteDigitos } from '@/lib/format';

/**
 * Campo de cliente com busca: filtra enquanto digita, igual ao de serviço.
 * Se o nome digitado não existir, oferece cadastrar na hora (só com o nome —
 * telefone e observações podem ser completados depois na ficha).
 */
export default function ComboCliente({ clientes, clienteId, aoMudar, aoCriar, id = 'servico-cliente' }) {
  const [texto, setTexto] = useState('');
  const [aberto, setAberto] = useState(false);
  const [marcado, setMarcado] = useState(0);
  const [criando, setCriando] = useState(false);
  const caixa = useRef(null);
  const campo = useRef(null);

  const selecionada = clientes.find((c) => c.id === clienteId) || null;

  const encontradas = useMemo(() => {
    const busca = normalizar(texto);
    const digitos = somenteDigitos(texto);
    const lista = [...clientes].sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
    if (!busca) return lista.slice(0, 50);
    return lista
      .filter((c) => {
        if (normalizar(c.nome).includes(busca)) return true;
        if (digitos && somenteDigitos(c.telefone).includes(digitos)) return true;
        return false;
      })
      .slice(0, 50);
  }, [clientes, texto]);

  const digitado = texto.trim();
  const ehNova =
    digitado.length >= 3 && !clientes.some((c) => normalizar(c.nome) === normalizar(digitado));

  /*
   * A opção de cadastrar vai no FIM quando a busca achou alguém: assim o Enter
   * seleciona a cliente encontrada, e não cria uma nova sem querer. Só sobe
   * para o topo quando não houve nenhum resultado.
   */
  const opcaoNova = { id: '__nova__', nome: digitado, nova: true };
  const opcoes = !ehNova
    ? encontradas
    : encontradas.length > 0
      ? [...encontradas, opcaoNova]
      : [opcaoNova];

  useEffect(() => {
    function aoClicarFora(e) {
      if (caixa.current && !caixa.current.contains(e.target)) {
        setAberto(false);
        setTexto('');
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  useEffect(() => setMarcado(0), [texto]);

  async function escolher(opcao) {
    if (opcao.nova) {
      setCriando(true);
      const nova = await aoCriar(opcao.nome);
      setCriando(false);
      if (!nova) return; // o formulário já mostrou o erro
      aoMudar(nova.id);
    } else {
      aoMudar(opcao.id);
    }
    setTexto('');
    setAberto(false);
    campo.current?.blur();
  }

  function aoTeclar(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAberto(true);
      setMarcado((m) => Math.min(m + 1, opcoes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMarcado((m) => Math.max(m - 1, 0));
    } else if (e.key === 'Enter' && aberto && opcoes[marcado]) {
      e.preventDefault();
      escolher(opcoes[marcado]);
    } else if (e.key === 'Escape') {
      setAberto(false);
      setTexto('');
    }
  }

  return (
    <div className="combo" ref={caixa}>
      <input
        id={id}
        ref={campo}
        className="entrada"
        value={aberto ? texto : selecionada?.nome || ''}
        placeholder={selecionada ? selecionada.nome : 'Digite o nome da cliente…'}
        onChange={(e) => {
          setTexto(e.target.value);
          setAberto(true);
        }}
        onFocus={() => {
          setTexto('');
          setAberto(true);
        }}
        onKeyDown={aoTeclar}
        autoComplete="off"
        role="combobox"
        aria-expanded={aberto}
        aria-autocomplete="list"
      />

      {criando ? (
        <span className="carregando" style={{ position: 'absolute', right: 16, top: 16 }} />
      ) : null}

      {aberto ? (
        <div className="combo-lista" role="listbox">
          {opcoes.length === 0 ? (
            <div className="combo-vazio">
              {clientes.length === 0 ? 'Nenhuma cliente cadastrada ainda' : 'Nenhuma cliente encontrada'}
            </div>
          ) : (
            opcoes.map((opcao, i) => (
              <button
                key={opcao.id}
                type="button"
                role="option"
                aria-selected={i === marcado}
                className={`combo-item ${i === marcado ? 'marcado' : ''}`}
                onMouseEnter={() => setMarcado(i)}
                onClick={() => escolher(opcao)}
              >
                <span className="linha" style={{ gap: 10, minWidth: 0 }}>
                  <span className="avatar" style={{ width: 28, height: 28, fontSize: '0.66rem' }}>
                    {iniciais(opcao.nome)}
                  </span>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {opcao.nome}
                    {opcao.telefone ? (
                      <span style={{ opacity: 0.6, fontSize: '0.82rem' }}> · {formatarTelefone(opcao.telefone)}</span>
                    ) : null}
                  </span>
                </span>
                {opcao.nova ? <span className="novo">CADASTRAR</span> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
