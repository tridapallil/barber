import { CabecalhoEsqueleto, Linha, ListaEsqueleto } from '@/components/Esqueleto';

export default function Carregando() {
  return (
    <>
      <CabecalhoEsqueleto />
      <div className="pilha">
        <div className="linha envolver" style={{ gap: 10 }}>
          <Linha largura={150} altura={42} raio={999} />
          <Linha largura={200} altura={42} raio={999} />
          <Linha largura="100%" altura={48} raio={999} estilo={{ flex: '1 1 260px' }} />
        </div>
        <ListaEsqueleto linhas={8} titulo={false} />
      </div>
    </>
  );
}
