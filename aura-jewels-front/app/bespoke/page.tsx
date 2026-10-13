import type { Metadata } from 'next';
import BespokeForm from '@/components/bespoke/BespokeForm';

export const metadata: Metadata = {
    title: "Bespoke Jewellery Concierge | Aura Jewels Fine Diamonds",
    description: "Design your custom engagement ring or bespoke diamond jewellery with Aura Jewels's master craftsmen. Personal consultation and 3D CAD sculpting.",
    openGraph: {
        title: "Bespoke Jewellery Concierge | Aura Jewels",
        description: "Transform your vision into custom lab-grown diamond jewellery with master craftsmen.",
        url: "https://Aura Jewels.co/bespoke",
        siteName: "Aura Jewels",
    },
};

export default function BespokePage() {
    return <BespokeForm />;
}
