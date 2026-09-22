import { atualizarUm, ehDuplicado, removerUm, removerVarios } from '@/lib/db';
import { erro, ok, semSessao, texto } from '@/lib/api';
import { somenteDigitos } from '@/lib/format';

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
  if (!nome) return erro('O nome do cliente é obrigatório.');

  let atualizado;
  try {
    atualizado = await atualizarUm(
      'clients',
      { id },
      {
        nome,
        telefone: somenteDigitos(texto(corpo.telefone, 30)),
        descricao: texto(corpo.descricao, 2000),
        atualizadoEm: new Date().toISOString(),
      }
    );
  } catch (e) {
    if (ehDuplicado(e)) return erro('Já existe um cliente com esse nome.', 409);
    throw e;
  }

  if (!atualizado) return erro('Cliente não encontrado.', 404);
  return ok(atualizado);
}

export async function DELETE(_request, { params }) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  const { id } = await params;
  if (!(await removerUm('clients', { id }))) return erro('Cliente não encontrado.', 404);

  // o histórico da cliente vai junto
  const servicosRemovidos = await removerVarios('services', { clienteId: id });
  return ok({ servicosRemovidos });
}
