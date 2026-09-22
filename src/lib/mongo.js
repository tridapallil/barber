import { MongoClient } from 'mongodb';

const URI = process.env.MONGODB_URI;
const NOME_BANCO = process.env.MONGODB_DB || 'salao';

export const COLECOES = {
  clients: 'clientes',
  services: 'atendimentos',
  serviceTypes: 'tiposServico',
  users: 'usuarios',
  config: 'config',
};

function criarConexao() {
  if (!URI) {
    throw new Error(
      'MONGODB_URI não está definida. Configure a conexão com o MongoDB antes de iniciar o sistema.'
    );
  }
  const cliente = new MongoClient(URI, {
    serverSelectionTimeoutMS: 8000,
    retryWrites: true,
  });
  return cliente.connect();
}

/*
 * A conexão é aberta só no primeiro uso, nunca ao importar o módulo: o `next
 * build` carrega as rotas para inspecioná-las e não deve precisar de banco.
 *
 * Em desenvolvimento o Next recarrega os módulos a cada alteração; guardar a
 * promessa no globalThis evita abrir um pool novo a cada recarga.
 */
let conexao = null;

function obterConexao() {
  if (conexao) return conexao;

  if (process.env.NODE_ENV === 'development') {
    if (!globalThis.__salaoMongo) globalThis.__salaoMongo = criarConexao();
    conexao = globalThis.__salaoMongo;
  } else {
    conexao = criarConexao();
  }

  // uma falha não pode deixar a promessa rejeitada em cache para sempre
  conexao.catch(() => {
    conexao = null;
    if (process.env.NODE_ENV === 'development') globalThis.__salaoMongo = null;
  });

  return conexao;
}

let indicesProntos = null;

async function garantirIndices(bd) {
  await Promise.all([
    // `id` é o identificador usado pelo sistema todo; `_id` fica escondido
    bd.collection(COLECOES.clients).createIndex({ id: 1 }, { unique: true }),
    bd.collection(COLECOES.clients).createIndex({ nomeChave: 1 }, { unique: true }),
    bd.collection(COLECOES.services).createIndex({ id: 1 }, { unique: true }),
    bd.collection(COLECOES.services).createIndex({ clienteId: 1 }),
    bd.collection(COLECOES.services).createIndex({ data: -1 }),
    // permite saber se um tipo de serviço já foi usado sem varrer a coleção
    bd.collection(COLECOES.services).createIndex({ nomeChave: 1 }),
    bd.collection(COLECOES.serviceTypes).createIndex({ id: 1 }, { unique: true }),
    bd.collection(COLECOES.serviceTypes).createIndex({ nomeChave: 1 }, { unique: true }),
    bd.collection(COLECOES.users).createIndex({ id: 1 }, { unique: true }),
    bd.collection(COLECOES.users).createIndex({ usuarioChave: 1 }, { unique: true }),
    bd.collection(COLECOES.config).createIndex({ chave: 1 }, { unique: true }),
  ]);
}

export async function banco() {
  const cliente = await obterConexao();
  const bd = cliente.db(NOME_BANCO);
  if (!indicesProntos) {
    indicesProntos = garantirIndices(bd).catch((erro) => {
      indicesProntos = null; // permite tentar de novo na próxima chamada
      throw erro;
    });
  }
  await indicesProntos;
  return bd;
}

export async function colecao(chave) {
  const nome = COLECOES[chave] || chave;
  return (await banco()).collection(nome);
}

/** Erro de chave duplicada do Mongo. */
export function ehDuplicado(erro) {
  return erro?.code === 11000;
}
