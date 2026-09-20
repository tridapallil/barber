import { mutate, newId, readAll } from '@/lib/db';
import { dataValida, erro, numeroOuNulo, ok, semSessao, texto } from '@/lib/api';
import { registrarTipo } from '@/lib/tipos';

export const dynamic = 'force-dynamic';

export async function GET() {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;
  return ok(await readAll('services'));
}

export async function POST(request) {
  const bloqueio = await semSessao();
  if (bloqueio) return bloqueio;

  let corpo = {};
  try {
    corpo = await request.json();
  } catch {
    return erro('Requisição inválida.');
  }

  const clienteId = texto(corpo.clienteId, 80);
  const nome = texto(corpo.nome, 120);
  const data = texto(corpo.data, 10);

  if (!clienteId) return erro('Selecione o cliente.');
  if (!nome) return erro('O nome do serviço é obrigatório.');
  if (!dataValida(data)) return erro('Informe uma data válida.');

  const clientes = await readAll('clients');
  if (!clientes.some((c) => c.id === clienteId)) return erro('Cliente não encontrado.', 404);

  const servico = {
    id: newId(),
    clienteId,
    nome,
    data,
    valor: numeroOuNulo(corpo.valor),
    pagamento: texto(corpo.pagamento, 60),
    descricao: texto(corpo.descricao, 2000),
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  await mutate('services', (rows) => rows.push(servico));
  await registrarTipo(nome);

  return ok(servico);
}
