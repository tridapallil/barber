import { NextResponse } from 'next/server';
import { getSession } from './auth';

export function ok(data) {
  return NextResponse.json(data ?? { ok: true });
}

export function erro(mensagem, status = 400) {
  return NextResponse.json({ erro: mensagem }, { status });
}

/** Retorna uma resposta 401 quando não há sessão, ou null quando pode seguir. */
export async function semSessao() {
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
