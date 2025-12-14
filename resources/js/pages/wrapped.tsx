import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface GitHubStats {
    user: {
        login: string;
        name: string;
        avatar_url: string;
        bio: string;
        followers: number;
        following: number;
        public_repos: number;
    };
    stats: {
        totalCommits: number;
        totalPRs: number;
        mergedPRs: number;
        totalIssues: number;
        closedIssues: number;
        reposActive: number;
        topLanguages: string[];
        topRepos: Array<{
            name: string;
            stars: number;
            language: string | null;
        }>;
    };
}

interface Props {
    username: string;
}

export default function WrappedPage({ username }: Props) {
    const [data, setData] = useState<GitHubStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/github?username=${encodeURIComponent(username)}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch data');
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchData();
        }
    }, [username]);

    // Update meta tags for social sharing
    useEffect(() => {
        if (!data) return;

        const updateMetaTag = (property: string, content: string) => {
            let element =
                document.querySelector(`meta[property="${property}"]`) ||
                document.querySelector(`meta[name="${property}"]`);

            if (!element) {
                element = document.createElement('meta');
                if (property.startsWith('og:') || property.startsWith('twitter:')) {
                    element.setAttribute('property', property);
                } else {
                    element.setAttribute('name', property);
                }
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        const url = window.location.href;
        const title = `${data.user.name}'s GitWrap - ${data.stats.totalCommits.toLocaleString()} Commits`;
        const description = `Check out ${data.user.name}'s GitHub stats: ${data.stats.totalCommits.toLocaleString()} commits, ${data.stats.totalPRs.toLocaleString()} PRs, ${data.stats.reposActive.toLocaleString()} active repos!`;

        // Open Graph tags
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:image', data.user.avatar_url);
        updateMetaTag('og:url', url);
        updateMetaTag('og:type', 'website');

        // Twitter Card tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', data.user.avatar_url);

        // Standard meta tags
        document.title = title;
        updateMetaTag('description', description);
    }, [data]);

    // Animate numbers on mount
    useEffect(() => {
        if (!data) return;

        const animateValue = (key: string, target: number, duration: number = 2000) => {
            const start = 0;
            const startTime = Date.now();

            const updateValue = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (ease-out)
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(start + (target - start) * easeOut);

                setAnimatedValues((prev) => ({ ...prev, [key]: current }));

                if (progress < 1) {
                    requestAnimationFrame(updateValue);
                } else {
                    setAnimatedValues((prev) => ({ ...prev, [key]: target }));
                }
            };

            requestAnimationFrame(updateValue);
        };

        // Animate all stats
        animateValue('commits', data.stats.totalCommits);
        animateValue('prs', data.stats.totalPRs);
        animateValue('mergedPRs', data.stats.mergedPRs);
        animateValue('issues', data.stats.totalIssues);
        animateValue('closedIssues', data.stats.closedIssues);
        animateValue('repos', data.stats.reposActive);
        animateValue('followers', data.user.followers);
        animateValue('following', data.user.following);
        animateValue('publicRepos', data.user.public_repos);
    }, [data]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
                        <span
                            className="ready-steady-go-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white"
                            style={{ animationDelay: '0s' }}
                        >
                            Ready
                        </span>
                        <span
                            className="ready-steady-go-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white"
                            style={{ animationDelay: '0.6s' }}
                        >
                            Steady
                        </span>
                        <span
                            className="ready-steady-go-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                            style={{ animationDelay: '1.2s' }}
                        >
                            Go
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div
                            className="loading-dot w-2 h-2 bg-purple-400 rounded-full"
                            style={{ animationDelay: '1.8s' }}
                        ></div>
                        <div
                            className="loading-dot w-2 h-2 bg-purple-400 rounded-full"
                            style={{ animationDelay: '2s' }}
                        ></div>
                        <div
                            className="loading-dot w-2 h-2 bg-purple-400 rounded-full"
                            style={{ animationDelay: '2.2s' }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black relative overflow-hidden p-4 sm:p-6">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: '1s' }}
                    ></div>
                </div>

                <div className="relative w-full max-w-lg mx-auto">
                    <div
                        className="rounded-2xl bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border border-zinc-800/50 relative p-8 sm:p-12"
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

                        {/* Glow effect overlay */}
                        <div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                                background:
                                    'radial-gradient(circle at center, transparent 0%, rgba(139, 92, 246, 0.1) 100%)',
                            }}
                        />

                        {/* Content */}
                        <div className="relative text-center">
                            {/* Error Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/30">
                                    <svg
                                        className="w-10 h-10 sm:w-12 sm:h-12 text-red-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Error Title */}
                            <h2 className="mb-4 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                                Oops!
                            </h2>

                            {/* Error Message */}
                            <div className="mb-8 space-y-2">
                                <p className="text-white text-base sm:text-lg font-medium">Check your username</p>
                                <p className="text-zinc-400 text-sm sm:text-base">
                                    There are no user for this username
                                </p>
                                {username && (
                                    <p className="text-zinc-500 text-xs sm:text-sm mt-3 font-mono">"{username}"</p>
                                )}
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => router.visit('/')}
                                className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white font-semibold transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 active:scale-95"
                            >
                                <svg
                                    className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                <span>Go Back</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const { user, stats } = data;

    // Calculate additional stats
    const totalStars = stats.topRepos.reduce((sum, repo) => sum + repo.stars, 0);
    const contributedRepos = stats.reposActive;
    const streak = Math.min(stats.reposActive, 47);
    const topLanguage = stats.topLanguages[0] || 'N/A';

    // Calculate rank based on commits per year (assuming commits are for current year)
    const calculateRank = (commits: number): string => {
        if (commits >= 5000) return 'Top 0.5%';
        if (commits >= 2000) return 'Top 1%';
        if (commits >= 1000) return 'Top 2%';
        if (commits >= 500) return 'Top 5%';
        if (commits >= 200) return 'Top 20%';
        if (commits >= 50) return 'Top 50%';
        return 'Top 80%';
    };

    // Calculate power level based on total commits
    const calculatePowerLevel = (commits: number): string => {
        if (commits >= 9000) return 'God Mode';
        if (commits >= 4000) return 'Super Saiyan';
        if (commits >= 2000) return 'Sage Mode';
        if (commits >= 1000) return 'Elite Class';
        if (commits >= 500) return 'Ninja';
        if (commits >= 100) return 'Adventurer';
        return 'Rookie';
    };

    // Get power level emoji for display
    const getPowerLevelEmoji = (powerLevel: string): string => {
        switch (powerLevel) {
            case 'God Mode': return '🪐';
            case 'Super Saiyan': return '🔥💥';
            case 'Sage Mode': return '🌀';
            case 'Elite Class': return '⚡';
            case 'Ninja': return '🌪️';
            case 'Adventurer': return '🛡️';
            case 'Rookie': return '🌱';
            default: return '🌱';
        }
    };

    const rank = calculateRank(stats.totalCommits);
    const mostActiveMonth = 'January'; // Placeholder
    const mostActiveDay = 'Sunday'; // Placeholder
    const powerLevel = calculatePowerLevel(stats.totalCommits);

    const handleDownload = () => {
        const node = document.getElementById('my-section-to-capture');
        if (!node) return;

        // Store original border radius and class
        const originalBorderRadius = node.style.borderRadius;
        const originalClassName = node.className;
        const originalBackgroundColor = node.style.backgroundColor;

        // Remove border radius for screenshot
        node.style.borderRadius = '0';
        node.className = node.className.replace(/rounded-[^\s]*/g, '');
        // Set background to full black for screenshot
        node.style.backgroundColor = '#000000';

        // Also remove rounded classes from child elements that might have border radius
        const roundedElements = node.querySelectorAll('[class*="rounded"]');
        const originalClasses: { element: Element; className: string }[] = [];
        roundedElements.forEach((el) => {
            originalClasses.push({ element: el, className: el.className });
            el.className = el.className.replace(/rounded-[^\s]*/g, '');
        });

        toPng(node, {
            backgroundColor: '#000000',
            width: node.scrollWidth,
            height: node.scrollHeight,
            cacheBust: true,
            pixelRatio: 2,
            filter: (node) => {
                // Exclude download button and buy me a coffee button from screenshot
                if (node.classList && node.classList.contains('exclude-from-screenshot')) {
                    return false;
                }
                return true;
            },
        })
            .then((dataUrl) => {
                // Restore original border radius, class, and background
                node.style.borderRadius = originalBorderRadius;
                node.style.backgroundColor = originalBackgroundColor;
                node.className = originalClassName;
                originalClasses.forEach(({ element, className }) => {
                    element.className = className;
                });

                // Trigger a download directly
                const filename = `${username}.png`;
                download(dataUrl, filename);
            })
            .catch((error) => {
                // Restore original border radius, class, and background even on error
                node.style.borderRadius = originalBorderRadius;
                node.style.backgroundColor = originalBackgroundColor;
                node.className = originalClassName;
                originalClasses.forEach(({ element, className }) => {
                    element.className = className;
                });
                console.error('oops, something went wrong!', error);
            });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
            {/* Back Button */}
            <button
                onClick={() => router.visit('/')}
                className="absolute top-4 left-4 text-zinc-400 hover:text-white transition-colors z-10"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
            </button>

            {/* Single Shareable Card */}
            <div className="relative w-full max-w-2xl mx-auto" data-shareable-card>
                <div
                    id="my-section-to-capture"
                    className="rounded-2xl bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden border border-zinc-800/50 relative"
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

                    {/* Glow effect overlay */}
                    <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                            background:
                                'radial-gradient(circle at center, transparent 0%, rgba(139, 92, 246, 0.1) 100%)',
                        }}
                    />

                    {/* Buy me a coffee button - Top Right */}
                    <a
                        href="https://buymeacoffee.com/monayem"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="exclude-from-screenshot absolute top-3 right-3 bg-yellow-500 hover:bg-yellow-600 text-black px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 z-10"
                    >
                        <span>☕</span>
                        <span>Buy me a coffee</span>
                    </a>

                    {/* Card Content */}
                    <div className="relative p-4 sm:p-5 space-y-3 h-full flex flex-col">
                        {/* Header Section */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <img
                                src={user.avatar_url}
                                alt={user.name}
                                width={50}
                                height={50}
                                className="rounded-full"
                            />
                            <div className="flex-1">
                                <p className="text-white text-sm font-medium">@{user.login}</p>
                                <p className="text-purple-400 text-xs">2025 Year in Code</p>
                            </div>
                        </div>

                        {/* Contribution Graph */}
                        <div className="bg-zinc-900/50 rounded-lg p-2 border border-zinc-700/50 flex-shrink-0">
                            <div
                                className="grid grid-cols-53 gap-0.5 mb-1.5"
                                style={{ gridTemplateColumns: 'repeat(53, minmax(0, 1fr))' }}
                            >
                                {Array.from({ length: 371 }).map((_, i) => {
                                    const hasContribution = Math.random() < 0.1; // 10% chance for demo
                                    return (
                                        <div
                                            key={i}
                                            className={`aspect-square rounded-sm ${
                                                hasContribution ? 'bg-green-500' : 'bg-zinc-800'
                                            }`}
                                            style={{ width: '100%' }}
                                        />
                                    );
                                })}
                            </div>
                            <p className="text-white text-xs">
                                {stats.totalCommits} contributions in 2025
                            </p>
                        </div>

                        {/* Stats Grid - 4x2 */}
                        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                            <StatCard
                                title="Universal Rank"
                                value={rank}
                                bgIcon="trophy"
                                gradient="from-yellow-400 to-orange-500"
                                delay={0}
                                tooltipContent={
                                    <div className="space-y-1.5 text-zinc-900">
                                        <div>5000+ commits/year → Top 0.5%</div>
                                        <div>2000+ commits/year → Top 1%</div>
                                        <div>1000+ commits/year → Top 2%</div>
                                        <div>500+ commits/year → Top 5%</div>
                                        <div>200+ commits/year → Top 20%</div>
                                        <div>50+ commits/year → Top 50%</div>
                                        <div>Less than 50 commits → Top 80%</div>
                                        <div className="text-xs text-zinc-600 mt-2 pt-2 border-t border-zinc-400">
                                            Note: This is an estimation and not backed by any reliable data.
                                        </div>
                                    </div>
                                }
                            />
                            <StatCard
                                title="Longest Streak"
                                value={`${streak} days`}
                                bgIcon="calendar"
                                gradient="from-blue-400 to-blue-600"
                                delay={100}
                            />
                            <StatCard
                                title="Total Commits"
                                value={
                                    animatedValues.commits !== undefined
                                        ? animatedValues.commits.toString()
                                        : stats.totalCommits.toString()
                                }
                                bgIcon="trophy"
                                gradient="from-pink-500 to-purple-500"
                                delay={200}
                            />
                            <StatCard
                                title="Most Active Month"
                                value={mostActiveMonth}
                                bgIcon="calendar"
                                gradient="from-purple-400 to-purple-600"
                                delay={300}
                            />
                            <StatCard
                                title="Most Active Day"
                                value={mostActiveDay}
                                bgIcon="calendar"
                                gradient="from-blue-400 to-blue-600"
                                delay={400}
                            />
                            <StatCard
                                title="Total Stars"
                                value={totalStars.toString()}
                                bgIcon="star"
                                gradient="from-yellow-400 to-orange-500"
                                delay={500}
                            />
                            <StatCard
                                title="Top Language"
                                value={topLanguage}
                                bgIcon="globe"
                                gradient="from-blue-400 to-blue-600"
                                delay={600}
                            />
                            <StatCard
                                title="Power Level"
                                value={`${getPowerLevelEmoji(powerLevel)} ${powerLevel}`}
                                bgIcon="globe"
                                gradient="from-yellow-400 to-orange-500"
                                delay={700}
                                tooltipContent={
                                    <div className="space-y-1.5 text-zinc-900">
                                        <div className="font-semibold mb-2">Power Levels:</div>
                                        <div>100+ commits: Adventurer 🛡️</div>
                                        <div>500+ commits: Ninja 🌪️</div>
                                        <div>1000+ commits: Elite Class ⚡</div>
                                        <div>2000+ commits: Sage Mode 🌀</div>
                                        <div>4000+ commits: Super Saiyan 🔥💥</div>
                                        <div>9000+ commits: God Mode 🪐</div>
                                    </div>
                                }
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50 flex-shrink-0">
                            <p className="text-white text-xs">
                                Make yours at{' '}
                                <a
                                    href="https://gitwrap.monayemislam.me"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    gitwrap.monayemislam.me
                                </a>
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="exclude-from-screenshot bg-white text-black px-3 py-1.5 rounded text-xs font-semibold hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                    </svg>
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    bgIcon,
    gradient,
    delay = 0,
    tooltipContent,
}: {
    title: string;
    value: string;
    bgIcon: 'trophy' | 'calendar' | 'globe' | 'star';
    gradient: string;
    delay?: number;
    tooltipContent?: React.ReactNode;
}) {
    const getBackgroundIcon = () => {
        switch (bgIcon) {
            case 'trophy':
                return (
                    <svg
                        className="w-24 h-24 text-zinc-700/20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                    </svg>
                );
            case 'calendar':
                return (
                    <svg
                        className="w-24 h-24 text-zinc-700/20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                );
            case 'globe':
                return (
                    <svg
                        className="w-24 h-24 text-zinc-700/20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
            case 'star':
                return (
                    <svg
                        className="w-24 h-24 text-zinc-700/20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                    </svg>
                );
            default:
                return null;
        }
    };

    const cardContent = (
        <div
            className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-3 text-center backdrop-blur-sm transition-all duration-300"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div
                className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}
            >
                {value}
            </div>
            <div className="text-[9px] text-zinc-400 font-medium">{title}</div>
        </div>
    );

    if (tooltipContent) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {cardContent}
                </TooltipTrigger>
                <TooltipContent
                    className="bg-zinc-200 text-zinc-900 border-zinc-300 max-w-xs p-3 text-xs rounded-lg shadow-lg"
                    side="top"
                >
                    {tooltipContent}
                </TooltipContent>
            </Tooltip>
        );
    }

    return cardContent;
}

