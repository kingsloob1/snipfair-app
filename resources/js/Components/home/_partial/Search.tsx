import { SearchIcon } from '@/Components/icon/Icons';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import SearchDialog from './SearchDialog';

export default function Search() {
    const [isSearchOpen, setSearchOpen] = useState(false);
    return (
        <div className="relative flex-1">
            <input
                type="text"
                placeholder="Search services"
                className="h-14 w-full rounded-xl border border-white bg-white bg-opacity-90 pl-12 pr-4 text-gray-900 transition placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                onChange={(e) =>
                    e.target.value ? setSearchOpen(false) : setSearchOpen(true)
                }
                onFocus={(e) =>
                    e.target.value ? setSearchOpen(false) : setSearchOpen(true)
                }
                onBlur={() => setSearchOpen(false)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <SearchIcon />
            </span>
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="static right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
                    >
                        <SearchDialog />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
