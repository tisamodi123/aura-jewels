export default function Banner({ title, content }: { title: String, content: String }) {
    return (
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-20 text-center">
            <h1 className="font-el-messiri text-4xl md:text-5xl text-[#1A1A1A] mb-6">{title}</h1>
            <p className="text-gray-500 font-jakarta font-light leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
                {content}
            </p>
        </div>
    )
}