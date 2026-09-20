/*
 * Utilitário de dados:
 *   node scripts/dados.js exemplo  -> carrega os dados de demonstração
 *   node scripts/dados.js limpar   -> apaga tudo e deixa só a lista de serviços
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const raiz = path.join(__dirname, '..');
const dados = path.join(raiz, 'data');
const exemplo = path.join(raiz, 'exemplo');

const SERVICOS_PADRAO = [
  'Corte feminino', 'Corte masculino', 'Escova', 'Hidratação', 'Coloração',
  'Luzes / Mechas', 'Progressiva', 'Manicure', 'Pedicure',
  'Design de sobrancelha', 'Maquiagem', 'Penteado',
];

const acao = process.argv[2];
fs.mkdirSync(dados, { recursive: true });

if (acao === 'exemplo') {
  for (const arquivo of ['clients.json', 'services.json', 'serviceTypes.json']) {
    fs.copyFileSync(path.join(exemplo, arquivo), path.join(dados, arquivo));
  }
  const clientes = require(path.join(dados, 'clients.json'));
  const servicos = require(path.join(dados, 'services.json'));
  console.log(`Dados de exemplo carregados: ${clientes.length} clientes e ${servicos.length} atendimentos.`);
} else if (acao === 'limpar') {
  fs.writeFileSync(path.join(dados, 'clients.json'), '[]\n');
  fs.writeFileSync(path.join(dados, 'services.json'), '[]\n');
  const agora = new Date().toISOString();
  const tipos = SERVICOS_PADRAO.map((nome) => ({ id: crypto.randomUUID(), nome, criadoEm: agora }));
  fs.writeFileSync(path.join(dados, 'serviceTypes.json'), `${JSON.stringify(tipos, null, 2)}\n`);
  console.log(`Dados apagados. Lista de serviços redefinida com ${tipos.length} itens.`);
} else {
  console.log('Use: node scripts/dados.js exemplo   |   node scripts/dados.js limpar');
  process.exit(1);
}
