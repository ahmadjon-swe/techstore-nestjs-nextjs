import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { HeaderShell } from './HeaderShell';
import { CartButton } from './CartButton';

export async function Header() {
  const session = await getSession();
  return <HeaderShell authed={!!session} cart={<CartButton />} />;
}

export { Link };
