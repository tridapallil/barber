import { mutate } from '@/lib/db';
import { erro, ok, semSessao, texto } from '@/lib/api';
import { normalizar, somenteDigitos } from '@/lib/format';

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

  const resultado = await mutate('clients', (rows) => {
    const i = rows.findIndex((c) => c.id === id);
    if (i === -1) return { status: 'ausente' };
    const conflito = rows.some((c) => c.id !== id && normalizar(c.nome) === normalizar(nome));
    if (conflito) return { status: 'duplicado' };
    rows[i] = {
      ...rows[i],
      nome,
      telefone: somenteDigitos(texto(corpo.telefone, 30)),
      descricao: texto(corpo.descricao, 2000),
      atualizadoEm: new Date().toISOString(),
    };
    return { status: 'ok', cliente: rows[i] };
  });

  if (resultado.status === 'ausente') return erro('Cliente não encontrado.', 404);
  if (resultado.status === 'duplicado') return erro('Já existe um cliente com esse nome.', 409);
  return ok(resultado.cliente);
}

export async function DELETE(_request, { params }) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  const { id } = await params;

  const removido = await mutate('clients', (rows) => {
    const i = rows.findIndex((c) => c.id === id);
    if (i === -1) return false;
    rows.splice(i, 1);
    return true;
  });

  if (!removido) return erro('Cliente não encontrado.', 404);

  // Apaga junto todo o histórico de serviços do cliente.
  const servicosRemovidos = await mutate('services', (rows) => {
    let n = 0;
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      if (rows[i].clienteId === id) {
        rows.splice(i, 1);
        n += 1;
      }
    }
    return n;
  });

  return ok({ servicosRemovidos });
}
