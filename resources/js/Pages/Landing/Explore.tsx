import AnimatedSweep from '@/Components/common/AnimatedSweep';
import Featured from '@/Components/explore/Featured';
import Latest from '@/Components/explore/Latest';
import Cta from '@/Components/home/Cta';
import Trending from '@/Components/home/Trending';
import Footer from '@/Components/layout/Footer';
import Navbar from '@/Components/layout/Navbar';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

type Portfolio = {
    id: number;
    slug_id: number;
    banner_image?: string | null;
    category: string;
    name: string;
    description: string;
    price: number;
    stylist_name: string;
};
type ExploreProps = {
    bestPortfolios: string[];
    otherPortfolios: string[];
    portfolios: Portfolio[];
};

export default function Explore({
    auth,
    bestPortfolios,
    otherPortfolios,
    portfolios,
}: PageProps<ExploreProps>) {
    return (
        <>
            <Head title="Explore" />
            <AnimatedSweep />
            <Navbar auth={auth} />
            <Featured portfolios={bestPortfolios} />
            <Latest portfolios={otherPortfolios} />
            <Trending portfolios={portfolios} title="Recommended Styles" />
            <Cta />
            <Footer />
        </>
    );
}
