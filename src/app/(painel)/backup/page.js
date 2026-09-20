import { carregarTudo } from '@/lib/carregar';
import PainelBackup from './PainelBackup';

export const dynamic = 'force-dynamic';

export default async function PaginaBackup() {
  const { clientes, servicos, tipos } = await carregarTudo();
  return (
    <PainelBackup
      contagem={{ clientes: clientes.length, servicos: servicos.length, tipos: tipos.length }}
    />
  );
}
