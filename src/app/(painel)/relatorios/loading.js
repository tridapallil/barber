import { CabecalhoEsqueleto, GraficoEsqueleto, IndicadoresEsqueleto, Linha, ListaEsqueleto } from '@/components/Esqueleto';

export default function Carregando() {
  return (
    <>
      <CabecalhoEsqueleto />
      <div className="pilha">
        <div className="linha" style={{ gap: 8 }}>
          <Linha largura={120} altura={42} raio={999} />
          <Linha largura={110} altura={42} raio={999} />
        </div>
        <IndicadoresEsqueleto />
        <GraficoEsqueleto />
        <div className="grade grade-relatorio">
          <ListaEsqueleto linhas={5} />
          <ListaEsqueleto linhas={5} />
        </div>
      </div>
    </>
  );
}
