import { useState, useEffect } from 'react';

interface Star {
    left: number;
    top: number;
    size: number;
    opacity: number;
    duration: number;
    delay: number;
}

export default function DialogBackground() {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        // Generate stars only on client side to avoid hydration mismatch
        const generatedStars = Array.from({ length: 50 }).map(() => ({
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.8 + 0.2,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
        }));
        setStars(generatedStars);
    }, []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Starry background effect */}
            <div className="absolute inset-0">
                {stars.map((star, i) => (
                    <div
                        key={i}
                        className="star absolute rounded-full bg-white"
                        style={{
                            left: `${star.left}%`,
                            top: `${star.top}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            opacity: star.opacity,
                            animationDuration: `${star.duration}s`,
                            animationDelay: `${star.delay}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

