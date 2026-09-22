import { listar, semearTiposPadrao } from './db';

export async function carregarTudo() {
  await semearTiposPadrao();

  const [clientes, servicos, tipos] = await Promise.all([
    listar('clients'),
    listar('services'),
    listar('serviceTypes'),
  ]);

  return { clientes, servicos, tipos };
}

export function ordenarServicos(servicos) {
  return [...servicos].sort((a, b) =>
    a.data < b.data ? 1 : a.data > b.data ? -1 : String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''))
  );
}
