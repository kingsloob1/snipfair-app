import defaultLogo from '@/assets/logo/logo.png';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';

export default function ApplicationLogo() {
    return (
        <Link href={route('home')}>
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="flex items-center space-x-2"
            >
                <img
                    className="h-8 w-8 rounded-lg md:h-9 md:w-9 lg:h-12 lg:w-12"
                    src={defaultLogo}
                />
                <span className="bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                    Snipfair
                </span>
            </motion.div>
        </Link>
    );
}
