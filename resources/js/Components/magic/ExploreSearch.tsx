import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { useState } from 'react';
import { ProductGrid } from './_partial/ProductGrid';
import { SearchSection } from './_partial/SearchSection';

export function ExploreSearch({
    stylists,
    category_names,
}: {
    stylists: MergedStylistPortfolioItem[];
    category_names: string[];
}) {
    const [filteredStylists, setFilteredStylists] = useState(stylists);
    return (
        <section className="mx-auto max-w-7xl space-y-6 px-5 py-1 sm:py-2 md:py-4">
            <SearchSection
                stylists={stylists}
                category_names={category_names}
                onFilteredStylists={setFilteredStylists}
                onDashboard={true}
            />
            <ProductGrid
                stylists={filteredStylists}
                total_stylists={stylists.length}
            />
        </section>
    );
}
