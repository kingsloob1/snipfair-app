import GradientText from '@/Components/common/GradientText';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import React, { useEffect, useState } from 'react';
import LoadingProducts from './LoadingProducts';

interface StylistsGridProps {
    stylists: MergedStylistPortfolioItem[];
    total_stylists: number;
}

export const StylistsGrid: React.FC<StylistsGridProps> = ({
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
            <LoadingProducts
                stylists={stylists}
                batchSize={screenSize}
                rowCount={screenSize == 2 ? 5 : 3}
            />
        </div>
    );
};
