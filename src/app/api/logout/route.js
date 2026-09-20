import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';
import { ok } from '@/lib/api';

export async function POST() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  return ok();
}
