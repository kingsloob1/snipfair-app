import { Location } from '@/Components/icon/Icons';
import { router } from '@inertiajs/react';

interface StylistProps {
    stylist: {
        id: number;
        stylist_profile_id?: number | null;
        category: string | null;
        name: string;
        title: string;
        banner_image?: string | null;
        profile_image?: string | null;
        price_range?: string | null;
        location: string;
        categories: { id: number; name: string; category: string }[];
    };
}

export default function FeaturedCard({ stylist }: StylistProps) {
    return (
        <div className="group flex w-64 min-w-64 cursor-pointer flex-col overflow-hidden rounded-xl hover:shadow-md">
            <div className="h-48 w-full overflow-hidden bg-sf-gradient-primary">
                <img
                    src={
                        stylist.banner_image
                            ? stylist.banner_image
                            : stylist.profile_image
                              ? stylist.profile_image
                              : '/placeholder.svg'
                    }
                    alt={stylist.name}
                    className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
                />
            </div>
            <div className="flex flex-col gap-2 px-2 py-3 md:px-3 md:py-4">
                <h4 className="font-inter text-base font-semibold text-sf-black">
                    {stylist.name}
                </h4>
                <h5 className="font-inter text-sm font-semibold text-sf-gradient-purple">
                    {stylist.title || 'Stylist'}
                </h5>
                <div className="flex items-center gap-1.5 text-sf-gray">
                    <Location className="shrink-0" />
                    <span className="truncate">{stylist.location}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 font-inter text-xs">
                    {stylist.categories &&
                        stylist.categories.map((tag, i) => (
                            <span
                                className="rounded-3xl bg-sf-stroke/50 px-2.5 py-1 font-medium text-sf-primary-paragraph"
                                key={i}
                            >
                                {tag.category}
                            </span>
                        ))}
                </div>
                <div className="flex items-center justify-between">
                    <span className="rounded-3xl bg-sf-stroke/50 px-2.5 py-1 font-inter text-xs font-bold text-sf-gradient-purple">
                        {stylist.price_range}
                    </span>
                    <button
                        onClick={() =>
                            router.visit(
                                route('customer.stylists.show', stylist.id),
                            )
                        }
                        className="rounded-3xl bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-all duration-500 hover:from-sf-gradient-pink hover:to-sf-gradient-purple hover:font-bold group-hover:opacity-100 md:text-sm"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
