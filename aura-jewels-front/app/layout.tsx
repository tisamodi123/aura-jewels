import type { Metadata } from 'next';
import Script from 'next/script';
import { DM_Sans, El_Messiri, Plus_Jakarta_Sans, Cormorant_Garamond, Instrument_Sans } from 'next/font/google';

// Styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './main.css';

// UI Components
import Footer2 from '@/components/Footer2';
import Header from '@/components/Header';
import OfferPopup from '@/components/OfferPopup';
import { Toaster } from "sonner";

// Feature Components & Tracking
import FloatingContactWidget from '../components/FloatingContactWidget';
import LocationInitializer from '../components/LocationInitializer';
import RouteTracker from '../components/RouteTracker';
import ScrollToTopBottom from '../components/ScrollToTopBottom';

// Utilities & Config
import { ENDPOINTS, ENABLE_SCRIPT } from '@/lib/Api_Url';

// Font Configurations
const elMessiri = El_Messiri({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-el-messiri',
    display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-cormorant-garamond',
    display: 'swap',
});

const instrumentSans = Instrument_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-instrument-sans',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '700', '800'],
    variable: '--font-dm-sans',
    display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-plus-jakarta-sans',
    display: 'swap',
});

// Metadata Config
export const metadata: Metadata = {
    title: 'Aura Jewels | Handcrafted Luxury Jewellery',
    description: 'Modern heirlooms crafted for the individual who values understated luxury and ethical artistry.',
    icons: {
        icon: `${process.env.NEXT_PUBLIC_PREFIX || ''}/images/Aura Jewels/Logo Png.jpg`,
    },
};

const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Aura Jewels",
    "url": "https://aurajewels.com/",
    "logo": "https://aurajewels.com/images/logo.png",
    // "sameAs": [
    //     "https://www.facebook.com/people/Aura Jewels/61590574653318/",
    //     "https://www.instagram.com/official_Aura Jewels.co/",
    //     "https://Aura Jewels.co/"
    // ]
};

async function getMenuData() {
    if (!ENDPOINTS?.HOME?.MENU) return { items: [] };

    try {
        const res = await fetch(ENDPOINTS.HOME.MENU, {
            next: { revalidate: 120 }
        });
        if (!res.ok) return { items: [] };
        const data = await res.json();
        return data?.data || { items: [] };
    } catch (err) {
        console.log("Menu fetch error in layout:", err);
        return { items: [] };
    }
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const menuData = await getMenuData();

    return (
        <html
            lang="en"
            className={`${elMessiri.variable} ${dmSans.variable} ${plusJakartaSans.variable} ${cormorantGaramond.variable} ${instrumentSans.variable}`}
            data-scroll-behavior="smooth"
            suppressHydrationWarning
        >
            <head>
                {/* Structured Data (JSON-LD Schemas) */}
                {/* <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema, null, 2) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                /> */}
            </head>

            <body className="antialiased" suppressHydrationWarning>
                {ENABLE_SCRIPT && (
                    <>
                        {/* Google Tag Manager */}
                        <Script
                        //                             id="gtm-script"
                        //                             strategy="afterInteractive"
                        //                             dangerouslySetInnerHTML={{
                        //                                 __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        // new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        // j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        // 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        // })(window,document,'script','dataLayer','GTM-KL2ZCJ2M');`,
                        //                             }}
                        />

                        {/* Meta Pixel Code */}
                        <Script
                        //                             id="meta-pixel-script"
                        //                             strategy="afterInteractive"
                        //                             dangerouslySetInnerHTML={{
                        //                                 __html: `!function(f,b,e,v,n,t,s)
                        // {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        // n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        // if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        // n.queue=[];t=b.createElement(e);t.async=!0;
                        // t.src=v;s=b.getElementsByTagName(e)[0];
                        // s.parentNode.insertBefore(t,s)}(window, document,'script',
                        // 'https://connect.facebook.net/en_US/fbevents.js');
                        // fbq('init', '2348859908980339');
                        // fbq('track', 'PageView');`,
                        //                             }}
                        />
                        {/* <noscript>
                            <img
                                height="1"
                                width="1"
                                style={{ display: 'none' }}
                                // src="https://www.facebook.com/tr?id=2348859908980339&ev=PageView&noscript=1"
                                alt=""
                            />
                        </noscript> */}

                        {/* Microsoft Clarity */}
                        <Script
                        //                             id="clarity-script"
                        //                             strategy="afterInteractive"
                        //                             dangerouslySetInnerHTML={{
                        //                                 __html: `(function(c,l,a,r,i,t,y){
                        // c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        // t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                        // y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                        // })(window, document, "clarity", "script", "xwgz55a3d9");`,
                        //                             }}
                        />
                    </>
                )}
                {/* Google Tag Manager (noscript) */}
                {/* {ENABLE_SCRIPT && (
                    <noscript>
                        <iframe
                        // src="https://www.googletagmanager.com/ns.html?id=GTM-KL2ZCJ2M"

                        // height="0"
                        // width="0"
                        // style={{ display: 'none', visibility: 'hidden' }}
                        />
                    </noscript>
                )} */}

                <div className="min-h-screen flex flex-col selection:bg-light-gold">
                    <Header menuData={menuData} />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer2 />
                    <ScrollToTopBottom />
                    <FloatingContactWidget />
                    <LocationInitializer />
                    <RouteTracker />
                </div>

                <OfferPopup />
                <Toaster richColors position="bottom-right" />
            </body>
        </html>
    );
}