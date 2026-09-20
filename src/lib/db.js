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
        ? SEED_SERVICE_TYPES.map((name) => ({ id: newId(), name, createdAt: new Date().toISOString() }))
        : [];
    await fs.writeFile(file, JSON.stringify(seed, null, 2), 'utf8');
  }
  return file;
}

export async function readAll(key) {
  const file = await ensureFile(key);
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
    const result = await mutator(rows);
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), 'utf8');
    await fs.rename(tmp, file);
    return result;
  });
}
