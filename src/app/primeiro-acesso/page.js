import { redirect } from 'next/navigation';
import { MIN_SENHA, MIN_USUARIO, temUsuario } from '@/lib/auth';
import { verificarConexao } from '@/lib/mongo';
import BancoIndisponivel from '@/components/BancoIndisponivel';
import FormularioPrimeiroAcesso from './FormularioPrimeiroAcesso';

export const dynamic = 'force-dynamic';

export default async function PaginaPrimeiroAcesso() {
  const banco = await verificarConexao();
  if (!banco.ok) return <BancoIndisponivel motivo={banco.motivo} detalhe={banco.detalhe} />;

  if (await temUsuario()) redirect('/login');
  return <FormularioPrimeiroAcesso minUsuario={MIN_USUARIO} minSenha={MIN_SENHA} />;
}
