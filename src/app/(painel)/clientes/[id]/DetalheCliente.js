'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import FormularioCliente from '@/components/FormularioCliente';
import FormularioServico from '@/components/FormularioServico';
import Confirmar from '@/components/Confirmar';
import { useAviso } from '@/components/Avisos';
import { useAtualizar } from '@/components/Progresso';
import {
  IconeArquivo,
  IconeLapis,
  IconeLixeira,
  IconeMais,
  IconeNota,
  IconeTelefone,
  IconeTesoura,
  IconeVoltar,
} from '@/components/Icones';
import { formatarData, formatarDataExtenso, formatarMoeda, formatarTelefone, iniciais } from '@/lib/format';
import { resumo } from '@/lib/estatisticas';

function Quadro({ rotulo, valor, nota, destaque }) {
  return (
    <div className={`cartao indicador ${destaque ? 'cartao-lima' : ''}`}>
      <span className="indicador-rotulo" style={destaque ? { color: 'rgba(26,26,24,0.6)' } : undefined}>{rotulo}</span>
      <div className="indicador-corpo">
        <span className="valor-medio">{valor}</span>
        {nota ? <div className="indicador-nota" style={destaque ? { color: 'rgba(26,26,24,0.65)' } : undefined}>{nota}</div> : null}
      </div>
    </div>
  );
}

export default function DetalheCliente({ cliente, historico, tipos }) {
  const router = useRouter();
  const avisar = useAviso();
  const { atualizar } = useAtualizar();

  const [editandoCliente, setEditandoCliente] = useState(false);
  const [excluindoCliente, setExcluindoCliente] = useState(false);
  const [novoServico, setNovoServico] = useState(false);
  const [editandoServico, setEditandoServico] = useState(null);
  const [excluindoServico, setExcluindoServico] = useState(null);

  const r = resumo(historico);

  async function excluirCliente() {
    const resposta = await fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' });
    if (!resposta.ok) {
      const dados = await resposta.json();
      avisar(dados.erro || 'Não foi possível excluir.', 'erro');
      return;
    }
    avisar('Cliente excluída.');
    router.replace('/clientes');
    router.refresh();
  }

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

  return (
    <>
      <div className="cabecalho-pagina">
        <div className="linha" style={{ gap: 16, alignItems: 'flex-start' }}>
          <Link href="/clientes" className="btn-circulo" aria-label="Voltar para clientes" style={{ width: 46, height: 46, marginTop: 20 }}>
            <IconeVoltar size={18} />
          </Link>
          <div>
            <div className="migalhas">
              <span><IconeArquivo size={14} /> Clientes</span>
              <span><IconeArquivo size={14} /> Ficha</span>
            </div>
            <h1 className="titulo-pagina">{cliente.nome}</h1>
          </div>
        </div>

        <div className="cabecalho-acoes">
          {cliente.telefone ? (
            <a href={`tel:${cliente.telefone}`} className="btn btn-claro">
              <IconeTelefone size={16} />
              {formatarTelefone(cliente.telefone)}
            </a>
          ) : null}
          <button type="button" className="btn-circulo" onClick={() => setEditandoCliente(true)} aria-label="Editar cliente" style={{ width: 44, height: 44 }}>
            <IconeLapis size={17} />
          </button>
          <button type="button" className="btn-circulo perigo" onClick={() => setExcluindoCliente(true)} aria-label="Excluir cliente" style={{ width: 44, height: 44 }}>
            <IconeLixeira size={17} />
          </button>
          <button type="button" className="btn btn-primario" onClick={() => setNovoServico(true)}>
            <IconeMais size={17} />
            Novo atendimento
          </button>
        </div>
      </div>

      <div className="pilha">
        <div className="grade grade-4">
          <Quadro
            destaque
            rotulo="Atendimentos"
            valor={r.quantidade}
            nota={historico.length ? `Último em ${formatarData(historico[0].data)}` : 'Nenhum ainda'}
          />
          <Quadro rotulo="Total gasto" valor={formatarMoeda(r.valor)} nota={r.semValor > 0 ? `${r.semValor} sem valor` : null} />
          <Quadro rotulo="Ticket médio" valor={r.ticket ? formatarMoeda(r.ticket) : '—'} />
          <div className="cartao indicador">
            <span className="indicador-rotulo">Observações</span>
            <div className="indicador-corpo">
              {cliente.descricao ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--tinta-2)', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                  {cliente.descricao}
                </p>
              ) : (
                <p className="lista-item-sub" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <IconeNota size={15} />
                  Nada anotado
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="cartao">
          <div className="cartao-topo">
            <span className="rotulo-cartao">Histórico de serviços</span>
            <span className="etiqueta">{historico.length} {historico.length === 1 ? 'registro' : 'registros'}</span>
          </div>

          {historico.length === 0 ? (
            <div className="vazio">
              <div className="vazio-icone"><IconeTesoura size={24} /></div>
              <p className="vazio-titulo">Nenhum atendimento ainda</p>
              <p>Registre o primeiro serviço desta cliente.</p>
            </div>
          ) : (
            <div className="lista">
              {historico.map((s) => (
                <div key={s.id} className="lista-item" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                  <div className="avatar" style={{ fontSize: '0.78rem', flexDirection: 'column', lineHeight: 1.05 }}>
                    <span style={{ fontWeight: 700 }}>{formatarData(s.data).slice(0, 2)}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--tinta-3)' }}>{formatarData(s.data).slice(3, 5)}</span>
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="lista-item-titulo">{s.nome}</div>
                    <div className="lista-item-sub">{formatarDataExtenso(s.data)}</div>
                    {s.descricao ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--tinta-2)', marginTop: 6, whiteSpace: 'pre-wrap' }}>
                        {s.descricao}
                      </p>
                    ) : null}
                    {s.pagamento ? <span className="etiqueta" style={{ marginTop: 8 }}>{s.pagamento}</span> : null}
                  </div>

                  <div className="lista-item-fim" style={{ alignItems: 'flex-start' }}>
                    {s.valor === null || s.valor === undefined || s.valor === '' ? (
                      <span className="etiqueta etiqueta-ambar">sem valor</span>
                    ) : (
                      <span className="badge-lima">{formatarMoeda(s.valor)}</span>
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

      {editandoCliente ? (
        <FormularioCliente cliente={cliente} onFechar={() => setEditandoCliente(false)} onSalvo={atualizar} />
      ) : null}

      {excluindoCliente ? (
        <Confirmar
          titulo={`Excluir ${cliente.nome}?`}
          mensagem={
            historico.length > 0
              ? `Isso também apaga os ${historico.length} atendimentos do histórico. Não dá para desfazer.`
              : 'Esta ação não pode ser desfeita.'
          }
          onConfirmar={excluirCliente}
          onFechar={() => setExcluindoCliente(false)}
        />
      ) : null}

      {novoServico ? (
        <FormularioServico
          clientes={[cliente]}
          tipos={tipos}
          clienteFixo={cliente}
          onFechar={() => setNovoServico(false)}
          onSalvo={atualizar}
        />
      ) : null}

      {editandoServico ? (
        <FormularioServico
          servico={editandoServico}
          clientes={[cliente]}
          tipos={tipos}
          clienteFixo={cliente}
          onFechar={() => setEditandoServico(null)}
          onSalvo={atualizar}
        />
      ) : null}

      {excluindoServico ? (
        <Confirmar
          titulo="Excluir atendimento?"
          mensagem={`“${excluindoServico.nome}” de ${formatarData(excluindoServico.data)} será removido do histórico.`}
          onConfirmar={() => excluirServico(excluindoServico)}
          onFechar={() => setExcluindoServico(null)}
        />
      ) : null}
    </>
  );
}
