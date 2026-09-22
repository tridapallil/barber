import crypto from 'node:crypto';
import { colecao, ehDuplicado } from './mongo';
import { normalizar } from './format';

export { ehDuplicado };

/** Campos internos de busca — nunca saem para a aplicação. */
const SEM_INTERNOS = { _id: 0, nomeChave: 0, usuarioChave: 0 };

export const SERVICOS_PADRAO = [
  'Corte feminino',
  'Corte masculino',
  'Escova',
  'Hidratação',
  'Coloração',
  'Luzes / Mechas',
  'Progressiva',
  'Manicure',
  'Pedicure',
  'Design de sobrancelha',
  'Maquiagem',
  'Penteado',
];

export function newId() {
  return crypto.randomUUID();
}

/*
 * Chaves normalizadas guardadas junto do documento. São elas que carregam os
 * índices únicos: em vez de "procurar e depois inserir" — que abre espaço para
 * duas gravações simultâneas criarem o mesmo cliente — o próprio banco recusa
 * a duplicata.
 */
function comChaves(chave, doc) {
  const saida = { ...doc };
  if (chave === 'clients' || chave === 'serviceTypes' || chave === 'services') {
    saida.nomeChave = normalizar(doc.nome);
  }
  if (chave === 'users') {
    saida.usuarioChave = String(doc.usuario || '').toLowerCase();
  }
  return saida;
}

export async function listar(chave, filtro = {}, opcoes = {}) {
  const col = await colecao(chave);
  return col.find(filtro, { projection: SEM_INTERNOS, ...opcoes }).toArray();
}

export async function buscarUm(chave, filtro) {
  const col = await colecao(chave);
  return col.findOne(filtro, { projection: SEM_INTERNOS });
}

export async function contar(chave, filtro = {}) {
  const col = await colecao(chave);
  return col.countDocuments(filtro);
}

export async function inserir(chave, doc) {
  const col = await colecao(chave);
  await col.insertOne(comChaves(chave, doc));
  return doc;
}

/** Aplica `mudancas` e devolve o documento já atualizado, ou null se não existir. */
export async function atualizarUm(chave, filtro, mudancas) {
  const col = await colecao(chave);
  const resultado = await col.findOneAndUpdate(
    filtro,
    { $set: comChaves(chave, mudancas) },
    { returnDocument: 'after', projection: SEM_INTERNOS }
  );
  return resultado || null;
}

export async function removerUm(chave, filtro) {
  const col = await colecao(chave);
  const { deletedCount } = await col.deleteOne(filtro);
  return deletedCount > 0;
}

export async function removerVarios(chave, filtro) {
  const col = await colecao(chave);
  const { deletedCount } = await col.deleteMany(filtro);
  return deletedCount;
}

/** Usado na restauração de backup: troca o conteúdo inteiro de uma coleção. */
export async function substituirColecao(chave, documentos) {
  const col = await colecao(chave);
  await col.deleteMany({});
  if (documentos.length > 0) {
    await col.insertMany(documentos.map((d) => comChaves(chave, { ...d, _id: undefined })));
  }
  return documentos.length;
}

/* ---------- configuração interna (segredo da sessão, marcações) ---------- */

export async function configObter(chave) {
  const col = await colecao('config');
  const doc = await col.findOne({ chave });
  return doc?.valor ?? null;
}

export async function configDefinir(chave, valor) {
  const col = await colecao('config');
  await col.updateOne({ chave }, { $set: { chave, valor } }, { upsert: true });
  return valor;
}

/**
 * Semeia a lista de serviços na primeira execução. A marcação em `config`
 * evita que os padrões voltem caso o usuário apague todos de propósito.
 */
export async function semearTiposPadrao() {
  if (await configObter('tiposSemeados')) return 0;

  const col = await colecao('serviceTypes');
  const agora = new Date().toISOString();
  let criados = 0;

  for (const nome of SERVICOS_PADRAO) {
    const resultado = await col.updateOne(
      { nomeChave: normalizar(nome) },
      { $setOnInsert: { id: newId(), nome, nomeChave: normalizar(nome), criadoEm: agora } },
      { upsert: true }
    );
    if (resultado.upsertedCount) criados += 1;
  }

  await configDefinir('tiposSemeados', true);
  return criados;
}

/** Grava só se ainda não existir; devolve o valor que ficou valendo. */
export async function configDefinirSeAusente(chave, valor) {
  const col = await colecao('config');
  await col.updateOne({ chave }, { $setOnInsert: { chave, valor } }, { upsert: true });
  const doc = await col.findOne({ chave });
  return doc?.valor ?? valor;
}
