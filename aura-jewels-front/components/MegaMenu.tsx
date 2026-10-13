import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { PREFIX } from '@/lib/constants';
import { useGlobleStore } from '@/store/globleStore';
import { DEFAULT_COUNTRY } from '@/lib/Api_Url';
import { formatBudgetLabel } from '@/lib/priceUtils';

// ---------------------------------------------------------------------------
// Authored mega-menu tree, served by GET /app/menu (admin-built, Shopify-style).
// Every link already carries a resolved `redirect.href` (built server-side), so
// this component just renders labels + hrefs — no URL building or lookups.
// ---------------------------------------------------------------------------

export interface MenuRedirect {
    type?: string;
    href?: string;
    url?: string;
}
export interface MenuLink {
    _id?: string;
    label: string;
    image?: string;
    redirect?: MenuRedirect;
}
export interface MenuGroup {
    _id?: string;
    label: string;
    hex?: string;
    redirect?: MenuRedirect;
    options?: { label: string; redirect?: MenuRedirect }[];
}
export interface MenuColumn {
    _id?: string;
    title: string;
    layout?: 'links' | 'grouped';
    links?: MenuLink[];
    groups?: MenuGroup[];
}
export interface MenuCard {
    image?: string;
    imageMobile?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    redirect?: MenuRedirect;
}
export interface MenuItem {
    _id?: string;
    label: string;
    redirect?: MenuRedirect;
    hasMegaMenu?: boolean;
    columns?: MenuColumn[];
    featuredCards?: MenuCard[];
}

const hrefOf = (r?: MenuRedirect, label?: string): string => {
    let href = (r?.href || r?.url || '').trim();
    if (label) {
        const l = label.toLowerCase();
        if (l.includes('start with a setting') || l.includes('start with setting')) {
            return '/rings?mode=builder';
        }
        if (
            l.includes('start with lab diamond') ||
            l.includes('start with a lab diamond') ||
            l.includes('start with color lab diamond') ||
            l.includes('start with a color lab diamond') ||
            l.includes('start with a diamond') ||
            l.includes('start with diamond')
        ) {
            return '/diamonds?view=all&builderStep=2&mode=builder';
        }
    }
    return href;
};

interface MegaMenuProps {
    item?: MenuItem | null;
    onClose?: () => void;
    activeNav?: string;
    menuData?: any;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ item: propItem, onClose, activeNav, menuData }) => {
    const { country } = useGlobleStore();
    const isIndia = (country || 'IN') === (DEFAULT_COUNTRY || 'IN');
    let item = propItem;

    // Resolve item if only activeNav / menuData were passed by Header
    if (!item && activeNav) {
        const categoriesList = menuData?.categories || menuData?.items || (Array.isArray(menuData) ? menuData : []);
        const found = categoriesList.find((c: any) =>
            (c.name || c.label || '').toLowerCase() === activeNav.toLowerCase() ||
            (c.slug || '').toLowerCase() === activeNav.toLowerCase()
        );

        if (found) {
            item = {
                label: found.name || found.label || activeNav,
                hasMegaMenu: true,
                redirect: { href: found.slug ? `/${found.slug}` : `/${activeNav.toLowerCase()}` },
                columns: found.columns || [],
                featuredCards: found.featuredCards || found.sideCards || []
            };
        } else {
            item = {
                label: activeNav,
                hasMegaMenu: true,
                redirect: { href: `/${activeNav.toLowerCase().replace(/\s+/g, '-')}` },
                columns: [],
                featuredCards: []
            };
        }
    }

    if (!item || item.hasMegaMenu === false) return null;

    const navLabel = (item.label || activeNav || '').toLowerCase();
    const isRingNav = navLabel.includes('ring') && !navLabel.includes('earring');

    let columns = [...(item.columns || [])].filter(
        (c) => (c.links && c.links.length) || (c.groups && c.groups.length)
    );

    // If columns list is empty, construct default style columns from menuData categories if available
    if (columns.length === 0 && menuData?.categories) {
        const cat = menuData.categories.find((c: any) => (c.name || '').toLowerCase() === navLabel);
        if (cat && cat.subcategories && cat.subcategories.length > 0) {
            columns.push({
                title: 'SHOP BY STYLE',
                layout: 'links',
                links: cat.subcategories.map((sub: any) => ({
                    label: sub.name,
                    image: sub.image,
                    redirect: { href: sub.slug ? `/${cat.slug}/${sub.slug}` : `/${cat.slug}` }
                }))
            });
        }
    }

    // Check if "DESIGN YOUR ENGAGEMENT RING" column exists
    const designColIndex = columns.findIndex((c) =>
        c.title?.toLowerCase().includes('design your') || c.title?.toLowerCase().includes('start with')
    );
    const hasDesignCol = designColIndex !== -1;

    // If it is already present (configured in Admin CMS), move it to the very beginning (left side).
    if (isRingNav && hasDesignCol) {
        // Move the admin-defined design column to the very beginning
        const [designCol] = columns.splice(designColIndex, 1);
        columns.unshift(designCol);
    }

    const cards = item.featuredCards || [];
    const hasSideCards = cards.length > 0;
    const viewAllHref = hrefOf(item.redirect, item.label);
    const singleColumn = columns.length === 1;

    if (columns.length === 0 && !hasSideCards) return null;

    return (
        <div className="w-full bg-white border-t border-b border-stone-200 shadow-2xl overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-5 pt-10 pb-6">
                <div className={`grid grid-cols-1 ${hasSideCards ? 'lg:grid-cols-[1fr_260px] xl:grid-cols-[1fr_320px]' : ''} gap-4 lg:gap-6 xl:gap-8 items-start`}>

                    {/* Columns */}
                    <div className={`grid gap-x-8 lg:gap-x-12 xl:gap-x-16 gap-y-10 w-full max-h-[75vh] overflow-y-auto ${singleColumn
                        ? 'grid-cols-1 max-w-7xl'
                        : columns.length === 2
                            ? 'grid-cols-2 max-w-3xl'
                            : columns.length === 3
                                ? 'grid-cols-3 max-w-5xl'
                                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 max-w-7xl'
                        } mx-auto`}>
                        {columns.map((section) => {
                            const grouped = section.layout === 'grouped' && section.groups && section.groups.length > 0;
                            const wide = !grouped && singleColumn;
                            return (
                                <div
                                    key={section._id || section.title}
                                    className="flex flex-col w-full"
                                >
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-black font-sans truncate mb-4">
                                        {section.title}
                                    </h3>

                                    {/* Wide single-column panel (e.g. Collections) → image-card grid */}
                                    {wide && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8">
                                            {(section.links || []).map((link, i) => (
                                                <Link
                                                    key={link._id || i}
                                                    href={hrefOf(link.redirect, link.label) || '#'}
                                                    onClick={onClose}
                                                    className="group flex items-center gap-4"
                                                >
                                                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden bg-stone-100 rounded">
                                                        {link.image ? (
                                                            <Image src={link.image} alt={link.label} fill unoptimized sizes="80px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-stone-400 uppercase tracking-wider px-1 text-center leading-tight">{formatBudgetLabel(link.label, isIndia)}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <h4 className="font-serif text-base text-stone-900 group-hover:text-[#A96D56] transition-colors font-medium mb-1.5 truncate">{formatBudgetLabel(link.label, isIndia)}</h4>
                                                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand group-hover:translate-x-1 transition-transform">
                                                            <span>Explore</span>
                                                            <ArrowRight size={14} />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Compact text list (multi-column items) */}
                                    {!grouped && !wide && (
                                        <ul className="space-y-3">
                                            {(section.links || []).map((link, i) => {
                                                const isShopAll = link.label.toUpperCase().includes('SHOP ALL');
                                                return (
                                                    <li key={link._id || i} className={isShopAll ? 'pt-2' : ''}>
                                                        <Link
                                                            href={hrefOf(link.redirect, link.label) || '#'}
                                                            onClick={onClose}
                                                            className={`group flex items-center gap-3 text-sm transition-colors ${isShopAll
                                                                ? 'font-semibold text-black underline hover:text-[#A96D56]'
                                                                : 'text-stone-600 hover:text-[#A96D56]'
                                                                }`}
                                                        >
                                                            {link.image ? (
                                                                <span className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded bg-stone-50 flex items-center justify-center p-0.5">
                                                                    <img src={link.image} alt={link.label} className="w-full h-full object-contain" />
                                                                </span>
                                                            ) : null}
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block truncate">{formatBudgetLabel(link.label, isIndia)}</span>
                                                            </span>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}

                                    {grouped && (
                                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 xl:gap-x-8 mt-2">
                                            {(section.groups || []).map((group, idx) => (
                                                <div key={group._id || idx} className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.hex || '#C0C0C0' }}></div>
                                                        {hrefOf(group.redirect, group.label) ? (
                                                            <Link href={hrefOf(group.redirect, group.label)} onClick={onClose} className="text-[13px] font-bold text-gray-800 font-jakarta truncate hover:text-[#A96D56]">{formatBudgetLabel(group.label, isIndia)}</Link>
                                                        ) : (
                                                            <span className="text-[13px] font-bold text-gray-800 font-jakarta truncate">{formatBudgetLabel(group.label, isIndia)}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {(group.options || []).map((opt, oIdx) => (
                                                            <Link
                                                                key={oIdx}
                                                                href={hrefOf(opt.redirect, opt.label) || '#'}
                                                                onClick={onClose}
                                                                className="flex-shrink-0 px-2 py-1.5 border border-gray-100 text-[10px] text-gray-500 hover:border-[#A96D56] hover:text-[#A96D56] transition-all font-jakarta uppercase tracking-wider bg-gray-50/50"
                                                            >
                                                                {formatBudgetLabel(opt.label, isIndia)}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Right column — admin-curated featured cards. */}
                    {hasSideCards && (
                        <div className="flex flex-col pl-4 xl:pl-6 border-l border-stone-100 h-full justify-between gap-5">
                            <div className="space-y-5">
                                {cards.map((c, idx) => {
                                    const href = hrefOf(c.redirect, c.title);
                                    const hasLink = href !== '';
                                    const cta = c.ctaText?.trim() || 'Explore';
                                    const Wrapper: any = hasLink ? Link : 'div';
                                    const wrapperProps = hasLink ? { href, onClick: onClose } : {};
                                    return (
                                        <Wrapper key={`${c.title || 'card'}-${idx}`} {...wrapperProps} className="group block">
                                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded mb-3 bg-stone-100">
                                                {c.image ? (
                                                    <Image src={c.image} alt={c.title || ''} fill unoptimized sizes="320px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                                ) : null}
                                            </div>
                                            {c.title && (
                                                <h4 className="font-serif text-base text-stone-900 group-hover:text-[#A96D56] transition-colors font-medium">{c.title}</h4>
                                            )}
                                            {c.subtitle && (
                                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{c.subtitle}</p>
                                            )}
                                            {hasLink && (
                                                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand mt-2 group-hover:translate-x-1 transition-transform">
                                                    <span>{cta}</span>
                                                    <ArrowRight size={14} />
                                                </div>
                                            )}
                                        </Wrapper>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* View-all footer — uses the top-level item's own destination. */}
                {viewAllHref && (
                    <div className="mt-10 pt-4 border-t border-stone-100 text-center">
                        <Link href={viewAllHref} onClick={onClose} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-[#A96D56] transition-colors py-1">
                            <span>View All {item.label}</span>
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MegaMenu;

