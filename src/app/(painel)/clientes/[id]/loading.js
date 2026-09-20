import { CabecalhoEsqueleto, IndicadoresEsqueleto, ListaEsqueleto } from '@/components/Esqueleto';

export default function Carregando() {
  return (
    <>
      <CabecalhoEsqueleto />
      <div className="pilha">
        <IndicadoresEsqueleto />
        <ListaEsqueleto linhas={6} />
      </div>
    </>
  );
}
