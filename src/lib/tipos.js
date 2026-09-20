import { mutate, newId } from './db';
import { normalizar } from './format';

/**
 * Garante que o nome do serviço exista na lista de tipos.
 * É assim que um serviço digitado na hora fica pré-salvo para a próxima vez.
 */
export async function registrarTipo(nome) {
  const limpo = String(nome || '').trim();
  if (!limpo) return null;
  return mutate('serviceTypes', (rows) => {
    const existente = rows.find((t) => normalizar(t.nome) === normalizar(limpo));
    if (existente) return existente;
    const tipo = { id: newId(), nome: limpo, criadoEm: new Date().toISOString() };
    rows.push(tipo);
    return tipo;
  });
}
