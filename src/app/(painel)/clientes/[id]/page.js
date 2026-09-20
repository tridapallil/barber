import { notFound } from 'next/navigation';
import { carregarTudo, ordenarServicos } from '@/lib/carregar';
import DetalheCliente from './DetalheCliente';

export const dynamic = 'force-dynamic';

export default async function PaginaCliente({ params }) {
  const { id } = await params;
  const { clientes, servicos, tipos } = await carregarTudo();

  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) notFound();

  const historico = ordenarServicos(servicos.filter((s) => s.clienteId === id));

  return <DetalheCliente cliente={cliente} historico={historico} tipos={tipos} />;
}
