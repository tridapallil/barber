import { NextResponse } from 'next/server';
import { getSession } from './auth';
import { verificarConexao } from './mongo';

export function ok(data) {
  return NextResponse.json(data ?? { ok: true });
}

export function erro(mensagem, status = 400) {
  return NextResponse.json({ erro: mensagem }, { status });
}

/**
 * Barra a requisição quando o banco está fora ou não há sessão.
 * Devolve a resposta pronta, ou null quando pode seguir.
 */
export async function semSessao() {
  const banco = await verificarConexao();
  if (!banco.ok) {
    return erro(
      banco.motivo === 'sem-uri'
        ? 'O banco de dados não está configurado (MONGODB_URI).'
        : 'Não foi possível falar com o banco de dados.',
      503
    );
  }

  const sessao = await getSession();
  return sessao ? null : erro('Sessão expirada. Entre novamente.', 401);
}

export function texto(valor, max = 400) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim().slice(0, max);
}

/** Aceita "120", "120,50", "R$ 120,50" e devolve número ou null. */
export function numeroOuNulo(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
  const limpo = String(valor).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.');
  const n = Number.parseFloat(limpo);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

export function dataValida(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(iso || '')) && !Number.isNaN(Date.parse(iso));
}
