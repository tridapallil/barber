import { NextResponse } from 'next/server';
import { listar, substituirColecao } from '@/lib/db';
import { erro, ok, semSessao } from '@/lib/api';
import { paraISO } from '@/lib/format';

export const dynamic = 'force-dynamic';

const CHAVES = ['clients', 'services', 'serviceTypes', 'users'];

/** Baixa um arquivo com tudo: clientes, atendimentos, lista de serviços e acesso. */
export async function GET() {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  const [clients, services, serviceTypes, users] = await Promise.all(CHAVES.map((c) => listar(c)));

  const conteudo = {
    formato: 'salao-backup',
    versao: 1,
    geradoEm: new Date().toISOString(),
    clients,
    services,
    serviceTypes,
    users,
  };

  const nome = `salao-backup-${paraISO(new Date())}.json`;

  return new NextResponse(JSON.stringify(conteudo, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nome}"`,
      'Cache-Control': 'no-store',
    },
  });
}

/** Restaura um arquivo gerado acima, substituindo o que existe hoje. */
export async function POST(request) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro('O arquivo não é um JSON válido.');
  }

  if (!corpo || corpo.formato !== 'salao-backup') {
    return erro('Este arquivo não é um backup do salão.');
  }

  const presentes = CHAVES.filter((c) => Array.isArray(corpo[c]));
  if (presentes.length === 0) {
    return erro('O backup está vazio — nada para restaurar.');
  }

  // Um backup sem usuários deixaria o sistema sem acesso nenhum.
  if (presentes.includes('users') && corpo.users.length === 0) {
    return erro('O backup não tem nenhum usuário. Restaurar deixaria você sem acesso.');
  }

  const resumo = {};
  for (const chave of presentes) {
    resumo[chave] = await substituirColecao(chave, corpo[chave]);
  }

  return ok({ restaurado: resumo, geradoEm: corpo.geradoEm || null });
}
