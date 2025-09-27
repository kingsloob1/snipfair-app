import { Chat, Notification, User } from '@/Components/icon/Icons';
import NavMenu from '@/Components/magic/NavMenu';
import NavNotification from '@/Components/magic/NavNotification';
import AvailabilityPill from '@/Components/stylist/AvailabilityPill';
import { cn } from '@/lib/utils';
import { PagePropsWithNotifiers } from '@/types';
import { Link, router } from '@inertiajs/react';
import {
    Book,
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Gavel,
    HelpCircle,
    Home,
    Image,
    Menu,
    Settings,
    Star,
    // Sun,
    // UserPlus,
    X,
    ListTodo
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Dispatch, SetStateAction, useState } from 'react';
import AppLogoImage from '../AppLogoImage';
import SubscriptionPill from './SubscriptionPill';

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    route: string;
    isDisabled?: boolean;
}

type NavbarProps = {
    isSidebarOpen: boolean;
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Navbar({
    auth,
    recentChats,
    recentNotifications,
    isSidebarOpen,
    setIsSidebarOpen,
}: PagePropsWithNotifiers<NavbarProps>) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navItems = [
        {
            icon: Home,
            label: 'Dashboard',
            route: 'stylist.dashboard',
        },
        {
            icon: Calendar,
            label: 'Appointments',
            route: 'stylist.appointments',
        },
        {
            icon: Briefcase,
            label: 'Portfolio',
            route: 'stylist.portfolio',
        },
        {
            icon: Image,
            label: 'Media',
            route: 'stylist.work',
        },
        {
            icon: DollarSign,
            label: 'Earnings',
            route: 'stylist.earnings',
        },
        {
            icon: Book,
            label: 'Tutorials',
            route: 'stylist.tutorials',
            isDisabled: true,
        },
        {
            label: 'Support',
            icon: HelpCircle,
            route: 'tickets.index',
        },
    ];

    const menuItems: MenuItem[] = [
        {
            label: 'Account',
            icon: <User />,
            route: 'stylist.profile',
        },
        {
            label: 'Settings',
            icon: <Settings />,
            route: 'stylist.settings',
        },
        {
            label: 'Availability',
            icon: <Star />,
            route: 'stylist.appointments.availability',
        },
        {
            label: 'Disputes',
            icon: <Gavel />,
            route: 'disputes.index',
        },
        // {
        //     label: 'Favorites',
        //     icon: <Star />,
        //     route: 'stylist.favorites',
        // },
        // {
        //     label: 'Theme',
        //     icon: <Sun />,
        //     route: 'stylist.settings.theme',
        // },
        // {
        //     label: 'Invite a Friend',
        //     icon: <UserPlus />,
        //     route: 'stylist.referral',
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
                                <div className="flex items-center space-x-1.5">
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
                                {/* console.log(auth.user.subscription_status, auth.user.plan, auth.user.availability); */}
                                <SubscriptionPill
                                    status={auth.user?.stylist_profile?.status}
                                />
                                <AvailabilityPill
                                    enabled={
                                        auth.user.plan && auth.user.availability
                                            ? true
                                            : false
                                    }
                                    initialState={
                                        auth.user?.stylist_profile?.is_available
                                            ? true
                                            : false
                                    }
                                />
                            </div>
                            <nav className="flex-1 space-y-1 p-4">
                                {navItems.map((item, i) => (
                                    <Link
                                        key={i}
                                        disabled={item.isDisabled}
                                        href={route(item.route)}
                                        className={cn(
                                            item.isDisabled &&
                                                'pointer-events-none hidden opacity-60',
                                        )}
                                    >
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
                                <NavMenu
                                    menuItems={menuItems}
                                    auth={auth}
                                    variant="stylist"
                                />
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
                        <div className="flex items-center space-x-1.5">
                            <AppLogoImage
                                type="primary"
                                className="h-8 w-8 rounded-lg md:h-9 md:w-9 lg:h-11 lg:w-11"
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
                            <Link
                                key={i}
                                disabled={item.isDisabled}
                                href={route(item.route)}
                                className={cn(
                                    item.isDisabled &&
                                        'pointer-events-none hidden opacity-60',
                                )}
                            >
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
                            variant="stylist"
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
                    <div className="flex items-center space-x-1.5 lg:hidden">
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
                        Welcome Back {auth.user.first_name ?? 'User'}!🖐
                    </h1>
                    <div className="ml-auto flex items-center space-x-1.5 md:space-x-4">
                        <NavNotification
                            type="chat"
                            items={recentChats}
                            onClick={() => router.visit(route('stylist.chat'))}
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
                                router.visit(route('stylist.notifications'))
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
                        {/* Desktop-only buttons */}
                        <div className="hidden items-center space-x-4 lg:flex">
                            <SubscriptionPill
                                status={auth.user?.stylist_profile?.status}
                            />
                            <AvailabilityPill
                                enabled={
                                    auth.user.plan && auth.user.availability
                                        ? true
                                        : false
                                }
                                initialState={
                                    auth.user?.stylist_profile?.is_available
                                        ? true
                                        : false
                                }
                            />
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
