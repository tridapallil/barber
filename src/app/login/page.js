import { redirect } from 'next/navigation';
import { getSession, temUsuario } from '@/lib/auth';
import FormularioLogin from './FormularioLogin';

export const dynamic = 'force-dynamic';

export default async function PaginaLogin() {
  if (!(await temUsuario())) redirect('/primeiro-acesso');
  if (await getSession()) redirect('/');
  return <FormularioLogin />;
}
