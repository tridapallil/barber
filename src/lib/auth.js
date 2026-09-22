import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buscarUm, configDefinirSeAusente, contar, inserir, newId } from './db';
import { ehDuplicado } from './mongo';

export const COOKIE_NAME = 'salao_sessao';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

export const MIN_USUARIO = 3;
export const MIN_SENHA = 6;

/*
 * O segredo que assina o cookie vem da variável de ambiente. Sem ela, é gerado
 * uma vez e guardado no banco — assim as sessões sobrevivem a reinícios e a
 * novos deploys sem depender de arquivo em disco.
 */
let segredoEmCache = null;

async function segredo() {
  if (segredoEmCache) return segredoEmCache;

  if (process.env.SALAO_SEGREDO) {
    segredoEmCache = process.env.SALAO_SEGREDO;
    return segredoEmCache;
  }

  // upsert com $setOnInsert: se dois processos subirem juntos, vale um só valor
  segredoEmCache = await configDefinirSeAusente('segredoSessao', crypto.randomBytes(48).toString('hex'));
  return segredoEmCache;
}

async function assinar(valor) {
  return crypto.createHmac('sha256', await segredo()).update(valor).digest('hex');
}

export async function createToken(usuario) {
  const payload = Buffer.from(JSON.stringify({ user: usuario, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  return `${payload}.${await assinar(payload)}`;
}

export async function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, assinatura] = token.split('.');
  if (!payload || !assinatura) return null;

  const esperado = await assinar(payload);
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const dados = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!dados.exp || dados.exp < Date.now()) return null;
    return dados;
  } catch {
    return null;
  }
}

/* ---------- senhas ---------- */

function derivar(senha, salt) {
  return crypto.scryptSync(String(senha), salt, 64);
}

function criarHash(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: derivar(senha, salt).toString('hex') };
}

function conferirHash(senha, salt, hash) {
  if (!salt || !hash) return false;
  const esperado = Buffer.from(hash, 'hex');
  const obtido = derivar(senha, salt);
  return obtido.length === esperado.length && crypto.timingSafeEqual(obtido, esperado);
}

/* ---------- usuários ---------- */

export async function temUsuario() {
  return (await contar('users')) > 0;
}

export function validarCadastro(usuario, senha) {
  if (!usuario || usuario.length < MIN_USUARIO) return `O usuário precisa de pelo menos ${MIN_USUARIO} letras.`;
  if (!/^[\w.@-]+$/.test(usuario)) return 'Use apenas letras, números, ponto, hífen ou _ no usuário.';
  if (!senha || senha.length < MIN_SENHA) return `A senha precisa de pelo menos ${MIN_SENHA} caracteres.`;
  return null;
}

/** Só funciona enquanto não existir nenhum usuário — é o cadastro inicial. */
export async function criarPrimeiroUsuario(usuario, senha) {
  if (await temUsuario()) return { erro: 'Este sistema já tem um usuário cadastrado.' };

  const { salt, hash } = criarHash(senha);
  try {
    await inserir('users', {
      id: newId(),
      usuario,
      salt,
      hash,
      criadoEm: new Date().toISOString(),
    });
  } catch (erro) {
    if (ehDuplicado(erro)) return { erro: 'Este sistema já tem um usuário cadastrado.' };
    throw erro;
  }
  return { usuario };
}

export async function autenticar(usuario, senha) {
  const encontrado = await buscarUm('users', { usuarioChave: String(usuario).toLowerCase() });
  if (!encontrado) {
    // gasta o mesmo tempo de um acerto, para não entregar quais usuários existem
    derivar(senha, 'salt-falso-para-comparar');
    return null;
  }
  return conferirHash(senha, encontrado.salt, encontrado.hash) ? encontrado.usuario : null;
}

/* ---------- sessão ---------- */

export async function getSession() {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

/** Páginas protegidas: manda para o cadastro inicial ou para o login. */
export async function requireSession() {
  if (!(await temUsuario())) redirect('/primeiro-acesso');
  const sessao = await getSession();
  if (!sessao) redirect('/login');
  return sessao;
}

/*
 * `secure` fica desligado por padrão: numa instalação caseira o acesso costuma
 * ser por http://ip-da-rede, e um cookie secure simplesmente não seria enviado
 * — o login falharia sem explicação. Ligue com SALAO_COOKIE_SECURE=1 quando
 * estiver servindo por HTTPS.
 */
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: MAX_AGE,
  secure: process.env.SALAO_COOKIE_SECURE === '1',
};
