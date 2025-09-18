import { motion } from 'motion/react';
import React, { useState } from 'react';

interface NewsletterSignupProps {
    className?: string;
    onSubmit?: (email: string) => void;
}

const FooterSubscribe: React.FC<NewsletterSignupProps> = ({
    className = '',
    onSubmit,
}) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit && email.trim()) {
            onSubmit(email.trim());
            setEmail('');
        }
    };

    return (
        <motion.div
            className={`flex flex-col space-y-6 ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex w-full items-center justify-between">
                <span className="text-base font-medium text-white md:text-lg">
                    Get Email Notifications
                </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
                Sign up to our e-mail newsletter to receive the latest news &
                updates.
            </p>

            <form onSubmit={handleSubmit} className="w-full">
                <div className="flex h-[46px] w-full overflow-hidden rounded-md border border-transparent">
                    <div className="flex flex-1 items-center rounded-s-md border border-sf-gray focus-within:border-sf-gradient-purple">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Input your email."
                            className="w-full border-none bg-transparent text-sm text-sf-primary-background placeholder-sf-gray focus:border-none focus:outline-none focus:ring-0"
                        />
                    </div>
                    <motion.button
                        type="submit"
                        className="flex items-center justify-center bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink px-2.5 text-sm font-medium text-white shadow-lg hover:from-sf-gradient-pink hover:to-sf-gradient-purple md:px-3.5"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center">
                            <span className="text-xs">Submit</span>
                        </div>
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

export default FooterSubscribe;
