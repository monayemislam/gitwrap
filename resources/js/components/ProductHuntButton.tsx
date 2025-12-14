export default function ProductHuntButton() {
    return (
        <a
            href="https://www.producthunt.com/products/gitwrap-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-105 flex items-center gap-2 font-semibold text-sm"
        >
            <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                />
            </svg>
            <span className="hidden sm:inline">Product Hunt</span>
        </a>
    );
}

