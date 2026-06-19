import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { users } from '@/lib/api';
import { ProfileForm } from '@/components/account/ProfileForm';
import { AccountSecurity } from '@/components/account/AccountSecurity';
import { AddressBook } from '@/components/account/AddressBook';

export const metadata: Metadata = { title: 'Profile' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const token = await requireAuth();
  const [profile, addresses] = await Promise.all([
    users.profile(token),
    users.addresses(token).catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-fg">Profile</h1>
      <ProfileForm profile={profile} />
      <AddressBook addresses={addresses} />
      <AccountSecurity profile={profile} />
    </div>
  );
}
