import Link from 'next/link';
import { carregarTudo, ordenarServicos } from '@/lib/carregar';
import { intervaloMes, intervaloSemana, noIntervalo, porServico, resumo, serieDiaria } from '@/lib/estatisticas';
import { deISO, formatarData, formatarMoeda, hojeISO, iniciais, MESES } from '@/lib/format';
import GraficoDias from '@/components/GraficoDias';
import BotaoNovoAtendimento from '@/components/BotaoNovoAtendimento';
import { IconeArquivo, IconeExpandir, IconeTesoura } from '@/components/Icones';

export const dynamic = 'force-dynamic';

function Indicador({ rotulo, valor, sufixo, nota, href, destaque, tamanho = 'grande' }) {
  const miolo = (
    <div className={`cartao indicador ${destaque ? 'cartao-lima' : ''}`}>
      <div className="cartao-topo" style={{ marginBottom: 0 }}>
        <span className="indicador-rotulo">{rotulo}</span>
        {href ? (
          <span className="btn-circulo" aria-hidden="true">
            <IconeExpandir size={16} />
          </span>
        ) : null}
      </div>
      <div className="indicador-corpo">
        <span className={tamanho === 'grande' ? 'valor-grande' : 'valor-medio'}>
          {valor}
          {sufixo ? <span className="sufixo">{sufixo}</span> : null}
        </span>
        {nota ? <div className="indicador-nota">{nota}</div> : null}
      </div>
    </div>
  );

  return href ? <Link href={href}>{miolo}</Link> : miolo;
}

export default async function PaginaPainel() {
  const { clientes, servicos, tipos } = await carregarTudo();
  const hoje = hojeISO();
  const agora = deISO(hoje);

  const semana = intervaloSemana(hoje);
  const mes = intervaloMes(agora.getFullYear(), agora.getMonth());

  const daSemana = noIntervalo(servicos, semana.de, semana.ate);
  const doMes = noIntervalo(servicos, mes.de, mes.ate);
  const deHoje = servicos.filter((s) => s.data === hoje);

  const rSemana = resumo(daSemana);
  const rMes = resumo(doMes);
  const rTotal = resumo(servicos);

  const serie = serieDiaria(servicos, 14, hoje);
  const topServicos = porServico(doMes).slice(0, 5);
  const recentes = ordenarServicos(servicos).slice(0, 5);
  const nomePorId = new Map(clientes.map((c) => [c.id, c.nome]));
  const novosNoMes = clientes.filter((c) => (c.criadoEm || '').slice(0, 10) >= mes.de).length;

  return (
    <>
      <div className="cabecalho-pagina">
        <div>
          <div className="migalhas">
            <span><IconeArquivo size={14} /> Salão</span>
            <span><IconeArquivo size={14} /> Visão geral</span>
          </div>
          <h1 className="titulo-pagina">Painel do salão</h1>
        </div>

        <div className="cabecalho-acoes">
          <span className="etiqueta etiqueta-branca" style={{ padding: '11px 18px', fontSize: '0.88rem' }}>
            {agora.getDate()} de {MESES[agora.getMonth()]}
          </span>
          <span className="etiqueta etiqueta-branca" style={{ padding: '11px 18px', fontSize: '0.88rem' }}>
            {deHoje.length === 0 ? 'Nada hoje ainda' : `${deHoje.length} hoje`}
          </span>
          <BotaoNovoAtendimento clientes={clientes} tipos={tipos} />
        </div>
      </div>

      <div className="pilha">
        <div className="grade grade-4">
          <Indicador
            rotulo="Serviços na semana"
            valor={rSemana.quantidade}
            nota={<>Faturou <b>{formatarMoeda(rSemana.valor)}</b></>}
            destaque
            href="/relatorios"
          />
          <Indicador
            rotulo="Serviços no mês"
            valor={rMes.quantidade}
            nota={<>Faturou <b>{formatarMoeda(rMes.valor)}</b></>}
            href="/relatorios"
          />
          <Indicador
            rotulo="Clientes cadastradas"
            valor={clientes.length}
            nota={novosNoMes > 0 ? <><b>+{novosNoMes}</b> neste mês</> : 'Nenhuma nova no mês'}
            href="/clientes"
          />
          <Indicador
            rotulo="Total de atendimentos"
            valor={rTotal.quantidade}
            nota={<>Desde o começo · <b>{formatarMoeda(rTotal.valor)}</b></>}
            href="/servicos"
          />
        </div>

        <div className="grade grade-painel">
          <div className="cartao">
            <div className="cartao-topo">
              <span className="rotulo-cartao">Mais feitos no mês</span>
            </div>
            {topServicos.length === 0 ? (
              <p className="lista-item-sub">Nenhum serviço registrado neste mês.</p>
            ) : (
              <div className="pilha-sm">
                {topServicos.map((s) => (
                  <div key={s.nome} className="chip-linha">
                    <span className="valor num">{s.quantidade}×</span>
                    <span className="rotulo" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.nome}
                    </span>
                    <span className="linha-fim num" style={{ fontWeight: 500 }}>{formatarMoeda(s.valor)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <GraficoDias
            serie={serie}
            hoje={hoje}
            titulo="Últimos 14 dias"
            resumoRotulo="Atendimentos no período"
          />
        </div>

        <div className="cartao">
          <div className="cartao-topo">
            <span className="rotulo-cartao">Atendimentos recentes</span>
            <Link href="/servicos" className="btn btn-claro btn-pequeno">Ver todos</Link>
          </div>

          {recentes.length === 0 ? (
            <div className="vazio">
              <div className="vazio-icone"><IconeTesoura size={24} /></div>
              <p className="vazio-titulo">Nada registrado ainda</p>
              <p>Cadastre uma cliente e depois registre o primeiro atendimento.</p>
            </div>
          ) : (
            <div className="lista">
              {recentes.map((s) => (
                <Link key={s.id} href={`/clientes/${s.clienteId}`} className="lista-item">
                  <div className="avatar">{iniciais(nomePorId.get(s.clienteId) || '?')}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="lista-item-titulo">{nomePorId.get(s.clienteId) || 'Cliente removida'}</div>
                    <div className="lista-item-sub">{s.nome} · {formatarData(s.data)}</div>
                  </div>
                  <div className="lista-item-fim">
                    <span className="num" style={{ fontWeight: 500 }}>{formatarMoeda(s.valor)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
