import { cookies } from 'next/headers';
import {
  COOKIE_NAME,
  cookieOptions,
  createToken,
  criarPrimeiroUsuario,
  temUsuario,
  validarCadastro,
} from '@/lib/auth';
import { erro, ok, texto } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let corpo = {};
  try {
    corpo = await request.json();
  } catch {
    return erro('Requisição inválida.');
  }

  if (await temUsuario()) {
    return erro('Este sistema já tem um usuário cadastrado.', 409);
  }

  const usuario = texto(corpo.usuario, 60);
  const senha = texto(corpo.senha, 200);
  const confirmacao = texto(corpo.confirmacao, 200);

  const problema = validarCadastro(usuario, senha);
  if (problema) return erro(problema);
  if (senha !== confirmacao) return erro('As senhas não são iguais.');

  const resultado = await criarPrimeiroUsuario(usuario, senha);
  if (resultado.erro) return erro(resultado.erro, 409);

  const store = await cookies();
  store.set(COOKIE_NAME, createToken(resultado.usuario), cookieOptions);
  return ok({ usuario: resultado.usuario });
}
