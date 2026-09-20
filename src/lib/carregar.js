import { readAll } from './db';

export async function carregarTudo() {
  const [clientes, servicos, tipos] = await Promise.all([
    readAll('clients'),
    readAll('services'),
    readAll('serviceTypes'),
  ]);
  return { clientes, servicos, tipos };
}

export function ordenarServicos(servicos) {
  return [...servicos].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : (b.criadoEm || '').localeCompare(a.criadoEm || '')));
}
