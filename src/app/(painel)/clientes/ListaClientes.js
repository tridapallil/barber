'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import FormularioCliente from '@/components/FormularioCliente';
import Confirmar from '@/components/Confirmar';
import { useAviso } from '@/components/Avisos';
import { useAtualizar } from '@/components/Progresso';
import {
  IconeArquivo,
  IconeBusca,
  IconeClientes,
  IconeLapis,
  IconeLixeira,
  IconeMais,
  IconeX,
} from '@/components/Icones';
import { formatarData, formatarMoeda, formatarTelefone, iniciais, normalizar, somenteDigitos } from '@/lib/format';

const ORDENS = [
  ['nome', 'A–Z'],
  ['recentes', 'Atendidas há pouco'],
  ['atendimentos', 'Mais atendimentos'],
];

export default function ListaClientes({ clientes }) {
  const router = useRouter();
  const parametros = useSearchParams();
  const avisar = useAviso();
  const { atualizar } = useAtualizar();

  const campoBusca = useRef(null);
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState('nome');
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [abrindo, setAbrindo] = useState(null);
  const [navegando, iniciarNavegacao] = useTransition();

  // Atalho do rail: /clientes?novo=1 já abre o cadastro.
  useEffect(() => {
    if (parametros.get('novo') === '1') {
      setCriando(true);
      router.replace('/clientes', { scroll: false });
    }
  }, [parametros, router]);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca);
    const digitos = somenteDigitos(busca);
    let lista = clientes;

    if (termo) {
      lista = clientes.filter((c) => {
        if (normalizar(c.nome).includes(termo)) return true;
        if (normalizar(c.descricao).includes(termo)) return true;
        if (digitos && somenteDigitos(c.telefone).includes(digitos)) return true;
        return false;
      });
    }

    return [...lista].sort((a, b) => {
      if (ordem === 'recentes') return (b.ultima || '').localeCompare(a.ultima || '');
      if (ordem === 'atendimentos') return b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, 'pt-BR');
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }, [clientes, busca, ordem]);

  function abrir(id) {
    setAbrindo(id);
    iniciarNavegacao(() => router.push(`/clientes/${id}`));
  }

  async function excluir(cliente) {
    const resposta = await fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' });
    const dados = await resposta.json();
    if (!resposta.ok) {
      avisar(dados.erro || 'Não foi possível excluir.', 'erro');
      return;
    }
    avisar('Cliente excluída.');
    atualizar();
  }

  const totalAtendimentos = clientes.reduce((s, c) => s + c.quantidade, 0);

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <div className="migalhas">
            <span><IconeArquivo size={14} /> Salão</span>
            <span><IconeArquivo size={14} /> Cadastro</span>
          </div>
          <h1 className="titulo-pagina">Clientes</h1>
        </div>

        <div className="cabecalho-acoes">
          <span className="etiqueta etiqueta-branca" style={{ padding: '11px 18px', fontSize: '0.88rem' }}>
            {clientes.length} {clientes.length === 1 ? 'cadastrada' : 'cadastradas'}
          </span>
          <span className="etiqueta etiqueta-branca" style={{ padding: '11px 18px', fontSize: '0.88rem' }}>
            {totalAtendimentos} atendimentos
          </span>
          <button type="button" className="btn btn-primario" onClick={() => setCriando(true)}>
            <IconeMais size={17} />
            Nova cliente
          </button>
        </div>
      </div>

      <div className="pilha">
        <div className="linha envolver" style={{ gap: 10 }}>
          <div className="busca" style={{ flex: '1 1 280px' }}>
            <IconeBusca size={18} />
            <input
              ref={campoBusca}
              className="entrada"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, telefone ou observação…"
              type="search"
              aria-label="Buscar cliente"
            />
            {busca ? (
              <button type="button" className="busca-limpar" onClick={() => setBusca('')} aria-label="Limpar busca">
                <IconeX size={14} />
              </button>
            ) : null}
          </div>

          <div className="segmentos">
            {ORDENS.map(([chave, rotulo]) => (
              <button
                key={chave}
                type="button"
                className={`segmento ${ordem === chave ? 'ativo' : ''}`}
                onClick={() => setOrdem(chave)}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className="cartao">
          {filtrados.length === 0 ? (
            <div className="vazio">
              <div className="vazio-icone"><IconeClientes size={24} /></div>
              {clientes.length === 0 ? (
                <>
                  <p className="vazio-titulo">Nenhuma cliente ainda</p>
                  <p>Toque em “Nova cliente” para começar.</p>
                </>
              ) : (
                <>
                  <p className="vazio-titulo">Nada encontrado para “{busca}”</p>
                  <p>Tente outro nome ou telefone.</p>
                </>
              )}
            </div>
          ) : (
            <div className="lista">
              {filtrados.map((c) => (
                <div key={c.id} className="lista-item" onClick={() => abrir(c.id)}>
                  <div className="avatar">
                    {navegando && abrindo === c.id ? <span className="carregando" /> : iniciais(c.nome)}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Link href={`/clientes/${c.id}`} className="lista-item-titulo" onClick={(e) => e.stopPropagation()}>
                      {c.nome}
                    </Link>
                    <div className="lista-item-sub">
                      {c.telefone ? formatarTelefone(c.telefone) : 'Sem telefone'}
                      {c.quantidade > 0 ? ` · último em ${formatarData(c.ultima)}` : ' · sem atendimentos'}
                    </div>
                  </div>

                  <div className="lista-item-fim">
                    <div className="so-desktop" style={{ textAlign: 'right' }}>
                      <div className="num" style={{ fontWeight: 600 }}>{c.quantidade}</div>
                      <div className="lista-item-sub">{formatarMoeda(c.valor)}</div>
                    </div>

                    <div className="acoes-linha" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="btn-circulo" onClick={() => setEditando(c)} aria-label={`Editar ${c.nome}`}>
                        <IconeLapis size={16} />
                      </button>
                      <button type="button" className="btn-circulo perigo" onClick={() => setExcluindo(c)} aria-label={`Excluir ${c.nome}`}>
                        <IconeLixeira size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {criando ? <FormularioCliente onFechar={() => setCriando(false)} onSalvo={atualizar} /> : null}
      {editando ? <FormularioCliente cliente={editando} onFechar={() => setEditando(null)} onSalvo={atualizar} /> : null}

      {excluindo ? (
        <Confirmar
          titulo={`Excluir ${excluindo.nome}?`}
          mensagem={
            excluindo.quantidade > 0
              ? `Isso também apaga os ${excluindo.quantidade} atendimentos registrados para esta cliente. Não dá para desfazer.`
              : 'Esta ação não pode ser desfeita.'
          }
          onConfirmar={() => excluir(excluindo)}
          onFechar={() => setExcluindo(null)}
        />
      ) : null}
    </>
  );
}
