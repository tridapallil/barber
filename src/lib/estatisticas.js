import { hojeISO, inicioSemana, normalizar, somarDias } from './format';

export function totalValor(servicos) {
  return servicos.reduce((soma, s) => soma + (Number(s.valor) || 0), 0);
}

export function noIntervalo(servicos, de, ate) {
  return servicos.filter((s) => s.data >= de && s.data <= ate);
}

export function intervaloSemana(referencia = hojeISO()) {
  const de = inicioSemana(referencia);
  return { de, ate: somarDias(de, 6) };
}

export function intervaloMes(ano, mes) {
  const de = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
  const ultimoDia = new Date(ano, mes + 1, 0).getDate();
  return { de, ate: `${ano}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}` };
}

/** Série diária dos últimos N dias, terminando hoje. */
export function serieDiaria(servicos, dias = 14, referencia = hojeISO()) {
  const inicio = somarDias(referencia, -(dias - 1));
  const mapa = new Map();
  for (let i = 0; i < dias; i += 1) {
    mapa.set(somarDias(inicio, i), { data: somarDias(inicio, i), quantidade: 0, valor: 0 });
  }
  for (const s of servicos) {
    const alvo = mapa.get(s.data);
    if (alvo) {
      alvo.quantidade += 1;
      alvo.valor += Number(s.valor) || 0;
    }
  }
  return [...mapa.values()];
}

/** Agrupa por nome de serviço, do mais frequente para o menos. */
export function porServico(servicos) {
  const mapa = new Map();
  for (const s of servicos) {
    const chave = normalizar(s.nome);
    const atual = mapa.get(chave) || { nome: s.nome, quantidade: 0, valor: 0 };
    atual.quantidade += 1;
    atual.valor += Number(s.valor) || 0;
    mapa.set(chave, atual);
  }
  return [...mapa.values()].sort((a, b) => b.quantidade - a.quantidade || b.valor - a.valor);
}

export function porPagamento(servicos) {
  const mapa = new Map();
  for (const s of servicos) {
    const chave = s.pagamento || 'Não informado';
    const atual = mapa.get(chave) || { nome: chave, quantidade: 0, valor: 0 };
    atual.quantidade += 1;
    atual.valor += Number(s.valor) || 0;
    mapa.set(chave, atual);
  }
  return [...mapa.values()].sort((a, b) => b.valor - a.valor || b.quantidade - a.quantidade);
}

export function porCliente(servicos, clientes) {
  const nomes = new Map(clientes.map((c) => [c.id, c.nome]));
  const mapa = new Map();
  for (const s of servicos) {
    const atual = mapa.get(s.clienteId) || {
      id: s.clienteId,
      nome: nomes.get(s.clienteId) || 'Cliente removido',
      quantidade: 0,
      valor: 0,
    };
    atual.quantidade += 1;
    atual.valor += Number(s.valor) || 0;
    mapa.set(s.clienteId, atual);
  }
  return [...mapa.values()].sort((a, b) => b.quantidade - a.quantidade || b.valor - a.valor);
}

export function resumo(servicos) {
  const comValor = servicos.filter((s) => Number.isFinite(Number(s.valor)) && s.valor !== null && s.valor !== '');
  const valor = totalValor(servicos);
  return {
    quantidade: servicos.length,
    valor,
    semValor: servicos.length - comValor.length,
    ticket: comValor.length ? valor / comValor.length : 0,
  };
}

/** Série diária de um intervalo fechado (usada nos relatórios). */
export function serieIntervalo(servicos, de, ate) {
  const dias = [];
  let atual = de;
  let guarda = 0;
  while (atual <= ate && guarda < 400) {
    dias.push({ data: atual, quantidade: 0, valor: 0 });
    atual = somarDias(atual, 1);
    guarda += 1;
  }
  const mapa = new Map(dias.map((d) => [d.data, d]));
  for (const s of servicos) {
    const alvo = mapa.get(s.data);
    if (alvo) {
      alvo.quantidade += 1;
      alvo.valor += Number(s.valor) || 0;
    }
  }
  return dias;
}
