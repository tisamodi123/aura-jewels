import Image from "next/image";
import Link from "next/link";

const JournalCard = ({ article }: { article: any }) => {
    return (
        <Link href={`/journal/${article.slug}`} className="flex flex-col group cursor-pointer">
            <div className="relative aspect-[4/3] w-full bg-[#013D3D]/5 overflow-hidden mb-6">
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                />
            </div>

            <div className="flex items-center text-xs tracking-widest text-[#013D3D]/70 font-dm-sans font-medium mb-3 uppercase">
                <span>{article.category}</span>
                <span className="mx-2 font-light text-neutral-border">•</span>
                <span>{article.date}</span>
            </div>

            <h3 className="text-2xl font-el-messiri font-normal leading-snug tracking-wide text-[#013D3D] mb-3 group-hover:text-[#013D3D]/70 transition-colors duration-200">
                {article.title}
            </h3>

            <p className="text-sm text-[#013D3D]/70 font-dm-sans font-light leading-relaxed line-clamp-3">
                {article.description}
            </p>
        </Link>
    );
};

export default JournalCard;