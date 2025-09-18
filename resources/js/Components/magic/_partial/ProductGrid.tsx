import GradientText from '@/Components/common/GradientText';
import { Location } from '@/Components/icon/Icons';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { Crown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import TopRatedWrapper from '../customer_explore/TopRatedWrapper';
import TrendingProduct from '../customer_explore/TrendingProduct';
import LoadingProducts from './LoadingProducts';

interface ProductGridProps {
    stylists: MergedStylistPortfolioItem[];
    total_stylists: number;
}

const SECTIONS = [
    { name: 'featured', title: 'Most Popular' },
    { name: 'top_rated', title: 'Top Rated' },
    { name: 'online', title: 'Available Stylists' },
];

export const ProductGrid: React.FC<ProductGridProps> = ({
    stylists,
    total_stylists,
}) => {
    const [screenSize, setScreenSize] = useState<number>(3);

    useEffect(() => {
        const updateScreenSize = () => {
            if (window.innerWidth < 480) setScreenSize(1);
            else if (window.innerWidth < 976) setScreenSize(2);
            else setScreenSize(3);
        };

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => {
            window.removeEventListener('resize', updateScreenSize);
        };
    }, []);

    if (stylists.length === 0)
        return (
            <p className="flex h-[50vh] items-center justify-center text-center">
                <GradientText>
                    {total_stylists === 0
                        ? 'No stylists available. Try updating your location.'
                        : 'No stylists match your filter. Try changing the location or category.'}
                </GradientText>
            </p>
        );

    return (
        <div className="space-y-10 p-0 md:p-6">
            {SECTIONS.map((section) => {
                const sectionStylists = stylists.filter(
                    (stylist) => stylist.section === section.name,
                );

                if (sectionStylists.length === 0) return null;

                return (
                    <div key={section.name}>
                        {section.name === 'top_rated' ? (
                            <div className="flex items-center gap-5 pt-5 md:pt-12">
                                <div className="flex items-center gap-1.5">
                                    <Crown className="text-sf-yellow-47" />
                                    <h2 className="font-inter text-xl font-bold text-sf-black md:text-2xl">
                                        {section.title}
                                    </h2>
                                </div>
                                <span className="flex rounded-2xl bg-sf-gradient-secondary px-5 py-2 text-xs font-semibold text-sf-white">
                                    <span>Elite Professionals</span>
                                </span>
                            </div>
                        ) : section.name === 'online' ? (
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="font-inter text-xl font-bold text-sf-black md:text-2xl">
                                    {section.title}
                                </h2>
                                <span className="flex rounded-2xl bg-sf-stroke p-2 text-xs font-semibold text-sf-gray-zinc">
                                    <Location />
                                    <span>Closest to you</span>
                                </span>
                            </div>
                        ) : (
                            <h2 className="mt-5 font-inter text-xl font-bold text-sf-black md:mt-10 md:text-2xl">
                                {section.title}
                            </h2>
                        )}
                        {section.name === 'top_rated' ? (
                            <TopRatedWrapper stylists={sectionStylists} />
                        ) : section.name === 'online' ? (
                            <LoadingProducts
                                stylists={sectionStylists}
                                batchSize={screenSize}
                                rowCount={screenSize == 1 ? 6 : 3}
                            />
                        ) : (
                            <div className="grid grid-cols-2 gap-6 py-2 md:grid-cols-2 md:py-6 lg:grid-cols-3 xl:grid-cols-4">
                                {sectionStylists
                                    .slice(
                                        0,
                                        screenSize == 1 ? 6 : screenSize * 4,
                                    )
                                    .map((stylist) => (
                                        <TrendingProduct
                                            key={stylist.id}
                                            stylist={stylist}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
