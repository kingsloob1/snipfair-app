import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import PortfolioCard from '@/Components/stylist/PortfolioCard';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { router } from '@inertiajs/react';
import { Filter, Plus, Search, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

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
}

export default function Work({ services, portfolios }: WorkProps) {
    const routes = [
        {
            name: 'Work',
            path: route('stylist.work'),
            active: false,
        },
    ];
    const [stringFilter, setStringFilter] = useState('');
    // const [filteredProducts, setFilteredProducts] = useState<Portfolio[]>(portfolios);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [openFilter, setOpenFilter] = useState(false);

    const categoryOptions = ['All', ...services];

    const filterBySearch = (item: Portfolio) => {
        if (!stringFilter.trim()) return true;
        const query = stringFilter.toLowerCase();
        return (
            item.title.toLowerCase().includes(query) ||
            item.category.name.toLowerCase().includes(query)
        );
    };

    const filterByCategory = (item: Portfolio) => {
        if (categoryFilter === 'All') return true;
        return (
            item.category.name.toLowerCase() === categoryFilter.toLowerCase()
        );
    };

    const filteredItems = portfolios.filter(
        (item) => filterBySearch(item) && filterByCategory(item),
    );

    return (
        <StylistAuthLayout header="Stylist Work">
            <StylistNavigationSteps
                routes={routes}
                sub="Showcase your best work to attract more clients"
            >
                <div className="flex gap-2">
                    <CustomButton
                        onClick={() => router.visit(route('stylist.schedules'))}
                        fullWidth={false}
                        variant="secondary"
                    >
                        <div className="flex gap-1">
                            <Users size={14} />
                            See Requests
                        </div>
                    </CustomButton>
                    <CustomButton
                        onClick={() =>
                            router.visit(route('stylist.work.create'))
                        }
                        fullWidth={false}
                    >
                        <div className="flex gap-1">
                            <Plus size={14} />
                            Add Work
                        </div>
                    </CustomButton>
                </div>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                <div className="mb-5 flex items-center gap-4">
                    <CustomButton
                        variant={openFilter ? 'secondary' : 'primary'}
                        fullWidth={false}
                        onClick={() => setOpenFilter(!openFilter)}
                    >
                        <div className="flex items-center gap-2">
                            <Filter size={14} />
                            <span className="font-medium">Filter</span>
                        </div>
                    </CustomButton>
                    <AnimatePresence>
                        {openFilter && (
                            <motion.div
                                key="fade-box"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex items-center gap-2.5"
                            >
                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by name or category..."
                                        value={stringFilter}
                                        onChange={(e) =>
                                            setStringFilter(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) =>
                                            setCategoryFilter(e.target.value)
                                        }
                                        className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {categoryOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="ml-auto text-sm text-gray-500">
                                    {filteredItems.length}{' '}
                                    {filteredItems.length === 1
                                        ? 'result'
                                        : 'results'}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {filteredItems && filteredItems.length > 0 ? (
                        filteredItems.map((portfolio) => (
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
