import Image from 'next/image';
import Link from 'next/link';
import { PREFIX } from '@/lib/constants';

const withPrefix = (src: string) => (PREFIX ? `${PREFIX}${src}` : src);

type Block = { heading?: string; paragraphs: string[] };
type Article = {
    slug: string;
    category: string;
    date: string;
    readTime?: string;
    author?: string;
    title: string;
    description: string;
    image: string;
    body: Block[];
};

const JournalArticle = ({ article, related }: { article: Article; related: Article[] }) => {
    return (
        <article className="min-h-screen bg-white text-[#013D3D] font-dm-sans antialiased">
            <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[12px] text-[#013D3D]/50 mb-10">
                    <Link href="/" className="hover:text-[#013D3D]">Home</Link>
                    <span>›</span>
                    <Link href="/journal" className="hover:text-[#013D3D]">Journal</Link>
                    <span>›</span>
                    <span className="text-[#013D3D] font-medium truncate">{article.title}</span>
                </nav>

                {/* Header */}
                <header className="mb-10">
                    <div className="flex items-center text-xs tracking-widest text-[#013D3D]/70 font-medium mb-4 uppercase">
                        <span>{article.category}</span>
                        <span className="mx-2 font-light text-neutral-border">•</span>
                        <span>{article.date}</span>
                        {article.readTime && (
                            <>
                                <span className="mx-2 font-light text-neutral-border">•</span>
                                <span>{article.readTime}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-el-messiri font-normal leading-tight tracking-wide text-[#013D3D] mb-4">
                        {article.title}
                    </h1>
                    <p className="text-base md:text-lg text-[#013D3D]/70 font-light leading-relaxed">
                        {article.description}
                    </p>
                    {article.author && (
                        <p className="text-xs text-[#013D3D]/50 mt-4 uppercase tracking-wider">By {article.author}</p>
                    )}
                </header>

                {/* Hero image */}
                <div className="relative aspect-[16/9] w-full bg-[#013D3D]/5 overflow-hidden mb-12">
                    <Image src={withPrefix(article.image)} alt={article.title} fill className="object-cover" priority />
                </div>

                {/* Body */}
                <div className="space-y-8">
                    {article.body.map((block, i) => (
                        <section key={i}>
                            {block.heading && (
                                <h2 className="text-2xl font-el-messiri font-normal tracking-wide text-[#013D3D] mb-3">
                                    {block.heading}
                                </h2>
                            )}
                            {block.paragraphs.map((p, j) => (
                                <p key={j} className="text-[15px] md:text-base text-[#013D3D]/80 font-light leading-relaxed mb-4">
                                    {p}
                                </p>
                            ))}
                        </section>
                    ))}
                </div>

                {/* Back link */}
                <div className="mt-16 pt-8 border-t border-[#013D3D]/10">
                    <Link
                        href="/journal"
                        className="inline-flex items-center text-xs tracking-widest font-semibold text-[#013D3D] uppercase group hover:text-[#013D3D]/70 transition-colors"
                    >
                        <span className="mr-2 transition-transform duration-200 group-hover:-translate-x-1">←</span>
                        Back to Journal
                    </Link>
                </div>

                {/* Related articles */}
                {related.length > 0 && (
                    <section className="mt-16">
                        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#013D3D]/60 mb-6">
                            More From the Journal
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {related.map((r) => (
                                <Link key={r.slug} href={`/journal/${r.slug}`} className="group flex gap-4 items-center">
                                    <div className="relative w-24 h-24 shrink-0 bg-[#013D3D]/5 overflow-hidden">
                                        <Image src={withPrefix(r.image)} alt={r.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-[#013D3D]/50">{r.category}</span>
                                        <h4 className="text-base font-el-messiri font-normal text-[#013D3D] leading-snug group-hover:text-[#013D3D]/70 transition-colors">
                                            {r.title}
                                        </h4>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </article>
    );
};

export default JournalArticle;
