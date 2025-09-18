import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { useState } from 'react';
import { SearchSection } from './_partial/SearchSection';
import { StylistsGrid } from './_partial/StylistsGrid';

export function StylistsSearch({
    stylists,
    category_names,
}: {
    stylists: MergedStylistPortfolioItem[];
    category_names: string[];
}) {
    const [filteredStylists, setFilteredStylists] = useState(stylists);
    return (
        <section className="mx-auto max-w-7xl space-y-6 px-5 py-4 sm:py-8 md:py-12">
            <SearchSection
                stylists={stylists}
                onFilteredStylists={setFilteredStylists}
                category_names={category_names}
            />
            <StylistsGrid
                stylists={filteredStylists}
                total_stylists={stylists.length}
            />
        </section>
    );
}
