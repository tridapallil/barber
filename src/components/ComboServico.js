'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizar } from '@/lib/format';

/**
 * Campo de serviço: escolhe um já cadastrado ou digita um novo.
 * O que for digitado é salvo junto com o atendimento e passa a aparecer na lista.
 */
export default function ComboServico({ valor, aoMudar, tipos, id = 'servico-nome' }) {
  const [aberto, setAberto] = useState(false);
  const [marcado, setMarcado] = useState(0);
  const caixa = useRef(null);

  const sugestoes = useMemo(() => {
    const busca = normalizar(valor);
    const lista = [...tipos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (!busca) return lista.slice(0, 40);
    return lista.filter((t) => normalizar(t.nome).includes(busca)).slice(0, 40);
  }, [tipos, valor]);

  const ehNovo = valor.trim().length > 0 && !tipos.some((t) => normalizar(t.nome) === normalizar(valor));
  const opcoes = ehNovo ? [{ id: '__novo__', nome: valor.trim(), novo: true }, ...sugestoes] : sugestoes;

  useEffect(() => {
    function aoClicarFora(e) {
      if (caixa.current && !caixa.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  useEffect(() => setMarcado(0), [valor]);

  function escolher(opcao) {
    aoMudar(opcao.nome);
    setAberto(false);
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
    }
  }

  return (
    <div className="combo" ref={caixa}>
      <input
        id={id}
        className="entrada"
        value={valor}
        placeholder="Ex.: Corte, escova, manicure…"
        onChange={(e) => {
          aoMudar(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={aoTeclar}
        autoComplete="off"
        role="combobox"
        aria-expanded={aberto}
        aria-autocomplete="list"
      />

      {aberto ? (
        <div className="combo-lista" role="listbox">
          {opcoes.length === 0 ? (
            <div className="combo-vazio">Digite o nome do serviço</div>
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
                <span>{opcao.nome}</span>
                {opcao.novo ? <span className="novo">NOVO</span> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
