/* Helpers compartilhados pelos scripts de linha de comando. */
const { MongoClient } = require('mongodb');
const crypto = require('node:crypto');

const COLECOES = {
  clients: 'clientes',
  services: 'atendimentos',
  serviceTypes: 'tiposServico',
  users: 'usuarios',
  config: 'config',
};

function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function comChaves(chave, doc) {
  const saida = { ...doc };
  delete saida._id;
  if (chave === 'clients' || chave === 'serviceTypes' || chave === 'services') {
    saida.nomeChave = normalizar(doc.nome);
  }
  if (chave === 'users') {
    saida.usuarioChave = String(doc.usuario || '').toLowerCase();
  }
  return saida;
}

async function conectar() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Defina MONGODB_URI antes de rodar. Exemplo:');
    console.error('  MONGODB_URI="mongodb://localhost:27017" npm run migrar');
    process.exit(1);
  }
  const cliente = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await cliente.connect();
  return { cliente, bd: cliente.db(process.env.MONGODB_DB || 'salao') };
}

module.exports = { COLECOES, normalizar, comChaves, conectar, newId: () => crypto.randomUUID() };
