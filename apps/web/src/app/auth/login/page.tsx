import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthControls } from '@/components/auth/AuthControls';
import { AuthHeading, AuthAltPrompt } from '@/components/auth/AuthHeading';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <AuthControls />
      <div className="aurora" aria-hidden />
      <div className="w-full max-w-sm">
        <AuthHeading title="auth.welcomeBack" subtitle="auth.signinToContinue" />

        <div className="glass rounded-2xl border border-line p-8">
          <LoginForm />
        </div>

        <AuthAltPrompt prompt="auth.newHere" linkLabel="auth.signup" href="/auth/register" />
      </div>
    </div>
  );
}
