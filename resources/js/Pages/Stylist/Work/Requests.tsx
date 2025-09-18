import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { ServiceCard } from '@/Components/stylist/ServiceCard';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { products } from '@/type_data/products';
import { Product } from '@/types';
import { Filter, Search } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function Requests() {
    const routes = [
        {
            name: 'Work',
            path: route('stylist.work'),
            active: true,
        },
        {
            name: 'Nearby Service Requests',
            path: route('stylist.work.requests'),
            active: false,
        },
    ];
    const [stringFilter, setStringFilter] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [openFilter, setOpenFilter] = useState(false);

    useEffect(() => {
        if (products) setFilteredProducts(products.slice(0, 6));
    }, []);

    const categoryOptions = [
        'All',
        'Haircut',
        'Special Event',
        'Nails',
        'Hair Styling',
        'Facial Treatment',
        'Make Up',
        'Eye Brows',
    ];

    const filterBySearch = (item: Product) => {
        if (!stringFilter.trim()) return true;
        const query = stringFilter.toLowerCase();
        return (
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.title.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
    };

    const filterByCategory = (item: Product) => {
        if (categoryFilter === 'All') return true;
        return item.category.toLowerCase() === categoryFilter.toLowerCase();
    };

    const filteredItems = filteredProducts.filter(
        (item) => filterBySearch(item) && filterByCategory(item),
    );

    return (
        <StylistAuthLayout header="Appointments Requests">
            <StylistNavigationSteps
                routes={routes}
                sub="Find new clients and grow your business"
            />
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
                <div className="mb-6 grid grid-cols-1 gap-5">
                    {filteredItems && filteredItems.length > 0 ? (
                        filteredItems.map((product) => (
                            <ServiceCard
                                key={product.id}
                                {...product}
                                isPremium={product.section === 'top_rated'}
                                onAccept={() => console.log('Accepted')}
                                onMessage={() => console.log('Message clicked')}
                                onDecline={() => console.log('Declined')}
                            />
                        ))
                    ) : (
                        <p className="flex h-40 items-center justify-center italic md:col-span-3">
                            No products to show
                        </p>
                    )}
                </div>
            </section>
        </StylistAuthLayout>
    );
}
