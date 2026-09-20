import { mutate, newId, readAll } from '@/lib/db';
import { erro, ok, semSessao, texto } from '@/lib/api';
import { normalizar } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function GET() {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;
  return ok(await readAll('serviceTypes'));
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

  const resultado = await mutate('serviceTypes', (rows) => {
    if (rows.some((t) => normalizar(t.nome) === normalizar(nome))) return null;
    const tipo = { id: newId(), nome, criadoEm: new Date().toISOString() };
    rows.push(tipo);
    return tipo;
  });

  if (!resultado) return erro('Esse serviço já está na lista.', 409);
  return ok(resultado);
}
