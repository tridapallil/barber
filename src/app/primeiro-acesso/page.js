import { redirect } from 'next/navigation';
import { MIN_SENHA, MIN_USUARIO, temUsuario } from '@/lib/auth';
import FormularioPrimeiroAcesso from './FormularioPrimeiroAcesso';

export const dynamic = 'force-dynamic';

export default async function PaginaPrimeiroAcesso() {
  if (await temUsuario()) redirect('/login');
  return <FormularioPrimeiroAcesso minUsuario={MIN_USUARIO} minSenha={MIN_SENHA} />;
}
