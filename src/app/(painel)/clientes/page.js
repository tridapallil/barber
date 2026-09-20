import { carregarTudo } from '@/lib/carregar';
import ListaClientes from './ListaClientes';

export const dynamic = 'force-dynamic';

export default async function PaginaClientes() {
  const { clientes, servicos, tipos } = await carregarTudo();

  // Resumo por cliente já montado no servidor: a lista só renderiza.
  const resumoPorCliente = new Map();
  for (const s of servicos) {
    const atual = resumoPorCliente.get(s.clienteId) || { quantidade: 0, valor: 0, ultima: '' };
    atual.quantidade += 1;
    atual.valor += Number(s.valor) || 0;
    if (s.data > atual.ultima) atual.ultima = s.data;
    resumoPorCliente.set(s.clienteId, atual);
  }

  const lista = clientes.map((c) => ({
    ...c,
    ...(resumoPorCliente.get(c.id) || { quantidade: 0, valor: 0, ultima: '' }),
  }));

  return <ListaClientes clientes={lista} tipos={tipos} />;
}
