import { SearchIcon } from '@/Components/icon/Icons';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
// import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
import SearchDialog from './SearchDialog';

export default function SearchDropdown() {
    const [inputValue, setInputValue] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Show menu only when focused AND no value typed
    // const shouldOpenMenu = menuOpen && inputValue.trim() === '';
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative flex-1">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search services"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setMenuOpen(true)}
                        onBlur={() =>
                            setTimeout(() => setMenuOpen(false), 1000)
                        }
                        className="h-14 w-full rounded-xl border border-white bg-white bg-opacity-90 pl-12 pr-12 text-gray-900 transition placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <span
                        className={cn(
                            'absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-opacity',
                            menuOpen ? 'opacity-0' : 'opacity-100',
                        )}
                    >
                        <SearchIcon className="h-4 w-4" />
                    </span>
                    <button
                        type="button"
                        className={cn(
                            'absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 transition-opacity',
                            menuOpen ? 'opacity-100' : 'opacity-0',
                        )}
                        onClick={() => {
                            console.log('Searching for:', inputValue);
                        }}
                    >
                        <SearchIcon className="h-6 w-6" />
                    </button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <PopoverArrow className="fill-popover" />
                <SearchDialog />
            </PopoverContent>
        </Popover>
    );
}
