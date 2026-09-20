import { mutate, readAll } from '@/lib/db';
import { erro, ok, semSessao, texto } from '@/lib/api';
import { normalizar } from '@/lib/format';

export const dynamic = 'force-dynamic';

/** Um tipo já usado em algum atendimento fica travado (não pode editar nem excluir). */
async function estaEmUso(nomeTipo) {
  const servicos = await readAll('services');
  const alvo = normalizar(nomeTipo);
  return servicos.some((s) => normalizar(s.nome) === alvo);
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

  const tipos = await readAll('serviceTypes');
  const atual = tipos.find((t) => t.id === id);
  if (!atual) return erro('Serviço não encontrado.', 404);

  if (await estaEmUso(atual.nome)) {
    return erro('Este serviço já foi usado em atendimentos e não pode ser alterado.', 409);
  }

  const resultado = await mutate('serviceTypes', (rows) => {
    const i = rows.findIndex((t) => t.id === id);
    if (i === -1) return { status: 'ausente' };
    if (rows.some((t) => t.id !== id && normalizar(t.nome) === normalizar(nome))) {
      return { status: 'duplicado' };
    }
    rows[i] = { ...rows[i], nome };
    return { status: 'ok', tipo: rows[i] };
  });

  if (resultado.status === 'ausente') return erro('Serviço não encontrado.', 404);
  if (resultado.status === 'duplicado') return erro('Já existe um serviço com esse nome.', 409);
  return ok(resultado.tipo);
}

export async function DELETE(_request, { params }) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  const { id } = await params;
  const tipos = await readAll('serviceTypes');
  const atual = tipos.find((t) => t.id === id);
  if (!atual) return erro('Serviço não encontrado.', 404);

  if (await estaEmUso(atual.nome)) {
    return erro('Este serviço já foi usado em atendimentos e não pode ser excluído.', 409);
  }

  await mutate('serviceTypes', (rows) => {
    const i = rows.findIndex((t) => t.id === id);
    if (i !== -1) rows.splice(i, 1);
  });

  return ok();
}
