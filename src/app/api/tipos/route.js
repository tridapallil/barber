import { ehDuplicado, inserir, listar, newId, semearTiposPadrao } from '@/lib/db';
import { erro, ok, semSessao, texto } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;
  await semearTiposPadrao();
  return ok(await listar('serviceTypes'));
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
  if (!nome) return erro('Informe o nome do serviço.');

  const tipo = { id: newId(), nome, criadoEm: new Date().toISOString() };
  try {
    await inserir('serviceTypes', tipo);
  } catch (e) {
    if (ehDuplicado(e)) return erro('Esse serviço já está na lista.', 409);
    throw e;
  }

  return ok(tipo);
}
