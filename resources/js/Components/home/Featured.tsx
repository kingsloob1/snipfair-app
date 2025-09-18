import { router } from '@inertiajs/react';
import GradientText from '../common/GradientText';
import OutlineButton from '../common/OutlineButton';
import { ArrowRight } from '../icon/Icons';
import FeaturedCards from './_partial/FeaturedCards';

interface FeaturedProps {
    stylists: {
        id: number;
        stylist_profile_id?: number | null;
        category: string | null;
        name: string;
        title: string;
        banner_image?: string | null;
        price_range?: string | null;
        location: string;
        categories: { id: number; name: string; category: string }[];
    }[];
}

export default function Featured({ stylists }: FeaturedProps) {
    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 md:py-10">
            <header className="mb-5 flex flex-col gap-2 md:gap-3.5">
                <p>
                    <GradientText className="bg-gradient-to-b font-inter text-base font-semibold">
                        STYLISTS
                    </GradientText>
                </p>
                <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    Featured Stylists
                </h2>
                <p className="max-w-3xl font-sans text-base text-sf-primary-paragraph">
                    We take pride in presenting the artistry of our most
                    exceptional beauty professionals. Each stylist is celebrated
                    not only for their craft, but for the unforgettable
                    experiences they create. Here, we spotlight a select few
                    trusted, admired, and adored by our clients.
                </p>
            </header>
            <div>
                <FeaturedCards stylists={stylists} />
            </div>
            <div className="mt-2 text-center">
                <OutlineButton
                    onClick={() => router.visit(route('customer.stylists'))}
                    className="duration-400 flex gap-1.5 text-sf-gradient-purple transition-colors hover:text-sf-gradient-pink"
                >
                    <span>See All Stylists</span>
                    <ArrowRight />
                </OutlineButton>
            </div>
        </section>
    );
}
