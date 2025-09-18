import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { animate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import TextStroke from './TextStroke';

type ThumbnailGalleryProps = {
    portfolios: {
        id: number;
        slug_id: number;
        banner_image?: string | null;
        category: string;
        name: string;
        description: string;
        price: number;
        stylist_name: string;
    }[];
};

export default function Thumbnail({ portfolios }: ThumbnailGalleryProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        <div className="relative w-full bg-sf-primary-background py-6 sm:px-4 md:px-6 md:py-8">
            <div
                ref={containerRef}
                onScroll={checkScroll}
                className="no-scrollbar flex overflow-x-auto"
            >
                {portfolios.length === 0 && (
                    <div className="flex w-full items-center justify-center py-10">
                        <p className="text-lg italic text-sf-gray">
                            Loading...
                        </p>
                    </div>
                )}
                {portfolios.slice(0, 12).map((portfolio, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentImageIndex(index);
                            router.visit(
                                route(
                                    'customer.appointment.book',
                                    portfolio.slug_id,
                                ),
                            );
                        }}
                        className={`relative ml-8 h-52 w-40 min-w-32 rounded-lg border-2 transition-all duration-300 first:ml-6 md:ml-11 md:h-64 md:w-auto md:min-w-40 ${
                            currentImageIndex === index
                                ? 'border-sf-yellow-47'
                                : 'border-transparent hover:border-sf-orange-53'
                        }`}
                    >
                        <div className="h-full w-full max-w-80 overflow-hidden rounded-lg bg-sf-gradient-secondary">
                            <img
                                src={
                                    `/storage/${portfolio.banner_image}` ||
                                    '/placeholder.svg'
                                }
                                alt={portfolio.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <h3 className="absolute -left-3 bottom-4 drop-shadow-sf-custom">
                            <TextStroke
                                strokeWidth="4px"
                                textColor="hsl(var(--sf-black-secondary))"
                                strokeColor="hsl(var(--sf-white))"
                                className="text-5xl font-extrabold"
                            >
                                {index + 1}
                            </TextStroke>
                        </h3>
                    </button>
                ))}
            </div>

            {showLeft && (
                <button
                    onClick={() => scrollBy(-150)}
                    aria-label="Scroll left"
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white backdrop-blur hover:bg-black/50"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {showRight && (
                <button
                    onClick={() => scrollBy(150)}
                    aria-label="Scroll right"
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white backdrop-blur hover:bg-black/50"
                >
                    <ChevronRight size={24} />
                </button>
            )}
        </div>
    );
}
