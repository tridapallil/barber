import { mutate, newId, readAll } from '@/lib/db';
import { erro, ok, semSessao, texto } from '@/lib/api';
import { normalizar, somenteDigitos } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function GET() {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;
  return ok(await readAll('clients'));
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

  const cliente = {
    id: newId(),
    nome,
    telefone: somenteDigitos(texto(corpo.telefone, 30)),
    descricao: texto(corpo.descricao, 2000),
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  const duplicado = await mutate('clients', (rows) => {
    const jaExiste = rows.some((c) => normalizar(c.nome) === normalizar(nome));
    if (!jaExiste) rows.push(cliente);
    return jaExiste;
  });

  if (duplicado) return erro('Já existe um cliente com esse nome.', 409);
  return ok(cliente);
}
