import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
// import ResumeCardWrapper from '@/Components/stylist/ResumeCardWrapper';
import ViewTutorialCard from '@/Components/stylist/ViewTutorialCard';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
// import { products } from '@/type_data/products';
// import { Product } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    CheckCheck,
    ChevronRight,
    Clock,
    Filter,
    Search,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

type Course = {
    id: number;
    category: string;
    is_premium: boolean;
    title: string;
    author: string;
    duration: string;
    intro: string;
    likes: number;
    rating: number;
    image: string;
};

export default function Index() {
    const showFilter = false;
    const routes = [
        {
            name: 'Tutorial',
            path: route('stylist.tutorials'),
            active: true,
        },
    ];
    const [stringFilter, setStringFilter] = useState('');
    // const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [openFilter, setOpenFilter] = useState(false);

    // useEffect(() => {
    //     if (products) setFilteredProducts(products.slice(0, 6));
    // }, []);

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

    // const filterBySearch = (item: Product) => {
    //     if (!stringFilter.trim()) return true;
    //     const query = stringFilter.toLowerCase();
    //     return (
    //         item.name.toLowerCase().includes(query) ||
    //         item.description.toLowerCase().includes(query) ||
    //         item.title.toLowerCase().includes(query) ||
    //         item.category.toLowerCase().includes(query)
    //     );
    // };

    // const filterByCategory = (item: Product) => {
    //     if (categoryFilter === 'All') return true;
    //     return item.category.toLowerCase() === categoryFilter.toLowerCase();
    // };

    // const filteredItems = filteredProducts.filter(
    // (item) => filterBySearch(item) && filterByCategory(item),
    // );

    // const tutorialsRecommended = [
    //     {
    //         id: 1,
    //         category: 'Beginner',
    //         is_premium: true,
    //         title: 'Glass Skin Glow',
    //         author: 'Glash Hair Coach',
    //         duration: '1h 30m',
    //         intro: 'Learn effective strategies to grow your client base and increase bookings',
    //         likes: 234,
    //         rating: 3.4,
    //         image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    //     {
    //         id: 2,
    //         category: 'Intermediate',
    //         is_premium: false,
    //         title: 'Braids Mastery',
    //         author: 'Nia Bantu',
    //         duration: '2h 10m',
    //         intro: 'Master trending braid styles with tips for speed and neatness',
    //         likes: 562,
    //         rating: 4.7,
    //         image: 'https://images.unsplash.com/photo-1621961452894-3b4f2c456b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    //     {
    //         id: 3,
    //         category: 'Advanced',
    //         is_premium: true,
    //         title: 'Color Correction 101',
    //         author: 'Levi Mane',
    //         duration: '1h 45m',
    //         intro: 'Fix hair coloring mistakes with expert correction techniques',
    //         likes: 341,
    //         rating: 4.2,
    //         image: 'https://images.unsplash.com/photo-1612305063785-facb8c59b4b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    //     {
    //         id: 4,
    //         category: 'Beginner',
    //         is_premium: false,
    //         title: 'Natural Curls Defined',
    //         author: 'Curl Up Coach',
    //         duration: '1h 05m',
    //         intro: 'Define and maintain curls with natural hair care methods',
    //         likes: 189,
    //         rating: 4.0,
    //         image: 'https://images.unsplash.com/photo-1621973667699-c89e3e6a4387?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    //     {
    //         id: 5,
    //         category: 'Expert',
    //         is_premium: true,
    //         title: 'Editorial Hair Styling',
    //         author: 'Paris Wavez',
    //         duration: '3h 00m',
    //         intro: 'Craft camera-ready styles for shoots and runway events',
    //         likes: 721,
    //         rating: 4.9,
    //         image: 'https://images.unsplash.com/photo-1598228723793-52759c0b7f8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    //     {
    //         id: 6,
    //         category: 'Intermediate',
    //         is_premium: false,
    //         title: 'Salon Etiquette & Client Retention',
    //         author: 'Glow School',
    //         duration: '1h 20m',
    //         intro: 'Boost client trust and rebooking rates with expert behavior tips',
    //         likes: 432,
    //         rating: 4.3,
    //         image: 'https://images.unsplash.com/photo-1610921865127-8ab5c63adf6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    //     {
    //         id: 7,
    //         category: 'Advanced',
    //         is_premium: true,
    //         title: 'Textured Hair Blowouts',
    //         author: 'The Coil Lounge',
    //         duration: '2h 35m',
    //         intro: 'Handle heat and texture with precision to achieve flawless blowouts',
    //         likes: 298,
    //         rating: 4.1,
    //         image: 'https://images.unsplash.com/photo-1588702547959-bc9f0c8a3b83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    //     {
    //         id: 8,
    //         category: 'Beginner',
    //         is_premium: false,
    //         title: 'Shampoo Science',
    //         author: 'Glowlab Institute',
    //         duration: '45m',
    //         intro: 'Understand scalp health and cleansing techniques for optimal hair care',
    //         likes: 150,
    //         rating: 3.8,
    //         image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    //     {
    //         id: 9,
    //         category: 'Expert',
    //         is_premium: true,
    //         title: 'Wig Installation Secrets',
    //         author: 'Crowned Co.',
    //         duration: '2h 15m',
    //         intro: 'Learn lace melting, glueless techniques, and HD finishing',
    //         likes: 673,
    //         rating: 4.8,
    //         image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    //     {
    //         id: 10,
    //         category: 'Intermediate',
    //         is_premium: false,
    //         title: 'Men’s Fade Fundamentals',
    //         author: 'Sharp Fade Academy',
    //         duration: '1h 10m',
    //         intro: 'Get your fade game strong with core clipper skills and finishing',
    //         likes: 503,
    //         rating: 4.5,
    //         image: 'https://images.unsplash.com/photo-1618221764289-0d9d8a6339cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    //     },
    // ];
    // const tutorialsViewed: Course[] = [
    //     {
    //         category: 'Hair Styling',
    //         title: 'Beginner’s Guide to Becoming a Pro Stylist',
    //         authorName: 'Sasha Monroe',
    //         authorRole: 'Celebrity Hair Stylist',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1614289263880-0dc2273e9796?w=150&h=150&fit=crop&crop=face',
    //     },
    //     {
    //         category: 'Skincare',
    //         title: 'Glowing Skin: Daily Routine That Works',
    //         authorName: 'Lola Rae',
    //         authorRole: 'Licensed Esthetician',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face',
    //     },
    //     {
    //         category: 'Makeup',
    //         title: 'Mastering the No-Makeup Makeup Look',
    //         authorName: 'Andre Blake',
    //         authorRole: 'Professional MUA',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&h=150&fit=crop&crop=face',
    //     },
    //     {
    //         category: 'Hair Coloring',
    //         title: 'The Art of Balayage: Step-by-Step',
    //         authorName: 'Karina Styles',
    //         authorRole: 'Hair Color Expert',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    //     },
    //     {
    //         category: 'Natural Hair',
    //         title: 'Protective Styles 101: From Twists to Braids',
    //         authorName: 'Maya Thompson',
    //         authorRole: 'Natural Hair Coach',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=150&h=150&fit=crop&crop=face',
    //     },
    //     {
    //         category: 'Hair Cutting',
    //         title: 'Precision Bob Cuts for Beginners',
    //         authorName: 'Diego Marcel',
    //         authorRole: 'Salon Educator',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1614289263845-3e3aa6ecfc5a?w=150&h=150&fit=crop&crop=face',
    //     },
    //     {
    //         category: 'Bridal Beauty',
    //         title: 'Creating the Perfect Bridal Look',
    //         authorName: 'Anita Gold',
    //         authorRole: 'Bridal Makeup Artist',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    //     },
    //     {
    //         category: 'Barbering',
    //         title: 'Fade Like a Pro: Clippers, Guards & Lines',
    //         authorName: 'Jamal Ricks',
    //         authorRole: 'Master Barber',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1589578527966-bf6a899cfd0b?w=150&h=150&fit=crop&crop=face',
    //     },
    //     {
    //         category: 'Lash & Brow',
    //         title: 'Laminated Brows & Lashes at Home',
    //         authorName: 'Tina Glow',
    //         authorRole: 'Brow Specialist',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=150&h=150&fit=crop&crop=face',
    //     },
    //     {
    //         category: 'Haircare',
    //         title: 'Understanding Hair Porosity & Product Matching',
    //         authorName: 'Elijah Grace',
    //         authorRole: 'Haircare Formulator',
    //         authorImage:
    //             'https://images.unsplash.com/photo-1541233349642-6e425fe6190e?w=150&h=150&fit=crop&crop=face',
    //     },
    // ];

    const tutorialsRecommended: Course[] = [];
    return (
        <StylistAuthLayout header="Tutorials">
            <StylistNavigationSteps
                routes={routes}
                sub="Showcase your best work to attract more clients"
            >
                {showFilter && (
                    <div className="flex flex-row-reverse items-center gap-2">
                        <CustomButton
                            variant={openFilter ? 'secondary' : 'primary'}
                            fullWidth={false}
                            onClick={() => setOpenFilter(!openFilter)}
                            className="p-2"
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
                                    className="flex items-center gap-2"
                                >
                                    <div className="relative max-w-32">
                                        <Search
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={stringFilter}
                                            onChange={(e) =>
                                                setStringFilter(e.target.value)
                                            }
                                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="relative max-w-32">
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) =>
                                                setCategoryFilter(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {categoryOptions.map((option) => (
                                                <option
                                                    key={option}
                                                    value={option}
                                                >
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex flex-col items-center gap-2.5 rounded-xl border border-sf-stroke bg-sf-white p-4 md:p-6">
                        <BookOpen className="text-sf-gradient-pink" size={20} />
                        <h3 className="font-inter text-2xl font-bold text-sf-black md:text-3xl">
                            0
                        </h3>
                        <p className="font-inter text-sm text-sf-primary-paragraph">
                            Workshops Available
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2.5 rounded-xl border border-sf-stroke bg-sf-white p-4 md:p-6">
                        <CheckCheck className="text-sf-primary" size={20} />
                        <h3 className="font-inter text-2xl font-bold text-sf-black md:text-3xl">
                            0
                        </h3>
                        <p className="font-inter text-sm text-sf-primary-paragraph">
                            Completed
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2.5 rounded-xl border border-sf-stroke bg-sf-white p-4 md:p-6">
                        <Clock
                            className="text-sf-primary-paragraph"
                            size={20}
                        />
                        <h3 className="font-inter text-2xl font-bold text-sf-black md:text-3xl">
                            0hr
                        </h3>
                        <p className="font-inter text-sm text-sf-primary-paragraph">
                            Learning Time
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-2.5">
                    {/* <ResumeCardWrapper tutorials={[]} /> */}
                    <div>
                        <div className="my-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-sf-black lg:text-3xl">
                                Recommended
                            </h2>
                            <Link
                                href={route('stylist.tutorials.all')}
                                className="flex items-center gap-1 text-sf-primary-paragraph underline transition-all hover:mr-1.5 hover:no-underline"
                            >
                                View All
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div className="grid gap-5 md:grid-cols-3">
                            {tutorialsRecommended &&
                            tutorialsRecommended.length > 0 ? (
                                tutorialsRecommended
                                    .slice(0, 3)
                                    .map((item, i) => (
                                        <ViewTutorialCard
                                            tutorial={item}
                                            key={i}
                                        />
                                    ))
                            ) : (
                                <p className="flex h-40 items-center justify-center italic md:col-span-3">
                                    No tutorials available currently
                                </p>
                            )}
                        </div>
                    </div>

                    {/* <ResumeTutorialCard />
                    <ViewTutorialCard /> */}
                </div>
            </section>
        </StylistAuthLayout>
    );
}
