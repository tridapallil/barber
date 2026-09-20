'use client';

import { useState } from 'react';
import FormularioServico from './FormularioServico';
import { useAtualizar } from './Progresso';
import { IconeMais } from './Icones';

export default function BotaoNovoAtendimento({ clientes, tipos, clienteFixo, rotulo = 'Novo atendimento', variante = 'btn-primario' }) {
  const { atualizar } = useAtualizar();
  const [aberto, setAberto] = useState(false);

  const semClientes = clientes.length === 0 && !clienteFixo;

  return (
    <>
      <button
        type="button"
        className={`btn ${variante}`}
        onClick={() => setAberto(true)}
        disabled={semClientes}
        title={semClientes ? 'Cadastre um cliente primeiro' : undefined}
      >
        <IconeMais size={17} />
        {rotulo}
      </button>

      {aberto ? (
        <FormularioServico
          clientes={clientes}
          tipos={tipos}
          clienteFixo={clienteFixo}
          onFechar={() => setAberto(false)}
          onSalvo={atualizar}
        />
      ) : null}
    </>
  );
}
