import { atualizarUm, buscarUm, removerUm } from '@/lib/db';
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

  const mudancas = {
    nome,
    data,
    valor: numeroOuNulo(corpo.valor),
    pagamento: texto(corpo.pagamento, 60),
    descricao: texto(corpo.descricao, 2000),
    atualizadoEm: new Date().toISOString(),
  };

  if (clienteId) {
    if (!(await buscarUm('clients', { id: clienteId }))) return erro('Cliente não encontrado.', 404);
    mudancas.clienteId = clienteId;
  }

  const atualizado = await atualizarUm('services', { id }, mudancas);
  if (!atualizado) return erro('Serviço não encontrado.', 404);

  await registrarTipo(nome);
  return ok(atualizado);
}

export async function DELETE(_request, { params }) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  const { id } = await params;
  if (!(await removerUm('services', { id }))) return erro('Serviço não encontrado.', 404);
  return ok();
}
