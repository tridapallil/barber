'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import FormularioServico from '@/components/FormularioServico';
import Confirmar from '@/components/Confirmar';
import Modal from '@/components/Modal';
import { useAviso } from '@/components/Avisos';
import { useAtualizar } from '@/components/Progresso';
import {
  IconeArquivo,
  IconeBusca,
  IconeCadeado,
  IconeEtiqueta,
  IconeLapis,
  IconeLixeira,
  IconeMais,
  IconeTesoura,
  IconeX,
} from '@/components/Icones';
import { formatarData, formatarMoeda, iniciais, normalizar } from '@/lib/format';

function ModalTipo({ tipo, onFechar, onSalvo }) {
  const avisar = useAviso();
  const [nome, setNome] = useState(tipo?.nome || '');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    if (!nome.trim()) return setErro('Informe o nome.');
    setEnviando(true);
    const resposta = await fetch(tipo ? `/api/tipos/${tipo.id}` : '/api/tipos', {
      method: tipo ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: nome.trim() }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      setErro(dados.erro || 'Não foi possível salvar.');
      setEnviando(false);
      return;
    }
    avisar(tipo ? 'Serviço atualizado.' : 'Serviço adicionado à lista.');
    onSalvo();
    onFechar();
  }

  return (
    <Modal
      titulo={tipo ? 'Editar serviço' : 'Novo serviço na lista'}
      onFechar={onFechar}
      largura={450}
      rodape={
        <>
          <button type="button" className="btn btn-claro" onClick={onFechar} disabled={enviando}>Cancelar</button>
          <button type="submit" form="form-tipo" className="btn btn-primario" disabled={enviando}>
            {enviando ? <span className="carregando" /> : 'Salvar'}
          </button>
        </>
      }
    >
      <form id="form-tipo" className="modal-corpo" onSubmit={salvar}>
        <div className="campo">
          <label className="campo-rotulo" htmlFor="tipo-nome">Nome do serviço</label>
          <input
            id="tipo-nome"
            className="entrada"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Hidratação"
            autoFocus
            required
          />
          <span className="ajuda">Serve para aparecer na lista ao registrar um atendimento.</span>
        </div>
        {erro ? <p className="msg-erro">{erro}</p> : null}
      </form>
    </Modal>
  );
}

export default function PainelServicos({ servicos, clientes, tipos, tiposComUso }) {
  const router = useRouter();
  const parametros = useSearchParams();
  const avisar = useAviso();
  const { atualizar } = useAtualizar();

  const [aba, setAba] = useState('atendimentos');
  const [busca, setBusca] = useState('');
  const [novoServico, setNovoServico] = useState(false);
  const [editandoServico, setEditandoServico] = useState(null);
  const [excluindoServico, setExcluindoServico] = useState(null);
  const [tipoModal, setTipoModal] = useState(null);
  const [excluindoTipo, setExcluindoTipo] = useState(null);

  useEffect(() => {
    if (parametros.get('novo') === '1' && clientes.length > 0) {
      setNovoServico(true);
      router.replace('/servicos', { scroll: false });
    }
  }, [parametros, router, clientes.length]);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca);
    if (!termo) return servicos;
    return servicos.filter(
      (s) =>
        normalizar(s.clienteNome).includes(termo) ||
        normalizar(s.nome).includes(termo) ||
        normalizar(s.descricao).includes(termo) ||
        normalizar(s.pagamento).includes(termo)
    );
  }, [servicos, busca]);

  const tiposFiltrados = useMemo(() => {
    const termo = normalizar(busca);
    if (!termo) return tiposComUso;
    return tiposComUso.filter((t) => normalizar(t.nome).includes(termo));
  }, [tiposComUso, busca]);

  async function excluirServico(servico) {
    const resposta = await fetch(`/api/servicos/${servico.id}`, { method: 'DELETE' });
    if (!resposta.ok) {
      const dados = await resposta.json();
      avisar(dados.erro || 'Não foi possível excluir.', 'erro');
      return;
    }
    avisar('Atendimento excluído.');
    atualizar();
  }

  async function excluirTipo(tipo) {
    const resposta = await fetch(`/api/tipos/${tipo.id}`, { method: 'DELETE' });
    const dados = await resposta.json();
    if (!resposta.ok) {
      avisar(dados.erro || 'Não foi possível excluir.', 'erro');
      return;
    }
    avisar('Serviço removido da lista.');
    atualizar();
  }

  const naAbaTipos = aba === 'tipos';
  const faturamento = servicos.reduce((s, x) => s + (Number(x.valor) || 0), 0);

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <div className="migalhas">
            <span><IconeArquivo size={14} /> Salão</span>
            <span><IconeArquivo size={14} /> Atendimentos</span>
          </div>
          <h1 className="titulo-pagina">Serviços</h1>
        </div>

        <div className="cabecalho-acoes">
          <span className="etiqueta etiqueta-branca" style={{ padding: '11px 18px', fontSize: '0.88rem' }}>
            {servicos.length} registrados
          </span>
          <span className="badge-lima" style={{ padding: '11px 16px' }}>{formatarMoeda(faturamento)}</span>
          {naAbaTipos ? (
            <button type="button" className="btn btn-primario" onClick={() => setTipoModal({ tipo: null })}>
              <IconeMais size={17} />
              Novo serviço
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primario"
              onClick={() => setNovoServico(true)}
              disabled={clientes.length === 0}
              title={clientes.length === 0 ? 'Cadastre uma cliente primeiro' : undefined}
            >
              <IconeMais size={17} />
              Novo atendimento
            </button>
          )}
        </div>
      </div>

      <div className="pilha">
        <div className="linha envolver" style={{ gap: 10 }}>
          <div className="segmentos">
            <button type="button" className={`segmento ${!naAbaTipos ? 'ativo' : ''}`} onClick={() => setAba('atendimentos')}>
              Atendimentos
            </button>
            <button type="button" className={`segmento ${naAbaTipos ? 'ativo' : ''}`} onClick={() => setAba('tipos')}>
              Lista de serviços ({tiposComUso.length})
            </button>
          </div>

          <div className="busca" style={{ flex: '1 1 260px' }}>
            <IconeBusca size={18} />
            <input
              className="entrada"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={naAbaTipos ? 'Buscar serviço na lista…' : 'Buscar por cliente, serviço ou pagamento…'}
              type="search"
              aria-label="Buscar"
            />
            {busca ? (
              <button type="button" className="busca-limpar" onClick={() => setBusca('')} aria-label="Limpar busca">
                <IconeX size={14} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="cartao">
          {naAbaTipos ? (
            tiposFiltrados.length === 0 ? (
              <div className="vazio">
                <div className="vazio-icone"><IconeEtiqueta size={24} /></div>
                <p className="vazio-titulo">Nenhum serviço na lista</p>
                <p>Adicione um, ou apenas digite o nome ao registrar um atendimento.</p>
              </div>
            ) : (
              <div className="lista">
                {tiposFiltrados.map((t) => (
                  <div key={t.id} className="lista-item" style={{ cursor: 'default' }}>
                    <div className={`avatar ${t.usos > 0 ? 'avatar-lima' : ''}`}>
                      <IconeEtiqueta size={17} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="lista-item-titulo">{t.nome}</div>
                      <div className="lista-item-sub">
                        {t.usos === 0
                          ? 'Nunca usado'
                          : `Usado em ${t.usos} ${t.usos === 1 ? 'atendimento' : 'atendimentos'}`}
                      </div>
                    </div>

                    <div className="lista-item-fim">
                      {t.usos > 0 ? (
                        <span className="etiqueta" title="Já foi usado em atendimentos, por isso não pode ser alterado nem excluído">
                          <IconeCadeado size={13} />
                          Em uso
                        </span>
                      ) : (
                        <div className="acoes-linha">
                          <button type="button" className="btn-circulo" onClick={() => setTipoModal({ tipo: t })} aria-label={`Editar ${t.nome}`}>
                            <IconeLapis size={16} />
                          </button>
                          <button type="button" className="btn-circulo perigo" onClick={() => setExcluindoTipo(t)} aria-label={`Excluir ${t.nome}`}>
                            <IconeLixeira size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filtrados.length === 0 ? (
            <div className="vazio">
              <div className="vazio-icone"><IconeTesoura size={24} /></div>
              {servicos.length === 0 ? (
                <>
                  <p className="vazio-titulo">Nenhum atendimento registrado</p>
                  <p>Toque em “Novo atendimento” para começar.</p>
                </>
              ) : (
                <>
                  <p className="vazio-titulo">Nada encontrado para “{busca}”</p>
                  <p>Tente outro termo.</p>
                </>
              )}
            </div>
          ) : (
            <div className="lista">
              {filtrados.map((s) => (
                <div key={s.id} className="lista-item" style={{ cursor: 'default' }}>
                  <div className="avatar">{iniciais(s.clienteNome)}</div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="lista-item-titulo">{s.nome}</div>
                    <div className="lista-item-sub">
                      <Link href={`/clientes/${s.clienteId}`} style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>
                        {s.clienteNome}
                      </Link>
                      {` · ${formatarData(s.data)}`}
                      {s.pagamento ? ` · ${s.pagamento}` : ''}
                    </div>
                  </div>

                  <div className="lista-item-fim">
                    {s.valor === null || s.valor === undefined || s.valor === '' ? (
                      <span className="etiqueta etiqueta-ambar">sem valor</span>
                    ) : (
                      <span className="num" style={{ fontWeight: 600 }}>{formatarMoeda(s.valor)}</span>
                    )}
                    <div className="acoes-linha">
                      <button type="button" className="btn-circulo" onClick={() => setEditandoServico(s)} aria-label="Editar atendimento">
                        <IconeLapis size={16} />
                      </button>
                      <button type="button" className="btn-circulo perigo" onClick={() => setExcluindoServico(s)} aria-label="Excluir atendimento">
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

      {novoServico ? (
        <FormularioServico clientes={clientes} tipos={tipos} onFechar={() => setNovoServico(false)} onSalvo={atualizar} />
      ) : null}

      {editandoServico ? (
        <FormularioServico
          servico={editandoServico}
          clientes={clientes}
          tipos={tipos}
          onFechar={() => setEditandoServico(null)}
          onSalvo={atualizar}
        />
      ) : null}

      {excluindoServico ? (
        <Confirmar
          titulo="Excluir atendimento?"
          mensagem={`“${excluindoServico.nome}” de ${excluindoServico.clienteNome} em ${formatarData(excluindoServico.data)} será removido.`}
          onConfirmar={() => excluirServico(excluindoServico)}
          onFechar={() => setExcluindoServico(null)}
        />
      ) : null}

      {tipoModal ? <ModalTipo tipo={tipoModal.tipo} onFechar={() => setTipoModal(null)} onSalvo={atualizar} /> : null}

      {excluindoTipo ? (
        <Confirmar
          titulo={`Excluir “${excluindoTipo.nome}” da lista?`}
          mensagem="O serviço deixa de aparecer nas sugestões. Atendimentos já registrados não são afetados."
          onConfirmar={() => excluirTipo(excluindoTipo)}
          onFechar={() => setExcluindoTipo(null)}
        />
      ) : null}
    </>
  );
}
