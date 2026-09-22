/*
 * Utilitário de dados (agora sobre MongoDB):
 *   MONGODB_URI="..." npm run exemplo   -> carrega os dados de demonstração
 *   MONGODB_URI="..." npm run limpar    -> apaga clientes e atendimentos
 *
 * `limpar` não mexe nos usuários: apagar o acesso deixaria o sistema trancado.
 */
const fs = require('node:fs');
const path = require('node:path');
const { COLECOES, comChaves, conectar, newId, normalizar } = require('./mongo-util');

const SERVICOS_PADRAO = [
  'Corte feminino', 'Corte masculino', 'Escova', 'Hidratação', 'Coloração',
  'Luzes / Mechas', 'Progressiva', 'Manicure', 'Pedicure',
  'Design de sobrancelha', 'Maquiagem', 'Penteado',
];

const exemplo = path.join(__dirname, '..', 'exemplo');

function lerExemplo(arquivo) {
  return JSON.parse(fs.readFileSync(path.join(exemplo, arquivo), 'utf8'));
}

async function carregarExemplo(bd) {
  const conjuntos = {
    clients: lerExemplo('clients.json'),
    services: lerExemplo('services.json'),
    serviceTypes: lerExemplo('serviceTypes.json'),
  };

  for (const [chave, registros] of Object.entries(conjuntos)) {
    const col = bd.collection(COLECOES[chave]);
    await col.deleteMany({});
    if (registros.length) await col.insertMany(registros.map((r) => comChaves(chave, r)));
  }

  await bd.collection(COLECOES.config).updateOne(
    { chave: 'tiposSemeados' },
    { $set: { chave: 'tiposSemeados', valor: true } },
    { upsert: true }
  );

  console.log(
    `Dados de exemplo carregados: ${conjuntos.clients.length} clientes e ${conjuntos.services.length} atendimentos.`
  );
}

async function limpar(bd) {
  await bd.collection(COLECOES.clients).deleteMany({});
  await bd.collection(COLECOES.services).deleteMany({});

  const tipos = bd.collection(COLECOES.serviceTypes);
  await tipos.deleteMany({});
  const agora = new Date().toISOString();
  await tipos.insertMany(
    SERVICOS_PADRAO.map((nome) => ({ id: newId(), nome, nomeChave: normalizar(nome), criadoEm: agora }))
  );

  await bd.collection(COLECOES.config).updateOne(
    { chave: 'tiposSemeados' },
    { $set: { chave: 'tiposSemeados', valor: true } },
    { upsert: true }
  );

  console.log(`Clientes e atendimentos apagados. Lista de serviços redefinida com ${SERVICOS_PADRAO.length} itens.`);
  console.log('O usuário de acesso foi mantido.');
}

async function main() {
  const acao = process.argv[2];
  if (!['exemplo', 'limpar'].includes(acao)) {
    console.log('Use: npm run exemplo   |   npm run limpar');
    process.exit(1);
  }

  const { cliente, bd } = await conectar();
  if (acao === 'exemplo') await carregarExemplo(bd);
  else await limpar(bd);
  await cliente.close();
}

main().catch((erro) => {
  console.error('Falhou:', erro.message);
  process.exit(1);
});
