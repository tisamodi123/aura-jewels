import type { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/lib/Api_Url';
import policiesData from '@/data/policies';
import journalData from '@/data/journal.json';

// Set NEXT_PUBLIC_SITE_URL to the production storefront origin (no trailing
// slash). The fallback is only a placeholder for non-configured environments.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aurajewels.com').replace(/\/$/, '');

// Refresh the generated sitemap at most once an hour (ISR), so newly added
// categories/collections appear without a full redeploy.
export const revalidate = 3600;

const abs = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

// Static, high-value routes that always exist.
const STATIC_PATHS = [
  '/',
  '/all',
  '/collections',
  '/custom-jewellery',
  '/ethical-sourcing',
  '/journal',
  '/ring-size-guide',
  '/bracelet-size-guide',
  '/necklace-size-guide',
  '/about-us',
  '/4cs-guide',
  '/growing-diamonds',
  '/faq',
  '/get-in-touch',
  '/aura-care',
  '/sitemap',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // 1) Static pages.
  for (const p of STATIC_PATHS) {
    entries.push({ url: abs(p), lastModified: now, changeFrequency: 'weekly', priority: p === '/' ? 1 : 0.7 });
  }

  // 2) Policy pages (from the local content file).
  for (const policy of policiesData) {
    if (policy?.slug) entries.push({ url: abs(`/policies/${policy.slug}`), lastModified: now, changeFrequency: 'yearly', priority: 0.3 });
  }

  // 3) Journal articles (from the local content file).
  for (const article of journalData) {
    if (article?.slug) entries.push({ url: abs(`/journal/${article.slug}`), lastModified: now, changeFrequency: 'monthly', priority: 0.5 });
  }

  // 4) Categories — same admin-authored menu the header uses.
  try {
    const res = await fetch(`${API_BASE_URL}app/menu`, { next: { revalidate } }).then((r) => r.json());
    const items = Array.isArray(res?.data?.items) ? res.data.items : [];
    for (const it of items) {
      const href: string = it?.redirect?.href || it?.redirect?.url || '';
      if (href && href !== '#' && href.startsWith('/')) {
        entries.push({ url: abs(href), lastModified: now, changeFrequency: 'daily', priority: 0.8 });
      }
    }
  } catch (e) {
    console.error('sitemap.xml: category fetch failed:', e);
  }

  // 5) Collections — same source as the storefront collections API.
  try {
    const res = await fetch(`${API_BASE_URL}products/getCollectionList`, { next: { revalidate } }).then((r) => r.json());
    const cols = Array.isArray(res?.data) ? res.data : [];
    for (const c of cols) {
      if (c?.slug) entries.push({ url: abs(`/collection/${c.slug}`), lastModified: now, changeFrequency: 'weekly', priority: 0.6 });
    }
  } catch (e) {
    console.error('sitemap.xml: collection fetch failed:', e);
  }

  // De-duplicate by URL (a menu item may coincide with a static path).
  const seen = new Set<string>();
  return entries.filter((e) => (seen.has(e.url) ? false : (seen.add(e.url), true)));
}
