import { usePrefs } from '@/store/prefs';
import { translate, type TKey } from './dictionary';

export { translate, localized, type TKey } from './dictionary';
export type { Locale } from '@/store/prefs';

/** Hook: returns a translator bound to the active locale. */
export function useT() {
  const locale = usePrefs((s) => s.locale);
  const t = (key: TKey, vars?: Record<string, string | number>) => translate(locale, key, vars);
  return { t, locale };
}
