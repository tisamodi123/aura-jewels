import Image from 'next/image';
import Link from 'next/link';
import JournalCard from './JournalCard';
import { PREFIX } from '@/lib/constants';
import journalData from '@/data/journal.json';

const withPrefix = (src: string) => (PREFIX ? `${PREFIX}${src}` : src);

const JournalPage = () => {
    const articles = journalData;
    const mainArticle = articles.find((a) => a.featured) || articles[0];
    const secondaryArticles = articles.filter((a) => a.slug !== mainArticle.slug);

    return (
        <main className="min-h-screen bg-white text-[#013D3D] px-6 md:px-12 py-16 max-w-7xl mx-auto">

            {/* Header Section */}
            <header className="text-center mb-20 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-el-messiri font-normal tracking-wide text-[#013D3D] mb-4">
                    The Aura Jewels&apos;s Journal
                </h1>
                <p className="text-md text-[#013D3D]/70 tracking-wider font-dm-sans font-medium leading-relaxed">
                    Insights, guides, and stories on the art of fine jewelry, diamonds, and style.
                </p>
            </header>

            {/* Featured Article Section */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center mb-28">
                <Link
                    href={`/journal/${mainArticle.slug}`}
                    className="md:col-span-6 relative aspect-[4/3] w-full bg-[#013D3D]/5 overflow-hidden group block"
                >
                    <Image
                        src={withPrefix(mainArticle.image)}
                        alt={mainArticle.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                        priority
                    />
                </Link>

                <div className="md:col-span-6 flex flex-col justify-center lg:pr-8">
                    <div className="flex items-center text-xs tracking-widest text-[#013D3D]/70 font-dm-sans font-medium mb-3.5 uppercase">
                        <span>{mainArticle.category}</span>
                        <span className="mx-2 font-light text-neutral-border">•</span>
                        <span>{mainArticle.date}</span>
                    </div>
                    <Link href={`/journal/${mainArticle.slug}`}>
                        <h2 className="text-3xl md:text-4xl font-el-messiri font-normal leading-snug tracking-wide text-[#013D3D] mb-4 hover:text-[#013D3D]/70 transition-colors">
                            {mainArticle.title}
                        </h2>
                    </Link>
                    <p className="text-sm text-[#013D3D]/70 font-dm-sans font-light leading-relaxed mb-6 max-w-md">
                        {mainArticle.description}
                    </p>
                    <Link
                        href={`/journal/${mainArticle.slug}`}
                        className="inline-flex items-center text-xs tracking-widest font-dm-sans font-semibold text-[#013D3D] uppercase group hover:text-[#013D3D]/70 transition-colors duration-200"
                    >
                        Read Article
                        <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </Link>
                </div>
            </section>

            {/* Grid Articles Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-20 mb-20">
                {secondaryArticles.map((article) => (
                    <JournalCard key={article.slug} article={{ ...article, image: withPrefix(article.image) }} />
                ))}
            </section>

        </main>
    );
};

export default JournalPage;
