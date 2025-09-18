import CustomButton from '@/Components/common/CustomButton';
import { cn } from '@/lib/utils';
import { MergedStylistPortfolioItem } from '@/types/custom_types';
import { usePage } from '@inertiajs/react';
import { Filter, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';

interface SearchSectionProps {
    stylists: MergedStylistPortfolioItem[];
    onFilteredStylists: (stylists: MergedStylistPortfolioItem[]) => void;
    category_names: string[];
    onDashboard?: boolean;
}
export const SearchSection: React.FC<SearchSectionProps> = ({
    stylists,
    onFilteredStylists,
    category_names,
    onDashboard = false,
}) => {
    const { url } = usePage();
    useEffect(() => {
        const params = new URLSearchParams(
            new URL(url, window.location.origin).search,
        );
        const tab = params.get('c');
        if (tab && category_names.includes(tab)) {
            setSelectedCategory(tab);
        }
    }, [url, category_names]);
    const [showFilters, setShowFilters] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState('All Prices');
    const [rating, setRating] = useState('All');
    const [sortBy, setSortBy] = useState('Sort By Default');
    const categories = ['All', ...category_names];
    const priceRanges = [
        'All Prices',
        'Below R50',
        'R51 - 100',
        'R101 - 150',
        'R151 - 200',
        'R200 - Above',
    ];
    const ratings = ['All', 'Highest Rated', 'Lowest Price', 'Online Now'];
    const sortOptions = [
        'Sort By Default',
        'By Bookings Count',
        'By Distance',
        'By Price (Lowest)',
        'By Price (Highest)',
        'By Likes Count',
    ];
    const getPriceRange = (priceStr: string): [number, number] => {
        if (priceStr === 'All Prices') return [0, Infinity];
        const matches = priceStr.match(/\$(\d+)(?:\s*-\s*(\d+|Above))?/);
        if (!matches) return [0, Infinity];
        const min = parseInt(matches[1]);
        const max = matches[2] === 'Above' ? Infinity : parseInt(matches[2]);
        return [min, max];
    };
    const filteredStylists = useMemo(() => {
        let filtered = stylists.filter((stylist) => {
            // Search text filter
            const searchLower = searchText.toLowerCase();
            const matchesSearch =
                !searchText ||
                (stylist.category &&
                    stylist.category.toLowerCase().includes(searchLower)) ||
                (stylist.name &&
                    stylist.name.toLowerCase().includes(searchLower)) ||
                (stylist.description &&
                    stylist.description.toLowerCase().includes(searchLower));
            // Category filter

            const matchesCategory =
                selectedCategory === 'All' ||
                stylist.category === selectedCategory;
            // Price range filter
            const [minPrice, maxPrice] = getPriceRange(priceRange);
            const matchesPrice =
                stylist.price &&
                stylist.price >= minPrice &&
                stylist.price <= maxPrice;
            // Rating filter (simplified for demo)
            const matchesRating =
                rating === 'All' ||
                (rating === 'Highest Rated' &&
                    stylist.average_rating &&
                    stylist.average_rating >= 4.5) ||
                (rating === 'Lowest Price' &&
                    stylist.price &&
                    stylist.price < 100) ||
                (rating === 'Online Now' &&
                    stylist.availability === 'Online Now');

            return (
                matchesSearch &&
                matchesCategory &&
                matchesPrice &&
                matchesRating
            );
        });

        // Apply sorting
        if (sortBy !== 'Sort By Default') {
            filtered = [...filtered].sort((a, b) => {
                switch (sortBy) {
                    case 'By Bookings Count':
                        return (
                            (b.appointment_counts || 0) -
                            (a.appointment_counts || 0)
                        );
                    case 'By Distance': {
                        const distanceA =
                            a.distance === 'N/A'
                                ? Infinity
                                : parseFloat(
                                      a.distance?.replace('km', '') || '0',
                                  );
                        const distanceB =
                            b.distance === 'N/A'
                                ? Infinity
                                : parseFloat(
                                      b.distance?.replace('km', '') || '0',
                                  );
                        return distanceA - distanceB;
                    }
                    case 'By Price (Lowest)':
                        return (a.price || 0) - (b.price || 0);
                    case 'By Price (Highest)':
                        return (b.price || 0) - (a.price || 0);
                    case 'By Likes Count':
                        return (b.likes_count || 0) - (a.likes_count || 0);
                    default:
                        return 0;
                }
            });
        }

        return filtered;
    }, [stylists, searchText, selectedCategory, priceRange, rating, sortBy]);
    // Update filtered stylists whenever the filters change
    useEffect(() => {
        onFilteredStylists(filteredStylists);
    }, [filteredStylists, onFilteredStylists]);
    return (
        <div className="w-full rounded-2xl bg-white p-2 shadow-md sm:p-4 md:p-6">
            <div className="mb-4 flex gap-1.5 md:gap-2.5">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="peer w-full rounded-2xl border border-sf-stroke bg-sf-white-neutral p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-sf-gradient-purple md:p-3 md:pl-11"
                    />
                    <Search
                        className="absolute left-3 top-3.5 text-sf-gray peer-focus:text-sf-gray-zinc"
                        size={20}
                    />
                </div>
                <CustomButton
                    variant={showFilters ? 'secondary' : 'primary'}
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-100"
                >
                    <div className="flex">
                        <Filter size={16} className="mr-1" />
                        <span className="hidden md:inline">
                            {showFilters ? 'Hide Filter' : 'Show Filter'}
                        </span>
                    </div>
                </CustomButton>
            </div>
            <AnimatePresence>
                {showFilters && !onDashboard && (
                    <motion.div
                        initial={{
                            height: 0,
                            opacity: 0,
                        }}
                        animate={{
                            height: 'auto',
                            opacity: 1,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.3,
                        }}
                        className="overflow-hidden"
                    >
                        <div className="mb-4 grid grid-cols-1 gap-4 p-0.5 md:grid-cols-3">
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="rounded-lg border border-sf-stroke bg-sf-primary-background p-2 shadow-sm focus:border-sf-primary focus:ring-2 focus:ring-sf-primary"
                            >
                                {priceRanges.map((range) => (
                                    <option key={range} value={range}>
                                        {range}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="rounded-lg border border-sf-stroke bg-sf-primary-background p-2 shadow-sm focus:border-sf-primary focus:ring-2 focus:ring-sf-primary"
                            >
                                {ratings.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="rounded-lg border border-sf-stroke bg-sf-primary-background p-2 shadow-sm focus:border-sf-primary focus:ring-2 focus:ring-sf-primary"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div
                className={cn(
                    'mb-4 flex flex-wrap gap-2 pt-4',
                    !showFilters && 'hidden md:flex',
                    onDashboard && !showFilters && '!hidden',
                )}
            >
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-xl border px-4 py-2 text-sm transition-colors duration-300 ${selectedCategory === category ? 'border border-sf-gradient-purple bg-gradient-to-r from-purple-50 to-pink-50 text-sf-gradient-purple transition-shadow duration-200 hover:shadow-md' : 'border-sf-stroke bg-sf-white-card text-sf-gray-zinc hover:bg-sf-gray-zinc hover:text-sf-white'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
};
