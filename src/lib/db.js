import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = path.join(process.cwd(), 'data');

const FILES = {
  clients: 'clients.json',
  services: 'services.json',
  serviceTypes: 'serviceTypes.json',
  users: 'users.json',
};

const SEED_SERVICE_TYPES = [
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

// Fila de escrita: garante que duas gravações no mesmo arquivo nunca se cruzem.
const writeQueues = new Map();

function enqueue(key, task) {
  const previous = writeQueues.get(key) || Promise.resolve();
  const next = previous.then(task, task);
  writeQueues.set(
    key,
    next.catch(() => {})
  );
  return next;
}

export function newId() {
  return crypto.randomUUID();
}

async function ensureFile(key) {
  const file = path.join(DATA_DIR, FILES[key]);
  try {
    await fs.access(file);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const seed =
      key === 'serviceTypes'
        ? SEED_SERVICE_TYPES.map((nome) => ({ id: newId(), nome, criadoEm: new Date().toISOString() }))
        : [];
    await fs.writeFile(file, JSON.stringify(seed, null, 2), 'utf8');
  }
  return file;
}

/*
 * Versões antigas semeavam os tipos de serviço com `name`/`createdAt` em
 * inglês, o que quebrava qualquer ordenação por `nome`. Aqui os registros
 * antigos são convertidos na leitura e regravados já corrigidos.
 */
function migrar(key, rows) {
  if (key !== 'serviceTypes') return { rows, mudou: false };

  let mudou = false;
  const convertidas = rows
    .map((t) => {
      if (t && typeof t.nome === 'string' && t.nome) return t;
      mudou = true;
      return {
        id: t?.id || newId(),
        nome: String(t?.nome || t?.name || '').trim(),
        criadoEm: t?.criadoEm || t?.createdAt || new Date().toISOString(),
      };
    })
    .filter((t) => t.nome);

  if (convertidas.length !== rows.length) mudou = true;
  return { rows: convertidas, mudou };
}

export async function readAll(key) {
  const file = await ensureFile(key);
  let linhas = [];
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    linhas = Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }

  const { rows, mudou } = migrar(key, linhas);
  if (mudou) await writeAll(key, rows);
  return rows;
}

export async function writeAll(key, rows) {
  const file = await ensureFile(key);
  return enqueue(key, async () => {
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), 'utf8');
    await fs.rename(tmp, file);
    return rows;
  });
}

/** Lê, aplica `mutator` e grava — tudo dentro da fila, sem corrida. */
export async function mutate(key, mutator) {
  return enqueue(key, async () => {
    const file = await ensureFile(key);
    let rows = [];
    try {
      rows = JSON.parse((await fs.readFile(file, 'utf8')) || '[]');
    } catch {
      rows = [];
    }
    if (!Array.isArray(rows)) rows = [];
    rows = migrar(key, rows).rows;
    const result = await mutator(rows);
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), 'utf8');
    await fs.rename(tmp, file);
    return result;
  });
}
