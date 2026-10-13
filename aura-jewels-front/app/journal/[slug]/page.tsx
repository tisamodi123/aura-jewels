import { notFound } from 'next/navigation';
import JournalArticle from './components/JournalArticle';
import journalData from '@/data/journal.json';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
    return journalData.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const article = journalData.find((a) => a.slug === slug);
    if (!article) return { title: 'Journal | Aura Jewels' };
    return {
        title: `${article.title} | Aura Jewels Journal`,
        description: article.description,
    };
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    const article = journalData.find((a) => a.slug === slug);
    if (!article) notFound();

    const related = journalData.filter((a) => a.slug !== slug).slice(0, 2);
    return <JournalArticle article={article} related={related} />;
}
