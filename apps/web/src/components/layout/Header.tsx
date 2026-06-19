import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { catalog, users, type Category } from '@/lib/api';
import { HeaderShell } from './HeaderShell';
import { CartButton } from './CartButton';

const ADMIN_ROLES = ['OWNER', 'MANAGER', 'STAFF'];

// Fixed nav order — matches the full category taxonomy in seed-demo.ts
const NAV_ORDER = [
  'laptops', 'desktop-pcs', 'components',
  'smartphones', 'gaming', 'monitors',
  'accessories', 'networking', 'smart-home',
];

export async function Header() {
  const [session, categories] = await Promise.all([
    getSession(),
    catalog.navCategories().catch(() => [] as Category[]),
  ]);
  const profile = session ? await users.profile(session.token).catch(() => null) : null;
  const isAdmin = !!profile && ADMIN_ROLES.includes(profile.role);

  // Sort categories by the fixed NAV_ORDER; unknown slugs go at the end
  const catMap = new Map(categories.map((c) => [c.slug, c]));
  const ordered = [
    ...NAV_ORDER.map((slug) => catMap.get(slug)).filter(Boolean) as Category[],
    ...categories.filter((c) => !NAV_ORDER.includes(c.slug)),
  ];

  const navCategories = ordered.map((c) => ({
    slug: c.slug,
    nameUz: c.nameUz,
    nameRu: c.nameRu,
    nameEn: c.nameEn,
  }));

  return (
    <HeaderShell
      authed={!!session}
      isAdmin={isAdmin}
      categories={navCategories}
      cart={<CartButton />}
    />
  );
}

export { Link };
