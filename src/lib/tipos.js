import { colecao } from './mongo';
import { newId } from './db';
import { normalizar } from './format';

/**
 * Garante que o nome do serviço exista na lista de tipos.
 * É assim que um serviço digitado na hora fica pré-salvo para a próxima vez.
 *
 * O upsert por `nomeChave` resolve a concorrência: dois atendimentos gravados
 * ao mesmo tempo com o mesmo serviço novo criam um único registro.
 */
export async function registrarTipo(nome) {
  const limpo = String(nome || '').trim();
  if (!limpo) return null;

  const col = await colecao('serviceTypes');
  const chave = normalizar(limpo);

  await col.updateOne(
    { nomeChave: chave },
    { $setOnInsert: { id: newId(), nome: limpo, nomeChave: chave, criadoEm: new Date().toISOString() } },
    { upsert: true }
  );

  return col.findOne({ nomeChave: chave }, { projection: { _id: 0, nomeChave: 0 } });
}
