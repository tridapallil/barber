import { carregarTudo, ordenarServicos } from '@/lib/carregar';
import { normalizar } from '@/lib/format';
import PainelServicos from './PainelServicos';

export const dynamic = 'force-dynamic';

export default async function PaginaServicos() {
  const { clientes, servicos, tipos } = await carregarTudo();

  const nomePorId = new Map(clientes.map((c) => [c.id, c.nome]));
  const lista = ordenarServicos(servicos).map((s) => ({
    ...s,
    clienteNome: nomePorId.get(s.clienteId) || 'Cliente removido',
  }));

  // Quantas vezes cada tipo já foi usado — define se ele pode ser editado/excluído.
  const usoPorTipo = new Map();
  for (const s of servicos) {
    const chave = normalizar(s.nome);
    usoPorTipo.set(chave, (usoPorTipo.get(chave) || 0) + 1);
  }

  const tiposComUso = [...tipos]
    .map((t) => ({ ...t, usos: usoPorTipo.get(normalizar(t.nome)) || 0 }))
    .sort((a, b) => b.usos - a.usos || a.nome.localeCompare(b.nome, 'pt-BR'));

  return <PainelServicos servicos={lista} clientes={clientes} tipos={tipos} tiposComUso={tiposComUso} />;
}
