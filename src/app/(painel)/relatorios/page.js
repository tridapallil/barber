import { carregarTudo } from '@/lib/carregar';
import PainelRelatorios from './PainelRelatorios';

export const dynamic = 'force-dynamic';

export default async function PaginaRelatorios() {
  const { clientes, servicos } = await carregarTudo();
  return <PainelRelatorios clientes={clientes} servicos={servicos} />;
}
