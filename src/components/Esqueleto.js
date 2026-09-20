/* Blocos de carregamento usados pelos loading.js de cada rota. */

export function Linha({ largura = '100%', altura = 12, raio = 10, estilo }) {
  return <div className="esqueleto" style={{ width: largura, height: altura, borderRadius: raio, ...estilo }} />;
}

export function CabecalhoEsqueleto({ comAcoes = true }) {
  return (
    <div className="cabecalho-pagina">
      <div>
        <Linha largura={150} altura={12} estilo={{ marginBottom: 12 }} />
        <Linha largura={300} altura={44} raio={14} />
      </div>
      {comAcoes ? (
        <div className="cabecalho-acoes">
          <Linha largura={120} altura={42} raio={999} />
          <Linha largura={180} altura={44} raio={999} />
        </div>
      ) : null}
    </div>
  );
}

export function IndicadoresEsqueleto({ quantidade = 4 }) {
  return (
    <div className="grade grade-4">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="cartao indicador">
          <Linha largura="60%" altura={12} />
          <div className="indicador-corpo">
            <Linha largura="48%" altura={34} raio={12} />
            <Linha largura="76%" altura={11} estilo={{ marginTop: 12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListaEsqueleto({ linhas = 6, titulo = true }) {
  return (
    <div className="cartao">
      {titulo ? <Linha largura={190} altura={17} estilo={{ marginBottom: 20 }} /> : null}
      <div className="lista">
        {Array.from({ length: linhas }).map((_, i) => (
          <div key={i} className="lista-item" style={{ cursor: 'default' }}>
            <div className="esqueleto" style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div className="pilha-sm" style={{ flex: 1, gap: 8 }}>
              <Linha largura={`${40 + ((i * 13) % 30)}%`} altura={13} />
              <Linha largura={`${26 + ((i * 17) % 26)}%`} altura={11} />
            </div>
            <Linha largura={74} altura={13} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GraficoEsqueleto() {
  return (
    <div className="cartao">
      <Linha largura={170} altura={17} />
      <Linha largura={110} altura={11} estilo={{ marginTop: 14 }} />
      <Linha largura={200} altura={38} raio={12} estilo={{ marginTop: 8 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 170, marginTop: 18 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="esqueleto"
            style={{ flex: 1, height: `${28 + ((i * 37) % 64)}%`, borderRadius: '9px 9px 3px 3px' }}
          />
        ))}
      </div>
    </div>
  );
}
