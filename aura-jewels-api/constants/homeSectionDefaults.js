import { HOME_SECTION_KEYS } from "./homeSection.constant.js";

const noneRedirect = () => ({ type: "none" });
const directRedirect = (url) => ({ type: "direct", url });

export const HOME_SECTION_DEFAULTS = {
    [HOME_SECTION_KEYS.HERO_SLIDER]: {
        title: "Hero Slider",
        content: {
            slides: [
                {
                    label: "PRECIOUS FOREVER",
                    headingLine1: "WHERE ELEGANCE",
                    headingLine2: "BECOMES ETERNAL",
                    desc: "We craft exceptional diamonds that celebrate love, honor heritage, and radiate a brilliance designed to endure for generations.",
                    image: "images/home/Main-Banner-1.jpg",
                    ctaText: "Shop Now",
                    redirect: directRedirect("/shop")
                }
            ]
        }
    },
    [HOME_SECTION_KEYS.CHAPTERS_OF_LIGHT]: {
        title: "Chapters Of Light (Shop By Category)",
        content: {
            heading: "CHAPTERS OF LIGHT",
            subText: "Discover our radiant collections.",
            categories: []
        }
    },
    [HOME_SECTION_KEYS.SIGNATURE_SHOWCASE]: {
        title: "Signature Showcase",
        content: {
            heading: "SIGNATURE SHOWCASE",
            subText: "Elegance in every style.",
            ctaText: "Shop Now",
            image: "images/home/Elegance.jpg",
            redirect: directRedirect("/shop"),
            showOption: "selected",
            productIds: [],
            filters: {
                categoryIds: [],
                subCategoryIds: [],
                collectionIds: [],
                tagIds: [],
                lastNDays: 7
            }
        }
    },
    [HOME_SECTION_KEYS.TRENDING_BRILLIANCE]: {
        title: "Trending Brilliance",
        content: {
            heading: "TRENDING BRILLIANCE",
            subText: "Explore our most loved pieces.",
        }
    },
    [HOME_SECTION_KEYS.COLLECTIONS_OF_NOTE]: {
        title: "Collections Of Note",
        content: {
            heading: "COLLECTIONS OF NOTE",
            subText: "Curated selections for every occasion.",
            items: []
        }
    },
    [HOME_SECTION_KEYS.BESPOKE_EXPERIENCE]: {
        title: "Bespoke Experience",
        content: {
            heading: "Mastering Your Vision",
            subText: "Create your own custom jewellery.",
            ctaText: "Discover More",
            redirect: directRedirect("/custom-jewellery"),
            image: "images/home/Custom-Jewellery.jpg"
        }
    },
    [HOME_SECTION_KEYS.SHOP_BY_BUDGET]: {
        title: "Shop By Budget",
        content: {
            heading: "SHOP BY BUDGET",
            items: []
        }
    },
    [HOME_SECTION_KEYS.SHOP_BY_SEGMENT]: {
        title: "Shop By Segment",
        content: {
            heading: "SHOP BY SEGMENT",
            items: []
        }
    },
    [HOME_SECTION_KEYS.GIFTS_OCCASION]: {
        title: "Gifts That Speak The Occasion",
        content: {
            heading: "GIFTS THAT SPEAK THE OCCASION",
            items: []
        }
    },
    [HOME_SECTION_KEYS.INSTAGRAM_SOCIAL]: {
        title: "From Our Instagram",
        content: {
            heading: "FROM OUR INSTAGRAM",
            items: []
        }
    }
};

export default HOME_SECTION_DEFAULTS;
