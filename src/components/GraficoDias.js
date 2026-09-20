'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import { deISO, diaCurto, formatarDataExtenso, formatarMoeda } from '@/lib/format';

/*
 * Barras por dia. As barras neutras dão o contexto; o dia de hoje vem
 * hachurado em preto e o pico ganha um selo lima com o número — contraste
 * claro sem quebrar a linguagem clara do resto da tela. Cada barra tem
 * rótulo de dia e tooltip próprio, que é o que sustenta a leitura.
 */
const NEUTRA = '#b5b5ab';
const PRETO = '#1a1a18';
const LIMA = '#d6f24b';

export default function GraficoDias({
  serie,
  hoje,
  titulo = 'Atendimentos por dia',
  resumoRotulo = 'No período',
  formatoRotulo = 'dia',
  acoes,
}) {
  const caixa = useRef(null);
  const idHachura = useId().replace(/:/g, '');
  const [largura, setLargura] = useState(320);
  const [ativo, setAtivo] = useState(null);

  // useLayoutEffect mede já no primeiro layout; o observer cuida do resto.
  useLayoutEffect(() => {
    const alvo = caixa.current;
    if (!alvo) return undefined;

    const medir = () => setLargura(Math.max(240, alvo.getBoundingClientRect().width));
    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(alvo);
    window.addEventListener('resize', medir);
    return () => {
      observador.disconnect();
      window.removeEventListener('resize', medir);
    };
  }, []);

  const compacto = largura < 440;
  const altura = compacto ? 180 : 248;
  const baseRotulos = 26;
  const topoSelo = 34;
  const alturaPlot = altura - baseRotulos - topoSelo;

  const maximo = Math.max(1, ...serie.map((d) => d.quantidade));
  const passo = largura / serie.length;
  const larguraBarra = Math.max(8, Math.min(compacto ? 22 : 56, passo * 0.56));
  const total = serie.reduce((s, d) => s + d.quantidade, 0);
  const indicePico = serie.findIndex((d) => d.quantidade === maximo && maximo > 0);
  const pularRotulo = compacto && serie.length > 9 ? 2 : 1;

  function barraPath(x, y, w, h) {
    const r = Math.min(9, w / 2, h);
    return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
  }

  const dadoAtivo = ativo !== null ? serie[ativo] : null;

  return (
    <div className="cartao">
      <div className="cartao-topo">
        <div>
          <div className="rotulo-cartao">{titulo}</div>
          <div className="rotulo-fino" style={{ marginTop: 10 }}>{resumoRotulo}</div>
          <div className="valor-grande" style={{ marginTop: 4 }}>
            {total}
            <span className="sufixo">{total === 1 ? ' atendimento' : ' atendimentos'}</span>
          </div>
        </div>
        {acoes ? <div className="cartao-acoes">{acoes}</div> : null}
      </div>

      <div ref={caixa} className="grafico-caixa" style={{ marginTop: 14 }}>
        <svg
          className="grafico"
          width={largura}
          height={altura}
          viewBox={`0 0 ${largura} ${altura}`}
          role="img"
          aria-label={`Atendimentos por dia. Total de ${total} no período.`}
          onMouseLeave={() => setAtivo(null)}
        >
          <defs>
            <pattern id={`hachura-${idHachura}`} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#e4e4e0" />
              <line x1="0" y1="0" x2="0" y2="6" stroke={PRETO} strokeWidth="2.6" />
            </pattern>
          </defs>

          {serie.map((dia, i) => {
            const x = i * passo + (passo - larguraBarra) / 2;
            const alturaBarra = dia.quantidade > 0 ? Math.max(6, (dia.quantidade / maximo) * alturaPlot) : 4;
            const topo = topoSelo + alturaPlot - alturaBarra;
            const d = deISO(dia.data);
            const ehHoje = dia.data === hoje;
            const destacado = ativo === i;
            const ehPico = i === indicePico;

            let preenchimento = NEUTRA;
            if (destacado) preenchimento = PRETO;
            else if (ehHoje && dia.quantidade > 0) preenchimento = `url(#hachura-${idHachura})`;

            return (
              <g key={dia.data}>
                <path
                  d={barraPath(x, topo, larguraBarra, alturaBarra)}
                  fill={dia.quantidade > 0 ? preenchimento : '#dcdcd7'}
                  style={{ transition: 'fill 0.15s' }}
                  pointerEvents="none"
                />

                {ehPico && maximo > 0 && !destacado ? (
                  <g pointerEvents="none">
                    <rect
                      x={Math.min(Math.max(x + larguraBarra / 2 - 22, 0), largura - 44)}
                      y={topo - 30}
                      width="44"
                      height="24"
                      rx="9"
                      fill={LIMA}
                    />
                    <text
                      x={Math.min(Math.max(x + larguraBarra / 2, 22), largura - 22)}
                      y={topo - 13}
                      textAnchor="middle"
                      fill={PRETO}
                      fontSize="12.5"
                      fontWeight="600"
                    >
                      {dia.quantidade}
                    </text>
                  </g>
                ) : null}

                {i % pularRotulo === 0 ? (
                  <text
                    x={i * passo + passo / 2}
                    y={altura - 8}
                    textAnchor="middle"
                    fill={ehHoje ? PRETO : '#97978f'}
                    fontSize="11.5"
                    fontWeight={ehHoje ? 600 : 400}
                    pointerEvents="none"
                  >
                    {formatoRotulo === 'semana' ? diaCurto(dia.data) : d ? String(d.getDate()).padStart(2, '0') : ''}
                  </text>
                ) : null}

                <rect
                  x={i * passo}
                  y={0}
                  width={passo}
                  height={altura}
                  fill="transparent"
                  onMouseEnter={() => setAtivo(i)}
                  onFocus={() => setAtivo(i)}
                  tabIndex={0}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <title>{`${formatarDataExtenso(dia.data)}: ${dia.quantidade} atendimento(s)`}</title>
                </rect>
              </g>
            );
          })}
        </svg>

        {dadoAtivo ? (
          <div
            style={{
              position: 'absolute',
              left: Math.min(Math.max(ativo * passo + passo / 2 - 86, 0), Math.max(0, largura - 172)),
              top: -6,
              width: 172,
              background: PRETO,
              color: '#fff',
              borderRadius: 16,
              padding: '11px 14px',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <div style={{ fontSize: '0.74rem', opacity: 0.65 }}>{formatarDataExtenso(dadoAtivo.data)}</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: 3 }}>
              {dadoAtivo.quantidade} {dadoAtivo.quantidade === 1 ? 'atendimento' : 'atendimentos'}
            </div>
            {dadoAtivo.valor > 0 ? (
              <div style={{ fontSize: '0.82rem', opacity: 0.75 }}>{formatarMoeda(dadoAtivo.valor)}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
