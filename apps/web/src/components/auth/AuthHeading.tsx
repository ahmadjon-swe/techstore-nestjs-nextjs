'use client';

import Link from 'next/link';
import { useT, type TKey } from '@/lib/i18n';

export function AuthHeading({ title, subtitle }: { title: TKey; subtitle: TKey }) {
  const { t } = useT();
  return (
    <div className="mb-8 text-center">
      <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
        TechStore
      </Link>
      <h1 className="mt-4 font-display text-xl">{t(title)}</h1>
      <p className="mt-1 text-sm text-muted">{t(subtitle)}</p>
    </div>
  );
}

export function AuthAltPrompt({
  prompt,
  linkLabel,
  href,
}: {
  prompt?: TKey;
  linkLabel: TKey;
  href: string;
}) {
  const { t } = useT();
  return (
    <p className="mt-6 text-center text-sm text-muted">
      {prompt && <span>{t(prompt)} </span>}
      <Link href={href} className="text-accent-ink hover:underline">
        {t(linkLabel)}
      </Link>
    </p>
  );
}
