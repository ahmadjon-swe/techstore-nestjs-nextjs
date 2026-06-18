import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="aurora" aria-hidden />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
            TechStore
          </Link>
          <h1 className="mt-4 font-display text-xl">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to continue</p>
        </div>

        <div className="glass rounded-2xl border border-line p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{' '}
          <Link href="/auth/register" className="text-accent-ink hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
