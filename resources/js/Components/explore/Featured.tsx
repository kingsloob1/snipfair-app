import { openFullscreenOverlay } from '@/lib/helper';
import { cn } from '@/lib/utils';
import FallbackImage from '../FallbackImage';

interface FeaturedProps {
    portfolios: string[];
}

export default function Featured({ portfolios }: FeaturedProps) {
    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-12 md:py-16">
            <header className="mb-5 flex flex-col items-center gap-2 md:gap-3.5">
                <h2 className="font-inter text-3xl font-bold text-sf-black md:text-4xl">
                    Our Featured Media
                </h2>
                <p className="max-w-3xl font-sans text-base text-sf-primary-paragraph">
                    Explore our gallery of real transformations, stylist work,
                    and behind-the-scenes moments. From flawless fades to glam
                    makeovers, our gallery showcases the magic our stylists
                    create every day.
                </p>
            </header>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-11">
                {portfolios && portfolios.length > 0 ? (
                    portfolios.map((portfolio, i) => (
                        <div
                            key={i}
                            className={cn(
                                'col-span-3 h-52 cursor-pointer overflow-hidden rounded-sm',
                                (i === 0 || i === portfolios.length - 1) &&
                                    'col-span-5',
                            )}
                        >
                            <FallbackImage
                                src={`/storage/${portfolio}` || ''}
                                alt="Featured"
                                className="h-full w-full rounded-sm object-cover transition-all duration-300 hover:scale-110"
                                onClick={() =>
                                    openFullscreenOverlay(
                                        `/storage/${portfolio}`,
                                    )
                                }
                            />
                        </div>
                    ))
                ) : (
                    <div className="flex w-full items-center justify-center py-10 md:col-span-11">
                        <p className="text-lg italic text-sf-gray">
                            Coming soon! Check back later
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
