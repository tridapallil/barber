/*
 * Leva os dados dos arquivos JSON antigos (pasta data/) para o MongoDB.
 *
 *   MONGODB_URI="mongodb://localhost:27017" npm run migrar
 *   MONGODB_URI="..." node scripts/migrar-mongo.js /caminho/para/data
 *
 * Roda quantas vezes quiser: registros já migrados são reconhecidos pelo `id`
 * e apenas atualizados, nunca duplicados.
 */
const fs = require('node:fs');
const path = require('node:path');
const { COLECOES, comChaves, conectar, normalizar } = require('./mongo-util');

const ARQUIVOS = {
  clients: 'clients.json',
  services: 'services.json',
  serviceTypes: 'serviceTypes.json',
  users: 'users.json',
};

function ler(pasta, arquivo) {
  const caminho = path.join(pasta, arquivo);
  try {
    const bruto = fs.readFileSync(caminho, 'utf8');
    const dados = JSON.parse(bruto || '[]');
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

/** Os JSON antigos usavam `name`/`createdAt` em alguns registros. */
function ajustarTipo(t) {
  return {
    id: t.id,
    nome: String(t.nome || t.name || '').trim(),
    criadoEm: t.criadoEm || t.createdAt || new Date().toISOString(),
  };
}

async function main() {
  const pasta = process.argv[2] || path.join(__dirname, '..', 'data');
  if (!fs.existsSync(pasta)) {
    console.error(`Pasta não encontrada: ${pasta}`);
    process.exit(1);
  }

  const { cliente, bd } = await conectar();
  console.log(`Origem : ${pasta}`);
  console.log(`Destino: ${bd.databaseName}\n`);

  let total = 0;
  for (const [chave, arquivo] of Object.entries(ARQUIVOS)) {
    let registros = ler(pasta, arquivo);
    if (chave === 'serviceTypes') registros = registros.map(ajustarTipo).filter((t) => t.nome);

    if (registros.length === 0) {
      console.log(`${arquivo.padEnd(20)} vazio ou inexistente`);
      continue;
    }

    const col = bd.collection(COLECOES[chave]);
    let novos = 0;
    let atualizados = 0;

    for (const registro of registros) {
      if (!registro?.id) continue;
      const resultado = await col.updateOne(
        { id: registro.id },
        { $set: comChaves(chave, registro) },
        { upsert: true }
      );
      if (resultado.upsertedCount) novos += 1;
      else if (resultado.matchedCount) atualizados += 1;
    }

    total += novos;
    console.log(`${arquivo.padEnd(20)} ${novos} novo(s), ${atualizados} já existia(m)`);
  }

  // impede que a lista padrão de serviços seja semeada por cima do que veio
  const tipos = await bd.collection(COLECOES.serviceTypes).countDocuments();
  if (tipos > 0) {
    await bd.collection(COLECOES.config).updateOne(
      { chave: 'tiposSemeados' },
      { $set: { chave: 'tiposSemeados', valor: true } },
      { upsert: true }
    );
  }

  console.log(`\n${total} registro(s) inserido(s).`);
  await cliente.close();
}

main().catch((erro) => {
  console.error('Falhou:', erro.message);
  process.exit(1);
});
