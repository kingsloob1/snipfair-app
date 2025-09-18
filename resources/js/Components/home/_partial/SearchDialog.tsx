import { motion } from 'motion/react';
import React from 'react';

const recentSearches = ['Beard shaping', 'Hair Locks'];

const popularServices = [
    'Make up',
    'Beard Grooming',
    'Nail Care',
    'Eye Lashes',
    'Hair Lock',
    'Hair Styling',
    'Wig Making',
    'Facial Care',
];

const icon = (
    <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 16 16"
        className="text-gray-400"
    >
        <circle
            cx="7.5"
            cy="7.5"
            r="5"
            stroke="currentColor"
            strokeWidth="1.5"
        />
        <path
            d="M13 13L11 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

const SearchDialog: React.FC = () => {
    return (
        <motion.div
            className="no-scrollbar relative flex h-[272px] w-[283px] flex-col overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex flex-col gap-4 px-4 py-3">
                {/* Recent Searches */}
                <div className="flex flex-col gap-2">
                    <span className="text-base font-semibold text-[#1D1E23]">
                        Recent Searches
                    </span>
                    <div className="flex flex-col gap-2">
                        {recentSearches.map((search, idx) => (
                            <motion.button
                                key={search}
                                className="flex items-center gap-2 rounded-md p-1.5 hover:bg-sf-stroke"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                            >
                                {icon}
                                <span className="text-sm text-[#37445A]">
                                    {search}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
                {/* Popular Services */}
                <div className="flex flex-col gap-2">
                    <span className="text-base font-semibold text-[#1D1E23]">
                        Popular Services
                    </span>
                    <div className="flex flex-row flex-wrap gap-2">
                        {popularServices.map((service) => (
                            <motion.button
                                key={service}
                                className="rounded-[6px] border border-transparent bg-[#F6F7F8] px-3 py-1 text-sm font-medium text-[#37445A] transition-colors hover:bg-[#e4e6e8] focus:outline-none focus:ring-2 focus:ring-[#A4A6AB]"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {service}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SearchDialog;
