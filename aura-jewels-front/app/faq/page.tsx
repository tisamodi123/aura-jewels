import type { Metadata } from 'next';
import FaqClient from '@/components/faq/FaqClient';

export const metadata: Metadata = {
    title: "Frequently Asked Questions | Aura Jewels Diamond Jewellery",
    description: "Find answers to questions about Aura Jewels's lab-grown diamonds, 4Cs, certification (IGI, GSI, GIA), custom jewelry, shipping, returns, and lifetime exchange.",
    openGraph: {
        title: "Frequently Asked Questions | Aura Jewels",
        description: "Find answers to questions about Aura Jewels's lab-grown diamonds, certification, shipping, and returns.",
        url: "https://Aura Jewels.co/faq",
        siteName: "Aura Jewels",
    },
};

export default function FAQPage() {
    return <FaqClient />;
}