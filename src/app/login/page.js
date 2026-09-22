import { redirect } from 'next/navigation';
import { getSession, temUsuario } from '@/lib/auth';
import { verificarConexao } from '@/lib/mongo';
import BancoIndisponivel from '@/components/BancoIndisponivel';
import FormularioLogin from './FormularioLogin';

export const dynamic = 'force-dynamic';

export default async function PaginaLogin() {
  const banco = await verificarConexao();
  if (!banco.ok) return <BancoIndisponivel motivo={banco.motivo} detalhe={banco.detalhe} />;

  if (!(await temUsuario())) redirect('/primeiro-acesso');
  if (await getSession()) redirect('/');
  return <FormularioLogin />;
}
