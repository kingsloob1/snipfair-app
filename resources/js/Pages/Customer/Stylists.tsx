import { StylistsSearch } from '@/Components/magic/StylistsSearch';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { Head } from '@inertiajs/react';

export default function Stylists({
    stylists,
    category_names,
}: {
    stylists: MergedStylistPortfolioItem[];
    category_names: string[];
}) {
    return (
        <AuthenticatedLayout>
            <Head title="Stylists" />
            <StylistsSearch
                category_names={category_names}
                stylists={stylists}
            />
        </AuthenticatedLayout>
    );
}
