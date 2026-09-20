export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Data local de hoje no formato AAAA-MM-DD (sem sustos de fuso horário). */
export function hojeISO() {
  return paraISO(new Date());
}

export function paraISO(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Converte AAAA-MM-DD em Date local (meio-dia evita virada de fuso). */
export function deISO(iso) {
  if (!iso) return null;
  const [a, m, d] = String(iso).split('-').map(Number);
  if (!a || !m || !d) return null;
  return new Date(a, m - 1, d, 12, 0, 0);
}

export function somarDias(iso, dias) {
  const d = deISO(iso);
  if (!d) return iso;
  d.setDate(d.getDate() + dias);
  return paraISO(d);
}

/** Segunda-feira da semana de uma data. */
export function inicioSemana(iso) {
  const d = deISO(iso);
  if (!d) return iso;
  const diaSemana = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - diaSemana);
  return paraISO(d);
}

export function formatarData(iso) {
  const d = deISO(iso);
  if (!d) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export function formatarDataExtenso(iso) {
  const d = deISO(iso);
  if (!d) return '—';
  return `${DIAS_CURTOS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function diaCurto(iso) {
  const d = deISO(iso);
  if (!d) return '';
  return DIAS_CURTOS[d.getDay()];
}

export function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === '') return '—';
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarMoedaCurta(valor) {
  const n = Number(valor) || 0;
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',')}k`;
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatarTelefone(tel) {
  const d = String(tel || '').replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel || '';
}

export function somenteDigitos(tel) {
  return String(tel || '').replace(/\D/g, '');
}

/** Remove acentos e caixa para busca tolerante. */
export function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function iniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export const FORMAS_PAGAMENTO = ['Dinheiro', 'Pix', 'Cartão de débito', 'Cartão de crédito', 'Fiado'];

/** Ordena por nome sem quebrar se algum registro vier sem o campo. */
export function compararNome(a, b) {
  return String(a?.nome || '').localeCompare(String(b?.nome || ''), 'pt-BR');
}
