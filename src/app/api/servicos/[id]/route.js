import { mutate, readAll } from '@/lib/db';
import { dataValida, erro, numeroOuNulo, ok, semSessao, texto } from '@/lib/api';
import { registrarTipo } from '@/lib/tipos';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  const { id } = await params;
  let corpo = {};
  try {
    corpo = await request.json();
  } catch {
    return erro('Requisição inválida.');
  }

  const nome = texto(corpo.nome, 120);
  const data = texto(corpo.data, 10);
  const clienteId = texto(corpo.clienteId, 80);
  if (!nome) return erro('O nome do serviço é obrigatório.');
  if (!dataValida(data)) return erro('Informe uma data válida.');

  if (clienteId) {
    const clientes = await readAll('clients');
    if (!clientes.some((c) => c.id === clienteId)) return erro('Cliente não encontrado.', 404);
  }

  const atualizado = await mutate('services', (rows) => {
    const i = rows.findIndex((s) => s.id === id);
    if (i === -1) return null;
    rows[i] = {
      ...rows[i],
      clienteId: clienteId || rows[i].clienteId,
      nome,
      data,
      valor: numeroOuNulo(corpo.valor),
      pagamento: texto(corpo.pagamento, 60),
      descricao: texto(corpo.descricao, 2000),
      atualizadoEm: new Date().toISOString(),
    };
    return rows[i];
  });

  if (!atualizado) return erro('Serviço não encontrado.', 404);
  await registrarTipo(nome);
  return ok(atualizado);
}

export async function DELETE(_request, { params }) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  const { id } = await params;
  const removido = await mutate('services', (rows) => {
    const i = rows.findIndex((s) => s.id === id);
    if (i === -1) return false;
    rows.splice(i, 1);
    return true;
  });

  if (!removido) return erro('Serviço não encontrado.', 404);
  return ok();
}
