'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { ENDPOINTS } from '@/lib/Api_Url';

// First-visit "Today's Offer" popup. Shows once per browser SESSION (a
// sessionStorage flag), only when the admin has enabled it and set an image.
// Fails silently — a popup must never break the site.
const SESSION_KEY = 'offer_popup_shown';

interface PopupData {
    enabled: boolean;
    desktopImage: string;
    mobileImage: string;
    linkUrl: string;
}

const OfferPopup: React.FC = () => {
    const router = useRouter();
    const [data, setData] = useState<PopupData | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Already shown this session? Do nothing.
        try {
            if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) return;
        } catch {
            // sessionStorage blocked (private mode) — just show once per mount.
        }

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(ENDPOINTS.HOME.OFFER_POPUP, { cache: 'no-store' });
                const json = await res.json();
                const d: PopupData = json?.data || {};
                if (cancelled) return;
                if (d?.enabled && (d.desktopImage || d.mobileImage)) {
                    setData(d);
                    setOpen(true);
                    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { }
                }
            } catch {
                // ignore — no popup
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (!open || !data) return null;

    const close = () => setOpen(false);

    const handleImageClick = () => {
        close();
        const url = (data.linkUrl || '').trim();
        if (!url) return;
        if (/^https?:\/\//i.test(url)) window.location.href = url;   // external
        else router.push(url.startsWith('/') ? url : `/${url}`);     // internal route
    };

    const clickable = !!(data.linkUrl && data.linkUrl.trim());
    // Prefer the matching image; fall back to whichever exists.
    const desktopSrc = data.desktopImage || data.mobileImage;
    const mobileSrc = data.mobileImage || data.desktopImage;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-4"
            onClick={close}
            role="dialog"
            aria-modal="true"
        >
            {/* inline-flex → the box hugs the visible image, so it never
                letterboxes and the close button sits on the image's corner. */}
            <div
                className="relative inline-flex max-w-[75vw] max-h-[75vw]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="absolute top-2 right-2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                </button>

                {/* One <img> per breakpoint so desktop/mobile art can differ.
                    Size is DRIVEN by the viewport so even a small source image
                    scales up to fill the popup: desktop by height (82vh), phones
                    by width (94vw). object-contain keeps the aspect ratio intact
                    (and letterboxes safely if the art is an unexpected shape).
                    Upload a high-res image for the crispest result. */}
                {/* eslint-disable @next/next/no-img-element */}
                <img
                    src={desktopSrc}
                    alt="Today's offer"
                    onClick={clickable ? handleImageClick : undefined}
                    className={`hidden md:block h-[55vh] w-auto max-w-[55vw] object-contain rounded-xl ${clickable ? 'cursor-pointer' : ''}`}
                />
                <img
                    src={mobileSrc}
                    alt="Today's offer"
                    onClick={clickable ? handleImageClick : undefined}
                    className={`block md:hidden w-[75vw] h-auto max-h-[75vh] object-contain rounded-xl ${clickable ? 'cursor-pointer' : ''}`}
                />
                {/* eslint-enable @next/next/no-img-element */}
            </div>
        </div>
    );
};

export default OfferPopup;
