import { redirect } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const token = await getAccessToken();
  if (!token) redirect('/auth/login');

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">{children}</main>
      <Footer />
    </>
  );
}
