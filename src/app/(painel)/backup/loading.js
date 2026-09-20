import { CabecalhoEsqueleto, Linha } from '@/components/Esqueleto';

export default function Carregando() {
  return (
    <>
      <CabecalhoEsqueleto comAcoes={false} />
      <div className="pilha">
        <div className="grade grade-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="cartao indicador">
              <Linha largura="55%" altura={12} />
              <div className="indicador-corpo"><Linha largura="40%" altura={34} raio={12} /></div>
            </div>
          ))}
        </div>
        <div className="grade grade-2">
          {[0, 1].map((i) => (
            <div key={i} className="cartao">
              <Linha largura="60%" altura={17} />
              <Linha largura="85%" altura={11} estilo={{ marginTop: 12 }} />
              <Linha altura={46} raio={999} estilo={{ marginTop: 22 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
