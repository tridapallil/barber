import { ehDuplicado, inserir, listar, newId } from '@/lib/db';
import { erro, ok, semSessao, texto } from '@/lib/api';
import { somenteDigitos } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function GET() {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;
  return ok(await listar('clients'));
}

export async function POST(request) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  let corpo = {};
  try {
    corpo = await request.json();
  } catch {
    return erro('Requisição inválida.');
  }

  const nome = texto(corpo.nome, 120);
  if (!nome) return erro('O nome do cliente é obrigatório.');

  const agora = new Date().toISOString();
  const cliente = {
    id: newId(),
    nome,
    telefone: somenteDigitos(texto(corpo.telefone, 30)),
    descricao: texto(corpo.descricao, 2000),
    criadoEm: agora,
    atualizadoEm: agora,
  };

  try {
    await inserir('clients', cliente);
  } catch (e) {
    if (ehDuplicado(e)) return erro('Já existe um cliente com esse nome.', 409);
    throw e;
  }

  return ok(cliente);
}
