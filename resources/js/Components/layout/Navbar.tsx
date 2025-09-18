import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useState } from 'react';
import ApplicationLogo from '../ApplicationLogo';
import { Calendar, Help, User } from '../icon/Icons';

interface NavItem {
    label: string;
    route: string;
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    route: string;
}

const Navbar = ({ auth }: PageProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

    const navItems: NavItem[] = [
        { label: 'Home', route: 'home' },
        { label: 'About Us', route: 'about' },
        { label: 'Explore Styles', route: 'explore' },
    ];
    // route().current('dashboard')
    const menuItems: MenuItem[] = [
        {
            label: 'Sign Up',
            icon: <User />,
            route: 'register',
        },
        {
            label: 'FAQs',
            icon: <Help />,
            route: 'faqs',
        },
        {
            label: 'Contact us',
            icon: <Calendar />,
            route: 'contact',
        },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleMenuDropdown = () => {
        setIsMenuDropdownOpen(!isMenuDropdownOpen);
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
                    <ApplicationLogo />
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
                    <div className="hidden items-center space-x-4 lg:flex">
                        <Link
                            href={
                                auth.user ? route('dashboard') : route('login')
                            }
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="rounded-full border border-sf-gradient-purple bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 text-sm font-medium text-sf-gradient-purple transition-shadow duration-200 hover:shadow-md"
                            >
                                {auth.user ? 'Account' : 'Login'}
                            </motion.button>
                        </Link>

                        {!auth.user && (
                            <Link href={route('stylist.register')}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-800 transition-shadow duration-200 hover:shadow-md"
                                >
                                    Join as Stylist
                                </motion.button>
                            </Link>
                        )}

                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleMenuDropdown}
                                className="flex items-center space-x-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-800 transition-shadow duration-200 hover:shadow-md"
                            >
                                <span>Menu</span>
                                <motion.svg
                                    animate={{
                                        rotate: isMenuDropdownOpen ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="h-5 w-5"
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
                                </motion.svg>
                            </motion.button>

                            {/* Menu Dropdown */}
                            <AnimatePresence>
                                {isMenuDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
                                    >
                                        <div className="px-2">
                                            {menuItems.map((item) => (
                                                <Link
                                                    key={item.label}
                                                    href={route(item.route)}
                                                    className={cn(
                                                        (item.route ===
                                                            'register' ||
                                                            item.route ===
                                                                'stylist.register') &&
                                                            'hidden',
                                                    )}
                                                >
                                                    <motion.button
                                                        whileHover={{
                                                            backgroundColor:
                                                                '#f9fafb',
                                                        }}
                                                        className="flex w-full items-center space-x-3 rounded-lg px-4 py-4 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                                                    >
                                                        <div className="text-gray-600">
                                                            {item.icon}
                                                        </div>
                                                        <span className="font-medium">
                                                            {item.label}
                                                        </span>
                                                    </motion.button>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
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

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            {/* Overlay */}
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

                            {/* Off-canvas Sidebar */}
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
                                {/* Header with Close Button */}
                                <div className="flex h-20 items-center justify-between border-b border-gray-100 px-4">
                                    <ApplicationLogo />
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
                                <div className="flex-1 overflow-y-auto py-6">
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
                                    {/* Divider */}
                                    <div className="mx-4 my-6 border-t border-gray-200"></div>
                                    {/* Menu Items */}
                                    <div className="space-y-2 px-4">
                                        {menuItems.reverse().map((item) => (
                                            <motion.a
                                                key={item.label}
                                                whileHover={{ x: 10 }}
                                                href={route(item.route)}
                                                className={cn(
                                                    'flex items-center space-x-3 rounded-lg px-2 py-3 text-gray-800 transition-colors duration-200 hover:bg-gray-50 hover:text-sf-gradient-purple',
                                                    (item.route ===
                                                        'register' ||
                                                        item.route ===
                                                            'stylist.register') &&
                                                        'hidden',
                                                )}
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
                                        <Link
                                            href={
                                                auth.user
                                                    ? route('dashboard')
                                                    : route('login')
                                            }
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full rounded-full border border-sf-gradient-purple bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 text-sm font-medium text-sf-gradient-purple"
                                            >
                                                {auth.user
                                                    ? 'Dasbhoard'
                                                    : 'Login'}
                                            </motion.button>
                                        </Link>
                                        {!auth.user && (
                                            <Link
                                                href={route('stylist.register')}
                                                className="block"
                                            >
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-800"
                                                >
                                                    Join as Stylist
                                                </motion.button>
                                            </Link>
                                        )}
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

export default Navbar;
