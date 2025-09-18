import { getInitials } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronsUpDown, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type NavMenuProps = {
    menuItems: {
        label: string;
        icon: React.ReactNode;
        route: string;
    }[];
    variant?: 'customer' | 'stylist';
    avatarOnly?: boolean;
};

export default function NavMenu({
    menuItems,
    auth,
    variant = 'customer',
    avatarOnly = false,
}: PageProps<NavMenuProps>) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="border-none focus:outline-none focus:ring-0 focus:ring-ring focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        'flex items-center',
                        variant === 'stylist'
                            ? ''
                            : 'rounded-full border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md',
                    )}
                >
                    <Avatar className="h-12 w-12">
                        <AvatarImage
                            className="h-12"
                            src={`/storage/${auth.user.avatar}` || ''}
                            alt={auth.user.name || 'User'}
                        />
                        <AvatarFallback>
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    {!avatarOnly && (
                        <div className="flex flex-col px-3 py-2.5">
                            <span className="flex items-center gap-2.5 text-sm font-medium text-gray-800">
                                <span>
                                    {auth.user.name.split(' ')[0] ?? 'Account'}
                                </span>
                                <motion.span
                                    animate={{
                                        rotate: isOpen ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="h-4 w-4"
                                >
                                    {!isOpen && variant === 'stylist' ? (
                                        <ChevronsUpDown size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                </motion.span>
                            </span>
                            {variant === 'stylist' && (
                                <span className="text-xs text-sf-secondary-paragraph">
                                    {auth.user.stylist_profile?.business_name ??
                                        'Stylist'}
                                </span>
                            )}
                        </div>
                    )}
                </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
                <div className="px-2">
                    {menuItems.map((item) => (
                        <Link key={item.label} href={route(item.route)}>
                            <motion.button
                                whileHover={{
                                    backgroundColor: '#f9fafb',
                                }}
                                className="flex w-full items-center space-x-3 rounded-lg px-4 py-4 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                            >
                                <div className="text-gray-600">{item.icon}</div>
                                <span className="font-medium">
                                    {item.label}
                                </span>
                            </motion.button>
                        </Link>
                    ))}
                    <hr />
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
                            className="flex w-full items-center space-x-3 rounded-lg px-4 py-4 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50"
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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
