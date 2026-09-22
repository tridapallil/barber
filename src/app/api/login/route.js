import { cookies } from 'next/headers';
import { COOKIE_NAME, autenticar, cookieOptions, createToken, temUsuario } from '@/lib/auth';
import { erro, ok, texto } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let corpo = {};
  try {
    corpo = await request.json();
  } catch {
    return erro('Requisição inválida.');
  }

  if (!(await temUsuario())) {
    return erro('Nenhum usuário cadastrado. Crie o primeiro acesso.', 409);
  }

  const usuario = texto(corpo.usuario, 60);
  const senha = texto(corpo.senha, 200);
  if (!usuario || !senha) return erro('Informe usuário e senha.');

  const autenticado = await autenticar(usuario, senha);
  if (!autenticado) return erro('Usuário ou senha incorretos.', 401);

  const store = await cookies();
  store.set(COOKIE_NAME, await createToken(autenticado), cookieOptions);
  return ok({ usuario: autenticado });
}
