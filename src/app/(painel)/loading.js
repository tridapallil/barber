import { CabecalhoEsqueleto, GraficoEsqueleto, IndicadoresEsqueleto, ListaEsqueleto } from '@/components/Esqueleto';

export default function Carregando() {
  return (
    <>
      <CabecalhoEsqueleto />
      <div className="pilha">
        <IndicadoresEsqueleto />
        <div className="grade grade-painel">
          <ListaEsqueleto linhas={5} />
          <GraficoEsqueleto />
        </div>
        <ListaEsqueleto linhas={4} />
      </div>
    </>
  );
}
