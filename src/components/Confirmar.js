'use client';

import { useState } from 'react';
import Modal from './Modal';

export default function Confirmar({ titulo, mensagem, rotuloConfirmar = 'Excluir', onConfirmar, onFechar }) {
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    setEnviando(true);
    try {
      await onConfirmar();
      onFechar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      titulo={titulo}
      onFechar={onFechar}
      largura={440}
      rodape={
        <>
          <button type="button" className="btn btn-claro" onClick={onFechar} disabled={enviando}>
            Cancelar
          </button>
          <button type="button" className="btn btn-perigo" onClick={confirmar} disabled={enviando}>
            {enviando ? <span className="carregando" /> : rotuloConfirmar}
          </button>
        </>
      }
    >
      <div className="modal-corpo">
        <p style={{ color: 'var(--tinta-2)', lineHeight: 1.6 }}>{mensagem}</p>
      </div>
    </Modal>
  );
}
