import { Chat, Notification, User } from '@/Components/icon/Icons';
import NavNotification from '@/Components/magic/NavNotification';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    CircleQuestionMark,
    Gavel,
    Home,
    Menu,
    MessageSquare,
    Settings,
    // Sun,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Dispatch, SetStateAction, useState } from 'react';
import AppLogoImage from '../AppLogoImage';
import { OrangeNav, PurpleNav } from './_partials/NavButtons';
import NavMenu from './_partials/NavMenu';

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    route: string;
}
type Item = {
    type: 'reminder' | 'setting' | 'info' | 'chat';
    title: string;
    description: string;
    timestamp: string;
    isUnread?: boolean;
    image?: string;
};
type NavbarProps = {
    auth: {
        name: string;
        role: string;
    };
    recentChats?: Item[];
    recentNotifications?: Item[];
    isSidebarOpen: boolean;
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Navbar({
    auth,
    recentChats,
    recentNotifications,
    isSidebarOpen,
    setIsSidebarOpen,
}: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navItems = [
        {
            icon: Home,
            label: 'Dashboard',
            route: 'admin.dashboard',
        },
        {
            icon: Users,
            label: 'Users',
            route: 'admin.users',
        },
        {
            icon: MessageSquare,
            label: 'Contents',
            route: 'admin.contents',
        },
        {
            icon: Wallet,
            label: 'Transactions',
            route: 'admin.transactions',
        },
        {
            icon: Gavel,
            label: 'Disputes',
            route: 'admin.disputes.index',
        },
        {
            icon: Settings,
            label: 'Settings',
            route: 'admin.settings',
        },
        {
            icon: CircleQuestionMark,
            label: 'Support',
            route: 'admin.support',
        },
    ];
    const menuItems: MenuItem[] = [
        {
            label: 'Account',
            icon: <User />,
            route: 'admin.profile',
        },
        {
            label: 'Settings',
            icon: <Settings />,
            route: 'admin.settings',
        },
        // {
        //     label: 'Theme',
        //     icon: <Sun />,
        //     route: 'admin.settings.theme',
        // },
    ];

    return (
        <>
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{
                            x: '-100%',
                        }}
                        animate={{
                            x: 0,
                        }}
                        exit={{
                            x: '-100%',
                        }}
                        transition={{
                            type: 'tween',
                        }}
                        className="fixed inset-0 z-50 bg-white lg:hidden"
                    >
                        <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-2">
                                    <AppLogoImage
                                        type="primary"
                                        className="h-7 w-7 rounded-lg md:h-9 md:w-9 lg:h-11 lg:w-11"
                                    />
                                    <span className="bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                                        Snipfair
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-lg p-2 hover:bg-gray-100"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 p-4">
                                <Link href={route('admin.dashboard')}>
                                    <OrangeNav text="Add Tutorials" />
                                </Link>
                                <Link href={route('admin.dashboard')}>
                                    <PurpleNav text="Manage Rewards" />
                                </Link>
                            </div>
                            <nav className="flex-1 space-y-1 p-4">
                                {navItems.map((item, i) => (
                                    <Link key={i} href={route(item.route)}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                'flex w-full items-center space-x-3 rounded-lg px-3 py-3 text-gray-700',
                                                route().current(item.route) &&
                                                    'bg-sf-gradient-primary text-sf-white',
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 flex-shrink-0" />
                                            {isSidebarOpen && (
                                                <span>{item.label}</span>
                                            )}
                                        </motion.button>
                                    </Link>
                                ))}
                            </nav>
                            <div className="border-t p-4">
                                <NavMenu menuItems={menuItems} auth={auth} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isSidebarOpen ? 240 : 80,
                }}
                className="fixed hidden h-full border-r bg-white lg:z-50 lg:block"
            >
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center px-4">
                        <div className="flex items-center space-x-2">
                            <AppLogoImage
                                type="primary"
                                className="h-7 w-7 rounded-lg md:h-9 md:w-9 lg:h-11 lg:w-11"
                            />
                            {isSidebarOpen && (
                                <span className="bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                                    Snipfair
                                </span>
                            )}
                        </div>
                    </div>
                    <nav className="flex-1 space-y-1 p-2 pt-8">
                        {navItems.map((item, i) => (
                            <Link key={i} href={route(item.route)}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        'flex w-full items-center space-x-3 rounded-lg px-3 py-3 text-gray-700',
                                        route().current(item.route) &&
                                            'bg-sf-gradient-primary text-sf-white',
                                    )}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    {isSidebarOpen && <span>{item.label}</span>}
                                </motion.button>
                            </Link>
                        ))}
                    </nav>
                    <div className="border-t p-4">
                        <NavMenu
                            menuItems={menuItems}
                            auth={auth}
                            avatarOnly={!isSidebarOpen}
                        />
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm"
                    >
                        {isSidebarOpen ? (
                            <ChevronLeft className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </motion.aside>
            {/* Top Navigation */}
            <header className="fixed left-0 right-0 top-0 z-40 border-b bg-white">
                <div
                    className={cn(
                        'flex h-16 items-center px-4',
                        isSidebarOpen ? 'lg:ml-[240px]' : 'lg:ml-[80px]',
                    )}
                >
                    {/* Mobile Logo */}
                    <div className="flex items-center space-x-2 lg:hidden">
                        <AppLogoImage
                            type="primary"
                            className="h-7 w-7 rounded-lg md:h-9 md:w-9 lg:h-11 lg:w-11"
                        />
                        <span className="bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                            Snipfair
                        </span>
                    </div>
                    {/* Desktop Welcome Text */}
                    <h1 className="hidden text-xl font-semibold lg:block">
                        Welcome Back {auth.name ?? 'Admin'}!🖐
                    </h1>
                    <div className="ml-auto flex items-center space-x-2 md:space-x-4">
                        <NavNotification
                            type="chat"
                            items={recentChats}
                            onClick={() => router.visit(route('stylist.chat'))}
                            trigger={
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="hidden rounded-full border border-sf-gradient-purple bg-gradient-to-r from-purple-50 to-pink-50 px-1.5 py-1 text-sm font-medium text-sf-gradient-purple transition-shadow duration-200 hover:shadow-md"
                                >
                                    <Chat />
                                </motion.div>
                            }
                        />

                        <NavNotification
                            type="admin-notification"
                            items={recentNotifications}
                            onClick={() =>
                                router.visit(route('admin.notifications'))
                            }
                            trigger={
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="rounded-full border border-gray-200 bg-white px-1.5 py-1 text-sm font-medium text-gray-800 transition-shadow duration-200 hover:shadow-md"
                                >
                                    <div className="relative">
                                        <Notification />
                                        <div className="absolute right-[3px] top-px h-2 w-2 animate-ping rounded-full bg-sf-gradient-pink"></div>
                                        <div className="absolute right-1 top-0.5 h-1.5 w-1.5 rounded-full bg-sf-gradient-pink"></div>
                                    </div>
                                </motion.div>
                            }
                        />
                        {/* Desktop-only buttons */}
                        <div className="hidden items-center space-x-4 lg:flex">
                            <Link href={route('admin.dashboard')}>
                                <OrangeNav text="Add Tutorials" />
                            </Link>
                            <Link href={route('admin.dashboard')}>
                                <PurpleNav text="Manage Rewards" />
                            </Link>
                        </div>
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
