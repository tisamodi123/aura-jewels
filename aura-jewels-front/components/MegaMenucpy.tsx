import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface MegaMenuSection {
    title: string;
    // `image` is optional — only the dynamic "By Style" section attaches
    // one (small thumbnail rendered to the left of the style label).
    links: { label: string; subLabel?: string; href: string; image?: string }[];
}

interface MegaMenuContent {
    sections: MegaMenuSection[];
    featured: {
        title: string;
        image: string;
        cta: string;
        href: string;
    };
    footerLink?: { label: string; href: string };
}

const MENU_DATA: Record<string, MegaMenuContent> = {
    'Rings & Bands': {
        sections: [
            {
                title: 'By Style',
                links: [
                    { label: 'Engagement Rings', href: '/rings?search=Engagement Rings' },
                    { label: 'Solitaire Rings', href: '/rings?search=Solitaire Rings' },
                    { label: 'Couple Bands', href: '/rings?search=Couple Bands' },
                    { label: 'Cocktail Rings', href: '/rings?search=Cocktail Rings' },
                    { label: 'Platinum Bands', href: '/rings?search=Platinum Bands' },
                    { label: 'Eternity Bands', href: '/rings?search=Eternity Bands' },
                    { label: 'Minimal Rings', href: '/rings?search=Minimal Rings' },
                    { label: 'For Men', href: '/rings?search=Men Rings' },
                ]
            },
            // {
            //     title: 'By Occasion',
            //     links: [
            //         { label: 'Regular Rings', href: '/rings' },
            //         { label: 'Open Top Rings', href: '/rings?search=Open Top' },
            //         { label: 'Stackable Rings', href: '/rings?search=Stackable' },
            //         { label: 'Halo Rings', href: '/rings?search=Halo' },
            //         { label: 'Hidden Halo Rings', href: '/rings?search=Hidden Halo' },
            //         { label: 'Vintage Rings', href: '/rings?search=Vintage' },
            //         { label: 'Bands', href: '/rings?search=Bands' },
            //     ]
            // },
            {
                title: 'By Metal',
                links: [
                    { label: 'Yellow Gold', href: '/rings?search=Yellow Gold' },
                    { label: 'Rose Gold', href: '/rings?search=Rose Gold' },
                    { label: 'White Gold', href: '/rings?search=White Gold' },
                    { label: 'Platinum', href: '/rings?search=Platinum' },
                ]
            },
            {
                title: 'By Budget',
                links: [
                    { label: 'Under ₹15,000', href: '/rings?maxPrice=15000' },
                    { label: '₹15,000 - ₹50,000', href: '/rings?minPrice=15000&maxPrice=50000' },
                    { label: '₹50,000 - ₹1 Lakh', href: '/rings?minPrice=50000&maxPrice=100000' },
                    { label: 'Above ₹1 Lakh', href: '/rings?minPrice=100000' },
                ]
            },
            {
                title: 'Featured',
                links: [
                    { label: 'Best Sellers', href: '/rings?search=Best Sellers' },
                    { label: 'New Arrivals', href: '/rings?search=New Arrivals' },
                    { label: 'Most Popular', href: '/rings?search=Most Popular' },
                    { label: 'Current Trending', href: '/rings?search=Trending' },
                ]
            }
        ],
        featured: {
            title: 'The Solitaire Edit',
            image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400',
            cta: 'Browse Collection',
            href: '/rings?search=Solitaire'
        },
        footerLink: { label: 'View All', href: '/rings' }
    },
    'Earrings': {
        sections: [
            {
                title: 'By Style',
                links: [
                    { label: 'Studs', href: '/earrings?search=Studs' },
                    { label: 'Hoops & Huggies', href: '/earrings?search=Hoops' },
                    { label: 'Drops & Danglers', href: '/earrings?search=Drops' },
                    { label: 'Jhumkas', href: '/earrings?search=Jhumkas' },
                    { label: 'Ear Cuffs', href: '/earrings?search=Ear Cuffs' },
                    { label: 'Sui Dhaga', href: '/earrings?search=Sui Dhaga' },
                    { label: 'Chandbalis', href: '/earrings?search=Chandbalis' },
                ]
            },
            // {
            //     title: 'By Occasion',
            //     links: [
            //         { label: 'Daily Wear', href: '/earrings?search=Daily Wear' },
            //         { label: 'Work Wear', href: '/earrings?search=Work Wear' },
            //         { label: 'Party Wear', href: '/earrings?search=Party Wear' },
            //         { label: 'Bridal', href: '/earrings?search=Bridal' },
            //         { label: 'Gifting Essentials', href: '/earrings?search=Gifting' },
            //     ]
            // },
            {
                title: 'By Metal',
                links: [
                    { label: 'Yellow Gold', href: '/earrings?search=Yellow Gold' },
                    { label: 'Rose Gold', href: '/earrings?search=Rose Gold' },
                    { label: 'White Gold', href: '/earrings?search=White Gold' },
                    { label: 'Platinum', href: '/earrings?search=Platinum' },
                ]
            },
            {
                title: 'By Budget',
                links: [
                    { label: 'Under ₹15,000', href: '/earrings?maxPrice=15000' },
                    { label: '₹15,000 - ₹50,000', href: '/earrings?minPrice=15000&maxPrice=50000' },
                    { label: '₹50,000 - ₹1 Lakh', href: '/earrings?minPrice=50000&maxPrice=100000' },
                    { label: 'Above ₹1 Lakh', href: '/earrings?minPrice=100000' },
                ]
            },
            {
                title: 'Featured',
                links: [
                    { label: 'Best Sellers', href: '/earrings?search=Best Sellers' },
                    { label: 'New Arrivals', href: '/earrings?search=New Arrivals' },
                    { label: 'Most Popular', href: '/earrings?search=Most Popular' },
                    { label: 'Current Trending', href: '/earrings?search=Trending' },
                ]
            }
        ],
        featured: {
            title: 'Dewdrop Hoops',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400',
            cta: 'Shop Earrings',
            href: '/earrings'
        },
        footerLink: { label: 'View All', href: '/earrings' }
    },
    'Necklaces': {
        sections: [
            {
                title: 'By Style',
                links: [
                    { label: 'Chokers', href: '/necklaces?search=Chokers' },
                    { label: 'Short Necklaces', href: '/necklaces?search=Short Necklaces' },
                    { label: 'Long Necklaces (Harams)', href: '/necklaces?search=Long Necklaces' },
                    { label: 'Lariats', href: '/necklaces?search=Lariats' },
                    { label: 'Collar Necklaces', href: '/necklaces?search=Collar Necklaces' },
                    { label: 'Tennis Necklaces', href: '/necklaces?search=Tennis Necklaces' },
                ]
            },
            // {
            //     title: 'By Occasion',
            //     links: [
            //         { label: 'Daily Wear', href: '/earrings?search=Daily Wear' },
            //         { label: 'Work Wear', href: '/earrings?search=Work Wear' },
            //         { label: 'Party Wear', href: '/earrings?search=Party Wear' },
            //         { label: 'Bridal', href: '/earrings?search=Bridal' },
            //         { label: 'Gifting Essentials', href: '/earrings?search=Gifting' },
            //     ]
            // },
            {
                title: 'By Metal',
                links: [
                    { label: 'Yellow Gold', href: '/necklaces?search=Yellow Gold' },
                    { label: 'Rose Gold', href: '/necklaces?search=Rose Gold' },
                    { label: 'White Gold', href: '/necklaces?search=White Gold' },
                    { label: 'Platinum', href: '/necklaces?search=Platinum' },
                ]
            },
            {
                title: 'By Budget',
                links: [
                    { label: 'Under ₹15,000', href: '/necklaces?maxPrice=15000' },
                    { label: '₹15,000 - ₹50,000', href: '/necklaces?minPrice=15000&maxPrice=50000' },
                    { label: '₹50,000 - ₹1 Lakh', href: '/necklaces?minPrice=50000&maxPrice=100000' },
                    { label: 'Above ₹1 Lakh', href: '/necklaces?minPrice=100000' },
                ]
            },
            {
                title: 'Featured',
                links: [
                    { label: 'Best Sellers', href: '/necklaces?search=Best Sellers' },
                    { label: 'New Arrivals', href: '/necklaces?search=New Arrivals' },
                    { label: 'Most Popular', href: '/necklaces?search=Most Popular' },
                    { label: 'Current Trending', href: '/necklaces?search=Trending' },
                ]
            }
        ],
        featured: {
            title: 'Celestial Pendants',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
            cta: 'Explore Necklaces',
            href: '/necklaces'
        },
        footerLink: { label: 'View All', href: '/necklaces' }
    },
    'Pendants': {
        sections: [
            {
                title: 'By Style',
                links: [
                    { label: 'Solitaire Pendants', href: '/pendants?search=Solitaire' },
                    { label: 'Halo Pendants', href: '/pendants?search=Halo' },
                    { label: 'Heart Pendants', href: '/pendants?search=Heart' },
                    { label: 'Religious Pendants', href: '/pendants?search=Religious' },
                    { label: 'Alphabet Pendants', href: '/pendants?search=Alphabet' },
                    { label: 'Lockets', href: '/pendants?search=Lockets' },
                ]
            },
            // {
            //     title: 'By Occasion',
            //     links: [
            //         { label: 'Birthday Gifts', href: '/pendants?search=Birthday' },
            //         { label: 'Anniversary Gifts', href: '/pendants?search=Anniversary' },
            //         { label: 'Office Elegance', href: '/pendants?search=Office' },
            //         { label: 'Everyday Wear', href: '/pendants?search=Everyday' },
            //     ]
            // },
            {
                title: 'By Metal',
                links: [
                    { label: 'Yellow Gold', href: '/pendants?search=Yellow Gold' },
                    { label: 'Rose Gold', href: '/pendants?search=Rose Gold' },
                    { label: 'White Gold', href: '/pendants?search=White Gold' },
                    { label: 'Platinum', href: '/pendants?search=Platinum' },
                ]
            },
            {
                title: 'By Budget',
                links: [
                    { label: 'Under ₹15,000', href: '/pendants?maxPrice=15000' },
                    { label: '₹15,000 - ₹50,000', href: '/pendants?minPrice=15000&maxPrice=50000' },
                    { label: '₹50,000 - ₹1 Lakh', href: '/pendants?minPrice=50000&maxPrice=100000' },
                    { label: 'Above ₹1 Lakh', href: '/pendants?minPrice=100000' },
                ]
            },
            {
                title: 'Featured',
                links: [
                    { label: 'Best Sellers', href: '/pendants?search=Best Sellers' },
                    { label: 'New Arrivals', href: '/pendants?search=New Arrivals' },
                    { label: 'Most Popular', href: '/pendants?search=Most Popular' },
                    { label: 'Current Trending', href: '/pendants?search=Trending' },
                ]
            }
        ],
        featured: {
            title: 'Radiant Charms',
            image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=400',
            cta: 'Shop Pendants',
            href: '/pendants'
        },
        footerLink: { label: 'View All', href: '/pendants' }
    },
    'Mangalsutras': {
        sections: [
            {
                title: 'By Style',
                links: [
                    { label: 'Short Mangalsutras', href: '/mangalsutras?search=Short' },
                    { label: 'Long Mangalsutras', href: '/mangalsutras?search=Long' },
                    { label: 'Diamond Mangalsutras', href: '/mangalsutras?search=Diamond' },
                    { label: 'Traditional Designs', href: '/mangalsutras?search=Traditional' },
                    { label: 'Modern Minimal', href: '/mangalsutras?search=Modern' },
                    { label: 'Mangalsutra Bracelets', href: '/mangalsutras?search=Bracelets' },
                ]
            },
            // {
            //     title: 'By Occasion',
            //     links: [
            //         { label: 'Wedding Day', href: '/mangalsutras?search=Wedding' },
            //         { label: 'Daily Wear', href: '/mangalsutras?search=Daily Wear' },
            //         { label: 'Festive Occasions', href: '/mangalsutras?search=Festive' },
            //         { label: 'Anniversary Celebration', href: '/mangalsutras?search=Anniversary' },
            //     ]
            // },
            {
                title: 'By Metal',
                links: [
                    { label: 'Yellow Gold', href: '/mangalsutras?search=Yellow Gold' },
                    { label: 'Rose Gold', href: '/mangalsutras?search=Rose Gold' },
                    { label: 'White Gold', href: '/mangalsutras?search=White Gold' },
                    { label: 'Platinum', href: '/mangalsutras?search=Platinum' },
                ]
            },
            {
                title: 'By Budget',
                links: [
                    { label: 'Under ₹15,000', href: '/mangalsutras?maxPrice=15000' },
                    { label: '₹15,000 - ₹50,000', href: '/mangalsutras?minPrice=15000&maxPrice=50000' },
                    { label: '₹50,000 - ₹1 Lakh', href: '/mangalsutras?minPrice=50000&maxPrice=100000' },
                    { label: 'Above ₹1 Lakh', href: '/mangalsutras?minPrice=100000' },
                ]
            },
            {
                title: 'Featured',
                links: [
                    { label: 'Best Sellers', href: '/mangalsutras?search=Best Sellers' },
                    { label: 'New Arrivals', href: '/mangalsutras?search=New Arrivals' },
                    { label: 'Most Popular', href: '/mangalsutras?search=Most Popular' },
                    { label: 'Current Trending', href: '/mangalsutras?search=Trending' },
                ]
            }
        ],
        featured: {
            title: 'Sacred Bond Edit',
            image: 'https://images.unsplash.com/photo-1611591472159-4b6a9da0e909?auto=format&fit=crop&q=80&w=400',
            cta: 'Explore Mangalsutras',
            href: '/mangalsutras'
        },
        footerLink: { label: 'View all', href: '/mangalsutras' }
    },
    'Bracelets & Bangles': {
        sections: [
            {
                title: 'Style',
                links: [
                    { label: 'Chain Bracelets', href: '/bracelets-bangles?search=Chain' },
                    { label: 'Tennis Bracelets', href: '/bracelets-bangles?search=Tennis' },
                    { label: 'Bangles', subLabel: 'Handcrafted', href: '/bracelets-bangles?search=Bangles' },
                    { label: 'Cuff Bracelets', href: '/bracelets-bangles?search=Cuff' },
                    { label: 'Charm Bracelets', href: '/bracelets-bangles?search=Charm' },
                    { label: 'Flexible Bracelets', href: '/bracelets-bangles?search=Flexible' },
                ]
            },
            // {
            //     title: 'Occasion',
            //     links: [
            //         { label: 'Everyday Wear', href: '/bracelets-bangles?search=Everyday' },
            //         { label: 'Office Wear', href: '/bracelets-bangles?search=Office' },
            //         { label: 'Party & Festive', href: '/bracelets-bangles?search=Party' },
            //         { label: 'Bridal Sets', href: '/bracelets-bangles?search=Bridal' },
            //     ]
            // },
            {
                title: 'By Metal',
                links: [
                    { label: 'Yellow Gold', href: '/bracelets-bangles?search=Yellow Gold' },
                    { label: 'Rose Gold', href: '/bracelets-bangles?search=Rose Gold' },
                    { label: 'White Gold', href: '/bracelets-bangles?search=White Gold' },
                    { label: 'Platinum', href: '/bracelets-bangles?search=Platinum' },
                ]
            },
            {
                title: 'By Budget',
                links: [
                    { label: 'Under ₹15,000', href: '/bracelets-bangles?maxPrice=15000' },
                    { label: '₹15,000 - ₹50,000', href: '/bracelets-bangles?minPrice=15000&maxPrice=50000' },
                    { label: '₹50,000 - ₹1 Lakh', href: '/bracelets-bangles?minPrice=50000&maxPrice=100000' },
                    { label: 'Above ₹1 Lakh', href: '/bracelets-bangles?minPrice=100000' },
                ]
            },
            {
                title: 'Featured',
                links: [
                    { label: 'Best Sellers', href: '/bracelets-bangles?search=Best Sellers' },
                    { label: 'New Arrivals', href: '/bracelets-bangles?search=New Arrivals' },
                    { label: 'Most Popular', href: '/bracelets-bangles?search=Most Popular' },
                    { label: 'Current Trending', href: '/bracelets-bangles?search=Trending' },
                ]
            }
        ],
        featured: {
            title: 'The Bangle Box',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400',
            cta: 'Shop Bracelets',
            href: '/bracelets-bangles'
        },
        footerLink: { label: 'View All', href: '/bracelets-bangles' }
    },
    "Men's": {
        sections: [
            {
                title: 'Jewellery Categories',
                links: [
                    { label: "Men's Rings", href: '/all?search=Men Rings' },
                    { label: 'Platinum Bands', href: '/all?search=Men Platinum' },
                    { label: 'Kada & Bracelets', href: '/all?search=Men Bracelets' },
                    { label: 'Gold Chains', href: '/all?search=Men Chains' },
                    { label: 'Cufflinks', href: '/all?search=Cufflinks' },
                    { label: 'Kurta Buttons', href: '/all?search=Kurta Buttons' },
                    { label: 'Single Ear Studs', href: '/all?search=Men Studs' },
                ]
            },
            // {
            //     title: 'Occasion & Vows',
            //     links: [
            //         { label: 'Engagement Bands', href: '/all?search=Men Engagement' },
            //         { label: 'Wedding Vows', href: '/all?search=Men Wedding' },
            //         { label: 'Anniversary Gifts', href: '/all?search=Men Anniversary' },
            //         { label: 'Birthday Specials', href: '/all?search=Men Birthday' },
            //         { label: 'Executive Styling', href: '/all?search=Men Executive' },
            //     ]
            // },
            {
                title: 'By Metal',
                links: [
                    { label: 'Yellow Gold', href: '/all?search=Men Yellow Gold' },
                    { label: 'Rose Gold', href: '/all?search=Men Rose Gold' },
                    { label: 'White Gold', href: '/all?search=Men White Gold' },
                    { label: 'Platinum', href: '/all?search=Men Platinum' },
                ]
            },
            {
                title: 'By Budget',
                links: [
                    { label: 'Under ₹15,000', href: '/all?maxPrice=15000&search=Men' },
                    { label: '₹15,000 - ₹50,000', href: '/all?minPrice=15000&maxPrice=50000&search=Men' },
                    { label: '₹50,000 - ₹1 Lakh', href: '/all?minPrice=50000&maxPrice=100000&search=Men' },
                    { label: 'Above ₹1 Lakh', href: '/all?minPrice=100000&search=Men' },
                ]
            },
            {
                title: 'Featured',
                links: [
                    { label: 'Best Sellers', href: '/all?search=Men Best Sellers' },
                    { label: 'New Arrivals', href: '/all?search=Men New Arrivals' },
                    { label: 'Most Popular', href: '/all?search=Men Most Popular' },
                    { label: 'Current Trending', href: '/all?search=Men Trending' },
                ]
            }
        ],
        featured: {
            title: 'Gentleman Signature',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400',
            cta: 'Explore Men Collection',
            href: '/all?search=Men'
        },
        footerLink: { label: 'View All', href: '/all?search=Men' }
    },
    'Gifting': {
        sections: [
            // {
            //     title: 'Shop By Occasion',
            //     links: [
            //         { label: 'Birthday Gifts', href: '/all?search=Birthday Gifts' },
            //         { label: 'Anniversary Gifts', href: '/all?search=Anniversary Gifts' },
            //         { label: 'Wedding Gifts', href: '/all?search=Wedding Gifts' },
            //         { label: 'Housewarming', href: '/all?search=Housewarming' },
            //         { label: 'Personal Milestone', href: '/all?search=Milestone' },
            //         { label: 'Just Because', href: '/all?search=Gifts' },
            //     ]
            // },
            {
                title: 'Gift For',
                links: [
                    { label: 'For Her', href: '/all?search=Gifts for Her' },
                    { label: 'For Him', href: '/all?search=Gifts for Him' },
                    { label: 'For Kids', href: '/all?search=Gifts for Kids' },
                    { label: 'For Couples', href: '/all?search=Gifts for Couples' },
                    { label: 'For Mother', href: '/all?search=Gifts for Mother' },
                ]
            },
            {
                title: 'By Metal',
                links: [
                    { label: 'Yellow Gold', href: '/all?search=Gifts Yellow Gold' },
                    { label: 'Rose Gold', href: '/all?search=Gifts Rose Gold' },
                    { label: 'White Gold', href: '/all?search=Gifts White Gold' },
                    { label: 'Platinum', href: '/all?search=Gifts Platinum' },
                ]
            },
            {
                title: 'By Budget',
                links: [
                    { label: 'Under ₹15,000', href: '/all?maxPrice=15000&search=Gift' },
                    { label: '₹15,000 - ₹50,000', href: '/all?minPrice=15000&maxPrice=50000&search=Gift' },
                    { label: '₹50,000 - ₹1 Lakh', href: '/all?minPrice=50000&maxPrice=100000&search=Gift' },
                    { label: 'Above ₹1 Lakh', href: '/all?minPrice=100000&search=Gift' },
                ]
            },
            {
                title: 'Featured',
                links: [
                    { label: 'Best Sellers', href: '/all?search=Gifts Best Sellers' },
                    { label: 'New Arrivals', href: '/all?search=Gifts New Arrivals' },
                    { label: 'Most Popular', href: '/all?search=Gifts Most Popular' },
                    { label: 'Current Trending', href: '/all?search=Gifts Trending' },
                ]
            }
        ],
        featured: {
            title: 'The Gift Guide',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
            cta: 'Explore Gift Guide',
            href: '/all?search=Gift'
        },
        footerLink: { label: 'View All', href: '/all?search=Gift' }
    },
    'Collections': {
        sections: [
            {
                title: 'Exclusive Series',
                links: [
                    { label: 'Aurora 2024', href: '/all?search=Aurora' },
                    { label: 'Solstice Minimal', href: '/all?search=Solstice' },
                    { label: 'Heritage Gold', href: '/all?search=Heritage' },
                    { label: 'Zenith Geometric', href: '/all?search=Zenith' },
                ]
            },
            {
                title: 'Shop By Theme',
                links: [
                    { label: 'Botanical Bloom', href: '/all?search=Botanical' },
                    { label: 'Celestial Light', href: '/all?search=Celestial' },
                    { label: 'Art Deco', href: '/all?search=Art Deco' },
                    { label: 'Modern Mangalsutra', href: '/all?search=Modern' },
                ]
            },
            {
                title: 'Trending',
                links: [
                    { label: 'Stackable Series', href: '/all?search=Stackable' },
                    { label: 'Solitaire Pride', href: '/all?search=Solitaire' },
                    { label: 'Men’s Signature', href: '/all?search=Men Signature' },
                ]
            },
            {
                title: 'Limited Edition',
                links: [
                    { label: 'Festival Sparkle', href: '/all?search=Festival' },
                    { label: 'Bridal Trousseau', href: '/all?search=Bridal' },
                ]
            }
        ],
        featured: {
            title: 'Anthology Index',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400',
            cta: 'View All Collections',
            href: '/all?search=Collection'
        },
        footerLink: { label: 'View All', href: '/all?search=Collection' }
    },
    'Bespoke Design': {
        sections: [
            {
                title: 'Personalise Your Brilliance',
                links: [
                    { label: 'The Bespoke Journey', subLabel: 'How it works', href: '/custom-jewellery' },
                    { label: 'Consult an Artisan', subLabel: 'Book a video call', href: '/custom-jewellery' },
                    { label: 'Heirloom Redesign', href: '/custom-jewellery' },
                    { label: 'Ethical Sourcing', href: '/custom-jewellery' },
                ]
            }
        ],
        featured: {
            title: 'The Custom Atelier',
            image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=400',
            cta: 'Start Design Form',
            href: '/custom-jewellery'
        },
        // footerLink: { label: 'Bring your vision to life with our master craftsmen', href: '/custom-jewellery' }
    }
};

const COLLECTIONS_CARDS = [
    {
        title: 'Solitaire Edit',
        subtitle: 'Timeless Solitaire Jewellery Crafted For Modern Elegance.',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400',
        href: '/all?search=Solitaire'
    },
    {
        title: 'Royal Heritage',
        subtitle: 'Regal designs inspired by majestic royal traditions.',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
        href: '/all?search=Heritage'
    },
    {
        title: 'Modern Minimalist',
        subtitle: 'Sleek, lightweight creations for the modern lifestyle.',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400',
        href: '/all?search=Minimalist'
    },
    {
        title: 'Floral Symphony',
        subtitle: 'Delicate floral motifs crafted with brilliant diamonds.',
        image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=400',
        href: '/all?search=Floral'
    },
    {
        title: 'Celestial Glow',
        subtitle: 'Dazzling diamond pieces reflecting starry night skies.',
        image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80&w=400',
        href: '/all?search=Celestial'
    },
    {
        title: 'Stackable Series',
        subtitle: 'Versatile bands and rings designed to be stacked.',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400',
        href: '/all?search=Stackable'
    },
    {
        title: "Men's Signature",
        subtitle: 'Bold, sophisticated statements for the modern gentleman.',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400',
        href: '/all?search=Men Signature'
    },
    {
        title: 'Bridal Trousseau',
        subtitle: 'Uncompromising luxury for your most special wedding day.',
        image: 'https://images.unsplash.com/photo-1611591472159-4b6a9da0e909?auto=format&fit=crop&q=80&w=400',
        href: '/all?search=Bridal'
    }
];

// Dynamic payload from GET /app/menu. Optional — the component falls back
// to MENU_DATA for unknown labels so legacy hover targets keep working
// until every category is migrated to the new `isMenu` flag.
interface MenuDataShape {
    categories: Array<{
        _id: string;
        name: string;
        slug: string;
        image: string;
        subcategories: Array<{ _id: string; name: string; slug: string; image?: string }>;
        featuredTags?: Array<{ _id: string; name: string }>;
        sideCards?: Array<{
            image?: string;
            imageMobile?: string;
            title?: string;
            subtitle?: string;
            redirect?: { type?: string; url?: string; href?: string };
        }>;
    }>;
    collections: Array<{ _id: string; name: string; slug: string; image: string; description?: string }>;
    tags: Array<{ _id: string; name: string; href?: string }>;
    metals: Array<{ _id: string; name: string; type: string; stamp: string }>;
}

interface MegaMenuProps {
    activeNav: string;
    onClose?: () => void;
    menuData?: MenuDataShape;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ activeNav, onClose, menuData }) => {
    // Collections panel — admin-curated list from the API. When no
    // collections are flagged `isMenu`, fall back to the hardcoded design
    // cards so the panel never appears empty.
    if (activeNav === 'Collections') {
        const apiCollections = menuData?.collections || [];
        // Once the admin has flagged at least one collection `isMenu`, we
        // drop the hardcoded design fallback entirely — the panel renders
        // whatever the admin curated, including their description text.
        const cards = apiCollections.length > 0
            ? apiCollections.map((c) => ({
                title: c.name,
                subtitle: c.description || '',
                image: c.image || '',
                href: c.slug ? `/collection/${c.slug}` : '/jewellery',
            }))
            : COLLECTIONS_CARDS;
        return (
            <div className="w-full bg-white border-t border-b border-stone-200 shadow-2xl overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                        {cards.map((col) => (
                            <Link
                                key={col.title}
                                href={col.href}
                                onClick={onClose}
                                className="group flex items-center gap-5 p-2.5 bg-white"
                            >
                                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-stone-100 rounded">
                                    {col.image ? (
                                        <Image
                                            src={col.image}
                                            alt={col.title}
                                            fill
                                            unoptimized
                                            sizes="96px"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        // Placeholder for collections without an
                                        // image yet — keeps the row aligned and
                                        // hints at the missing thumbnail.
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-stone-400 uppercase tracking-wider">
                                            No image
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h4 className="font-serif text-base text-stone-900 group-hover:text-brand transition-colors font-medium mb-1.5 truncate">
                                        {col.title}
                                    </h4>
                                    {col.subtitle && (
                                        <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed font-sans">
                                            {col.subtitle}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand group-hover:translate-x-1 transition-transform">
                                        <span>Explore</span>
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Shop By Tag panel — Header2 adds a "Shop By Tag" nav entry when
    // any tag is flagged `isMenu`. Each chip links to the global
    // jewellery list with the tag pre-filtered. Tags are text-only on
    // purpose: they're behaviour labels (Best Seller, New Arrival, …),
    // not entities with their own imagery.
    if (activeNav === 'Shop By Tag') {
        const tags = menuData?.tags || [];
        return (
            <div className="w-full bg-white border-t border-b border-stone-200 shadow-2xl overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-10">
                    <div className="flex flex-col items-start gap-6">
                        <div>
                            <h3 className="font-serif text-2xl text-stone-900 mb-1">Shop By Tag</h3>
                            <p className="text-xs uppercase tracking-widest text-stone-500">
                                Curated edits and seasonal selections
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {tags.map((t) => (
                                <Link
                                    key={t._id}
                                    href={t.href || `/jewellery?tags=${t._id}`}
                                    onClick={onClose}
                                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-200 hover:border-brand hover:bg-brand-light transition-colors"
                                >
                                    <span className="text-sm text-stone-800 group-hover:text-brand transition-colors">
                                        {t.name}
                                    </span>
                                    <ArrowRight
                                        size={12}
                                        className="text-stone-400 group-hover:text-brand group-hover:translate-x-0.5 transition-all"
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // For top-level categories backed by the API, build every column
    // from live data:
    //   - "By Style" — that category's subcategories
    //   - "By Metal" — unique Metal.type values from the active metal list
    //   - "By Stamp" — unique Metal.stamp values
    //   - "Featured" — that category's featuredTags
    //   - "By Budget" stays static (it's a price-range filter, not entity-backed)
    // Falls back to the legacy MENU_DATA for any nav label that isn't a
    // recognized API category (e.g. "Men's", "Gifting" before they're set up).
    const apiCategory = menuData?.categories?.find((c) => c.name === activeNav);
    const apiMetals = menuData?.metals || [];
    const baseMenu = MENU_DATA[activeNav] || MENU_DATA['Rings & Bands'];

    const uniqueBy = <T,>(arr: T[], key: (x: T) => string): T[] => {
        const seen = new Set<string>();
        const out: T[] = [];
        for (const x of arr) {
            const k = key(x);
            if (!k || seen.has(k)) continue;
            seen.add(k);
            out.push(x);
        }
        return out;
    };

    const buildDynamicSections = () => {
        if (!apiCategory) return baseMenu.sections;
        const slug = apiCategory.slug;
        const styleLinks = apiCategory.subcategories.map((sub) => ({
            label: sub.name,
            href: sub.slug ? `/category/${sub.slug}` : `/category/${slug}`,
            // Optional thumbnail rendered next to the style label. Empty
            // string is treated as "no image" downstream.
            image: sub.image || "",
        }));
        const metalLinks = uniqueBy(apiMetals, (m) => (m.type || '').toLowerCase())
            .filter((m) => m.type)
            .map((m) => ({
                label: m.type,
                href: `/category/${slug}?metals=${m._id}`,
            }));
        const stampLinks = uniqueBy(apiMetals, (m) => (m.stamp || '').toLowerCase())
            .filter((m) => m.stamp)
            .map((m) => ({
                label: m.stamp,
                href: `/category/${slug}?metals=${m._id}`,
            }));
        const featuredLinks = (apiCategory.featuredTags || []).map((t) => ({
            label: t.name,
            href: `/category/${slug}?tags=${t._id}`,
        }));
        const budgetSection = baseMenu.sections.find((s) => s.title === 'By Budget');

        const sections: typeof baseMenu.sections = [];
        if (styleLinks.length) sections.push({ title: 'By Style', links: styleLinks });
        if (metalLinks.length) sections.push({ title: 'By Metal', links: metalLinks });
        // if (stampLinks.length) sections.push({ title: 'By Stamp', links: stampLinks });
        if (budgetSection) {
            // Rewrite legacy budget hrefs to the new /category/<slug> path.
            sections.push({
                ...budgetSection,
                links: budgetSection.links.map((l) => ({
                    label: l.label,
                    href: l.href.replace(/^\/[^?]+/, `/category/${slug}`),
                })),
            });
        }
        if (featuredLinks.length) sections.push({ title: 'Featured', links: featuredLinks });
        return sections.length > 0 ? sections : baseMenu.sections;
    };

    const currentMenu: MegaMenuContent = apiCategory
        ? {
            ...baseMenu,
            sections: buildDynamicSections(),
            footerLink: { label: 'View All', href: `/category/${apiCategory.slug}` },
        }
        : baseMenu;

    // Right side cards only render when the admin has actually curated
    // some — no dummy/legacy fallback. The grid template collapses to a
    // single column when there's nothing on the right so the sections
    // fill the full width instead of leaving an empty rail.
    const hasSideCards =
        !!apiCategory &&
        Array.isArray(apiCategory.sideCards) &&
        apiCategory.sideCards.length > 0;

    return (
        <div className="w-full bg-white border-t border-b border-stone-200 shadow-2xl overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="max-w-[1440px] mx-auto px-4 lg:px-10 pt-10 pb-6">
                <div className={`grid grid-cols-1 ${hasSideCards ? "lg:grid-cols-[1fr_320px]" : ""} gap-12 items-start `}>

                    {/* Sections Grid: 6 columns max */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-flow-col md:auto-cols-fr lg:max-w-7xl mx-auto gap-24 justify-center">
                        {currentMenu.sections.map((section) => (
                            <div key={section.title} className="flex flex-col">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-black font-sans truncate mb-4">
                                    {section.title}
                                </h3>
                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                onClick={onClose}
                                                className="group flex items-center gap-3 text-sm text-stone-600 hover:text-brand transition-colors"
                                            >
                                                {/* Thumbnail — only rendered when
                                                    the API supplies an image for
                                                    this link (currently only the
                                                    dynamic By Style column does).
                                                    Reserves no space when absent
                                                    so other sections keep their
                                                    text-only rhythm. */}
                                                {link.image ? (
                                                    <span className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-stone-100">
                                                        <Image
                                                            src={link.image}
                                                            alt={link.label}
                                                            fill
                                                            unoptimized
                                                            sizes="32px"
                                                            className="object-cover"
                                                        />
                                                    </span>
                                                ) : null}
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate">{link.label}</span>
                                                    {link.subLabel && (
                                                        <span className="block text-xs text-stone-400 group-hover:text-brand/80 transition-colors mt-0.5 tracking-tight font-medium">
                                                            {link.subLabel}
                                                        </span>
                                                    )}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Right column — admin-curated `sideCards` from the
                        category's `menuSideCards` array. We only render the
                        column when there's at least one card; no dummy
                        fallback. */}
                    {hasSideCards && (
                        <div className="flex flex-col pl-6 border-l border-stone-100 h-full justify-between gap-5">
                            <div className="space-y-5">
                                {apiCategory?.sideCards?.map((c: any, idx: number) => {
                                    // The backend stamps `redirect.href` via
                                    // decorateRedirects — falls back to
                                    // direct-link `redirect.url` for safety.
                                    // Empty → card renders as plain content
                                    // (no link, no CTA row).
                                    const href = c?.redirect?.href || c?.redirect?.url || "";
                                    const hasLink = typeof href === "string" && href.trim() !== "";
                                    const cta = c?.ctaText?.trim() || "Explore";
                                    const Wrapper: any = hasLink ? Link : "div";
                                    const wrapperProps = hasLink
                                        ? { href, onClick: onClose }
                                        : {};
                                    return (
                                        <Wrapper
                                            key={`${c.title || "card"}-${idx}`}
                                            {...wrapperProps}
                                            className="group block"
                                        >
                                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded mb-3 bg-stone-100">
                                                {c.image ? (
                                                    <Image
                                                        src={c.image}
                                                        alt={c.title || ""}
                                                        fill
                                                        unoptimized
                                                        sizes="320px"
                                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : null}
                                            </div>
                                            {c.title && (
                                                <h4 className="font-serif text-base text-stone-900 group-hover:text-brand transition-colors font-medium">
                                                    {c.title}
                                                </h4>
                                            )}
                                            {c.subtitle && (
                                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                                    {c.subtitle}
                                                </p>
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

                {/* Optional Footer Bar */}
                {currentMenu.footerLink && (
                    <div className="mt-10 pt-4 border-t border-stone-100 text-center">
                        <Link
                            href={currentMenu.footerLink.href}
                            onClick={onClose}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-brand transition-colors py-1"
                        >
                            <span>{currentMenu.footerLink.label}</span>
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MegaMenu;
