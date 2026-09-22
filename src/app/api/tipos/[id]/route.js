import { atualizarUm, buscarUm, contar, ehDuplicado, removerUm } from '@/lib/db';
import { erro, ok, semSessao, texto } from '@/lib/api';
import { normalizar } from '@/lib/format';

export const dynamic = 'force-dynamic';

/** Um tipo já usado em algum atendimento fica travado (não pode editar nem excluir). */
async function estaEmUso(nomeTipo) {
  return (await contar('services', { nomeChave: normalizar(nomeTipo) })) > 0;
}

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
  if (!nome) return erro('Informe o nome do serviço.');

  const atual = await buscarUm('serviceTypes', { id });
  if (!atual) return erro('Serviço não encontrado.', 404);

  if (await estaEmUso(atual.nome)) {
    return erro('Este serviço já foi usado em atendimentos e não pode ser alterado.', 409);
  }

  let atualizado;
  try {
    atualizado = await atualizarUm('serviceTypes', { id }, { nome });
  } catch (e) {
    if (ehDuplicado(e)) return erro('Já existe um serviço com esse nome.', 409);
    throw e;
  }

  if (!atualizado) return erro('Serviço não encontrado.', 404);
  return ok(atualizado);
}

export async function DELETE(_request, { params }) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  const { id } = await params;
  const atual = await buscarUm('serviceTypes', { id });
  if (!atual) return erro('Serviço não encontrado.', 404);

  if (await estaEmUso(atual.nome)) {
    return erro('Este serviço já foi usado em atendimentos e não pode ser excluído.', 409);
  }

  await removerUm('serviceTypes', { id });
  return ok();
}
