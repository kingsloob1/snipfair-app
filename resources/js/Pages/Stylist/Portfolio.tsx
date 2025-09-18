// import CustomButton from '@/Components/common/CustomButton';
import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import PortfolioCard from '@/Components/stylist/PortfolioCard';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { router } from '@inertiajs/react';
// import { router } from '@inertiajs/react';
import { Briefcase, Heart, Plus, Star } from 'lucide-react';

interface Portfolio {
    id: number;
    category: {
        name: string;
    };
    title: string;
    like_count: number;
    // rating: 3.4,
    media_urls: string[];
}

interface WorkProps {
    services: string[];
    portfolios: Portfolio[];
    statistics: {
        total_works: number;
        total_likes: number;
        average_rating: number;
    };
}

export default function Portfolio({ portfolios, statistics }: WorkProps) {
    const routes = [
        {
            name: 'Portfolio',
            path: route('stylist.portfolio'),
            active: false,
        },
    ];

    return (
        <StylistAuthLayout header="Stylist Portfolio">
            <StylistNavigationSteps
                routes={routes}
                sub="Showcase your best work to attract more clients"
            >
                <CustomButton
                    onClick={() => router.visit(route('stylist.work.create'))}
                    fullWidth={false}
                >
                    <div className="flex gap-1">
                        <Plus size={14} />
                        Add Work
                    </div>
                </CustomButton>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-sf-stroke bg-sf-white p-4 md:p-6">
                        <Briefcase className="text-sf-primary" size={20} />
                        <h3 className="font-inter text-2xl font-bold text-sf-black md:text-3xl">
                            {statistics.total_works}
                        </h3>
                        <p className="font-inter text-sm text-sf-primary-paragraph">
                            Total Works
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-sf-stroke bg-sf-white p-4 md:p-6">
                        <Heart
                            className="text-sf-gradient-pink"
                            fill="hsl(var(--sf-gradient-pink))"
                            size={20}
                        />
                        <h3 className="font-inter text-2xl font-bold text-sf-black md:text-3xl">
                            {statistics.total_likes}
                        </h3>
                        <p className="font-inter text-sm text-sf-primary-paragraph">
                            Total Likes
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-sf-stroke bg-sf-white p-4 md:p-6">
                        <Star
                            className="text-sf-yellow-47"
                            fill="hsl(var(--sf-yellow-47))"
                            size={20}
                        />
                        <h3 className="font-inter text-2xl font-bold text-sf-black md:text-3xl">
                            {statistics.average_rating}
                        </h3>
                        <p className="font-inter text-sm text-sf-primary-paragraph">
                            Average Rating
                        </p>
                    </div>
                </div>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {portfolios && portfolios.length > 0 ? (
                        portfolios.map((portfolio) => (
                            <PortfolioCard
                                key={portfolio.id}
                                portfolio={portfolio}
                                showDelete={true}
                            />
                        ))
                    ) : (
                        <p className="flex h-40 items-center justify-center italic md:col-span-3">
                            No portfolio to show
                        </p>
                    )}
                </div>
            </section>
        </StylistAuthLayout>
    );
}
