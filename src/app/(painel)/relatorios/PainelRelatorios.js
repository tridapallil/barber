'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import GraficoDias from '@/components/GraficoDias';
import { IconeArquivo, IconeRelatorio, IconeSeta, IconeVoltar } from '@/components/Icones';
import { deISO, formatarData, formatarMoeda, hojeISO, iniciais, inicioSemana, MESES, somarDias } from '@/lib/format';
import { intervaloMes, noIntervalo, porCliente, porPagamento, porServico, resumo, serieIntervalo } from '@/lib/estatisticas';

function Quadro({ titulo, itens, vazio, secundario }) {
  const maximo = Math.max(0, ...itens.map((i) => i.quantidade));
  return (
    <div className="cartao">
      <div className="cartao-topo">
        <span className="rotulo-cartao">{titulo}</span>
      </div>
      {itens.length === 0 ? (
        <p className="lista-item-sub">{vazio}</p>
      ) : (
        <div className="pilha-sm">
          {itens.map((i) => (
            <div key={i.id || i.nome} style={{ padding: '2px 2px 10px' }}>
              <div className="linha" style={{ marginBottom: 7 }}>
                <span
                  className="lista-item-titulo"
                  style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {i.nome}
                </span>
                <span className="linha-fim lista-item-sub num">{secundario(i)}</span>
              </div>
              <div style={{ height: 8, background: 'var(--afundado)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${maximo > 0 ? Math.max(4, (i.quantidade / maximo) * 100) : 0}%`,
                    height: '100%',
                    background: 'var(--preto)',
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Indicador({ rotulo, valor, nota, destaque }) {
  return (
    <div className={`cartao indicador ${destaque ? 'cartao-lima' : ''}`}>
      <span className="indicador-rotulo" style={destaque ? { color: 'rgba(26,26,24,0.6)' } : undefined}>{rotulo}</span>
      <div className="indicador-corpo">
        <span className="valor-medio">{valor}</span>
        {nota ? (
          <div className="indicador-nota" style={destaque ? { color: 'rgba(26,26,24,0.68)' } : undefined}>{nota}</div>
        ) : null}
      </div>
    </div>
  );
}

export default function PainelRelatorios({ clientes, servicos }) {
  const hoje = hojeISO();
  const agora = deISO(hoje);

  const [modo, setModo] = useState('semana');
  const [semanaRef, setSemanaRef] = useState(inicioSemana(hoje));
  const [ano, setAno] = useState(agora.getFullYear());
  const [mes, setMes] = useState(agora.getMonth());

  const periodo = useMemo(() => {
    if (modo === 'semana') {
      const de = semanaRef;
      const ate = somarDias(de, 6);
      return { de, ate, rotulo: `${formatarData(de)} — ${formatarData(ate)}` };
    }
    const { de, ate } = intervaloMes(ano, mes);
    return { de, ate, rotulo: `${MESES[mes]} de ${ano}` };
  }, [modo, semanaRef, ano, mes]);

  const doPeriodo = useMemo(() => noIntervalo(servicos, periodo.de, periodo.ate), [servicos, periodo]);

  const anterior = useMemo(() => {
    if (modo === 'semana') {
      const de = somarDias(semanaRef, -7);
      return noIntervalo(servicos, de, somarDias(de, 6));
    }
    const m = mes === 0 ? 11 : mes - 1;
    const a = mes === 0 ? ano - 1 : ano;
    const { de, ate } = intervaloMes(a, m);
    return noIntervalo(servicos, de, ate);
  }, [servicos, modo, semanaRef, ano, mes]);

  const r = resumo(doPeriodo);
  const rAnterior = resumo(anterior);
  const serie = useMemo(() => serieIntervalo(doPeriodo, periodo.de, periodo.ate), [doPeriodo, periodo]);

  const servicosPeriodo = porServico(doPeriodo).slice(0, 7);
  const pagamentosPeriodo = porPagamento(doPeriodo);
  const clientesPeriodo = porCliente(doPeriodo, clientes).slice(0, 8);

  function navegar(direcao) {
    if (modo === 'semana') {
      setSemanaRef((atual) => somarDias(atual, direcao * 7));
      return;
    }
    const total = mes + direcao;
    if (total < 0) {
      setMes(11);
      setAno((a) => a - 1);
    } else if (total > 11) {
      setMes(0);
      setAno((a) => a + 1);
    } else {
      setMes(total);
    }
  }

  function voltarParaHoje() {
    setSemanaRef(inicioSemana(hoje));
    setAno(agora.getFullYear());
    setMes(agora.getMonth());
  }

  const noFuturo = periodo.de > hoje;
  const ehAtual = modo === 'semana'
    ? semanaRef === inicioSemana(hoje)
    : ano === agora.getFullYear() && mes === agora.getMonth();

  function variacao(atual, passado) {
    if (!passado) return atual > 0 ? 'primeiro período com registros' : 'sem comparação';
    const pct = Math.round(((atual - passado) / passado) * 100);
    if (pct === 0) return 'igual ao período anterior';
    return `${pct > 0 ? '+' : ''}${pct}% vs. período anterior`;
  }

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <div className="migalhas">
            <span><IconeArquivo size={14} /> Salão</span>
            <span><IconeArquivo size={14} /> Resultados</span>
          </div>
          <h1 className="titulo-pagina">Relatórios</h1>
        </div>

        <div className="cabecalho-acoes">
          <button type="button" className="btn-circulo" onClick={() => navegar(-1)} aria-label="Período anterior" style={{ width: 44, height: 44 }}>
            <IconeVoltar size={18} />
          </button>
          <span className="etiqueta etiqueta-branca" style={{ padding: '12px 20px', fontSize: '0.9rem' }}>
            {periodo.rotulo}
          </span>
          <button
            type="button"
            className="btn-circulo"
            onClick={() => navegar(1)}
            disabled={noFuturo}
            aria-label="Próximo período"
            style={{ width: 44, height: 44 }}
          >
            <IconeSeta size={18} />
          </button>
          {!ehAtual ? (
            <button type="button" className="btn btn-claro" onClick={voltarParaHoje}>Hoje</button>
          ) : null}
        </div>
      </div>

      <div className="pilha">
        <div className="segmentos">
          <button type="button" className={`segmento ${modo === 'semana' ? 'ativo' : ''}`} onClick={() => setModo('semana')}>
            Semanal
          </button>
          <button type="button" className={`segmento ${modo === 'mes' ? 'ativo' : ''}`} onClick={() => setModo('mes')}>
            Mensal
          </button>
        </div>

        <div className="grade grade-4">
          <Indicador destaque rotulo="Atendimentos" valor={r.quantidade} nota={variacao(r.quantidade, rAnterior.quantidade)} />
          <Indicador rotulo="Faturamento" valor={formatarMoeda(r.valor)} nota={variacao(r.valor, rAnterior.valor)} />
          <Indicador
            rotulo="Ticket médio"
            valor={r.ticket ? formatarMoeda(r.ticket) : '—'}
            nota={r.semValor > 0 ? `${r.semValor} sem valor informado` : null}
          />
          <Indicador rotulo="Clientes atendidas" valor={new Set(doPeriodo.map((s) => s.clienteId)).size} />
        </div>

        {doPeriodo.length === 0 ? (
          <div className="cartao">
            <div className="vazio">
              <div className="vazio-icone"><IconeRelatorio size={24} /></div>
              <p className="vazio-titulo">Nenhum atendimento neste período</p>
              <p>Use as setas acima para ver outro período.</p>
            </div>
          </div>
        ) : (
          <>
            <GraficoDias
              serie={serie}
              hoje={hoje}
              titulo={`Dia a dia · ${periodo.rotulo}`}
              resumoRotulo="Atendimentos no período"
              formatoRotulo={modo === 'semana' ? 'semana' : 'dia'}
            />

            <div className="grade grade-relatorio">
              <Quadro
                titulo="Serviços mais feitos"
                itens={servicosPeriodo}
                vazio="Nenhum serviço no período."
                secundario={(i) => `${i.quantidade}× · ${formatarMoeda(i.valor)}`}
              />
              <Quadro
                titulo="Formas de pagamento"
                itens={pagamentosPeriodo}
                vazio="Nenhum pagamento registrado."
                secundario={(i) => `${i.quantidade}× · ${formatarMoeda(i.valor)}`}
              />
            </div>

            <div className="cartao">
              <div className="cartao-topo">
                <span className="rotulo-cartao">Clientes do período</span>
              </div>
              <div className="lista">
                {clientesPeriodo.map((c) => (
                  <Link key={c.id} href={`/clientes/${c.id}`} className="lista-item">
                    <div className="avatar">{iniciais(c.nome)}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="lista-item-titulo">{c.nome}</div>
                      <div className="lista-item-sub">
                        {c.quantidade} {c.quantidade === 1 ? 'atendimento' : 'atendimentos'}
                      </div>
                    </div>
                    <div className="lista-item-fim">
                      <span className="num" style={{ fontWeight: 600 }}>{formatarMoeda(c.valor)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
