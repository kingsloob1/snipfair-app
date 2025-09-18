import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import React from 'react';

interface FooterNavigationProps {
    title: string;
    className?: string;
    links: {
        text: string;
        href: string;
    }[];
    underlineLast?: boolean;
}

const FooterLinks: React.FC<FooterNavigationProps> = ({
    title,
    links,
    className = '',
    underlineLast = false,
}) => {
    return (
        <motion.div
            className={`flex flex-col space-y-6 font-inter ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header Section */}
            <div className="flex w-full items-center justify-between">
                <span className="text-base font-medium text-white md:text-lg">
                    {title}
                </span>
            </div>

            <div className="flex flex-col space-y-3">
                {links.map((link, index) => (
                    <motion.div
                        key={index}
                        className="flex w-full items-center space-x-1 text-sf-gray hover:text-sf-white-card"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            href={link.href}
                            className={cn(
                                'text-sm font-normal',
                                underlineLast &&
                                    index === links.length - 1 &&
                                    'underline',
                            )}
                        >
                            {link.text}
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default FooterLinks;
