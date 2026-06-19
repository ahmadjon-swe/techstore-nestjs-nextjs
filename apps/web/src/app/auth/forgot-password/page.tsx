import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AuthControls } from '@/components/auth/AuthControls';
import { AuthHeading, AuthAltPrompt } from '@/components/auth/AuthHeading';

export const metadata: Metadata = { title: 'Reset password' };

export default function ForgotPasswordPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <AuthControls />
      <div className="aurora" aria-hidden />
      <div className="w-full max-w-sm">
        <AuthHeading title="auth.resetYourPassword" subtitle="auth.resetEmailHint" />

        <div className="glass rounded-2xl border border-line p-8">
          <ForgotPasswordForm />
        </div>

        <AuthAltPrompt linkLabel="auth.backToSignin" href="/auth/login" />
      </div>
    </div>
  );
}
