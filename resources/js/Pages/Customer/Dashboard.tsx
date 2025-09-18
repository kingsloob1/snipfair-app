import { ExploreSearch } from '@/Components/magic/ExploreSearch';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { Head } from '@inertiajs/react';

export default function Dashboard({
    category_names,
    all_collections,
}: {
    all_collections: MergedStylistPortfolioItem[];
    category_names: string[];
}) {
    const routes = [
        {
            name: 'Dashboard',
            path: route('dashboard'),
            active: true,
        },
        {
            name: 'Explore',
            path: route('customer.explore'),
            active: false,
        },
    ];

    return (
        <AuthenticatedLayout navigation={routes}>
            <Head title="Dashboard" />
            <ExploreSearch
                category_names={category_names}
                stylists={all_collections}
            />
        </AuthenticatedLayout>
    );
}
