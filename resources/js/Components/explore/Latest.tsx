import { useEffect, useState } from 'react';
import MediaGallery from './_partial/MediaGallery';

interface LatestProps {
    portfolios: string[];
}

export default function Latest({ portfolios }: LatestProps) {
    const [screenSize, setScreenSize] = useState<number>(3);
    useEffect(() => {
        const updateScreenSize = () => {
            if (window.innerWidth < 480) setScreenSize(2);
            else if (window.innerWidth < 768) setScreenSize(3);
            else setScreenSize(4);
        };

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => {
            window.removeEventListener('resize', updateScreenSize);
        };
    }, []);

    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-12 md:py-16">
            <header className="mb-5 flex flex-col gap-2 md:gap-3.5">
                <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    Our Latest Media
                </h2>
                <p className="max-w-3xl font-sans text-base text-sf-primary-paragraph">
                    Our gallery sections are used to provide visual means of
                    displaying various pictures, photos or graphics in a concise
                    but elegant manner.
                </p>
            </header>
            <MediaGallery portfolios={portfolios} batchSize={screenSize} />
        </section>
    );
}
