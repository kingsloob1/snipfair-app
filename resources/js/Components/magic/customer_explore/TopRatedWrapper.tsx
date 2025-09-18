import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { animate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import TopRatedProduct from './TopRatedProduct';

type FeaturedCardsProps = {
    stylists: MergedStylistPortfolioItem[];
};

export default function TopRatedWrapper({ stylists }: FeaturedCardsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScroll = () => {
        if (!containerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setShowLeft(scrollLeft > 0);
        setShowRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    useEffect(() => {
        checkScroll();
        const handleResize = () => checkScroll();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scrollBy = (offset: number) => {
        if (!containerRef.current) return;

        animate(
            containerRef.current.scrollLeft,
            containerRef.current.scrollLeft + offset,
            {
                duration: 0.5,
                onUpdate: (latest: number) => {
                    if (containerRef.current) {
                        containerRef.current.scrollLeft = latest;
                        checkScroll();
                    }
                },
            },
        );
    };

    return (
        <div className="relative w-full py-3 sm:py-6 md:py-8">
            <div
                ref={containerRef}
                onScroll={checkScroll}
                className="no-scrollbar flex gap-2.5 overflow-x-auto pb-6 pt-2 md:gap-5"
            >
                {stylists.map((stylist, index) => (
                    <TopRatedProduct stylist={stylist} key={index} />
                ))}
            </div>

            {showLeft && (
                <button
                    onClick={() => scrollBy(-250)}
                    aria-label="Scroll left"
                    className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-sf-white p-1 text-sf-black shadow-sm backdrop-blur hover:bg-sf-white-card hover:shadow-md"
                >
                    <ArrowLeft size={24} />
                </button>
            )}

            {showRight && (
                <button
                    onClick={() => scrollBy(250)}
                    aria-label="Scroll right"
                    className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-sf-white p-1 text-sf-black shadow-sm backdrop-blur hover:bg-sf-white-card hover:shadow-md"
                >
                    <ArrowRight size={24} />
                </button>
            )}
        </div>
    );
}
