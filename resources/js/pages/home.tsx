import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';
import DialogBackground from '../components/DialogBackground';
import ProductHuntButton from '../components/ProductHuntButton';

export default function Home() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        router.visit(`/wrapped/${encodeURIComponent(username.trim())}`);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black overflow-hidden">
            <ProductHuntButton />
            <DialogBackground />
            <main className="relative z-10 flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-8 py-16">
                {/* Main Dialog Box Container */}
                <div className="w-full max-w-2xl">
                    <div
                        className="relative rounded-2xl bg-black/40 backdrop-blur-xl shadow-2xl p-8 sm:p-12 overflow-hidden"
                        style={{
                            boxShadow:
                                '0 0 10px rgba(105, 96, 156, 0.6), 0 0 90px rgba(105, 96, 156, 0.4), 0 0 180px rgba(105, 96, 156, 0.3), inset 0 0 40px rgba(105, 96, 156, 0.1), inset 0 1px 8px rgba(255, 255, 255, 0.3), inset -1px -1px 2px rgba(105, 96, 156, 0.2)',
                        }}
                    >
                        {/* Glass shine/highlight effect */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl pointer-events-none"
                            style={{
                                background:
                                    'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)',
                            }}
                        />
                        {/* Content */}
                        <div className="text-center">
                            {/* Animated Cat */}
                            <div className="flex justify-center mb-6">
                                <div
                                    className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center p-2"
                                    style={{
                                        borderWidth: '3px',
                                        borderColor: 'rgba(105, 96, 156, 0.5)',
                                        borderStyle: 'solid',
                                        boxShadow:
                                            '0 0 20px rgba(105, 96, 156, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                                        animation: 'float 3s ease-in-out infinite',
                                    }}
                                >
                                    <svg
                                        className="w-full h-full"
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {/* Tail */}
                                        <g>
                                            <path
                                                d="M15 55 Q10 50 8 45 Q5 40 8 35 Q10 30 15 35 Q18 38 20 42"
                                                stroke="white"
                                                strokeWidth="2.5"
                                                fill="none"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M20 42 Q22 45 25 48 Q28 50 30 52"
                                                stroke="white"
                                                strokeWidth="2.5"
                                                fill="none"
                                                strokeLinecap="round"
                                            />
                                        </g>

                                        {/* Body */}
                                        <ellipse cx="50" cy="60" rx="20" ry="18" fill="white" />

                                        {/* Head */}
                                        <circle cx="50" cy="40" r="18" fill="white" />

                                        {/* Ears */}
                                        <path d="M38 25 L42 15 L46 25 Z" fill="white" />
                                        <path d="M54 25 L58 15 L62 25 Z" fill="white" />

                                        {/* Inner ears */}
                                        <path d="M40 22 L42 18 L44 22 Z" fill="#1a1a1a" />
                                        <path d="M56 22 L58 18 L60 22 Z" fill="#1a1a1a" />

                                        {/* Eyes */}
                                        <circle cx="45" cy="38" r="3" fill="#1a1a1a" />
                                        <circle cx="55" cy="38" r="3" fill="#1a1a1a" />

                                        {/* Nose */}
                                        <path d="M50 42 L48 45 L52 45 Z" fill="#1a1a1a" />

                                        {/* Mouth */}
                                        <path
                                            d="M50 45 Q48 48 46 48"
                                            stroke="#1a1a1a"
                                            strokeWidth="1.5"
                                            fill="none"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M50 45 Q52 48 54 48"
                                            stroke="#1a1a1a"
                                            strokeWidth="1.5"
                                            fill="none"
                                            strokeLinecap="round"
                                        />

                                        {/* Paws */}
                                        <ellipse cx="40" cy="75" rx="4" ry="5" fill="white" />
                                        <ellipse cx="60" cy="75" rx="4" ry="5" fill="white" />
                                    </svg>
                                </div>
                            </div>

                            <h1 className="mb-4 text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                                GitWrap
                            </h1>
                            <p className="mb-8 text-lg sm:text-xl text-zinc-300 drop-shadow-md">
                                See and share your coding journey beautifully
                            </p>

                            <form onSubmit={handleSubmit} className="mb-6">
                                <div className="flex items-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm overflow-hidden">
                                    <div className="flex items-center flex-1 px-1.5 sm:px-4 min-w-0">
                                        <svg
                                            className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-zinc-400 mr-1.5 sm:mr-3 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="GitHub username..."
                                            className="flex-1 bg-transparent text-white placeholder-zinc-400 outline-none py-2 sm:py-4 text-xs sm:text-base min-w-0"
                                            disabled={loading}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !username.trim()}
                                        className="bg-white text-black px-2.5 sm:px-6 py-2 sm:py-4 text-xs sm:text-base font-semibold border-l border-zinc-700/50 transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white flex-shrink-0 whitespace-nowrap"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="hidden sm:inline">Loading...</span>
                                                <span className="sm:hidden">...</span>
                                            </>
                                        ) : (
                                            'Generate'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <p className="text-xs sm:text-sm text-zinc-400 drop-shadow-sm">
                                Your GitHub data is fetched securely and never stored
                            </p>
                        </div>

                        {/* Glow effect overlay */}
                        <div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                                background:
                                    'radial-gradient(circle at center, transparent 0%, rgba(139, 92, 246, 0.1) 100%)',
                            }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

