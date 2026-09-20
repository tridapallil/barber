import { CabecalhoEsqueleto, Linha, ListaEsqueleto } from '@/components/Esqueleto';

export default function Carregando() {
  return (
    <>
      <CabecalhoEsqueleto />
      <div className="pilha">
        <div className="linha envolver" style={{ gap: 10 }}>
          <Linha largura="100%" altura={48} raio={999} estilo={{ flex: '1 1 280px' }} />
          <Linha largura={90} altura={42} raio={999} />
          <Linha largura={170} altura={42} raio={999} />
        </div>
        <ListaEsqueleto linhas={7} titulo={false} />
      </div>
    </>
  );
}
