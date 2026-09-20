'use client';

import { useEffect } from 'react';
import { IconeX } from './Icones';

export default function Modal({ titulo, onFechar, children, rodape, largura }) {
  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onFechar]);

  return (
    <div
      className="modal-fundo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="modal" style={largura ? { maxWidth: largura } : undefined} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-cabecalho">
          <h2 className="modal-titulo">{titulo}</h2>
          <button type="button" className="btn-circulo" onClick={onFechar} aria-label="Fechar">
            <IconeX size={18} />
          </button>
        </div>
        {children}
        {rodape ? <div className="modal-rodape">{rodape}</div> : null}
      </div>
    </div>
  );
}
