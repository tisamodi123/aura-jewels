export const Button = ({ label, onClick, type = "fill" }: { label: string, onClick: React.MouseEventHandler<HTMLButtonElement>, type?: string }) => {
    switch (type) {
        case "fill":
            return (
                <button
                    onClick={onClick}
                    className="flex-1 bg-brand text-neutral-white hover:bg-brand-hover text-xs py-3.5 px-4 transition-all duration-300 rounded-[2px] cursor-pointer disabled:opacity-50 text-center uppercase"
                >
                    {label}
                </button>
            )
        case "outline":
            return (
                <button
                    onClick={onClick}
                    className="w-full py-3 text-xs uppercase text-neutral-muted border border-neutral-border hover:bg-brand hover:text-neutral-white transition-all duration-300 active:scale-[0.99] rounded-[2px]"
                >
                    {label}
                </button>
            )
    }
}