import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthControls } from '@/components/auth/AuthControls';
import { AuthHeading, AuthAltPrompt } from '@/components/auth/AuthHeading';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <AuthControls />
      <div className="aurora" aria-hidden />
      <div className="w-full max-w-sm">
        <AuthHeading title="auth.createTitle" subtitle="auth.createSubtitle" />

        <div className="glass rounded-2xl border border-line p-8">
          <RegisterForm />
        </div>

        <AuthAltPrompt prompt="auth.haveAccount" linkLabel="auth.signin" href="/auth/login" />
      </div>
    </div>
  );
}
