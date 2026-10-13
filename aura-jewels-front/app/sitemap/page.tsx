import React from 'react';
import Link from 'next/link';
import { API_BASE_URL, ENDPOINTS } from '@/lib/Api_Url';
import { STATUS_CODE } from '@/lib/constants';

export const metadata = {
  title: 'Sitemap | Aura Jewels',
  description: 'Browse everything on Aura Jewels — shop, size guides, services, and policies.',
};

type LinkItem = { name: string; href: string };
type Group = { title: string; items: LinkItem[] };

const STATIC_GROUPS: Group[] = [
  {
    title: 'Shop',
    items: [
      { name: 'All Jewellery', href: '/all' },
      { name: 'Bespoke Design', href: '/custom-jewellery' },
      { name: 'Cart', href: '/cart' },
      { name: 'Wishlist', href: '/wishlist' },
      { name: 'My Account', href: '/my-account/profile' },
    ],
  },
  {
    title: 'About Aura Jewels',
    items: [
      { name: 'Our Story', href: '/about-us' },
      { name: 'The 4Cs Guide', href: '/4cs-guide' },
      { name: 'Growing Diamonds', href: '/growing-diamonds' },
      { name: 'Ethical Sourcing', href: '/ethical-sourcing' },
      { name: 'The Journal', href: '/journal' },
      { name: 'B2B Inquiry', href: '/inquiry' },
    ],
  },
  {
    title: 'Size Guides',
    items: [
      { name: 'Ring Size Guide', href: '/ring-size-guide' },
      { name: 'Bracelet Size Guide', href: '/bracelet-size-guide' },
      { name: 'Necklace / Chain Size Guide', href: '/necklace-size-guide' },
    ],
  },
  {
    title: 'Support',
    items: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Track My Order', href: '/my-account/my-order' },
      { name: 'Aura Care', href: '/aura-care' },
      { name: 'Get In Touch', href: '/get-in-touch' },
    ],
  },
  {
    title: 'Customer Policies',
    items: [
      { name: 'Payment Policy', href: '/policies/payment-policy' },
      { name: 'Shipping & Delivery Policy', href: '/policies/shipping-delivery-policy' },
      { name: 'Cancellation Policy', href: '/policies/cancellation-policy' },
      { name: 'Return & Refund Policy', href: '/policies/return-refund-policy' },
      { name: 'Warranty Policy', href: '/policies/warranty-policy' },
      { name: 'Grievance Redressal Policy', href: '/policies/grievance-redressal-policy' },
    ],
  },
  {
    title: 'Jewellery Services',
    items: [
      { name: 'Bespoke Design / Custom Jewellery Policy', href: '/policies/custom-jewellery-policy' },
      { name: 'Lifetime Exchange Policy', href: '/policies/lifetime-exchange-policy' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { name: 'Terms & Conditions', href: '/policies/terms-and-conditions' },
      { name: 'Privacy Policy', href: '/policies/privacy-policy' },
      { name: 'Cookie Policy', href: '/policies/cookie-policy' },
      { name: 'Mandatory E-commerce Disclosures', href: '/policies/mandatory-ecommerce-disclosures' },
    ],
  },
  {
    title: 'Certification & Compliance',
    items: [
      { name: 'Diamond Certification Policy', href: '/policies/diamond-certification-policy' },
      { name: 'BIS Hallmark Policy', href: '/policies/bis-hallmark-huid-policy' },
    ],
  },
];

async function getCategoryGroup(): Promise<Group | null> {
  try {
    const res = await fetch(`${API_BASE_URL}app/menu`, { next: { revalidate: 3600 } }).then((r) => r.json());
    const items = Array.isArray(res?.data?.items) ? res.data.items : [];
    const links: LinkItem[] = items
      .map((it: any) => ({
        name: it.label,
        href: it.redirect?.href || it.redirect?.url || '',
      }))
      .filter((l: LinkItem) => l.name && l.href && l.href !== '#');
    if (links.length) {
      return { title: 'Shop by Category', items: links };
    }
  } catch (e) {
    console.error('sitemap categories load failed:', e);
  }
  return null;
}

async function getCollectionGroup(): Promise<Group | null> {
  try {
    const res = await fetch(ENDPOINTS.PRODUCT.GET_COLLECTIONS, { next: { revalidate: 3600 } }).then((r) => r.json());
    if (res && (res.errorCode === STATUS_CODE.OK || res.status === STATUS_CODE.OK)) {
      const links: LinkItem[] = (Array.isArray(res.data) ? res.data : [])
        .filter((c: any) => c?.slug && c?.name)
        .map((c: any) => ({ name: c.name, href: `/collection/${c.slug}` }));
      if (links.length) {
        return { title: 'Collections', items: links };
      }
    }
  } catch (e) {
    console.error('sitemap collections load failed:', e);
  }
  return null;
}

export default async function Page() {
  const [categoryGroup, collectionGroup] = await Promise.all([
    getCategoryGroup(),
    getCollectionGroup(),
  ]);

  const [shopGroup, ...restGroups] = STATIC_GROUPS;
  const groups: Group[] = [
    shopGroup,
    ...(categoryGroup ? [categoryGroup] : []),
    ...(collectionGroup ? [collectionGroup] : []),
    ...restGroups,
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-jakarta antialiased py-14 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-gray-400 mb-8">
          <Link href="/" className="hover:text-[#A96D56]">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-900 font-medium">Sitemap</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-el-messiri font-medium tracking-wide text-[#1A1A1A] mb-3">
            Sitemap
          </h1>
          <p className="text-sm text-gray-500 font-light max-w-2xl">
            A complete overview of everything on Aura Jewels — shop, categories, collections, guides, services, and policies.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#A96D56] font-el-messiri mb-4 pb-2 border-b border-gray-100">
                {group.title}
              </h2>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.href + item.name}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-gray-600 hover:text-[#A96D56] transition-colors font-light"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
