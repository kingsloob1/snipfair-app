import { PagePropsWithNotifiers } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Gavel, HelpCircle, LogOut, Settings, Wallet } from 'lucide-react'; //, Sun, UserPlus
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import GradientTextSpan from '../common/GradientTextSpan';
import { Chat, Notification, User } from '../icon/Icons';
import NavMenu from '../magic/NavMenu';
// eslint-disable-next-line prettier/prettier
import NavNotification from '../magic/NavNotification';
import AppLogoImage from '../AppLogoImage';

interface NavItem {
    label: string;
    route: string;
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    route: string;
}

const AuthNavbar = ({
    auth,
    recentChats,
    recentNotifications,
}: PagePropsWithNotifiers) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems: NavItem[] = [
        { label: 'Explore', route: 'dashboard' },
        { label: 'Stylists', route: 'customer.stylists' },
        { label: 'Favorites', route: 'customer.favorites' },
        { label: 'Appointments', route: 'customer.appointments' },
        // { label: 'Rewards', route: 'customer.rewards' },
        { label: 'Wallet', route: 'customer.wallet' },
    ];
    const menuItems: MenuItem[] = [
        {
            label: 'Account',
            icon: <User />,
            route: 'customer.profile',
        },
        {
            label: 'Wallet',
            icon: <Wallet />,
            route: 'customer.wallet',
        },
        {
            label: 'Settings',
            icon: <Settings />,
            route: 'customer.settings',
        },
        {
            label: 'Disputes',
            icon: <Gavel />,
            route: 'disputes.index',
        },
        // {
        //     label: 'Favorites',
        //     icon: <Star />,
        //     route: 'customer.favorites',
        // },
        // {
        //     label: 'Theme',
        //     icon: <Sun />,
        //     route: 'customer.settings.theme',
        // },
        {
            label: 'Support',
            icon: <HelpCircle />,
            route: 'tickets.index',
        },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="sticky left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white"
        >
            <div className="mx-auto max-w-7xl px-5">
                <div className="flex items-center justify-between py-2 md:py-3 lg:py-5">
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        href={route('home')}
                        className="flex items-center space-x-1.5"
                    >
                        <AppLogoImage
                            type="primary"
                            className="h-7 w-7 rounded-lg md:h-9 md:w-9 lg:h-11 lg:w-11"
                        />
                        <GradientTextSpan text="Snipfair" />
                    </motion.a>

                    <div className="hidden items-center space-x-3 lg:flex">
                        {navItems.map((item) => (
                            <div key={item.label} className="relative">
                                <Link href={route(item.route)}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                                            route().current(item.route)
                                                ? 'text-sf-gradient-purple'
                                                : 'text-gray-800 hover:text-sf-gradient-purple'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>{item.label}</span>
                                        </div>
                                    </motion.button>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Buttons */}
                    <div className="flex items-center space-x-1.5 md:space-x-4">
                        <NavNotification
                            type="chat"
                            items={recentChats}
                            onClick={() => router.visit(route('customer.chat'))}
                            trigger={
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="rounded-full border border-sf-gradient-purple bg-gradient-to-r from-purple-50 to-pink-50 px-1.5 py-1 text-sm font-medium text-sf-gradient-purple transition-shadow duration-200 hover:shadow-md"
                                >
                                    <div className="relative">
                                        <Chat />
                                        {recentChats.some(
                                            (item) => item.isUnread,
                                        ) ? (
                                            <>
                                                <div className="absolute right-[3px] top-px h-2 w-2 animate-ping rounded-full bg-sf-gradient-purple"></div>
                                                <div className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-sf-gradient-purple"></div>
                                            </>
                                        ) : null}
                                    </div>
                                </motion.div>
                            }
                        />

                        <NavNotification
                            type="notification"
                            items={recentNotifications}
                            onClick={() =>
                                router.visit(route('customer.notifications'))
                            }
                            trigger={
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="rounded-full border border-gray-200 bg-white px-1.5 py-1 text-sm font-medium text-gray-800 transition-shadow duration-200 hover:shadow-md"
                                >
                                    <div className="relative">
                                        <Notification />
                                        {recentNotifications.some(
                                            (item) => item.isUnread,
                                        ) ? (
                                            <>
                                                <div className="absolute right-[3px] top-px h-2 w-2 animate-ping rounded-full bg-sf-gradient-pink"></div>
                                                <div className="absolute right-1 top-0.5 h-1.5 w-1.5 rounded-full bg-sf-gradient-pink"></div>
                                            </>
                                        ) : null}
                                    </div>
                                </motion.div>
                            }
                        />
                        <div className="hidden lg:block">
                            <NavMenu menuItems={menuItems} auth={auth} />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleMobileMenu}
                            className="rounded-lg border border-gray-200 p-2 lg:hidden"
                        >
                            <svg
                                className="h-6 w-6 text-gray-800"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </motion.button>
                    </div>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div
                                key="mobile-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 z-40 bg-black"
                                onClick={toggleMobileMenu}
                                aria-label="Close mobile menu overlay"
                            />

                            <motion.div
                                key="mobile-sidebar"
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 40,
                                }}
                                className="fixed bottom-0 left-0 top-0 z-50 flex w-80 max-w-full flex-col border-r border-gray-200 bg-white shadow-2xl"
                                role="dialog"
                                aria-modal="true"
                            >
                                <div className="flex h-20 items-center justify-between border-b border-gray-100 px-4">
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        href={route('home')}
                                        className="flex items-center space-x-3"
                                    >
                                        <AppLogoImage
                                            type="primary"
                                            className="h-7 w-7 rounded-lg md:h-9 md:w-9 lg:h-11 lg:w-11"
                                        />
                                        <GradientTextSpan text="Snipfair" />
                                    </motion.a>
                                    <button
                                        onClick={toggleMobileMenu}
                                        className="rounded-full p-2 hover:bg-gray-100 focus:outline-none"
                                        aria-label="Close menu"
                                    >
                                        <svg
                                            className="h-7 w-7 text-gray-700"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="no-scrollbar flex-1 overflow-y-auto py-6">
                                    <div className="space-y-2 px-4">
                                        {navItems.map((item) => (
                                            <motion.a
                                                key={item.label}
                                                whileHover={{ x: 10 }}
                                                href={route(item.route)}
                                                className="block rounded-lg px-2 py-3 text-gray-800 transition-colors duration-200 hover:bg-gray-50 hover:text-sf-gradient-purple"
                                                onClick={toggleMobileMenu}
                                            >
                                                {item.label}
                                            </motion.a>
                                        ))}
                                    </div>

                                    <div className="mx-4 my-6 border-t border-gray-200"></div>

                                    <div className="space-y-2 px-4">
                                        {menuItems.reverse().map((item) => (
                                            <motion.a
                                                key={item.label}
                                                whileHover={{ x: 10 }}
                                                href={route(item.route)}
                                                className="flex items-center space-x-3 rounded-lg px-2 py-3 text-gray-800 transition-colors duration-200 hover:bg-gray-50 hover:text-sf-gradient-purple"
                                                onClick={toggleMobileMenu}
                                            >
                                                <div className="text-gray-600">
                                                    {item.icon}
                                                </div>
                                                <span>{item.label}</span>
                                            </motion.a>
                                        ))}
                                    </div>
                                    <div className="mt-8 space-y-3 px-4">
                                        <Link href={route('customer.chat')}>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full rounded-full border border-sf-gradient-purple bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 text-sm font-medium text-sf-gradient-purple"
                                            >
                                                Chat
                                            </motion.button>
                                        </Link>
                                        <Link
                                            href={route(
                                                'customer.notifications',
                                            )}
                                            className="block"
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-800"
                                            >
                                                Notifications
                                            </motion.button>
                                        </Link>
                                        <Link
                                            method="post"
                                            href={route('logout')}
                                            as="button"
                                            className="w-full"
                                        >
                                            <motion.div
                                                whileHover={{
                                                    backgroundColor: '#f9fafb',
                                                }}
                                                className="flex w-full items-center justify-center space-x-3 rounded-full border border-gray-200 px-6 py-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                            >
                                                <div className="text-danger-normal">
                                                    <LogOut />
                                                </div>
                                                <span className="font-medium text-danger-normal">
                                                    Logout
                                                </span>
                                            </motion.div>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};

export default AuthNavbar;
