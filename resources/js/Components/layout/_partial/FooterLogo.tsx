import {
    FooterFacebook,
    FooterInstagram,
    FooterTikTok,
    FooterWhatsApp,
} from '@/Components/icon/Icons';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import React from 'react';

interface TextInputContainerProps {
    className?: string;
}

const FooterLogo: React.FC<TextInputContainerProps> = ({ className = '' }) => {
    return (
        <motion.div
            className={`flex flex-col space-y-4 ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Link href={route('home')} className="flex items-center space-x-3">
                <img
                    className="h-7 w-7 rounded-lg md:h-9 md:w-9 lg:h-12 lg:w-12"
                    src="/images/logo/logo_primary.png"
                />
                <span className="text-2xl font-bold text-white">Snipfair</span>
            </Link>

            <div className="flex flex-col space-y-4">
                <p className="text-sm leading-relaxed text-sf-gray">
                    Your trusted platform for booking professional beauty and
                    styling services.
                </p>
            </div>

            <div className="flex items-center space-x-6">
                <motion.a
                    href="https://www.facebook.com/share/1BmTa4YwyA/?mibextid=wwXIfr"
                    target="_blank"
                    className="h-6 w-6 text-sf-white hover:text-sf-gradient-purple"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FooterFacebook />
                </motion.a>

                <motion.a
                    href="https://whatsapp.com/channel/0029VbBMml684OmGJcIVmp3b"
                    target="_blank"
                    className="h-6 w-6 text-sf-white hover:text-sf-gradient-purple"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FooterWhatsApp className="h-7 w-7" />
                </motion.a>

                <motion.a
                    href="https://www.tiktok.com/@snipfair?_t=ZS-8ylQn02BlUC&_r=1"
                    target="_blank"
                    className="h-6 w-6 text-sf-white hover:text-sf-gradient-purple"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FooterTikTok className="h-7 w-7" />
                </motion.a>

                <motion.a
                    href="https://www.instagram.com/snipfair?igsh=MXh3aGN3OGI2bTd5dg== "
                    target="_blank"
                    className="h-6 w-6 text-sf-white hover:text-sf-gradient-purple"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FooterInstagram />
                </motion.a>
            </div>
        </motion.div>
    );
};

export default FooterLogo;
