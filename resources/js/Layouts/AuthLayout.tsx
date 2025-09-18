import imageSrc from '@/assets/images/auth-bg.jpg';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { PropsWithChildren, useEffect, useState } from 'react';
import TextRatingComponent from './TextRatingComponent';

const ratingData = {
    title: 'Your Next Favorite Stylist Is Just a Click Away',
    description:
        "Discover a new era of grooming and beauty where convenience meets excellence. With Snipfair, you're always connected to skilled, verified professionals ready to style you wherever you are.",
    rating: 4.5,
    reviewCount: 500,
    avatars: [
        {
            name: 'User 1',
            color: '#c7b3d9',
            imageUrl: '/images/avatar/avatar1.png',
        },
        {
            name: 'User 2',
            color: '#aa9b75',
            imageUrl: '/images/avatar/avatar.png',
        },
        {
            name: 'User 3',
            color: '#d4b5ad',
            imageUrl: '/images/avatar/avatar1.png',
        },
        {
            name: 'User 4',
            color: '#bea887',
            imageUrl: '/images/avatar/avatar.png',
        },
        {
            name: 'User 5',
            color: '#a2a8cd',
            imageUrl: '/images/avatar/avatar1.png',
        },
        {
            name: 'User 6',
            color: '#d1baa9',
            imageUrl: '/images/avatar/avatar1.png',
        },
        {
            name: 'User 7',
            color: '#d1dfc3',
            imageUrl: '/images/avatar/avatar1.png',
        },
        {
            name: 'User 8',
            color: '#cfc3a7',
            imageUrl: '/images/avatar/avatar.png',
        },
        {
            name: 'User 9',
            color: '#d2c7ac',
            imageUrl: '/images/avatar/avatar1.png',
        },
        {
            name: 'User 10',
            color: '#dac0dd',
            imageUrl: '/images/avatar/avatar.png',
        },
        {
            name: 'User 11',
            color: '#f9f6ff',
            imageUrl: '/images/avatar/avatar1.png',
        },
        {
            name: 'User 12',
            color: '#d0c3a7',
            imageUrl: '/images/avatar/avatar.png',
        },
    ],
};

interface AuthLayoutProps {
    type?: 'customer' | 'stylist' | 'admin';
    className?: string;
}

export default function AuthLayout({
    type = 'customer',
    className = 'w-full max-w-md',
    children,
}: PropsWithChildren<AuthLayoutProps>) {
    const [showForm, setShowForm] = useState(false);

    // Only for small screens: show image first, then reveal form after delay
    useEffect(() => {
        const time = window.innerWidth < 768 ? 1500 : 500;
        const timer = setTimeout(() => {
            setShowForm(true);
        }, time);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative top-0 flex min-h-screen flex-col md:flex-row">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={cn(
                    'relative h-[100vh] w-full md:h-auto md:w-[45%]',
                    !showForm ? 'z-10' : 'lg:z-0',
                )}
            >
                <img
                    src={imageSrc}
                    alt="Visual"
                    className="h-full w-full object-cover"
                />
                <div
                    className={cn(
                        'absolute bottom-0 flex w-full flex-col bg-[linear-gradient(358deg,var(--tw-gradient-stops))] p-4 pt-10 md:p-6 lg:p-8 xl:p-10',
                        type === 'stylist'
                            ? 'from-sf-gradient-purple via-sf-gradient-pink/40 to-sf-gradient-pink/0'
                            : 'from-black to-black/0',
                    )}
                >
                    <div className="flex justify-start pb-7">
                        <img
                            src="/images/icons/StarFourOrange.svg"
                            alt="Visual"
                            className="h-16 w-16"
                        />
                    </div>
                    <TextRatingComponent
                        title={
                            type === 'stylist'
                                ? 'Your Next Customer is Just a Click Away'
                                : 'Your Next Favorite Stylist Is Just a Click Away'
                        }
                        description={
                            type === 'stylist'
                                ? 'Your platform to build and manage your styling business on your terms. We handle the bookings and payments so you can focus on providing exceptional service and growing your clientele.'
                                : "Discover a new era of grooming and beauty where convenience meets excellence. With Snipfair, you're always connected to skilled, verified professionals ready to style you wherever you are."
                        }
                        rating={4.5}
                        reviewCount={500}
                        avatars={ratingData.avatars || []}
                    />
                    <div className="flex justify-end">
                        <img
                            src="/images/icons/StarFour.svg"
                            alt="Visual"
                            className="h-16 w-16"
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showForm ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className={cn(
                    'absolute left-0 top-0 flex min-h-full w-full items-center justify-center bg-white px-0 py-0 sm:px-2 sm:py-5 md:w-[55%] md:px-6 md:py-14',
                    'md:static md:h-auto',
                    showForm ? 'z-20' : 'z-0',
                )}
            >
                <div className={cn('rounded-3xl shadow-sf-custom', className)}>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
